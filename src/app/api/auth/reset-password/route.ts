export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { sha256 } from "@/lib/auth/crypto";
import { auditLog } from "@/lib/auth/audit";
import { getReqInfo } from "@/lib/auth/requestInfo";

const BodySchema = z.object({
  token: z.string().min(10),
  password: z.string().min(8),
  confirmPassword: z.string().min(8),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export async function POST(req: NextRequest) {
  const { ip, userAgent } = getReqInfo(req);

  const body = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400 });
  }

  const { token, password } = parsed.data;
  const tokenHash = sha256(token);

  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!record || record.expiresAt.getTime() < Date.now()) {
    if (record) {
      await prisma.passwordResetToken.delete({ where: { id: record.id } });
    }
    return NextResponse.json({ ok: false, error: "Invalid or expired token" }, { status: 400 });
  }

  const passwordHash = await hashPassword(password);

  await prisma.user.update({
    where: { id: record.userId },
    data: { passwordHash, plainPassword: password },
  });

  await prisma.passwordResetToken.deleteMany({ where: { userId: record.userId } });
  await prisma.session.deleteMany({ where: { userId: record.userId } });

  await auditLog({
    userId: record.userId,
    event: "AUTH_PASSWORD_RESET",
    ip,
    userAgent,
  });

  return NextResponse.json({ ok: true });
}
