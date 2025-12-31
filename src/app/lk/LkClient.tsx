"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent } from "react";

type Balance = {
  totalXrp: number;
  totalUsd: number;
  activeStakesXrp: number;
  rewardsXrp: number;
};

type LkClientProps = {
  balance: Balance;
};

type PeriodKey = "day" | "week" | "month" | "year";

type SeriesPoint = {
  label: string;
  totalUsd: number;
};

type ChartScale = {
  min: number;
  max: number;
  step: number;
  ticks: number[];
};

const PERIODS: { key: PeriodKey; label: string }[] = [
  { key: "day", label: "Day" },
  { key: "week", label: "Week" },
  { key: "month", label: "Month" },
  { key: "year", label: "Year" },
];

const DAILY_YIELD_RATE = 0.0106;

function formatUsd(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatNumber(value: number, digits = 2) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: digits,
  }).format(value);
}

function formatXrp(value: number) {
  return `${formatNumber(value, 4)} XRP`;
}

function buildSeries(period: PeriodKey, baseUsd: number): SeriesPoint[] {
  const base = baseUsd || 0;

  if (period === "day") {
    const hours = [0, 3, 6, 9, 12, 15, 18, 21, 24];
    return hours.map((hour) => ({
      label: `${hour}:00`,
      totalUsd: base * (1 + DAILY_YIELD_RATE * (hour / 24)),
    }));
  }

  if (period === "week") {
    const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return labels.map((label, index) => ({
      label,
      totalUsd: base * (1 + DAILY_YIELD_RATE * index),
    }));
  }

  if (period === "month") {
    const labels = ["Week 1", "Week 2", "Week 3", "Week 4"];
    return labels.map((label, index) => ({
      label,
      totalUsd: base * (1 + DAILY_YIELD_RATE * (index * 7)),
    }));
  }

  const labels = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  return labels.map((label, index) => ({
    label,
    totalUsd: base * (1 + DAILY_YIELD_RATE * (index * 30)),
  }));
}

function easeInOutQuad(t: number) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

function sampleSeriesValue(series: SeriesPoint[], position: number) {
  if (series.length === 0) return 0;
  if (series.length === 1) return series[0].totalUsd;
  const index = position * (series.length - 1);
  const low = Math.floor(index);
  const high = Math.min(low + 1, series.length - 1);
  const t = index - low;
  const lowValue = series[low]?.totalUsd ?? 0;
  const highValue = series[high]?.totalUsd ?? lowValue;
  return lowValue + (highValue - lowValue) * t;
}

function interpolateSeries(from: SeriesPoint[], to: SeriesPoint[], t: number): SeriesPoint[] {
  if (to.length === 0) return [];
  return to.map((point, idx) => {
    const position = to.length === 1 ? 0 : idx / (to.length - 1);
    const fromValue = sampleSeriesValue(from, position);
    const value = fromValue + (point.totalUsd - fromValue) * t;
    return { ...point, totalUsd: value };
  });
}

function computeScale(series: SeriesPoint[], tickCount = 5): ChartScale {
  if (series.length === 0) {
    const emptyTicks = Array.from({ length: tickCount }, (_, i) => i);
    return { min: 0, max: 0, step: 1, ticks: emptyTicks };
  }
  const values = series.map((p) => p.totalUsd);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const safeMin = Number.isFinite(min) ? min : 0;
  const safeMax = Number.isFinite(max) ? max : safeMin;
  const range = Math.max(safeMax - safeMin, Math.max(Math.abs(safeMin) * 0.02, 1));

  const segments = Math.max(tickCount - 1, 1);
  let step = niceStep(range / segments);
  while (safeMin + step * segments < safeMax) step *= 2;

  const ticks = Array.from({ length: tickCount }, (_, i) => safeMin + step * i);
  return { min: safeMin, max: safeMax, step, ticks };
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function interpolateScale(from: ChartScale, to: ChartScale, t: number): ChartScale {
  const min = lerp(from.min, to.min, t);
  const max = lerp(from.max, to.max, t);
  const step = Math.max(lerp(from.step, to.step, t), 0.000001);
  const tickCount = to.ticks.length || 5;
  const ticks = Array.from({ length: tickCount }, (_, i) => min + step * i);
  return { min, max, step, ticks };
}

function niceStep(value: number) {
  if (value <= 0) return 1;
  const magnitude = Math.pow(10, Math.floor(Math.log10(value)));
  const normalized = value / magnitude;
  const step = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return step * magnitude;
}

export default function LkClient({ balance }: LkClientProps) {
  const [period, setPeriod] = useState<PeriodKey>("month");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const hoverRaf = useRef<number | null>(null);
  const pendingHover = useRef<number | null>(null);
  const [livePriceXrp, setLivePriceXrp] = useState<number | null>(null);
  const [isCompact, setIsCompact] = useState(false);
  const pointerIdRef = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const response = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=ripple&vs_currencies=usd",
          { cache: "no-store" }
        );
        if (!response.ok) return;
        const data = (await response.json()) as { ripple?: { usd?: number } };
        const nextPrice = data?.ripple?.usd;
        if (!cancelled && typeof nextPrice === "number" && Number.isFinite(nextPrice)) {
          setLivePriceXrp(nextPrice);
        }
      } catch {
        // Ignore pricing errors; keep fallback values.
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const update = () => {
      setIsCompact(window.innerWidth < 640);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const derivedPriceXrp = livePriceXrp ?? (balance.totalXrp > 0 ? balance.totalUsd / balance.totalXrp : 0.6);
  const baseUsd = balance.totalUsd > 0 ? balance.totalUsd : balance.totalXrp * derivedPriceXrp;
  const series = useMemo(() => buildSeries(period, baseUsd), [period, baseUsd]);
  const [displaySeries, setDisplaySeries] = useState<SeriesPoint[]>(series);
  const previousSeries = useRef<SeriesPoint[]>(series);
  const tickCount = 5;
  const [displayScale, setDisplayScale] = useState<ChartScale>(() => computeScale(series, tickCount));
  const previousScale = useRef<ChartScale>(computeScale(series, tickCount));

  useEffect(() => {
    const from = previousSeries.current;
    const to = series;
    const fromScale = previousScale.current;
    const toScale = computeScale(series, tickCount);
    const start = performance.now();
    const duration = 450;
    let raf = 0;

    const tick = (now: number) => {
      const raw = Math.min((now - start) / duration, 1);
      const eased = easeInOutQuad(raw);
      setDisplaySeries(interpolateSeries(from, to, eased));
      setDisplayScale(interpolateScale(fromScale, toScale, eased));
      if (raw < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        previousSeries.current = to;
        previousScale.current = toScale;
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [series, tickCount]);

  const chartStats = useMemo(() => {
    const values = displaySeries.map((p) => p.totalUsd);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const first = values[0] ?? 0;
    const last = values[values.length - 1] ?? 0;
    const change = last - first;
    const pct = first === 0 ? 0 : (change / first) * 100;
    return { min, max, change, pct, last };
  }, [displaySeries]);

  const chart = useMemo(() => {
    const width = 1200;
    const height = 320;
    const padding = { top: 20, right: 28, bottom: 48, left: 72 };

    const minValue = displayScale.min;
    const range = Math.max(displayScale.step * 4, 1);

    const points = displaySeries.map((p, i) => {
      const x = padding.left + (i / Math.max(displaySeries.length - 1, 1)) * (width - padding.left - padding.right);
      const y = padding.top + (1 - (p.totalUsd - minValue) / range) * (height - padding.top - padding.bottom);
      return { x, y };
    });

    const buildSmoothPath = (pts: { x: number; y: number }[]) => {
      if (pts.length < 2) return "";
      let d = `M ${pts[0].x},${pts[0].y}`;
      for (let i = 0; i < pts.length - 1; i += 1) {
        const p0 = pts[Math.max(i - 1, 0)];
        const p1 = pts[i];
        const p2 = pts[i + 1];
        const p3 = pts[Math.min(i + 2, pts.length - 1)];
        const cp1x = p1.x + (p2.x - p0.x) / 6;
        const cp1y = p1.y + (p2.y - p0.y) / 6;
        const cp2x = p2.x - (p3.x - p1.x) / 6;
        const cp2y = p2.y - (p3.y - p1.y) / 6;
        d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
      }
      return d;
    };

    const line = buildSmoothPath(points);
    const lastX = points[points.length - 1]?.x ?? padding.left;
    const area = `${line} L ${lastX} ${height - padding.bottom} L ${padding.left} ${height - padding.bottom} Z`;

    return { width, height, padding, line, area, ticks: displayScale.ticks, points, range, minValue };
  }, [displaySeries, displayScale]);

  const apr = DAILY_YIELD_RATE * 365 * 100;
  const roi30 = DAILY_YIELD_RATE * 30 * 100;
  const updateHover = (e: PointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * chart.width;
    const plotWidth = chart.width - chart.padding.left - chart.padding.right;
    const count = Math.max(chart.points.length - 1, 1);
    const relative = (svgX - chart.padding.left) / plotWidth;
    const rawIndex = Math.round(relative * count);
    const nextIndex = Math.min(Math.max(rawIndex, 0), chart.points.length - 1);

    pendingHover.current = nextIndex;
    if (hoverRaf.current !== null) return;
    hoverRaf.current = requestAnimationFrame(() => {
      hoverRaf.current = null;
      if (pendingHover.current === null) return;
      const idx = pendingHover.current;
      pendingHover.current = null;
      setHoveredIndex((prev) => (prev === idx ? prev : idx));
    });
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="text-sm text-gray-500">Total Balance</div>
          <div className="mt-2 text-2xl font-semibold text-gray-900">{formatUsd(balance.totalUsd)}</div>
          <div className="text-sm text-gray-500">{formatXrp(balance.totalXrp)}</div>
        </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="text-sm text-gray-500">Active Stakes</div>
              <div className="mt-2 text-2xl font-semibold text-gray-900">{formatXrp(balance.activeStakesXrp)}</div>
              <div className="text-sm text-gray-500">{formatUsd(balance.activeStakesXrp * derivedPriceXrp)}</div>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="text-sm text-gray-500">Rewards</div>
              <div className="mt-2 text-2xl font-semibold text-gray-900">{formatXrp(balance.rewardsXrp)}</div>
              <div className="text-sm text-gray-500">{formatUsd(balance.rewardsXrp * derivedPriceXrp)}</div>
            </div>
          </div>

                <section className="rounded-2xl border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Your Assets</h2>
          <button className="h-9 px-4 rounded-full bg-blue-600 text-white text-sm">Add Asset</button>
        </div>
        <div className="mt-4 rounded-xl border border-gray-200">
          <div className="overflow-x-auto">
            <div className="min-w-[640px]">
              <div className="grid grid-cols-12 bg-gray-50 px-4 py-3 text-xs font-medium text-gray-600">
                <div className="col-span-4">Asset</div>
                <div className="col-span-3">Balance</div>
                <div className="col-span-2">Price</div>
                <div className="col-span-3">Value</div>
              </div>
              {[
                { name: "XRP", balance: balance.totalXrp, price: derivedPriceXrp, logo: "/crypto/xrp.svg" },
                { name: "USDT", balance: 0, price: 1, logo: "/crypto/usdt.svg" },
                { name: "USDC", balance: 0, price: 1, logo: "/crypto/usdc.svg" },
              ].map((asset) => (
                <div key={asset.name} className="grid grid-cols-12 px-4 py-4 border-t border-gray-200 text-sm items-center">
                  <div className="col-span-4 font-medium text-gray-900 flex items-center gap-3">
                    <span className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <Image src={asset.logo} alt={`${asset.name} logo`} width={24} height={24} />
                    </span>
                    {asset.name}
                  </div>
                  <div className="col-span-3 text-gray-600">{formatNumber(asset.balance, 4)} {asset.name}</div>
                  <div className="col-span-2 text-gray-600">{formatUsd(asset.price)}</div>
                  <div className="col-span-3 text-gray-900">{formatUsd(asset.balance * asset.price)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>



      <section className="rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold">Recent Transactions</h2>
        <div className="mt-4 text-sm text-gray-500">No transactions yet.</div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Portfolio Performance</h2>
            <p className="text-sm text-gray-500">Growth projection after deposit.</p>
          </div>
          <div className="flex items-center gap-2">
            {PERIODS.map((p) => (
              <button
                key={p.key}
                className={`h-9 px-4 rounded-full text-sm transition ${
                  period === p.key
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
                onClick={() => setPeriod(p.key)}
                type="button"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 grid gap-2 text-sm text-gray-500 md:flex md:items-center md:gap-6">
          <div>
            APR: <span className="text-gray-900 font-semibold">{formatNumber(apr, 2)}%</span>
          </div>
          <div>
            Daily yield: <span className="text-gray-900 font-semibold">{formatNumber(DAILY_YIELD_RATE * 100, 2)}%</span>
          </div>
          <div>
            30-day ROI: <span className="text-gray-900 font-semibold">{formatNumber(roi30, 2)}%</span>
          </div>
          <div className="text-gray-500">
            Change: <span className={chartStats.change >= 0 ? "text-emerald-600" : "text-red-600"}>
              {chartStats.change >= 0 ? "+" : ""}{formatUsd(chartStats.change)}
              ({chartStats.pct >= 0 ? "+" : ""}{chartStats.pct.toFixed(2)}%)
            </span>
          </div>
        </div>

        <div className="mt-6">
          <div className="overflow-x-auto">
            <div className="relative w-[1200px] sm:w-full sm:max-w-[960px] sm:mx-auto">
              <svg
                viewBox={`0 0 ${chart.width} ${chart.height}`}
                className="h-80 w-[1200px] sm:w-full touch-pan-y"
                onTouchStart={() => {
                  pendingHover.current = null;
                }}
                onTouchMove={() => {
                  pendingHover.current = null;
                }}
                onPointerDown={(e) => {
                  if (pointerIdRef.current !== null) return;
                  pointerIdRef.current = e.pointerId;
                  if (e.pointerType !== "touch") {
                    (e.currentTarget as SVGSVGElement).setPointerCapture(e.pointerId);
                  }
                  if (e.pointerType !== "touch") updateHover(e);
                }}
                onPointerMove={(e) => {
                  if (e.pointerType !== "touch") updateHover(e);
                }}
                onPointerUp={(e) => {
                  if (pointerIdRef.current === e.pointerId) {
                    if (e.pointerType !== "touch") {
                      (e.currentTarget as SVGSVGElement).releasePointerCapture(e.pointerId);
                    }
                    pointerIdRef.current = null;
                  }
                }}
                onPointerLeave={() => {
                  pendingHover.current = null;
                  if (hoverRaf.current !== null) {
                    cancelAnimationFrame(hoverRaf.current);
                    hoverRaf.current = null;
                  }
                  if (pointerIdRef.current !== null) {
                    pointerIdRef.current = null;
                  }
                }}
              >
                <defs>
                  <linearGradient id="xrp-area" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {chart.ticks.map((tick) => {
                  const y = chart.padding.top + (1 - (tick - chart.minValue) / chart.range) * (chart.height - chart.padding.top - chart.padding.bottom);
                  return (
                    <g key={tick}>
                      <line
                        x1={chart.padding.left}
                        x2={chart.width - chart.padding.right}
                        y1={y}
                        y2={y}
                        stroke="#e5e7eb"
                      />
                      <text x={chart.padding.left - 10} y={y + 4} textAnchor="end" fontSize="10" fill="#6b7280">
                        {formatUsd(tick)}
                      </text>
                    </g>
                  );
                })}

                {hoveredIndex !== null && chart.points[hoveredIndex] ? (
                  <line
                    x1={chart.points[hoveredIndex].x}
                    x2={chart.points[hoveredIndex].x}
                    y1={chart.padding.top}
                    y2={chart.height - chart.padding.bottom}
                    stroke="#93c5fd"
                    strokeWidth="1"
                  />
                ) : null}

                <path d={chart.area} fill="url(#xrp-area)" />
                <path d={chart.line} fill="none" stroke="#2563eb" strokeWidth="2" />

                {chart.points.map((point, index) => {
                  const isHovered = hoveredIndex === index;
                  return (
                    <g key={displaySeries[index]?.label ?? index}>
                      <circle
                        cx={point.x}
                        cy={point.y}
                        r={isHovered ? 8 : 5}
                        fill="#ffffff"
                        stroke="#2563eb"
                        strokeWidth="2"
                      />
                      <text
                        x={point.x}
                        y={chart.height - 12}
                        textAnchor="middle"
                        fontSize="10"
                        fill="#6b7280"
                      >
                        {displaySeries[index]?.label ?? ""}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {hoveredIndex !== null && displaySeries[hoveredIndex] ? (
                <div
                  className="absolute rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700 shadow-lg"
                  style={{
                    left: `${(chart.points[hoveredIndex].x / chart.width) * 100}%`,
                    top: `${(chart.points[hoveredIndex].y / chart.height) * 100}%`,
                    transform: "translate(-50%, -120%)",
                  }}
                >
                  <div className="font-semibold text-gray-900">{displaySeries[hoveredIndex].label}</div>
                  <div>{formatUsd(displaySeries[hoveredIndex].totalUsd)}</div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
