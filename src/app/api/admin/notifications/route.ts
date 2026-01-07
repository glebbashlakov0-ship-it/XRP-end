import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiAdmin } from "@/lib/auth/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type NotificationItem = {
  id: string;
  type: "deposit" | "withdrawal" | "support";
  createdAt: string;
};

export async function GET(req: Request) {
  const admin = await requireApiAdmin();
  if (admin instanceof NextResponse) return admin;

  const url = new URL(req.url);
  const sinceRaw = url.searchParams.get("since");
  const sinceMs = sinceRaw ? Number(sinceRaw) : Date.now() - 60_000;
  const since = new Date(Number.isFinite(sinceMs) ? sinceMs : Date.now() - 60_000);

  const [deposits, withdrawals, support] = await Promise.all([
    prisma.deposit.findMany({
      where: { createdAt: { gt: since } },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, createdAt: true },
    }),
    prisma.withdrawal.findMany({
      where: { createdAt: { gt: since } },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, createdAt: true },
    }),
    prisma.supportMessage.findMany({
      where: { createdAt: { gt: since } },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, createdAt: true },
    }),
  ]);

  const items: NotificationItem[] = [
    ...deposits.map((d) => ({ id: d.id, type: "deposit" as const, createdAt: d.createdAt.toISOString() })),
    ...withdrawals.map((w) => ({ id: w.id, type: "withdrawal" as const, createdAt: w.createdAt.toISOString() })),
    ...support.map((s) => ({ id: s.id, type: "support" as const, createdAt: s.createdAt.toISOString() })),
  ];

  items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return NextResponse.json({ items: items.slice(0, 10) });
}
