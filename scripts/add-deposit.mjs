import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const DAY_MS = 24 * 60 * 60 * 1000;

function parseArgs(argv) {
  const args = new Map();
  for (let i = 0; i < argv.length; i += 1) {
    const key = argv[i];
    if (!key.startsWith("--")) continue;
    const value = argv[i + 1];
    if (value && !value.startsWith("--")) {
      args.set(key, value);
      i += 1;
    } else {
      args.set(key, "true");
    }
  }
  return args;
}

function toNumber(value, fallback) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

const args = parseArgs(process.argv.slice(2));
const email = args.get("--email");
const amount = toNumber(args.get("--amount"), 0);
const daysAgo = Math.max(0, toNumber(args.get("--days-ago"), 0));
const status = (args.get("--status") || "PAID").toUpperCase();
const backdateYield = args.get("--backdate-yield") !== "false";

if (!email || !amount || !Number.isFinite(amount)) {
  console.error("Usage: node scripts/add-deposit.mjs --email user@example.com --amount 100 --days-ago 5 --status PAID");
  process.exit(1);
}

const createdAt = new Date(Date.now() - daysAgo * DAY_MS);

try {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error(`User not found: ${email}`);
    process.exit(1);
  }

  const wallet = await prisma.walletConfig.findUnique({ where: { currency: "XRP" } });
  const address = wallet?.address ?? "";

  const deposit = await prisma.deposit.create({
    data: {
      userId: user.id,
      amount,
      amountXrp: amount,
      currency: "XRP",
      address,
      status,
      createdAt,
      updatedAt: createdAt,
    },
  });

  const balance = await prisma.userBalance.findUnique({ where: { userId: user.id } });
  const nextLastYieldAt =
    backdateYield && (!balance?.lastYieldAt || balance.lastYieldAt > createdAt)
      ? createdAt
      : balance?.lastYieldAt ?? createdAt;

  let updatedBalance;
  if (!balance) {
    updatedBalance = await prisma.userBalance.create({
      data: {
        userId: user.id,
        totalXrp: amount,
        totalUsd: amount,
        activeStakesXrp: amount,
        rewardsXrp: 0,
        lastYieldAt: nextLastYieldAt,
      },
    });
  } else {
    updatedBalance = await prisma.userBalance.update({
      where: { userId: user.id },
      data: {
        totalXrp: balance.totalXrp + amount,
        totalUsd: balance.totalUsd + amount,
        activeStakesXrp: balance.activeStakesXrp + amount,
        lastYieldAt: nextLastYieldAt,
      },
    });
  }

  await prisma.portfolioSnapshot.create({
    data: {
      userId: user.id,
      totalXrp: updatedBalance.totalXrp,
      totalUsd: updatedBalance.totalUsd,
      createdAt,
    },
  });

  console.log(
    `Created deposit ${deposit.id} for ${email} (${amount} XRP, ${daysAgo} days ago, status ${status}).`
  );
} catch (error) {
  console.error(error);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
