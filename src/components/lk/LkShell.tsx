"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowDownToLine,
  ArrowUpToLine,
  HelpCircle,
  LayoutGrid,
  LifeBuoy,
  LogOut,
  User,
  Users,
} from "lucide-react";

type NavItem = {
  label: string;
  href?: string;
  icon: LucideIcon;
  onClick?: () => Promise<void>;
};

const navItems: NavItem[] = [
  { label: "Portfolio", href: "/lk", icon: LayoutGrid },
  { label: "Profile", href: "/lk/profile", icon: User },
  { label: "Deposit", href: "/lk/deposit", icon: ArrowDownToLine },
  { label: "Withdraw", href: "/lk/withdraw", icon: ArrowUpToLine },
  { label: "Referrals", href: "/lk/referrals", icon: Users },
  { label: "Support", href: "/lk/support", icon: LifeBuoy },
  { label: "FAQ", href: "/lk/faq", icon: HelpCircle },
  {
    label: "Log out",
    icon: LogOut,
    onClick: async () => {
      const r = await fetch("/api/auth/logout", { method: "POST" });
      if (r.ok) window.location.href = "/login";
    },
  },
];

type LkShellProps = {
  email: string;
  verified: boolean;
  profileComplete: boolean;
  children: ReactNode;
};

export default function LkShell({ email, verified, profileComplete, children }: LkShellProps) {
  const pathname = usePathname();
  const [sending, setSending] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [totalBalanceUsd, setTotalBalanceUsd] = useState<number | null>(null);
  const [notifications, setNotifications] = useState<
    { id: string; wallet: string; amount: string; symbol: string; elapsed: string }[]
  >([]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const maskWallet = (value: string) => {
      if (value.length <= 6) return value;
      return `${value.slice(0, 4)}...${value.slice(-2)}`;
    };

    const addNotification = () => {
      const id = crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
      const sources = [
        { wallet: "rhWPVrNsddEig3MSambjuR2XwcDLLhtZM9", symbol: "XRP" },
        { wallet: "TNg7uCJ9y46DkXJqf1V4wVZ8M5wT1Qm3qP", symbol: "USDT" },
        { wallet: "0x9C2bcd43e1f2c2b2b28a1cF1b2d62a8a2c4D3f1A", symbol: "USDC" },
      ];
      const pick = sources[Math.floor(Math.random() * sources.length)];
      const amount = (Math.random() * 1.5 + 0.05).toFixed(2);
      const elapsedSeconds = Math.max(5, Math.floor(Math.random() * 58) + 1);
      setNotifications((prev) => [
        ...prev.slice(-9),
        { id, wallet: maskWallet(pick.wallet), amount, symbol: pick.symbol, elapsed: `${elapsedSeconds} seconds ago` },
      ]);
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }, 12000);
      const nextDelay = 30000 + Math.random() * 60000;
      timer = setTimeout(addNotification, nextDelay);
    };

    timer = setTimeout(addNotification, 30000 + Math.random() * 60000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadBalance = async () => {
      try {
        const balanceRes = await fetch("/api/balance", { cache: "no-store" });
        if (!balanceRes.ok) return;
        const balanceData = await balanceRes.json();
        const totalXrp = Number(balanceData?.totalXrp ?? 0);
        if (!Number.isFinite(totalXrp)) return;

        const priceRes = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=ripple&vs_currencies=usd",
          { cache: "no-store" }
        );
        if (!priceRes.ok) return;
        const priceData = await priceRes.json();
        const price = priceData?.ripple?.usd;
        if (!cancelled && typeof price === "number") {
          setTotalBalanceUsd(totalXrp * price);
        }
      } catch {
        // Ignore pricing/balance errors.
      }
    };

    loadBalance();
    return () => {
      cancelled = true;
    };
  }, []);

  const formatUsd = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(value);

  return (
    <div className="h-dvh bg-gray-50 overflow-hidden">
      <div className="flex h-full">
        <aside className="hidden lg:flex w-64 h-full flex-col border-r border-gray-200 bg-white">
          <div className="px-6 py-6 border-b border-gray-100">
            <div className="text-lg font-semibold text-gray-900">XRP Restaking</div>
            <div className="text-xs text-gray-500 mt-1">Account: {email}</div>
            <div className="text-xs text-gray-500">
              Total balance: {totalBalanceUsd === null ? "—" : formatUsd(totalBalanceUsd)}
            </div>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-1 text-sm text-gray-600 flex flex-col">
            {navItems.map((item) => {
              const active = item.href ? pathname === item.href : false;
              const base = `flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg transition ${
                active ? "bg-blue-50 text-blue-700 font-medium" : "hover:bg-gray-100"
              }`;

              if (item.href) {
                return (
                  <Link key={item.label} href={item.href} className={base}>
                    <item.icon size={18} />
                    <span>{item.label}</span>
                  </Link>
                );
              }

              return (
                <button key={item.label} className={base} onClick={item.onClick} type="button">
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        <div className="flex-1 min-h-0 min-w-0 flex flex-col">
          <div className="lg:hidden border-b border-gray-200 bg-white px-4 py-3 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-gray-900">XRP Restaking</div>
              <div className="text-xs text-gray-500">{email}</div>
              <div className="text-xs text-gray-500">
                Total balance: {totalBalanceUsd === null ? "—" : formatUsd(totalBalanceUsd)}
              </div>
            </div>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-700 hover:bg-gray-50 transition"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              onClick={() => setMobileOpen((prev) => !prev)}
            >
              <span className="sr-only">{mobileOpen ? "Close menu" : "Open menu"}</span>
              <span className="relative block h-4 w-5">
                <span
                  className={`absolute left-0 top-0 h-0.5 w-full bg-current transition ${
                    mobileOpen ? "translate-y-[7px] rotate-45" : ""
                  }`}
                />
                <span
                  className={`absolute left-0 top-[7px] h-0.5 w-full bg-current transition ${
                    mobileOpen ? "opacity-0" : ""
                  }`}
                />
                <span
                  className={`absolute left-0 bottom-0 h-0.5 w-full bg-current transition ${
                    mobileOpen ? "-translate-y-[7px] -rotate-45" : ""
                  }`}
                />
              </span>
            </button>
          </div>

          <main className="flex-1 min-h-0 min-w-0 overflow-y-auto overflow-x-hidden p-6 lg:p-10 space-y-8">
            {!verified ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <div className="font-semibold">Email not verified</div>
                <div className="mt-1 text-sm text-gray-700">
                  Please verify your email to unlock account actions.
                </div>

                <button
                  className="mt-4 h-11 px-5 rounded-full bg-gray-900 text-white disabled:opacity-60"
                  disabled={sending}
                  onClick={async () => {
                    setSending(true);
                    const r = await fetch("/api/auth/resend-verification", {
                      method: "POST",
                      headers: { "content-type": "application/json" },
                      body: JSON.stringify({ email }),
                    });
                    const d = await r.json().catch(() => ({}));
                    if (!r.ok) alert(d?.error || "Could not send email");
                    else alert("Verification email sent.");
                    setSending(false);
                  }}
                >
                  Resend verification email
                </button>

                <div className="mt-3 text-xs text-gray-600">
                  Important actions will be available after verification.
                </div>
              </div>
            ) : null}

            {!profileComplete ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <div className="font-semibold">Profile information required</div>
                <div className="mt-1 text-sm text-gray-700">
                  Access to account actions is restricted until you fill in your first name, last name, and phone number
                  in Profile.
                </div>
              </div>
            ) : null}

            {children}
          </main>
        </div>
      </div>

      {mobileOpen ? (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/40" onClick={() => setMobileOpen(false)}>
          <div
            className="absolute inset-y-0 right-0 w-72 bg-white shadow-xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-5 border-b border-gray-100">
              <div className="text-sm font-semibold text-gray-900">Account</div>
              <div className="text-xs text-gray-500">{email}</div>
              <div className="text-xs text-gray-500">
                Total balance: {totalBalanceUsd === null ? "—" : formatUsd(totalBalanceUsd)}
              </div>
            </div>
            <nav className="flex-1 px-4 py-4 space-y-1 text-sm text-gray-700 flex flex-col">
              {navItems.map((item) => {
                const active = item.href ? pathname === item.href : false;
                const base = `flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg transition ${
                  active ? "bg-blue-50 text-blue-700 font-medium" : "hover:bg-gray-100"
                }`;

                if (item.href) {
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={base}
                      onClick={() => setMobileOpen(false)}
                    >
                      <item.icon size={18} />
                      <span>{item.label}</span>
                    </Link>
                  );
                }

                return (
                  <button
                    key={item.label}
                    className={base}
                    onClick={async () => {
                      await item.onClick?.();
                      setMobileOpen(false);
                    }}
                    type="button"
                  >
                    <item.icon size={18} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      ) : null}

      <div className="pointer-events-none fixed top-4 inset-x-0 z-50 flex flex-col items-center space-y-2 px-4">
        {notifications.map((n) => (
          <div
            key={n.id}
            className="pointer-events-auto rounded-xl border border-blue-100 bg-white/90 px-4 py-3 shadow-lg backdrop-blur"
          >
            <div className="text-xs font-semibold text-blue-600">{n.wallet} made a deposit</div>
            <div className="mt-1 text-sm text-gray-800">
              {n.amount} {n.symbol} received
            </div>
            <div className="text-xs text-gray-500">{n.elapsed}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
