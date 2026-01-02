"use client";

import { useEffect, useMemo, useState } from "react";

const DAILY_YIELD_RATE = 0.0106;

function formatUsd(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

export default function DepositClient() {
  const [amountUsd, setAmountUsd] = useState(819251);
  const [days, setDays] = useState(16);
  const [currency, setCurrency] = useState("XRP");
  const [availableCurrencies, setAvailableCurrencies] = useState<string[]>(["XRP", "USDT", "USDC"]);
  const depositDetails = {
    XRP: {
      label: "XRP (XRP Ledger)",
      address: "rhWPVrNsddEig3MSambjuR2XwcDLLhtZM9",
      qr: "/deposit/qr-xrp.jpg",
    },
    USDT: {
      label: "USDT",
      address: "TNg7uCJ9y46DkXJqf1V4wVZ8M5wT1Qm3qP",
      qr: "/deposit/qr-usdt.jpg",
    },
    USDC: {
      label: "USDC",
      address: "0x9C2bcd43e1f2c2b2b28a1cF1b2d62a8a2c4D3f1A",
      qr: "/deposit/qr-usdc.jpg",
    },
    BTC: {
      label: "BTC",
      address: "bc1qexamplebtcaddress0000000000000",
      qr: "/deposit/qr-deposit.jpg",
    },
    ETH: {
      label: "ETH",
      address: "0xexampleethaddress000000000000000000000000",
      qr: "/deposit/qr-deposit.jpg",
    },
    BNB: {
      label: "BNB",
      address: "bnb1examplebnbaddress0000000000000",
      qr: "/deposit/qr-deposit.jpg",
    },
    SOL: {
      label: "SOL",
      address: "SoLexampleaddress000000000000000000000",
      qr: "/deposit/qr-deposit.jpg",
    },
    ADA: {
      label: "ADA",
      address: "addr1exampleadaaddress0000000000000",
      qr: "/deposit/qr-deposit.jpg",
    },
    DOGE: {
      label: "DOGE",
      address: "Dexampledogeaddress0000000000000000",
      qr: "/deposit/qr-deposit.jpg",
    },
    TRX: {
      label: "TRX",
      address: "TExampletrxaddress0000000000000000",
      qr: "/deposit/qr-deposit.jpg",
    },
    TON: {
      label: "TON",
      address: "UQexampletonaddress0000000000000000",
      qr: "/deposit/qr-deposit.jpg",
    },
    MATIC: {
      label: "MATIC",
      address: "0xexamplematicaddress0000000000000000000000",
      qr: "/deposit/qr-deposit.jpg",
    },
    LTC: {
      label: "LTC",
      address: "ltc1exampleltcaddress0000000000000",
      qr: "/deposit/qr-deposit.jpg",
    },
    DOT: {
      label: "DOT",
      address: "15exampledotaddress000000000000000",
      qr: "/deposit/qr-deposit.jpg",
    },
  } as const;

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem("lkCustomAssets");
      if (!stored) return;
      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed)) return;
      const symbols = parsed
        .map((item) => (typeof item?.symbol === "string" ? item.symbol.toUpperCase() : null))
        .filter(Boolean) as string[];
      if (symbols.length === 0) return;
      const merged = Array.from(new Set(["XRP", "USDT", "USDC", ...symbols]));
      setAvailableCurrencies(merged);
      if (!merged.includes(currency)) {
        setCurrency(merged[0]);
      }
    } catch {
      // Ignore invalid local storage values.
    }
  }, []);

  const selectedDeposit =
    depositDetails[currency as keyof typeof depositDetails] ??
    ({
      label: currency,
      address: "Address will be assigned after selection.",
      qr: "/deposit/qr-deposit.jpg",
    } as const);
  const address = selectedDeposit.address;
  const qrImagePath = selectedDeposit.qr;

  const projectedUsd = useMemo(() => amountUsd * (1 + DAILY_YIELD_RATE * days), [amountUsd, days]);

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
            <button className="h-9 px-4 rounded-lg bg-blue-600 text-white text-xs font-semibold">
              Copy
            </button>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-[220px,1fr] md:items-start">
            <div className="flex justify-center md:justify-start">
              <div className="rounded-2xl border-4 border-yellow-400 bg-white p-3 shadow-sm">
                <img
                  src={qrImagePath}
                  alt={`QR code for ${address}`}
                  className="h-40 w-40"
                  loading="lazy"
                />
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
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent Deposits</h2>
          <button className="text-sm text-blue-600">View All</button>
        </div>
        <div className="mt-4 rounded-xl border border-gray-200">
          <div className="overflow-x-auto">
            <div className="min-w-[720px]">
              <div className="grid grid-cols-12 bg-gray-50 px-4 py-3 text-xs font-medium text-gray-600">
                <div className="col-span-2">Currency</div>
                <div className="col-span-4">Address</div>
                <div className="col-span-2">Amount</div>
                <div className="col-span-2">USD Value</div>
                <div className="col-span-1">Status</div>
                <div className="col-span-1">Date</div>
              </div>
              <div className="px-4 py-6 text-sm text-gray-500">No deposits found. Make your first deposit!</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
