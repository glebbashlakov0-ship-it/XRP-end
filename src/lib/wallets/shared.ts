export const SUPPORTED_CURRENCIES = ["XRP", "USDT", "USDC"] as const;

export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];

export const DEFAULT_WALLETS: Record<SupportedCurrency, { address: string; qrImage: string }> = {
  XRP: {
    address: "rhWPVrNsddEig3MSambjuR2XwcDLLhtZM9",
    qrImage: "/deposit/qr-xrp.jpg",
  },
  USDT: {
    address: "TNg7uCJ9y46DkXJqf1V4wVZ8M5wT1Qm3qP",
    qrImage: "/deposit/qr-usdt.jpg",
  },
  USDC: {
    address: "0x9C2bcd43e1f2c2b2b28a1cF1b2d62a8a2c4D3f1A",
    qrImage: "/deposit/qr-usdc.jpg",
  },
};

export const SUPPORTED_PRICES: Record<SupportedCurrency, number> = {
  XRP: 1,
  USDT: 1,
  USDC: 1,
};
