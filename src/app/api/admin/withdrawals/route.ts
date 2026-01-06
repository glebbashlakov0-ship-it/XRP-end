import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiAdmin } from "@/lib/auth/api";
import { TransactionStatus } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await requireApiAdmin();
  if (user instanceof NextResponse) return user;

  const withdrawals = await prisma.withdrawal.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: true },
  });

  return NextResponse.json({ withdrawals });
}

export async function PATCH(req: Request) {
  const user = await requireApiAdmin();
  if (user instanceof NextResponse) return user;

  const body = await req.json().catch(() => null);
  const id = typeof body?.id === "string" ? body.id : "";
  const status = typeof body?.status === "string" ? body.status.toUpperCase() : "";

  if (!id || !status || !Object.keys(TransactionStatus).includes(status)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const updated = await prisma.withdrawal.update({
    where: { id },
    data: { status: status as TransactionStatus },
  });

  return NextResponse.json({ withdrawal: updated });
}
