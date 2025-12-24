import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sha256 } from "@/lib/auth/crypto";
import { auditLog } from "@/lib/auth/audit";
import { getReqInfo } from "@/lib/auth/requestInfo";

export async function GET(req: NextRequest) {
  const { ip, userAgent } = getReqInfo(req);
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.json({ ok: false, error: "Missing token" }, { status: 400 });
  }

  const tokenHash = sha256(token);

  const record = await prisma.emailVerificationToken.findUnique({
    where: { tokenHash },
    include: { user: { select: { id: true, emailVerifiedAt: true } } },
  });

  if (!record) {
    return NextResponse.json({ ok: false, error: "Invalid token" }, { status: 400 });
  }

  if (record.expiresAt.getTime() < Date.now()) {
    return NextResponse.json({ ok: false, error: "Token expired" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: record.userId },
    data: { emailVerifiedAt: new Date() },
  });

  await prisma.emailVerificationToken.delete({ where: { id: record.id } });

  await auditLog({
    userId: record.userId,
    event: "AUTH_EMAIL_VERIFIED",
    ip,
    userAgent,
    metadata: {},
  });

  return NextResponse.json({ ok: true });
}
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
