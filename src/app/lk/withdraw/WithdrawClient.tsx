"use client";

import { useMemo, useState } from "react";

function formatNumber(value: number, digits = 6) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: digits,
  }).format(value);
}

export default function WithdrawClient() {
  const [currency, setCurrency] = useState("XRP");
  const [amount, setAmount] = useState(0);
  const available = 0;
  const fee = 0.00003;
  const minWithdrawal = 0.01;

  const receiveAmount = useMemo(() => Math.max(amount - fee, 0), [amount]);

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
              onChange={(e) => setCurrency(e.target.value)}
            >
              <option value="XRP">XRP (XRP Ledger)</option>
              <option value="USDT">USDT</option>
              <option value="USDC">USDC</option>
            </select>
          </label>

          <label className="grid gap-2 text-sm text-gray-600">
            <span className="font-medium text-gray-700">Wallet Address</span>
            <input
              className="h-11 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm"
              placeholder="0x..."
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
            <div className="flex items-center gap-2">
              <input
                className="h-11 flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm"
                type="number"
                min="0"
                step="0.000001"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value || 0))}
              />
              <div className="h-11 px-3 rounded-xl border border-gray-200 bg-gray-100 text-xs font-semibold text-gray-600 flex items-center">
                {currency}
              </div>
              <button
                className="h-10 px-3 rounded-lg bg-blue-600 text-white text-xs font-semibold"
                type="button"
                onClick={() => setAmount(available)}
              >
                MAX
              </button>
            </div>
            <div className="text-xs text-gray-500">
              {formatNumber(amount)} {currency} = $0.00
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

          <button className="h-11 rounded-xl bg-blue-600 text-white font-semibold">
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
                <div className="col-span-3">Transaction</div>
                <div className="col-span-2">Currency</div>
                <div className="col-span-2">Amount</div>
                <div className="col-span-2">Date</div>
                <div className="col-span-3">Status</div>
              </div>
              <div className="px-4 py-6 text-sm text-gray-500">
                No withdrawals found. Make your first withdrawal!
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
