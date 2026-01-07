"use client";

import { type FormEvent, useState, useTransition } from "react";

import Container from "@/components/ui/Container";
import Divider from "@/components/ui/Divider";
import LogoMark from "@/components/ui/LogoMark";
import { footer } from "@/lib/landingData";

type InfoFormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

const initialForm: InfoFormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
};

export default function Footer() {
  const [form, setForm] = useState<InfoFormState>(initialForm);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function updateField(key: keyof InfoFormState, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("idle");
    setError(null);

    startTransition(async () => {
      const res = await fetch("/api/info-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setForm(initialForm);
        setStatus("success");
        return;
      }

      const data = await res.json().catch(() => null);
      setStatus("error");
      setError(data?.error ?? "Something went wrong. Please try again.");
    });
  }

  return (
    <footer className="border-t border-gray-200 bg-white">
      <Container className="py-8 space-y-10">
        <div className="rounded-2xl border border-gray-200 bg-gray-50/80 px-5 py-6 md:px-8 md:py-7">
          <div className="grid gap-6 lg:grid-cols-[1.15fr_1fr] lg:items-center">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-100">
                Pre-registration brief
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{footer.infoRequest.title}</h3>
                <p className="mt-1.5 text-sm text-gray-600 leading-relaxed">{footer.infoRequest.description}</p>
              </div>
            </div>

            <form id="info-request-form" onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-1 text-sm text-gray-700">
                <span>First name</span>
                <input
                  required
                  value={form.firstName}
                  onChange={(e) => updateField("firstName", e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 transition focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  placeholder="Brad"
                  name="firstName"
                />
              </label>
              <label className="space-y-1 text-sm text-gray-700">
                <span>Last name</span>
                <input
                  required
                  value={form.lastName}
                  onChange={(e) => updateField("lastName", e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 transition focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  placeholder="Garlinghouse"
                  name="lastName"
                />
              </label>
              <label className="space-y-1 text-sm text-gray-700">
                <span>Email</span>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 transition focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  placeholder="brad@email.com"
                  name="email"
                />
              </label>
              <label className="space-y-1 text-sm text-gray-700">
                <span>Phone</span>
                <input
                  required
                  value={form.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 transition focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  placeholder="+1 555 000 123"
                  name="phone"
                />
              </label>
              <div className="sm:col-span-2 flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center justify-center rounded-full bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isPending ? "Sending..." : footer.infoRequest.cta}
                </button>
                {status === "success" ? (
                  <span className="text-sm font-medium text-emerald-700">{footer.infoRequest.success}</span>
                ) : null}
                {status === "error" ? (
                  <span className="text-sm font-medium text-rose-700">{error}</span>
                ) : null}
              </div>
            </form>
          </div>
        </div>

        <div className="grid gap-10 lg:grid-cols-3">
          <div>
            <LogoMark />
            <p className="mt-4 text-sm text-gray-600 leading-relaxed">{footer.about}</p>

            <div className="mt-6 grid gap-2 sm:grid-cols-3">
              {footer.facts.map((f) => (
                <div
                  key={f.label}
                  className="rounded-xl border border-gray-200 px-3 py-2 transition-transform transition-shadow duration-200 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="text-[11px] text-gray-500 leading-tight">{f.label}</div>
                  <div className="mt-1 text-xs font-semibold text-gray-900 leading-snug">{f.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 grid gap-8 md:grid-cols-3">
            {Object.entries(footer.links).map(([group, links]) => (
              <div key={group}>
                <div className="text-sm font-semibold">{group}</div>
                <div className="mt-4 grid gap-3 text-sm text-gray-600">
                  {links.map((l) => (
                    <a key={l.label} href={l.href} className="hover:text-gray-900 transition">
                      {l.label}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <Divider className="my-6" />

        <div className="text-xs text-gray-500">{footer.copyright}</div>
      </Container>
    </footer>
  );
}
