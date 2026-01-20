import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/auth/api";
import { SUPPORTED_CURRENCIES, fetchUsdPrices } from "@/lib/wallets";
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
  const available = balance?.rewardsXrp ?? 0;
  const prices = await fetchUsdPrices();
  const price = prices[currency as (typeof SUPPORTED_CURRENCIES)[number]] ?? 1;
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
