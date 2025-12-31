export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { randomToken, sha256 } from "@/lib/auth/crypto";
import { sendPasswordResetEmail } from "@/lib/auth/mailer";
import { auditLog } from "@/lib/auth/audit";
import { getReqInfo } from "@/lib/auth/requestInfo";
import { DEV_ONLY_ADMIN_LINKS, RESET_TOKEN_TTL_HOURS } from "@/lib/auth/env";

const BodySchema = z.object({
  email: z.string().email().transform((v) => v.toLowerCase()),
});

export async function POST(req: NextRequest) {
  const { ip, userAgent } = getReqInfo(req);

  const body = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });
  }

  const { email } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.status === "BLOCKED") {
    return NextResponse.json({ ok: true, emailed: true });
  }

  await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });

  const token = randomToken(32);
  const tokenHash = sha256(token);
  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_HOURS * 60 * 60 * 1000);

  await prisma.passwordResetToken.create({
    data: { userId: user.id, tokenHash, expiresAt },
  });

  if (DEV_ONLY_ADMIN_LINKS) {
    await prisma.devVerificationLink.create({
      data: { userId: user.id, email, token, expiresAt, purpose: "RESET_PASSWORD" },
    });
  }

  const result = await sendPasswordResetEmail(email, token);

  await auditLog({
    userId: user.id,
    event: "AUTH_PASSWORD_RESET_REQUESTED",
    ip,
    userAgent,
    metadata: { email, emailed: result?.sent ?? true },
  });

  return NextResponse.json({
    ok: true,
    emailed: result?.sent ?? true,
    resetUrl: result?.resetUrl,
  });
}
