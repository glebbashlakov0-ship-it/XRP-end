"use client";

import { useMemo, useState } from "react";
import Section from "@/components/ui/Section";
import Card from "@/components/ui/Card";
import Divider from "@/components/ui/Divider";
import { roi } from "@/lib/landingData";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function formatXrp(n: number) {
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function MiniLineChart({ points }: { points: number[] }) {
  const w = 520;
  const h = 140;
  const pad = 10;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const norm = (v: number) => {
    if (max === min) return h / 2;
    return h - pad - ((v - min) / (max - min)) * (h - pad * 2);
  };

  const d = points
    .map((p, i) => {
      const x = pad + (i / (points.length - 1)) * (w - pad * 2);
      const y = norm(p);
      return `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-[160px]">
      <path d={d} fill="none" stroke="currentColor" strokeWidth="2.5" className="text-gray-900" />
      <path
        d={`${d} L ${w - pad} ${h - pad} L ${pad} ${h - pad} Z`}
        fill="currentColor"
        className="text-gray-900/10"
      />
    </svg>
  );
}

export default function RoiCalculator() {
  const [amount, setAmount] = useState(1080);
  const [days, setDays] = useState(30);
  const [apr, setApr] = useState(7.5);
  const [fee, setFee] = useState(0.8);

  const computed = useMemo(() => {
    const aprNet = Math.max(0, apr - fee);
    const dailyRate = aprNet / 100 / 365;
    const estReturn = amount * dailyRate * days;
    const totalValue = amount + estReturn;
    const roiPct = amount > 0 ? (estReturn / amount) * 100 : 0;

    return {
      dailyYieldPct: dailyRate * 100,
      estReturn,
      totalValue,
      roiPct
    };
  }, [amount, days, apr, fee]);

  const chartData = useMemo(() => {
    // Smooth monotonic curve (concave inward) for 30d, tied to APR but not claiming real data.
    const base = apr * 0.66;
    const span = apr - base;
    const pts: number[] = [];
    for (let i = 0; i < 30; i++) {
      const t = i / 29;
      const eased = Math.pow(t, 1.7);
      pts.push(base + span * eased);
    }
    return pts;
  }, [apr]);

  const badgeStyles = [
    { card: "border-emerald-100 bg-emerald-50", dot: "bg-emerald-500" },
    { card: "border-blue-100 bg-blue-50", dot: "bg-blue-500" },
    { card: "border-purple-100 bg-purple-50", dot: "bg-purple-500" }
  ];

  return (
    <Section className="pt-0">
      <div className="max-w-4xl">
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-gray-900">{roi.title}</h2>
        <p className="mt-3 text-base text-gray-700 leading-relaxed">{roi.disclaimer}</p>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.05fr_1fr] lg:items-stretch">
        <Card className="shadow-none h-full">
          <div className="text-lg font-semibold text-gray-900">{roi.calculatorTitle}</div>
          <p className="mt-2 text-sm text-gray-700">
            Adjust inputs to view estimated yield and ROI metrics.
          </p>

          <Divider className="my-6" />

          <div className="grid gap-6">
            <div className="grid gap-2">
              <div className="text-sm font-medium text-gray-700">{roi.tokenLabel}</div>
              <select className="h-11 rounded-xl border border-gray-200 px-3 bg-gray-50 text-gray-800 outline-none focus:ring-2 focus:ring-gray-900/10">
                <option>{roi.defaultToken}</option>
              </select>
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-gray-700">{roi.amountLabel}</div>
                <input
                  className="h-10 w-28 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-gray-900/10"
                  value={amount}
                  onChange={(e) => setAmount(clamp(Number(e.target.value || 0), 1, 250000))}
                  inputMode="numeric"
                />
              </div>
              <input
                type="range"
                min={1}
                max={250000}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full"
              />
              <div className="text-xs text-gray-500 flex justify-between">
                <span>1</span>
                <span>250,000</span>
              </div>

              <div className="mt-3 rounded-2xl border border-gray-200 p-4 bg-gray-50">
                <div className="text-xs text-gray-600">Amount</div>
                <div className="mt-1 text-2xl font-semibold">{formatXrp(amount)} XRP</div>
              </div>
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-gray-700">{roi.periodLabel}</div>
                <input
                  className="h-10 w-28 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-gray-900/10"
                  value={days}
                  onChange={(e) => setDays(clamp(Number(e.target.value || 0), 1, 365))}
                  inputMode="numeric"
                />
              </div>
              <input
                type="range"
                min={1}
                max={365}
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="w-full"
              />
              <div className="text-xs text-gray-500 flex justify-between">
                <span>1 Day</span>
                <span>365 Days</span>
              </div>

              <div className="mt-3 rounded-2xl border border-gray-200 p-4 bg-gray-50">
                <div className="text-xs text-gray-600">Period</div>
                <div className="mt-1 text-2xl font-semibold">{days} Days</div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <div className="text-sm font-medium text-gray-700">{roi.aprLabel}</div>
                <input
                  className="h-11 rounded-xl border border-gray-200 bg-gray-50 px-3 text-gray-800 outline-none focus:ring-2 focus:ring-gray-900/10"
                  value={apr}
                  onChange={(e) => setApr(clamp(Number(e.target.value || 0), 0, 30))}
                  inputMode="decimal"
                />
                <div className="text-xs text-gray-600">Example range: 0-30%</div>
              </div>
              <div className="grid gap-2">
                <div className="text-sm font-medium text-gray-700">{roi.feeLabel}</div>
                <input
                  className="h-11 rounded-xl border border-gray-200 bg-gray-50 px-3 text-gray-800 outline-none focus:ring-2 focus:ring-gray-900/10"
                  value={fee}
                  onChange={(e) => setFee(clamp(Number(e.target.value || 0), 0, 10))}
                  inputMode="decimal"
                />
                <div className="text-xs text-gray-600">Disclosed and reflected in net ROI</div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <div className="text-xs text-gray-600">Daily Yield</div>
                  <div className="mt-1 text-xl font-semibold">
                    {computed.dailyYieldPct.toFixed(3)}% Daily
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-600">Estimated Return</div>
                  <div className="mt-1 text-xl font-semibold">
                    {formatXrp(computed.estReturn)} XRP
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-600">Total Value</div>
                  <div className="mt-1 text-xl font-semibold">
                    {formatXrp(computed.totalValue)} XRP
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-600">ROI</div>
                  <div className="mt-1 text-xl font-semibold">
                    {computed.roiPct.toFixed(2)}%
                  </div>
                </div>
              </div>
              <p className="mt-4 text-xs text-gray-600 leading-relaxed">{roi.disclaimer}</p>
            </div>
          </div>
        </Card>

        <Card className="shadow-none h-full">
          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold text-gray-900">{roi.analyticsTitle}</div>
            <div className="text-xs text-gray-600 flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
              {roi.analyticsBadge}
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {roi.analytics.map((m) => (
              <div key={m.label} className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                <div className="text-xs text-gray-600">{m.label}</div>
                <div className="mt-2 text-2xl font-semibold tracking-tight text-gray-900">{m.value}</div>
                {m.note ? <div className="mt-1 text-xs text-emerald-600">{m.note}</div> : null}
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
            <div className="flex items-end justify-between">
              <div>
                <div className="text-sm font-semibold text-gray-900">Yield Performance (30 Days)</div>
                <div className="mt-1 text-xs text-gray-600">Trend view for operational visibility</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-600">Current APR</div>
                <div className="text-xl font-semibold text-gray-900">{apr.toFixed(2)}%</div>
              </div>
            </div>

            <div className="mt-4 text-gray-900">
              <MiniLineChart points={chartData} />
            </div>

            <div className="mt-3 flex justify-between text-xs text-gray-600">
              <span>30d ago</span>
              <span>Today</span>
            </div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {roi.riskBadges.map((b, idx) => {
              const style = badgeStyles[idx % badgeStyles.length];
              return (
                <div key={b.title} className={`rounded-2xl border p-4 ${style.card}`}>
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                    <span className={`h-2 w-2 rounded-full ${style.dot}`} />
                    {b.title}
                  </div>
                  <div className="mt-2 text-xs text-gray-700 leading-relaxed">{b.text}</div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </Section>
  );
}
