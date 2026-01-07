import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiAdmin } from "@/lib/auth/api";

const DAILY_RATE = 0.01;

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const user = await requireApiAdmin();
  if (user instanceof NextResponse) return user;

  const balances = await prisma.userBalance.findMany();
  const now = new Date();

  for (const balance of balances) {
    const last = balance.lastYieldAt ?? balance.updatedAt ?? now;
    const daysElapsed = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
    if (daysElapsed < 1) continue;
    const reward = balance.activeStakesXrp * DAILY_RATE * daysElapsed;
    const totalXrp = balance.totalXrp + reward;
    const rewardsXrp = balance.rewardsXrp + reward;

    await prisma.userBalance.update({
      where: { id: balance.id },
      data: { totalXrp, rewardsXrp, lastYieldAt: now, totalUsd: totalXrp },
    });

    await prisma.portfolioSnapshot.create({
      data: { userId: balance.userId, totalXrp, totalUsd: totalXrp },
    });
  }

  return NextResponse.json({ ok: true, processed: balances.length });
}
