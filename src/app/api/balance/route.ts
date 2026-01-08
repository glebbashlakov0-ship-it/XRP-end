import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth/session";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const balance = await prisma.userBalance.findUnique({ where: { userId: user.id } });

  return NextResponse.json({
    totalXrp: balance?.totalXrp ?? 0,
  });
}
