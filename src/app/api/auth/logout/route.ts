export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sha256 } from "@/lib/auth/crypto";
import { auditLog } from "@/lib/auth/audit";
import { getReqInfo } from "@/lib/auth/requestInfo";
import { SESSION_COOKIE_NAME } from "@/lib/auth/env";

export async function POST(req: NextRequest) {
  const { ip, userAgent } = getReqInfo(req);

  const sessionToken = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (sessionToken) {
    const hash = sha256(sessionToken);
    const session = await prisma.session.findUnique({ where: { sessionTokenHash: hash } });
    if (session) {
      await prisma.session.delete({ where: { id: session.id } });

      await auditLog({
        userId: session.userId,
        event: "AUTH_LOGOUT",
        ip,
        userAgent,
        metadata: {},
      });
    }
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0),
  });
  return res;
}
