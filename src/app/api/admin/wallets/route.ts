import { NextResponse } from "next/server";
import { requireApiAdmin } from "@/lib/auth/api";
import { SUPPORTED_CURRENCIES, upsertWalletConfig, getWalletConfig } from "@/lib/wallets";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await requireApiAdmin();
  if (user instanceof NextResponse) return user;
  const wallets = await getWalletConfig();
  return NextResponse.json({ wallets, supported: SUPPORTED_CURRENCIES });
}

export async function PUT(req: Request) {
  const user = await requireApiAdmin();
  if (user instanceof NextResponse) return user;

  const body = await req.json().catch(() => null);
  if (!body?.currency || !body?.address || !body?.qrImage) {
    return NextResponse.json({ error: "currency, address, and qrImage are required" }, { status: 400 });
  }
  const currency = String(body.currency).toUpperCase();
  if (!SUPPORTED_CURRENCIES.includes(currency as (typeof SUPPORTED_CURRENCIES)[number])) {
    return NextResponse.json({ error: "Unsupported currency" }, { status: 400 });
  }

  const address = String(body.address).trim();
  const qrImage = String(body.qrImage).trim();

  await upsertWalletConfig(currency as (typeof SUPPORTED_CURRENCIES)[number], address, qrImage);
  return NextResponse.json({ ok: true });
}
