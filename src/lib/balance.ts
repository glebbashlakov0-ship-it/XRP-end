import { prisma } from "@/lib/prisma";

const DAILY_RATE = 0.01;
const DAY_MS = 1000 * 60 * 60 * 24;

export async function applyDailyYieldIfNeeded(userId: string) {
  const balance = await prisma.userBalance.findUnique({ where: { userId } });
  if (!balance) return null;

  const now = new Date();
  const last = balance.lastYieldAt ?? balance.updatedAt ?? now;
  const daysElapsed = Math.floor((now.getTime() - last.getTime()) / DAY_MS);

  if (daysElapsed < 1) {
    return balance;
  }

  const reward = Math.max(balance.activeStakesXrp, 0) * DAILY_RATE * daysElapsed;
  const totalXrp = balance.totalXrp + reward;
  const rewardsXrp = balance.rewardsXrp + reward;

  const updated = await prisma.userBalance.update({
    where: { id: balance.id },
    data: {
      totalXrp,
      rewardsXrp,
      lastYieldAt: now,
      totalUsd: totalXrp,
    },
  });

  await prisma.portfolioSnapshot.create({
    data: { userId: balance.userId, totalXrp, totalUsd: totalXrp },
  });

  return updated;
}
