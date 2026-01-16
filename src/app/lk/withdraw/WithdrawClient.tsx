"use client";

import { useEffect, useMemo, useState } from "react";
import { SUPPORTED_CURRENCIES, SUPPORTED_PRICES } from "@/lib/wallets/shared";

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

function formatNumber(value: number, digits = 6) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: digits,
  }).format(value);
}

type WithdrawClientProps = {
  availableXrp: number;
};

export default function WithdrawClient({ availableXrp }: WithdrawClientProps) {
  const [currency, setCurrency] = useState<"XRP" | "USDT" | "USDC">("XRP");
  const [amount, setAmount] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<
    { id: string; amount: number; currency: string; status: string; createdAt: string; walletAddress: string }[]
  >([]);
  const [prices, setPrices] = useState<Record<string, number>>({
    XRP: 1,
    USDT: 1,
    USDC: 1,
  });
  const rate = prices[currency] ?? 1;
  const xrpUsd = prices.XRP ?? 1;
  const availableXrpUsd = availableXrp * xrpUsd;
  const available = rate > 0 ? availableXrpUsd / rate : 0;
  const fee = 0.00003;
  const minWithdrawal = 0.01;

  const amountValue = Number(amount || 0);
  const receiveAmount = useMemo(() => Math.max(amountValue - fee, 0), [amountValue]);
  const amountUsd = useMemo(() => amountValue * rate, [amountValue, rate]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/withdrawals", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        setHistory(data?.withdrawals ?? []);
      } catch {
        // ignore
      }
    };
    load();
  }, []);

  useEffect(() => {
    const loadPrices = async () => {
      const ids = Object.values(COINGECKO_IDS).join(",");
      try {
        const res = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`,
          { cache: "no-store" }
        );
        if (!res.ok) return;
        const data = await res.json();
        setPrices({
          XRP: data?.[COINGECKO_IDS.XRP]?.usd ?? 1,
          USDT: data?.[COINGECKO_IDS.USDT]?.usd ?? 1,
          USDC: data?.[COINGECKO_IDS.USDC]?.usd ?? 1,
        });
      } catch {
        // ignore
      }
    };
    loadPrices();
  }, []);

  const submit = async () => {
    setMessage(null);
    setError(null);

    const res = await fetch("/api/withdrawals", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ amount: amountValue, currency, walletAddress }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Unable to create withdrawal");
      return;
    }

    const data = await res.json();
    setHistory((prev) => [data.withdrawal, ...prev].slice(0, 20));
    setMessage(`Payment of ${formatNumber(amountValue)} ${currency} has been accepted and is now processing.`);
    setAmount("");
    setWalletAddress("");
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
          Cryptocurrency
        </div>

        <div className="mt-4 grid gap-5">
          <label className="grid gap-2 text-sm text-gray-600">
            <span className="font-medium text-gray-700">Select Currency</span>
            <select
              className="h-11 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm"
              value={currency}
              onChange={(e) => setCurrency(e.target.value as typeof currency)}
            >
              {SUPPORTED_CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm text-gray-600">
            <span className="font-medium text-gray-700">Wallet Address</span>
            <input
              className="h-11 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
            />
            <span className="text-xs text-gray-500">Enter your {currency} wallet address to receive funds.</span>
          </label>

          <div className="grid gap-2 text-sm text-gray-600">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-700">Amount</span>
              <span className="text-xs text-gray-500">
                Available: {formatNumber(available)} {currency}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <input
                className="h-11 flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm"
                type="number"
                min="0"
                max={available}
                step="0.000001"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <div className="h-11 px-3 rounded-xl border border-gray-200 bg-gray-100 text-xs font-semibold text-gray-600 flex items-center">
                {currency}
              </div>
              <button
                className="h-10 px-3 rounded-lg bg-blue-600 text-white text-xs font-semibold whitespace-nowrap"
                type="button"
                onClick={() => setAmount(available.toString())}
              >
                MAX
              </button>
            </div>
            <div className="text-xs text-gray-500">
              {formatNumber(amountValue)} {currency} = ${formatNumber(amountUsd, 2)}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
            <div className="flex items-center justify-between">
              <span>Network Fee</span>
              <span>~{formatNumber(fee)} {currency}</span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span>You will receive (approx.)</span>
              <span>{formatNumber(receiveAmount)} {currency}</span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span>Min. withdrawal</span>
              <span>{formatNumber(minWithdrawal)} {currency}</span>
            </div>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <div className="font-semibold">Important Security Notice</div>
            <ul className="mt-2 space-y-1 text-xs">
              <li>Double-check the wallet address before submitting.</li>
              <li>Network fee will be deducted from your withdrawal amount.</li>
              <li>Transactions are irreversible — ensure address is correct.</li>
            </ul>
          </div>

          {message ? <div className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</div> : null}
          {error ? <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div> : null}

          <button className="h-11 rounded-xl bg-blue-600 text-white font-semibold" type="button" onClick={submit}>
            Withdraw Funds
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent Withdrawals</h2>
          <button className="text-sm text-blue-600">View All</button>
        </div>
        <div className="mt-4 rounded-xl border border-gray-200">
          <div className="overflow-x-auto">
            <div className="min-w-[680px]">
              <div className="grid grid-cols-12 bg-gray-50 px-4 py-3 text-xs font-medium text-gray-600">
                <div className="col-span-3">Wallet</div>
                <div className="col-span-2">Currency</div>
                <div className="col-span-2">Amount</div>
                <div className="col-span-2">Date</div>
                <div className="col-span-3">Status</div>
              </div>
              {history.length === 0 ? (
                <div className="px-4 py-6 text-sm text-gray-500">
                  No withdrawals found. Make your first withdrawal!
                </div>
              ) : (
                history.map((w) => (
                  <div key={w.id} className="grid grid-cols-12 px-4 py-3 text-sm text-gray-700 border-t border-gray-100">
                    <div className="col-span-3 break-all text-xs">{w.walletAddress}</div>
                    <div className="col-span-2">{w.currency}</div>
                    <div className="col-span-2">{formatNumber(w.amount)} {w.currency}</div>
                    <div className="col-span-2">{new Date(w.createdAt).toLocaleString()}</div>
                    <div className={`col-span-3 font-medium ${STATUS_STYLES[w.status] ?? "text-gray-600"}`}>
                      {w.status}
                    </div>
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
