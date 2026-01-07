import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { sha256 } from "@/lib/auth/crypto";
import { SESSION_COOKIE_NAME } from "@/lib/auth/env";

export async function getSessionUser() {
  const sessionToken = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  if (!sessionToken) return null;

  const hash = sha256(sessionToken);
  let session;
  try {
    session = await prisma.session.findUnique({
      where: { sessionTokenHash: hash },
      include: { user: true },
    });
  } catch {
    return null;
  }

  if (!session) return null;
  if (session.expiresAt.getTime() < Date.now()) return null;
  return session.user;
}
