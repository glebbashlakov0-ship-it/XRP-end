"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
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
  activeUsd: number;
  rewardsUsd: number;
};

type Asset = {
  name: string;
  symbol: string;
  balance: number;
  price: number;
  logo?: string;
};

type ChartScale = {
  min: number;
  max: number;
  step: number;
  ticks: number[];
};

type ChartDimensions = {
  width: number;
  height: number;
};

const COINGECKO_IDS: Record<string, string> = {
  XRP: "ripple",
  BTC: "bitcoin",
  ETH: "ethereum",
  USDT: "tether",
  USDC: "usd-coin",
  BNB: "binancecoin",
  SOL: "solana",
  ADA: "cardano",
  DOGE: "dogecoin",
  TRX: "tron",
  TON: "the-open-network",
  MATIC: "polygon",
  LTC: "litecoin",
  DOT: "polkadot",
};

const PERIODS: { key: PeriodKey; label: string }[] = [
  { key: "day", label: "Day" },
  { key: "week", label: "Week" },
  { key: "month", label: "Month" },
  { key: "year", label: "Year" },
];

const LOCAL_ASSET_LOGO_PATH = "/assets/profile";

const POPULAR_ASSETS: Asset[] = [
  { name: "XRP", symbol: "XRP", balance: 0, price: 0, logo: `${LOCAL_ASSET_LOGO_PATH}/xrp.svg` },
  { name: "Bitcoin", symbol: "BTC", balance: 0, price: 0, logo: "https://cryptoicons.org/api/icon/btc/64" },
  { name: "Ethereum", symbol: "ETH", balance: 0, price: 0, logo: "https://cryptoicons.org/api/icon/eth/64" },
  { name: "Tether", symbol: "USDT", balance: 0, price: 1, logo: `${LOCAL_ASSET_LOGO_PATH}/usdt.svg` },
  { name: "USD Coin", symbol: "USDC", balance: 0, price: 1, logo: `${LOCAL_ASSET_LOGO_PATH}/usdc.svg` },
  { name: "BNB", symbol: "BNB", balance: 0, price: 0, logo: "https://cryptoicons.org/api/icon/bnb/64" },
  { name: "Solana", symbol: "SOL", balance: 0, price: 0, logo: "https://cryptoicons.org/api/icon/sol/64" },
  { name: "Cardano", symbol: "ADA", balance: 0, price: 0, logo: "https://cryptoicons.org/api/icon/ada/64" },
  { name: "Dogecoin", symbol: "DOGE", balance: 0, price: 0, logo: "https://cryptoicons.org/api/icon/doge/64" },
  { name: "TRON", symbol: "TRX", balance: 0, price: 0, logo: "https://cryptoicons.org/api/icon/trx/64" },
  { name: "Toncoin", symbol: "TON", balance: 0, price: 0, logo: "https://cryptoicons.org/api/icon/ton/64" },
  { name: "Polygon", symbol: "MATIC", balance: 0, price: 0, logo: "https://cryptoicons.org/api/icon/matic/64" },
  { name: "Litecoin", symbol: "LTC", balance: 0, price: 0, logo: "https://cryptoicons.org/api/icon/ltc/64" },
  { name: "Polkadot", symbol: "DOT", balance: 0, price: 0, logo: "https://cryptoicons.org/api/icon/dot/64" },
];

const ESTIMATED_APR = 389;
const PLATFORM_FEE = 0;
const NET_APR = Math.max(0, ESTIMATED_APR - PLATFORM_FEE);
const DAILY_YIELD_RATE = NET_APR / 100 / 365;

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

function niceStep(value: number) {
  if (value <= 0) return 1;
  const magnitude = Math.pow(10, Math.floor(Math.log10(value)));
  const normalized = value / magnitude;
  const step = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return step * magnitude;
}

function buildSeries(
  period: PeriodKey,
  baseActiveUsd: number,
  passiveUsd: number,
  baseRewardsUsd: number,
  dailyRate: number
): SeriesPoint[] {
  const active = Math.max(baseActiveUsd, 0);
  const passive = Math.max(passiveUsd, 0);
  const existingRewards = Math.max(baseRewardsUsd, 0);

  const makePoint = (label: string, progressDays: number): SeriesPoint => {
    const multiplier = 1 + dailyRate * progressDays;
    const activeWithYield = active * multiplier;
    const projectedRewards = existingRewards + Math.max(activeWithYield - active, 0);
    const totalUsd = passive + activeWithYield + projectedRewards;

    return {
      label,
      totalUsd,
      activeUsd: activeWithYield,
      rewardsUsd: projectedRewards,
    };
  };

  if (period === "day") {
    const hours = [0, 3, 6, 9, 12, 15, 18, 21, 24];
    return hours.map((hour) => makePoint(`${hour}:00`, hour / 24));
  }

  if (period === "week") {
    const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return labels.map((label, index) => makePoint(label, index + 1));
  }

  if (period === "month") {
    const labels = ["Week 1", "Week 2", "Week 3", "Week 4"];
    return labels.map((label, index) => makePoint(label, (index + 1) * 7));
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

  return labels.map((label, index) => makePoint(label, (index + 1) * 30));
}

function easeInOutQuad(t: number) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

function sampleSeriesValue(series: SeriesPoint[], position: number, accessor: (point: SeriesPoint) => number) {
  if (series.length === 0) return 0;
  if (series.length === 1) return accessor(series[0]);
  const index = position * (series.length - 1);
  const low = Math.floor(index);
  const high = Math.min(low + 1, series.length - 1);
  const t = index - low;
  const lowValue = accessor(series[low]);
  const highValue = accessor(series[high]);
  return lowValue + (highValue - lowValue) * t;
}

function interpolateSeries(from: SeriesPoint[], to: SeriesPoint[], t: number): SeriesPoint[] {
  if (to.length === 0) return [];
  return to.map((point, idx) => {
    const position = to.length === 1 ? 0 : idx / (to.length - 1);
    const fromTotal = sampleSeriesValue(from, position, (p) => p.totalUsd);
    const fromActive = sampleSeriesValue(from, position, (p) => p.activeUsd);
    const fromRewards = sampleSeriesValue(from, position, (p) => p.rewardsUsd);

    return {
      ...point,
      totalUsd: fromTotal + (point.totalUsd - fromTotal) * t,
      activeUsd: fromActive + (point.activeUsd - fromActive) * t,
      rewardsUsd: fromRewards + (point.rewardsUsd - fromRewards) * t,
    };
  });
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function computeScale(series: SeriesPoint[], tickCount = 5): ChartScale {
  if (series.length === 0) {
    const emptyTicks = Array.from({ length: tickCount }, (_, i) => i);
    return { min: 0, max: tickCount - 1, step: 1, ticks: emptyTicks };
  }

  const values = series.map((p) => p.totalUsd);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const buffer = Math.max((max - min) * 0.08, 1);
  const paddedMin = Math.max(min - buffer, 0);
  const paddedMax = max + buffer;
  const segments = Math.max(tickCount - 1, 1);

  let step = niceStep((paddedMax - paddedMin) / segments);
  while (paddedMin + step * segments < paddedMax) step *= 2;

  const ticks = Array.from({ length: tickCount }, (_, i) => paddedMin + step * i);
  return { min: paddedMin, max: paddedMin + step * (tickCount - 1), step, ticks };
}

function interpolateScale(from: ChartScale, to: ChartScale, t: number): ChartScale {
  const min = lerp(from.min, to.min, t);
  const max = lerp(from.max, to.max, t);
  const step = Math.max(lerp(from.step, to.step, t), 0.000001);
  const tickCount = to.ticks.length || 5;
  const ticks = Array.from({ length: tickCount }, (_, i) => min + step * i);
  return { min, max, step, ticks };
}

export default function LkClient({ balance }: LkClientProps) {
  const router = useRouter();
  const [period, setPeriod] = useState<PeriodKey>("month");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const hoverRaf = useRef<number | null>(null);
  const pendingHover = useRef<number | null>(null);
  const [livePriceXrp, setLivePriceXrp] = useState<number | null>(null);
  const [assetPrices, setAssetPrices] = useState<Record<string, number>>({});
  const [isCompact, setIsCompact] = useState(false);
  const pointerIdRef = useRef<number | null>(null);
  const [customAssets, setCustomAssets] = useState<Asset[]>([]);
  const [showAssetForm, setShowAssetForm] = useState(false);
  const [assetSymbol, setAssetSymbol] = useState(POPULAR_ASSETS[0]?.symbol ?? "XRP");
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const [chartSize, setChartSize] = useState<ChartDimensions>({ width: 960, height: 320 });

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const ids = Array.from(new Set(Object.values(COINGECKO_IDS))).join(",");
        const response = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`,
          { cache: "no-store" }
        );
        if (!response.ok) return;
        const data = (await response.json()) as Record<string, { usd?: number }>;
        if (cancelled) return;
        const nextPrices: Record<string, number> = {};
        Object.entries(COINGECKO_IDS).forEach(([symbol, id]) => {
          const usd = data?.[id]?.usd;
          if (typeof usd === "number" && Number.isFinite(usd)) {
            nextPrices[symbol] = usd;
          }
        });
        setAssetPrices(nextPrices);
        if (typeof nextPrices.XRP === "number") {
          setLivePriceXrp(nextPrices.XRP);
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

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem("lkCustomAssets");
      if (!stored) return;
      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed)) return;
      const sanitized = parsed
        .map((item) => {
          const symbol = typeof item?.symbol === "string" ? item.symbol.toUpperCase() : "";
          const match = POPULAR_ASSETS.find((asset) => asset.symbol === symbol);
          if (!match) return null;
          return {
            name: match.name,
            symbol,
            balance: 0,
            price: match.price,
            logo: match.logo,
          } as Asset;
        })
        .filter(Boolean) as Asset[];
      setCustomAssets(sanitized);
    } catch {
      // Ignore invalid local storage values.
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem("lkCustomAssets", JSON.stringify(customAssets));
    } catch {
      // Ignore write errors (private mode, etc).
    }
  }, [customAssets]);

  useEffect(() => {
    const element = chartContainerRef.current;
    if (!element || typeof ResizeObserver === "undefined") return;

    const syncSize = () => {
      const width = element.clientWidth || 360;
      const nextWidth = Math.max(width, 360);
      const nextHeight = Math.max(Math.min(nextWidth * 0.55, 360), 230);
      setChartSize({ width: nextWidth, height: nextHeight });
    };

    syncSize();
    const observer = new ResizeObserver(() => syncSize());
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const derivedPriceXrp =
    livePriceXrp ??
    assetPrices.XRP ??
    (balance.totalXrp > 0 && balance.totalUsd > 0 ? balance.totalUsd / balance.totalXrp : 0.6);
  const totalBalanceUsd = balance.totalUsd > 0 ? balance.totalUsd : balance.totalXrp * derivedPriceXrp;
  const activeStakesUsd = balance.activeStakesXrp * derivedPriceXrp;
  const rewardsUsd = balance.rewardsXrp * derivedPriceXrp;
  const passiveUsd = Math.max(totalBalanceUsd - activeStakesUsd - rewardsUsd, 0);

  const defaultAssets = useMemo<Asset[]>(
    () => [
      {
        name: "XRP",
        symbol: "XRP",
        balance: balance.totalXrp,
        price: assetPrices.XRP ?? derivedPriceXrp,
        logo: `${LOCAL_ASSET_LOGO_PATH}/xrp.svg`,
      },
      {
        name: "USDT",
        symbol: "USDT",
        balance: 0,
        price: assetPrices.USDT ?? 1,
        logo: `${LOCAL_ASSET_LOGO_PATH}/usdt.svg`,
      },
      {
        name: "USDC",
        symbol: "USDC",
        balance: 0,
        price: assetPrices.USDC ?? 1,
        logo: `${LOCAL_ASSET_LOGO_PATH}/usdc.svg`,
      },
    ],
    [balance.totalXrp, derivedPriceXrp, assetPrices.XRP, assetPrices.USDT, assetPrices.USDC]
  );

  const assets = useMemo(() => {
    const merged = [...defaultAssets];
    customAssets.forEach((asset) => {
      const index = merged.findIndex((item) => item.symbol === asset.symbol);
      const price = assetPrices[asset.symbol] ?? asset.price;
      const next = { ...asset, price };
      if (index >= 0) {
        merged[index] = next;
      } else {
        merged.push(next);
      }
    });
    return merged;
  }, [defaultAssets, customAssets, assetPrices]);

  const handleAddAsset = () => {
    const symbol = assetSymbol.trim().toUpperCase();
    const selected = POPULAR_ASSETS.find((asset) => asset.symbol === symbol);
    if (!selected || !symbol) return;
    const fallbackPrice = assetPrices[symbol] ?? (symbol === "XRP" ? derivedPriceXrp : selected.price);
    setCustomAssets((prev) => {
      const next = [...prev];
      const index = next.findIndex((asset) => asset.symbol === symbol);
      const entry = {
        name: selected.name,
        symbol,
        balance: 0,
        price: fallbackPrice,
        logo: selected.logo,
      };
      if (index >= 0) {
        next[index] = entry;
      } else {
        next.push(entry);
      }
      return next;
    });
    setShowAssetForm(false);
    router.push(`/lk/deposit?asset=${symbol}`);
  };

  const series = useMemo(
    () => buildSeries(period, activeStakesUsd, passiveUsd, rewardsUsd, DAILY_YIELD_RATE),
    [period, activeStakesUsd, passiveUsd, rewardsUsd]
  );
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
    const width = chartSize.width;
    const height = chartSize.height;
    const padding = { top: 18, right: isCompact ? 16 : 28, bottom: 56, left: isCompact ? 60 : 72 };

    const minValue = displayScale.min;
    const tickSpan = (displayScale.ticks[displayScale.ticks.length - 1] ?? displayScale.max) - minValue;
    const range = Math.max(tickSpan, displayScale.step * 2, 1);
    const plotWidth = width - padding.left - padding.right;
    const plotHeight = height - padding.top - padding.bottom;

    const mapPoints = (values: SeriesPoint[], accessor: (point: SeriesPoint) => number) =>
      values.map((p, i) => {
        const x =
          padding.left + (i / Math.max(values.length - 1, 1)) * Math.max(plotWidth, 1);
        const y = padding.top + (1 - (accessor(p) - minValue) / range) * Math.max(plotHeight, 1);
        return { x, y };
      });

    const totalPoints = mapPoints(displaySeries, (p) => p.totalUsd);

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

    const lineTotal = buildSmoothPath(totalPoints);
    const lastX = totalPoints[totalPoints.length - 1]?.x ?? padding.left;
    const area = `${lineTotal} L ${lastX} ${height - padding.bottom} L ${padding.left} ${height - padding.bottom} Z`;

    return { width, height, padding, lineTotal, area, ticks: displayScale.ticks, totalPoints, range, minValue };
  }, [displaySeries, displayScale, isCompact, chartSize.width, chartSize.height]);

  const updateHover = (e: PointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * chart.width;
    const plotWidth = chart.width - chart.padding.left - chart.padding.right;
    const count = Math.max(chart.totalPoints.length - 1, 1);
    const relative = (svgX - chart.padding.left) / Math.max(plotWidth, 1);
    const rawIndex = Math.round(relative * count);
    const nextIndex = Math.min(Math.max(rawIndex, 0), chart.totalPoints.length - 1);

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
        <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5">
          <div className="absolute left-5 top-0 h-1 w-14 rounded-b-full bg-blue-500" aria-hidden />
          <div className="pt-2 text-sm text-gray-500">Total Balance</div>
          <div className="mt-2 text-2xl font-semibold text-gray-900">{formatUsd(totalBalanceUsd)}</div>
          <div className="text-sm text-gray-500">{formatXrp(balance.totalXrp)}</div>
        </div>
        <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5">
          <div className="absolute left-5 top-0 h-1 w-14 rounded-b-full bg-emerald-500" aria-hidden />
          <div className="pt-2 text-sm text-gray-500">Active Stakes</div>
          <div className="mt-2 text-2xl font-semibold text-gray-900">{formatXrp(balance.activeStakesXrp)}</div>
          <div className="text-sm text-gray-500">{formatUsd(activeStakesUsd)}</div>
        </div>
        <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5">
          <div className="absolute left-5 top-0 h-1 w-14 rounded-b-full bg-orange-400" aria-hidden />
          <div className="pt-2 text-sm text-gray-500">Rewards</div>
          <div className="mt-2 text-2xl font-semibold text-gray-900">{formatXrp(balance.rewardsXrp)}</div>
          <div className="text-sm text-gray-500">{formatUsd(rewardsUsd)}</div>
        </div>
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Portfolio Performance</h2>
            <p className="text-sm text-gray-500">
              Total Balance projection driven by active stakes and accrued rewards.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {PERIODS.map((p) => (
              <button
                key={p.key}
                className={`h-9 px-4 rounded-full text-sm transition ${
                  period === p.key ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
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
            APR: <span className="text-gray-900 font-semibold">{formatNumber(NET_APR, 2)}%</span>
          </div>
          <div>
            Daily yield: <span className="text-gray-900 font-semibold">{formatNumber(DAILY_YIELD_RATE * 100, 2)}%</span>
          </div>
          <div>
            30-day ROI: <span className="text-gray-900 font-semibold">{formatNumber(DAILY_YIELD_RATE * 30 * 100, 2)}%</span>
          </div>
          <div className="text-gray-500">
            Change: <span className={chartStats.change >= 0 ? "text-emerald-600" : "text-red-600"}>
              {chartStats.change >= 0 ? "+" : ""}
              {formatUsd(chartStats.change)}
              ({chartStats.pct >= 0 ? "+" : ""}{chartStats.pct.toFixed(2)}%)
            </span>
          </div>
        </div>

        <div className="mt-6 space-y-4" ref={chartContainerRef}>
          <div className="relative w-full">
            <svg
              viewBox={`0 0 ${chart.width} ${chart.height}`}
              className="h-[260px] w-full sm:h-[320px] touch-pan-y"
              onTouchStart={() => {
                pendingHover.current = null;
              }}
              onTouchMove={() => {
                pendingHover.current = null;
              }}
              onPointerDown={(e) => {
                if (e.pointerType === "touch") {
                  updateHover(e);
                  return;
                }
                if (pointerIdRef.current !== null) return;
                pointerIdRef.current = e.pointerId;
                (e.currentTarget as SVGSVGElement).setPointerCapture(e.pointerId);
                updateHover(e);
              }}
              onPointerMove={(e) => {
                if (e.pointerType !== "touch") updateHover(e);
              }}
              onPointerUp={(e) => {
                if (pointerIdRef.current === e.pointerId) {
                  (e.currentTarget as SVGSVGElement).releasePointerCapture(e.pointerId);
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
              onClick={(e) => updateHover(e as PointerEvent<SVGSVGElement>)}
            >
              <defs>
                <linearGradient id="xrp-area" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                </linearGradient>
              </defs>

              {chart.ticks.map((tick) => {
                const y =
                  chart.padding.top +
                  (1 - (tick - chart.minValue) / chart.range) * (chart.height - chart.padding.top - chart.padding.bottom);
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

              {hoveredIndex !== null && chart.totalPoints[hoveredIndex] ? (
                <line
                  x1={chart.totalPoints[hoveredIndex].x}
                  x2={chart.totalPoints[hoveredIndex].x}
                  y1={chart.padding.top}
                  y2={chart.height - chart.padding.bottom}
                  stroke="#93c5fd"
                  strokeWidth="1"
                />
              ) : null}

              <path d={chart.area} fill="url(#xrp-area)" />
              <path d={chart.lineTotal} fill="none" stroke="#2563eb" strokeWidth="2" />

              {chart.totalPoints.map((point, index) => {
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
                    <text x={point.x} y={chart.height - 12} textAnchor="middle" fontSize="10" fill="#6b7280">
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
                  left: `${(chart.totalPoints[hoveredIndex].x / chart.width) * 100}%`,
                  top: `${(chart.totalPoints[hoveredIndex].y / chart.height) * 100}%`,
                  transform: "translate(-50%, -120%)",
                }}
              >
                <div className="font-semibold text-gray-900">{displaySeries[hoveredIndex].label}</div>
                <div>Total Balance: {formatUsd(displaySeries[hoveredIndex].totalUsd)}</div>
              </div>
            ) : null}
          </div>

        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Your Assets</h2>
          <button
            className="h-9 px-4 rounded-full bg-blue-600 text-white text-sm"
            type="button"
            onClick={() => setShowAssetForm((prev) => !prev)}
          >
            {showAssetForm ? "Close" : "Add Asset"}
          </button>
        </div>
        {showAssetForm ? (
          <div className="mt-4 grid gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div className="grid gap-3 md:grid-cols-2">
              <label className="grid gap-2 text-sm text-gray-600">
                <span className="font-medium text-gray-700">Select asset</span>
                <select
                  className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-800"
                  value={assetSymbol}
                  onChange={(e) => setAssetSymbol(e.target.value)}
                >
                  {POPULAR_ASSETS.map((asset) => (
                    <option key={asset.symbol} value={asset.symbol}>
                      {asset.name} ({asset.symbol})
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="text-xs text-gray-500">
              Balance and price are managed by the platform. Adding a currency only enables it in your portfolio and deposit list.
            </div>
            <div className="flex justify-end">
              <button
                className="h-9 px-4 rounded-full bg-gray-900 text-white text-sm"
                type="button"
                onClick={handleAddAsset}
              >
                Save asset
              </button>
            </div>
          </div>
        ) : null}
        <div className="mt-4 rounded-xl border border-gray-200">
          <div className="overflow-x-auto">
            <div className="min-w-[640px]">
              <div className="grid grid-cols-12 bg-gray-50 px-4 py-3 text-xs font-medium text-gray-600">
                <div className="col-span-4">Asset</div>
                <div className="col-span-3">Balance</div>
                <div className="col-span-2">Price</div>
                <div className="col-span-3">Value</div>
              </div>
              {assets.map((asset) => (
                <div
                  key={`${asset.symbol}-${asset.name}`}
                  className="grid grid-cols-12 px-4 py-4 border-t border-gray-200 text-sm items-center"
                >
                  <div className="col-span-4 font-medium text-gray-900 flex items-center gap-3">
                    <span className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                      {asset.logo ? (
                        asset.logo.startsWith("/") ? (
                          <Image src={asset.logo} alt={`${asset.name} logo`} width={24} height={24} />
                        ) : (
                          <img src={asset.logo} alt={`${asset.name} logo`} className="h-6 w-6" />
                        )
                      ) : (
                        <span className="text-xs text-gray-500">{asset.symbol}</span>
                      )}
                    </span>
                    {asset.name}
                  </div>
                  <div className="col-span-3 text-gray-600">{formatNumber(asset.balance, 4)} {asset.symbol}</div>
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
    </div>
  );
}
