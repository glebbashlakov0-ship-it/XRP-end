"use client";

import { useEffect, useMemo, useState } from "react";

type ReferralLedgerEntry = {
  id: string;
  user: string;
  level: 1 | 2 | 3;
  status: "Approved" | "Pending" | "Rejected";
  action: "Stake activation" | "Reward bonus" | "Welcome bonus";
  volumeUsd: number;
  rewardUsd: number;
  timestamp: string;
  direction: "referrer" | "invitee";
};

const LEDGER: ReferralLedgerEntry[] = [
  {
    id: "ref-001",
    user: "alex@example.com",
    level: 1,
    status: "Approved",
    action: "Stake activation",
    volumeUsd: 12000,
    rewardUsd: 72,
    timestamp: "2024-11-04T10:45:00Z",
    direction: "referrer",
  },
  {
    id: "ref-002",
    user: "alex@example.com",
    level: 1,
    status: "Approved",
    action: "Welcome bonus",
    volumeUsd: 12000,
    rewardUsd: 24,
    timestamp: "2024-11-04T10:45:00Z",
    direction: "invitee",
  },
  {
    id: "ref-003",
    user: "samira@example.com",
    level: 2,
    status: "Pending",
    action: "Stake activation",
    volumeUsd: 5000,
    rewardUsd: 20,
    timestamp: "2024-11-05T08:20:00Z",
    direction: "referrer",
  },
  {
    id: "ref-004",
    user: "leo@example.com",
    level: 1,
    status: "Approved",
    action: "Reward bonus",
    volumeUsd: 6400,
    rewardUsd: 19.2,
    timestamp: "2024-11-06T13:15:00Z",
    direction: "referrer",
  },
];

const REFERRAL_TIERS = [
  { level: 1, pct: 0.6, label: "Direct invites" },
  { level: 2, pct: 0.2, label: "Invited by your partners" },
  { level: 3, pct: 0.1, label: "Network reach" },
];

function formatUsd(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function ReferralsClient() {
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState("https://xrprestaking.org");
  const referralCode = "XRPNET-8421";

  useEffect(() => {
    if (typeof window !== "undefined" && window.location?.origin) {
      setOrigin(window.location.origin);
    }
  }, []);

  const referralLink = `${origin}/register?ref=${referralCode}`;

  const totals = useMemo(() => {
    const uniqueUsers = new Set(LEDGER.map((item) => item.user));
    const approved = LEDGER.filter((item) => item.status === "Approved");
    const pending = LEDGER.filter((item) => item.status === "Pending");

    return {
      uniqueCount: uniqueUsers.size,
      approvedEarnings: approved.reduce((sum, item) => sum + item.rewardUsd, 0),
      pendingEarnings: pending.reduce((sum, item) => sum + item.rewardUsd, 0),
      approvedVolume: approved.reduce((sum, item) => sum + item.volumeUsd, 0),
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="text-lg font-semibold">Your Referral Link</div>
        <div className="mt-2 text-sm text-gray-500">
          Share this link with partners. Rewards are calculated from verified staking volume and settle once per day.
        </div>
        <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center">
          <input
            className="h-11 flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm"
            value={referralLink}
            readOnly
          />
          <button
            className="h-11 px-4 rounded-xl bg-blue-600 text-white text-sm font-semibold"
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
        <div className="mt-2 flex flex-wrap gap-4 text-xs text-gray-500">
          <span>
            Referral code: <span className="font-semibold text-blue-600">{referralCode}</span>
          </span>
          <span>Settlements: daily after stake verification.</span>
          <span>Welcome bonus is reserved for invitees after their first stake.</span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[{
          label: "Approved earnings",
          value: formatUsd(totals.approvedEarnings),
          helper: "Paid after daily reconciliation",
        },
        {
          label: "Pending earnings",
          value: formatUsd(totals.pendingEarnings),
          helper: "Awaiting eligibility checks",
        },
        {
          label: "Tracked referrals",
          value: totals.uniqueCount.toString(),
          helper: "Unique profiles tied to your code",
        },
        {
          label: "Referral volume",
          value: formatUsd(totals.approvedVolume),
          helper: "Approved active-stake volume",
        }].map((item) => (
          <div key={item.label} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="text-xs text-blue-600 font-semibold">{item.label}</div>
            <div className="mt-2 text-lg font-semibold text-gray-900">{item.value}</div>
            <div className="text-xs text-gray-500">{item.helper}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="text-lg font-semibold">Transparent reward logic</div>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl bg-gray-50 p-4 text-sm text-gray-700">
            <div className="font-semibold text-gray-900">For inviters</div>
            <ul className="mt-2 space-y-1 text-gray-600">
              <li>• Earn a share of platform rewards from verified staking volume.</li>
              <li>• Payout window: once per day after fraud and volume checks.</li>
              <li>• Multi-level support: direct invites earn the highest rate.</li>
            </ul>
          </div>
          <div className="rounded-xl bg-gray-50 p-4 text-sm text-gray-700">
            <div className="font-semibold text-gray-900">For invitees</div>
            <ul className="mt-2 space-y-1 text-gray-600">
              <li>• One-time welcome bonus on first active stake.</li>
              <li>• Reduced service fee for the first 30 days.</li>
              <li>• Rewards tracked separately; core stake size stays unchanged.</li>
            </ul>
          </div>
          <div className="rounded-xl bg-gray-50 p-4 text-sm text-gray-700">
            <div className="font-semibold text-gray-900">Abuse protection</div>
            <ul className="mt-2 space-y-1 text-gray-600">
              <li>• Device / IP fingerprinting to block self-referrals.</li>
              <li>• Cooling period before payouts on suspicious spikes.</li>
              <li>• Volume verification against on-chain deposits.</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {REFERRAL_TIERS.map((item) => (
          <div key={item.level} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm text-center">
            <div className="text-xs text-gray-500">Level {item.level}</div>
            <div className="mt-2 text-2xl font-semibold text-blue-600">{(item.pct * 100).toFixed(0)}%</div>
            <div className="text-xs text-gray-500">{item.label}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-lg font-semibold">Referral earnings ledger</div>
            <div className="text-sm text-gray-500">Every line item maps to a staking action; nothing is auto-generated.</div>
          </div>
          <div className="text-xs text-gray-500">Payout status updates daily after compliance checks.</div>
        </div>
        <div className="mt-4 overflow-x-auto">
          <div className="min-w-[760px] rounded-xl border border-gray-200">
            <div className="grid grid-cols-12 bg-gray-50 px-4 py-3 text-xs font-medium text-gray-600">
              <div className="col-span-3">User</div>
              <div className="col-span-2">Level</div>
              <div className="col-span-2">Action</div>
              <div className="col-span-2">Volume</div>
              <div className="col-span-2">Reward</div>
              <div className="col-span-1 text-right">Status</div>
            </div>
            {LEDGER.map((entry) => (
              <div key={entry.id} className="grid grid-cols-12 border-t border-gray-200 px-4 py-3 text-sm text-gray-700">
                <div className="col-span-3">
                  <div className="font-semibold text-gray-900">{entry.user}</div>
                  <div className="text-xs text-gray-500">{formatDate(entry.timestamp)}</div>
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700">L{entry.level}</span>
                  <span className="text-xs text-gray-500">{entry.direction === "referrer" ? "You" : "Invitee"}</span>
                </div>
                <div className="col-span-2 text-gray-800">{entry.action}</div>
                <div className="col-span-2 text-gray-800">{formatUsd(entry.volumeUsd)}</div>
                <div className="col-span-2 font-semibold text-emerald-600">{formatUsd(entry.rewardUsd)}</div>
                <div className="col-span-1 text-right">
                  <span
                    className={`rounded-full px-2 py-1 text-[11px] font-semibold ${
                      entry.status === "Approved"
                        ? "bg-emerald-50 text-emerald-700"
                        : entry.status === "Pending"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-red-50 text-red-700"
                    }`}
                  >
                    {entry.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="text-lg font-semibold">How to share safely</div>
        <div className="mt-2 grid gap-3 text-sm text-gray-600 md:grid-cols-2">
          <div className="rounded-xl bg-gray-50 p-4">
            <div className="font-semibold text-gray-900">Motivate partners</div>
            <ul className="mt-2 space-y-1">
              <li>• Highlight the welcome bonus and lower starter fees.</li>
              <li>• Encourage larger active stakes for faster Total Balance growth.</li>
              <li>• Keep communications personal; cold outreach is disallowed.</li>
            </ul>
          </div>
          <div className="rounded-xl bg-gray-50 p-4">
            <div className="font-semibold text-gray-900">Stay compliant</div>
            <ul className="mt-2 space-y-1">
              <li>• One account per person; duplicate or automated signups are blocked.</li>
              <li>• Rewards only accrue after deposits clear and stakes go live.</li>
              <li>• Suspicious activity places payouts on hold until reviewed.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
