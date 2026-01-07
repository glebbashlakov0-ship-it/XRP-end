import { prisma } from "@/lib/prisma";

const DAILY_RATE = 0.01;
const DAY_MS = 1000 * 60 * 60 * 24;

type Status = "PROCESSING" | "PAID" | "ERROR";

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

export async function applyDepositStatusChange(params: {
  userId: string;
  amountXrp: number;
  previousStatus: Status;
  nextStatus: Status;
}) {
  const { userId, amountXrp, previousStatus, nextStatus } = params;
  const wasPaid = previousStatus === "PAID";
  const isPaid = nextStatus === "PAID";

  if (wasPaid === isPaid) return null;

  const balance = await prisma.userBalance.findUnique({ where: { userId } });
  if (!balance) {
    if (!isPaid) return null;
    const created = await prisma.userBalance.create({
      data: {
        userId,
        totalXrp: amountXrp,
        totalUsd: amountXrp,
        activeStakesXrp: amountXrp,
        rewardsXrp: 0,
      },
    });
    await prisma.portfolioSnapshot.create({
      data: { userId, totalXrp: created.totalXrp, totalUsd: created.totalUsd },
    });
    return created;
  }

  const delta = isPaid ? amountXrp : -amountXrp;
  const nextActive = Math.max(balance.activeStakesXrp + delta, 0);
  const nextTotal = Math.max(balance.totalXrp + delta, 0);
  const nextRewards = Math.max(balance.rewardsXrp, 0);

  const updated = await prisma.userBalance.update({
    where: { userId },
    data: {
      totalXrp: nextTotal,
      totalUsd: nextTotal,
      activeStakesXrp: nextActive,
      rewardsXrp: nextRewards,
    },
  });

  await prisma.portfolioSnapshot.create({
    data: { userId, totalXrp: updated.totalXrp, totalUsd: updated.totalUsd },
  });

  return updated;
}

export async function applyWithdrawalStatusChange(params: {
  userId: string;
  amountXrp: number;
  previousStatus: Status;
  nextStatus: Status;
}) {
  const { userId, amountXrp, previousStatus, nextStatus } = params;
  const wasPaid = previousStatus === "PAID";
  const isPaid = nextStatus === "PAID";

  if (wasPaid === isPaid) return null;

  const balance = await prisma.userBalance.findUnique({ where: { userId } });
  if (!balance) return null;

  if (isPaid) {
    const currentActive = balance.activeStakesXrp ?? 0;
    const currentRewards = balance.rewardsXrp ?? 0;
    let remaining = amountXrp;
    const activeUsed = Math.min(currentActive, remaining);
    remaining -= activeUsed;
    const rewardsUsed = Math.min(currentRewards, remaining);
    remaining -= rewardsUsed;

    const nextActive = Math.max(currentActive - activeUsed, 0);
    const nextRewards = Math.max(currentRewards - rewardsUsed, 0);
    const nextTotal = Math.max(nextActive + nextRewards, 0);

    const updated = await prisma.userBalance.update({
      where: { userId },
      data: {
        totalXrp: nextTotal,
        activeStakesXrp: nextActive,
        rewardsXrp: nextRewards,
        totalUsd: nextTotal,
      },
    });

    await prisma.portfolioSnapshot.create({
      data: { userId, totalXrp: updated.totalXrp, totalUsd: updated.totalUsd },
    });

    return updated;
  }

  const nextActive = balance.activeStakesXrp + amountXrp;
  const nextTotal = balance.totalXrp + amountXrp;

  const updated = await prisma.userBalance.update({
    where: { userId },
    data: {
      totalXrp: nextTotal,
      totalUsd: nextTotal,
      activeStakesXrp: nextActive,
    },
  });

  await prisma.portfolioSnapshot.create({
    data: { userId, totalXrp: updated.totalXrp, totalUsd: updated.totalUsd },
  });

  return updated;
}
