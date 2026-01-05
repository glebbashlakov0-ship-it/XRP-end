export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth/session";
import { verifyPassword } from "@/lib/auth/password";
import { randomToken, sha256 } from "@/lib/auth/crypto";
import { sendPasswordResetEmail } from "@/lib/auth/mailer";
import { auditLog } from "@/lib/auth/audit";
import { getReqInfo } from "@/lib/auth/requestInfo";
import { DEV_ONLY_ADMIN_LINKS, RESET_TOKEN_TTL_HOURS } from "@/lib/auth/env";

const BodySchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8),
    confirmNewPassword: z.string().min(8),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords do not match",
    path: ["confirmNewPassword"],
  });

export async function POST(req: NextRequest) {
  const sessionUser = await getSessionUser();
  const { ip, userAgent } = getReqInfo(req);

  if (!sessionUser) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400 });
  }

  const { currentPassword, newPassword } = parsed.data;

  const user = await prisma.user.findUnique({ where: { id: sessionUser.id } });
  if (!user || user.status === "BLOCKED") {
    return NextResponse.json({ ok: false, error: "Account is unavailable" }, { status: 403 });
  }

  const ok = await verifyPassword(user.passwordHash, currentPassword);
  if (!ok) {
    return NextResponse.json({ ok: false, error: "Invalid current password" }, { status: 401 });
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
      data: { userId: user.id, email: user.email, token, expiresAt, purpose: "RESET_PASSWORD" },
    });
  }

  const result = await sendPasswordResetEmail(user.email, token, newPassword);

  await auditLog({
    userId: user.id,
    event: "AUTH_PASSWORD_CHANGE_REQUESTED",
    ip,
    userAgent,
  });

  return NextResponse.json({
    ok: true,
    emailed: result?.sent ?? true,
    resetUrl: result?.resetUrl,
  });
}
