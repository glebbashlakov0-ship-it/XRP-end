import { prisma } from "./prisma";
import { DEFAULT_WALLETS, SUPPORTED_CURRENCIES, SUPPORTED_PRICES, type SupportedCurrency } from "./wallets/shared";

export async function getWalletConfig() {
  const configs = await prisma.walletConfig.findMany();
  const map = new Map(configs.map((c) => [c.currency.toUpperCase(), c]));

  return SUPPORTED_CURRENCIES.map((currency) => {
    const existing = map.get(currency);
    if (existing) {
      return {
        currency,
        address: existing.address,
        qrImage: existing.qrImage,
      };
    }
    const fallback = DEFAULT_WALLETS[currency];
    return {
      currency,
      address: fallback.address,
      qrImage: fallback.qrImage,
    };
  });
}

export async function upsertWalletConfig(currency: SupportedCurrency, address: string, qrImage: string) {
  return prisma.walletConfig.upsert({
    where: { currency },
    update: { address, qrImage },
    create: { currency, address, qrImage },
  });
}

export { SUPPORTED_CURRENCIES, SUPPORTED_PRICES };
export type { SupportedCurrency };
