import { prisma } from "./prisma";
import { DEFAULT_WALLETS, SUPPORTED_CURRENCIES, SUPPORTED_PRICES, type SupportedCurrency } from "./wallets/shared";

const COINGECKO_IDS: Record<SupportedCurrency, string> = {
  XRP: "ripple",
  USDT: "tether",
  USDC: "usd-coin",
};

function buildQrImageUrl(address: string) {
  const encoded = encodeURIComponent(address);
  return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encoded}`;
}

export async function getWalletConfig() {
  const configs = await prisma.walletConfig.findMany();
  const map = new Map(configs.map((c) => [c.currency.toUpperCase(), c]));

  return SUPPORTED_CURRENCIES.map((currency) => {
    const existing = map.get(currency);
    if (existing) {
      const fallback = DEFAULT_WALLETS[currency];
      const address = existing.address?.trim() || fallback.address;
      const qrImage = existing.qrImage?.trim() || buildQrImageUrl(address);
      return {
        currency,
        address,
        qrImage,
      };
    }
    const fallback = DEFAULT_WALLETS[currency];
    return {
      currency,
      address: fallback.address,
      qrImage: buildQrImageUrl(fallback.address),
    };
  });
}

export async function upsertWalletConfig(currency: SupportedCurrency, address: string) {
  const qrImage = buildQrImageUrl(address);
  return prisma.walletConfig.upsert({
    where: { currency },
    update: { address, qrImage },
    create: { currency, address, qrImage },
  });
}

export { SUPPORTED_CURRENCIES, SUPPORTED_PRICES };

export async function fetchUsdPrices() {
  const ids = Object.values(COINGECKO_IDS).join(",");
  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`,
      { cache: "no-store" }
    );
    if (!res.ok) return SUPPORTED_PRICES;
    const data = (await res.json()) as Record<string, { usd?: number }>;
    const next: Record<SupportedCurrency, number> = { ...SUPPORTED_PRICES };
    (Object.keys(COINGECKO_IDS) as SupportedCurrency[]).forEach((symbol) => {
      const id = COINGECKO_IDS[symbol];
      const usd = data?.[id]?.usd;
      if (typeof usd === "number" && Number.isFinite(usd)) {
        next[symbol] = usd;
      }
    });
    return next;
  } catch {
    return SUPPORTED_PRICES;
  }
}
export type { SupportedCurrency };
