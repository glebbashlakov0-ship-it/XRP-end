"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const navGroups = [
  {
    label: "Management",
    links: [
      { href: "/admin/users", label: "Users" },
      { href: "/admin/deposits", label: "Deposits" },
      { href: "/admin/withdrawals", label: "Withdrawals" },
      { href: "/admin/wallets", label: "Wallets" },
    ],
  },
  {
    label: "Support",
    links: [
      { href: "/admin/support", label: "Support" },
      { href: "/admin/info-requests", label: "Info Requests" },
    ],
  },
  {
    label: "Edit",
    links: [
      { href: "/admin/terms", label: "Edit (Terms)" },
      { href: "/admin/privacy", label: "Edit (Privacy)" },
    ],
  },
  {
    label: "Settings",
    links: [
      { href: "/admin/verification", label: "Verification" },
    ],
  },
];

function isActive(current: string | undefined, href: string) {
  if (!current) return false;
  return current === href || current.startsWith(`${href}/`);
}

export default function AdminNav({ current }: { current?: string }) {
  const [notifications, setNotifications] = useState<{ id: string; message: string; createdAt: string }[]>([]);
  const seenIds = useRef<Set<string>>(new Set());
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const STORAGE_KEY = "adminNotificationLastSeen";
    let timer: ReturnType<typeof setTimeout>;
    let lastSeen = Date.now() - 5000;

    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      const parsed = stored ? Number(stored) : NaN;
      if (Number.isFinite(parsed)) lastSeen = parsed;
    } catch {
      // ignore storage errors
    }

    const poll = async () => {
      try {
        const res = await fetch(`/api/admin/notifications?since=${lastSeen}`, { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          const items = Array.isArray(data?.items) ? data.items : [];
          let maxSeen = lastSeen;
          const next: { id: string; message: string; createdAt: string }[] = [];

          for (const item of items) {
            if (!item?.id || seenIds.current.has(item.id)) continue;
            const createdAt = typeof item.createdAt === "string" ? item.createdAt : "";
            const ts = createdAt ? new Date(createdAt).getTime() : Date.now();
            if (ts > maxSeen) maxSeen = ts;

            const type = String(item.type || "operation").toLowerCase();
            const label = type === "withdrawal" ? "withdraw" : type === "deposit" ? "deposit" : "support";
            const message = `New operation: ${label}`;
            next.push({ id: item.id, message, createdAt });
            seenIds.current.add(item.id);
          }

          if (next.length > 0) {
            setNotifications((prev) => [...next, ...prev].slice(0, 6));
            for (const n of next) {
              setTimeout(() => {
                setNotifications((prev) => prev.filter((p) => p.id !== n.id));
              }, 12000);
            }
          }

          lastSeen = maxSeen;
          try {
            window.localStorage.setItem(STORAGE_KEY, String(lastSeen));
          } catch {
            // ignore storage errors
          }
        }
      } catch {
        // ignore network errors
      }

      timer = setTimeout(poll, 5000);
    };

    poll();
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <aside className="rounded-2xl border border-gray-200 bg-white px-4 py-5">
      {navGroups.map((group, index) => (
        <div key={group.label} className={index === 0 ? "" : "pt-5 mt-5 border-t border-gray-200"}>
          <div className="px-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400">
            {group.label}
          </div>
          <div className="mt-3 grid gap-1 text-sm">
            {group.links.map((link) => {
              const active = isActive(current, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-xl px-3 py-2 transition ${
                    active
                      ? "bg-gray-900 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
        <div className="pt-5 mt-5 border-t border-gray-200">
          <button
            type="button"
            className="w-full rounded-xl px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
            onClick={async () => {
              if (loggingOut) return;
              setLoggingOut(true);
              try {
                await fetch("/api/admin/logout", { method: "POST" });
              } finally {
                window.location.href = "/admin/login";
              }
            }}
          >
            {loggingOut ? "Signing out..." : "Sign out"}
          </button>
        </div>
      </aside>
      <div className="pointer-events-none fixed top-4 inset-x-0 z-50 flex flex-col items-center space-y-2 px-4">
        {notifications.map((n) => (
          <div
            key={n.id}
            className="pointer-events-auto rounded-xl border border-emerald-100 bg-white/90 px-4 py-3 shadow-lg backdrop-blur"
          >
            <div className="text-xs font-semibold text-emerald-600">{n.message}</div>
            <div className="text-xs text-gray-500">
              {n.createdAt ? new Date(n.createdAt).toLocaleTimeString() : "Just now"}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
