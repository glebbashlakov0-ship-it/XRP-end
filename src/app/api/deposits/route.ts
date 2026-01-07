import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/auth/api";
import { SUPPORTED_CURRENCIES, SUPPORTED_PRICES, getWalletConfig } from "@/lib/wallets";
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

  const deposits = await prisma.deposit.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ deposits });
}

export async function POST(req: Request) {
  const user = await requireApiUser();
  if (user instanceof NextResponse) return user;

  const body = await req.json().catch(() => null);
  const amount = sanitizeAmount(body?.amount);
  const currency = typeof body?.currency === "string" ? body.currency.toUpperCase() : null;

  if (!amount || !currency) {
    return NextResponse.json({ error: "Amount and currency are required" }, { status: 400 });
  }

  if (!SUPPORTED_CURRENCIES.includes(currency as (typeof SUPPORTED_CURRENCIES)[number])) {
    return NextResponse.json({ error: "Unsupported currency" }, { status: 400 });
  }

  const price = SUPPORTED_PRICES[currency as (typeof SUPPORTED_CURRENCIES)[number]] ?? 1;
  const amountXrp = amount * price;
  const wallets = await getWalletConfig();
  const wallet = wallets.find((w) => w.currency === currency);

  const deposit = await prisma.deposit.create({
    data: {
      userId: user.id,
      amount,
      amountXrp,
      currency,
      address: wallet?.address ?? "",
      status: "PROCESSING",
    },
  });

  await applyDailyYieldIfNeeded(user.id);

  if (process.env.SUPPORT_EMAIL) {
    await sendSupportEmail({
      fromEmail: user.email,
      subject: "New deposit",
      message: `User ${user.email} submitted a deposit of ${amount} ${currency}.`,
      userId: user.id,
    }).catch(() => null);
  }

  return NextResponse.json({ deposit });
}
