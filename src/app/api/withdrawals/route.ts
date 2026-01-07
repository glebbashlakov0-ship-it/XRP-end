import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/auth/api";
import { SUPPORTED_CURRENCIES, SUPPORTED_PRICES } from "@/lib/wallets";
import { sendSupportEmail } from "@/lib/auth/mailer";
import { applyDailyYieldIfNeeded } from "@/lib/balance";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function sanitizeAmount(value: unknown) {
  const num = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(num) || num <= 0) return null;
  return num;
}

export async function GET() {
  const user = await requireApiUser();
  if (user instanceof NextResponse) return user;

  const withdrawals = await prisma.withdrawal.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ withdrawals });
}

export async function POST(req: Request) {
  const user = await requireApiUser();
  if (user instanceof NextResponse) return user;

  const body = await req.json().catch(() => null);
  const amount = sanitizeAmount(body?.amount);
  const currency = typeof body?.currency === "string" ? body.currency.toUpperCase() : null;
  const walletAddress = typeof body?.walletAddress === "string" ? body.walletAddress.trim() : "";

  if (!amount || !currency || !walletAddress) {
    return NextResponse.json({ error: "Amount, currency, and walletAddress are required" }, { status: 400 });
  }

  if (!SUPPORTED_CURRENCIES.includes(currency as (typeof SUPPORTED_CURRENCIES)[number])) {
    return NextResponse.json({ error: "Unsupported currency" }, { status: 400 });
  }

  await applyDailyYieldIfNeeded(user.id);
  const balance = await prisma.userBalance.findUnique({ where: { userId: user.id } });
  const available = balance?.totalXrp ?? 0;
  const price = SUPPORTED_PRICES[currency as (typeof SUPPORTED_CURRENCIES)[number]] ?? 1;
  const amountXrp = amount * price;

  if (amountXrp > available) {
    return NextResponse.json({ error: "Amount exceeds available balance" }, { status: 400 });
  }

  const withdrawal = await prisma.withdrawal.create({
    data: {
      userId: user.id,
      amount,
      amountXrp,
      currency,
      walletAddress,
      status: "PROCESSING",
    },
  });

  const currentActive = balance?.activeStakesXrp ?? 0;
  const currentRewards = balance?.rewardsXrp ?? 0;
  let remaining = amountXrp;
  const activeUsed = Math.min(currentActive, remaining);
  remaining -= activeUsed;
  const rewardsUsed = Math.min(currentRewards, remaining);
  remaining -= rewardsUsed;

  const nextActive = Math.max(currentActive - activeUsed, 0);
  const nextRewards = Math.max(currentRewards - rewardsUsed, 0);
  const nextTotal = Math.max(nextActive + nextRewards, 0);

  const updated = await prisma.userBalance.update({
    where: { userId: user.id },
    data: {
      totalXrp: nextTotal,
      activeStakesXrp: nextActive,
      rewardsXrp: nextRewards,
      totalUsd: nextTotal,
    },
  });

  await prisma.portfolioSnapshot.create({
    data: { userId: user.id, totalXrp: updated.totalXrp, totalUsd: updated.totalUsd },
  });

  if (process.env.SUPPORT_EMAIL) {
    await sendSupportEmail({
      fromEmail: user.email,
      subject: "New withdrawal",
      message: `User ${user.email} requested a withdrawal of ${amount} ${currency} to ${walletAddress}.`,
      userId: user.id,
    }).catch(() => null);
  }

  return NextResponse.json({ withdrawal });
}
