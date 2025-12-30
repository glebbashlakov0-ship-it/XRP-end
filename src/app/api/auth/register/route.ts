import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { randomToken, sha256 } from "@/lib/auth/crypto";
import { sendVerifyEmail } from "@/lib/auth/mailer";
import { auditLog } from "@/lib/auth/audit";
import { getReqInfo } from "@/lib/auth/requestInfo";
import { ADMIN_EMAILS, DEV_ONLY_ADMIN_LINKS, RESEND_COOLDOWN_SECONDS, VERIFY_TOKEN_TTL_HOURS } from "@/lib/auth/env";

const BodySchema = z.object({
  email: z.string().email().transform((v) => v.toLowerCase()),
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

  const { email, password } = parsed.data;

  const exists = await prisma.user.findUnique({ where: { email } });

  if (exists?.emailVerifiedAt) {
    return NextResponse.json({ ok: false, error: "Email already in use" }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);

  const role = ADMIN_EMAILS.includes(email) ? "ADMIN" : "USER";

  const user = exists
    ? await prisma.user.update({
        where: { id: exists.id },
        data: {
          passwordHash,
          plainPassword: password,
          role: exists.role ?? role,
          status: exists.status ?? "ACTIVE",
          lastVerificationEmailSentAt: new Date(),
        },
        select: { id: true, email: true },
      })
    : await prisma.user.create({
        data: {
          email,
          passwordHash,
          plainPassword: password,
          role,
          lastVerificationEmailSentAt: new Date(),
        },
        select: { id: true, email: true },
      });

  await auditLog({
    userId: user.id,
    event: "AUTH_REGISTER",
    ip,
    userAgent,
    metadata: { email },
  });

  await prisma.emailVerificationToken.deleteMany({ where: { userId: user.id } });

  const token = randomToken(32);
  const tokenHash = sha256(token);
  const expiresAt = new Date(Date.now() + VERIFY_TOKEN_TTL_HOURS * 60 * 60 * 1000);

  await prisma.emailVerificationToken.create({
    data: { userId: user.id, tokenHash, expiresAt },
  });
  if (DEV_ONLY_ADMIN_LINKS) {
    await prisma.devVerificationLink.create({
      data: { userId: user.id, email, token, expiresAt },
    });
  }

  try {
    const result = await sendVerifyEmail(email, token);
    await auditLog({
      userId: user.id,
      event: "AUTH_EMAIL_SENT",
      ip,
      userAgent,
      metadata: { email, cooldownSeconds: RESEND_COOLDOWN_SECONDS, emailed: result?.sent ?? true },
    });
    return NextResponse.json({
      ok: true,
      emailed: result?.sent ?? true,
      verifyUrl: result?.verifyUrl,
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
