export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { randomToken, sha256 } from "@/lib/auth/crypto";
import { auditLog } from "@/lib/auth/audit";
import { getReqInfo } from "@/lib/auth/requestInfo";
import { SESSION_COOKIE_NAME, SESSION_TTL_DAYS } from "@/lib/auth/env";

const BodySchema = z.object({
  email: z.string().email().transform((v) => v.toLowerCase()),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const { ip, userAgent } = getReqInfo(req);

  const body = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });
  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ ok: false, error: "Invalid credentials" }, { status: 401 });
  }

  if (user.status === "BLOCKED") {
    return NextResponse.json({ ok: false, error: "Account is blocked" }, { status: 403 });
  }

  const ok = await verifyPassword(user.passwordHash, password);
  if (!ok) {
    return NextResponse.json({ ok: false, error: "Invalid credentials" }, { status: 401 });
  }

  const sessionToken = randomToken(32);
  const sessionTokenHash = sha256(sessionToken);
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);

  await prisma.session.create({
    data: { userId: user.id, sessionTokenHash, expiresAt },
  });

  await auditLog({
    userId: user.id,
    event: "AUTH_LOGIN",
    ip,
    userAgent,
    metadata: { email },
  });

  const res = NextResponse.json({ ok: true, emailVerified: !!user.emailVerifiedAt });

  res.cookies.set(SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });

  return res;
}
