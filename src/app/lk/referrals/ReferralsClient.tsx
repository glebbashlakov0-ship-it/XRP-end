"use client";

import { useEffect, useMemo, useState } from "react";

type ReferralsClientProps = {
  referralCode: string;
  totals: {
    total: number;
    verified: number;
    pending: number;
  };
};

export default function ReferralsClient({ referralCode, totals }: ReferralsClientProps) {
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined" && window.location?.origin) {
      setOrigin(window.location.origin);
    }
  }, []);

  const referralLink = `${origin}/register?ref=${referralCode}`;
  const stats = useMemo(
    () => [
      {
        label: "Total Referred",
        value: totals.total.toString(),
      },
      {
        label: "Referral Points",
        value: totals.total > 0 ? totals.total.toString() : "No referral points yet",
      },
      {
        label: "ETH Earned",
        value: "0",
      },
    ],
    [totals.total]
  );

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="text-lg font-semibold">Your Referral Link</div>
        <div className="mt-2 text-sm text-gray-500">
          Share this link with friends and receive 10% of their commission.
        </div>
        <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center">
          <input
            className="h-11 flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm"
            value={referralLink}
            readOnly
          />
          <button
            className="h-11 px-6 rounded-xl bg-blue-600 text-white text-sm font-semibold"
            type="button"
            onClick={async () => {
              await navigator.clipboard.writeText(referralLink);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
          >
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
          <span>*</span>
          <span>
            Your unique referral code: <span className="font-semibold text-blue-600">{referralCode}</span>
          </span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((item) => (
          <div key={item.label} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="text-xs text-blue-600 font-semibold">{item.label}</div>
            <div className="mt-2 text-xl font-semibold text-gray-900">{item.value}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { level: 1, pct: "10%", label: "Direct referrals" },
          { level: 2, pct: "15%", label: "Second level referrals" },
          { level: 3, pct: "20%", label: "Third level referrals" },
        ].map((item) => (
          <div key={item.level} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm text-center">
            <div className="text-xs text-gray-500">Level {item.level}</div>
            <div className="mt-2 text-2xl font-semibold text-blue-600">{item.pct}</div>
            <div className="text-xs text-gray-500">{item.label}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="text-lg font-semibold">Referral Earnings History</div>
        <div className="mt-6 flex flex-col items-center text-center text-sm text-gray-500">
          <div className="text-3xl">🙂</div>
          <div className="mt-3 font-semibold text-gray-700">You have no referral earnings yet</div>
          <div className="mt-1 text-gray-500">Share your referral link with friends to start earning commissions</div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="text-lg font-semibold">About the Referral Program</div>
        <div className="mt-2 text-sm text-gray-600">
          Our referral program allows you to earn commissions for each invited user. The more users you invite, the
          higher your commission percentage will be.
        </div>
        <div className="mt-4 text-sm text-gray-700">
          <div className="font-semibold text-gray-900">How It Works</div>
          <ul className="mt-2 space-y-1 text-gray-600">
            <li>- Copy your unique referral link</li>
            <li>- Share your link with friends via social media or email</li>
            <li>- When a new user registers using your link, they automatically become your referral</li>
            <li>- You receive a percentage of the commissions for all operations performed by your referrals</li>
          </ul>
        </div>
        <div className="mt-4 text-sm text-gray-700">
          <div className="font-semibold text-gray-900">Program Terms</div>
          <div className="mt-2 text-gray-600">
            Commissions are credited automatically and available for withdrawal immediately after they are credited.
            The minimum withdrawal amount is 0.001 XRP. There are no time limits or restrictions on the number of
            invited users.
          </div>
        </div>
      </div>
    </div>
  );
}
