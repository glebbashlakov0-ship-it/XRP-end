"use client";

import { useState } from "react";
import Container from "@/components/ui/Container";
import LogoMark from "@/components/ui/LogoMark";
import { nav } from "@/lib/landingData";
import Link from "next/link";
import { LayoutGrid } from "lucide-react";

export default function Header() {
  const [open, setOpen] = useState(false);
  const mobileNav = [...nav, { label: "Dashboard", href: "/dashboard", type: "route" as const }];

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-gray-200">
      <Container className="h-16 flex items-center justify-between">
        <Link href="/" className="shrink-0">
          <LogoMark />
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600">
          {nav.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="hover:text-gray-900 transition"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="hidden md:inline-flex items-center justify-center rounded-full px-5 h-11 text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 transition"
          >
            Dashboard
          </Link>
          <button
            type="button"
            className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-700 hover:bg-gray-50 transition"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((prev) => !prev)}
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            <span className="relative block h-4 w-5">
              <span
                className={`absolute left-0 top-0 h-0.5 w-full bg-current transition ${
                  open ? "translate-y-[7px] rotate-45" : ""
                }`}
              />
              <span
                className={`absolute left-0 top-[7px] h-0.5 w-full bg-current transition ${
                  open ? "opacity-0" : ""
                }`}
              />
              <span
                className={`absolute left-0 bottom-0 h-0.5 w-full bg-current transition ${
                  open ? "-translate-y-[7px] -rotate-45" : ""
                }`}
              />
            </span>
          </button>
        </div>
      </Container>

      {open ? (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <Container className="py-4">
            <nav className="grid gap-2 text-sm text-gray-700">
              {mobileNav.map((item) => {
                const isDashboard = item.label === "Dashboard";
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`rounded-xl px-3 py-2 transition flex items-center justify-between ${
                      isDashboard
                        ? "bg-gray-900 text-white hover:bg-gray-800"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => setOpen(false)}
                  >
                    <span className="flex items-center gap-2">
                      {isDashboard ? <LayoutGrid className="h-4 w-4" /> : null}
                      {item.label}
                    </span>
                    {isDashboard ? (
                      <span className="text-[11px] uppercase tracking-wider opacity-80">
                        Primary
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </nav>
          </Container>
        </div>
      ) : null}
    </header>
  );
}
