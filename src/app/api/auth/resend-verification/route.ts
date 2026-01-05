import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomToken, sha256 } from "@/lib/auth/crypto";
import { sendVerifyEmail } from "@/lib/auth/mailer";
import { auditLog } from "@/lib/auth/audit";
import { getReqInfo } from "@/lib/auth/requestInfo";
import { DEV_ONLY_ADMIN_LINKS, RESEND_COOLDOWN_SECONDS, VERIFY_TOKEN_TTL_HOURS } from "@/lib/auth/env";

export async function POST(req: NextRequest) {
  const { ip, userAgent } = getReqInfo(req);
  const body = await req.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.toLowerCase() : null;

  if (!email) {
    return NextResponse.json({ ok: false, error: "Missing email" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ ok: true });
  }

  if (user.emailVerifiedAt) {
    return NextResponse.json({ ok: true });
  }

  const last = user.lastVerificationEmailSentAt?.getTime() ?? 0;
  const now = Date.now();
  const diffSec = Math.floor((now - last) / 1000);

  if (diffSec < RESEND_COOLDOWN_SECONDS) {
    return NextResponse.json(
      { ok: false, error: "Cooldown", cooldownLeft: RESEND_COOLDOWN_SECONDS - diffSec },
      { status: 429 }
    );
  }

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
    if (result?.sent) {
      await prisma.user.update({
        where: { id: user.id },
        data: { lastVerificationEmailSentAt: new Date() },
      });
    }
    await auditLog({
      userId: user.id,
      event: "AUTH_EMAIL_SENT",
      ip,
      userAgent,
      metadata: { email, resend: true, emailed: result?.sent ?? true },
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
