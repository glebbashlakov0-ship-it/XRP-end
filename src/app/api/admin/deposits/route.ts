import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiAdmin } from "@/lib/auth/api";
import { TransactionStatus } from "@prisma/client";
import { applyDepositStatusChange } from "@/lib/balance";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await requireApiAdmin();
  if (user instanceof NextResponse) return user;

  const deposits = await prisma.deposit.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: true },
  });

  return NextResponse.json({ deposits });
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

  const current = await prisma.deposit.findUnique({ where: { id } });
  if (!current) {
    return NextResponse.json({ error: "Deposit not found" }, { status: 404 });
  }
  const nextStatus = status as TransactionStatus;
  if (current.status !== nextStatus) {
    await prisma.deposit.update({
      where: { id },
      data: { status: nextStatus },
    });
    await applyDepositStatusChange({
      userId: current.userId,
      amountXrp: current.amountXrp,
      previousStatus: current.status,
      nextStatus,
    });
  }

  const updated = await prisma.deposit.findUnique({ where: { id } });

  return NextResponse.json({ deposit: updated });
}
