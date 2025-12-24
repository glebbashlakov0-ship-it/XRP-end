"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
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
  children: ReactNode;
};

export default function LkShell({ email, verified, children }: LkShellProps) {
  const pathname = usePathname();
  const [sending, setSending] = useState(false);

  return (
    <div className="h-dvh bg-gray-50 overflow-hidden">
      <div className="flex h-full">
        <aside className="hidden lg:flex w-64 h-full flex-col border-r border-gray-200 bg-white">
          <div className="px-6 py-6 border-b border-gray-100">
            <div className="text-lg font-semibold text-gray-900">XRP Restaking</div>
            <div className="text-xs text-gray-500 mt-1">Account: {email}</div>
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

        <main className="flex-1 min-h-0 overflow-y-auto p-6 lg:p-10 space-y-8">
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

          {children}
        </main>
      </div>
    </div>
  );
}
