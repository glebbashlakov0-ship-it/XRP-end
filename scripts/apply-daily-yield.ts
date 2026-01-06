import "dotenv/config";
import { prisma } from "../src/lib/prisma";

const DAILY_RATE = 0.01;

async function main() {
  const users = await prisma.userBalance.findMany();
  const now = new Date();

  for (const balance of users) {
    const daysElapsed = Math.max(
      1,
      Math.floor((now.getTime() - balance.lastYieldAt.getTime()) / (1000 * 60 * 60 * 24))
    );
    const reward = balance.activeStakesXrp * DAILY_RATE * daysElapsed;
    const totalXrp = balance.totalXrp + reward;
    const rewardsXrp = balance.rewardsXrp + reward;

    await prisma.userBalance.update({
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
  }

  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
