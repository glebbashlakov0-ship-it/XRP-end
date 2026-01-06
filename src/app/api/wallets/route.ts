import { NextResponse } from "next/server";
import { getWalletConfig } from "@/lib/wallets";
import { requireApiUser } from "@/lib/auth/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await requireApiUser();
  if (user instanceof NextResponse) return user;

  const wallets = await getWalletConfig();
  return NextResponse.json({ wallets });
}
