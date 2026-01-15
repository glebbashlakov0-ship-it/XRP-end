export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth/adminAuth";
import { redirect } from "next/navigation";
import AdminNav from "@/components/admin/AdminNav";

const sections: Record<string, { title: string; description: string }> = {
  "statistics": {
    title: "Statistics",
    description: "Key platform metrics and performance summaries will appear here.",
  },
  "detailed-statistics": {
    title: "Detailed Statistics",
    description: "Granular analytics, charts, and filters for deeper insights.",
  },
  "promo-codes": {
    title: "Promo Codes",
    description: "Create and manage promotional codes for campaigns.",
  },
  "deposits": {
    title: "Deposits",
    description: "Monitor and review all deposit activity.",
  },
  "withdrawals": {
    title: "Withdrawals",
    description: "Approve, reject, and audit withdrawal requests.",
  },
  "wallet-connect": {
    title: "Wallet Connect",
    description: "Review wallet connection activity and configuration.",
  },
  "workers": {
    title: "Workers",
    description: "Manage worker instances and operational assignments.",
  },
  "common-domains": {
    title: "Common Domains",
    description: "Manage shared domains for platform services.",
  },
  "worker-domains": {
    title: "Worker Domains",
    description: "Manage domains dedicated to worker operations.",
  },
  "logs": {
    title: "Logs",
    description: "System logs and audit history.",
  },
  "kyc": {
    title: "KYC List",
    description: "Review and verify submitted KYC documents.",
  },
  "payments": {
    title: "Payments",
    description: "Track payment activity and processor status.",
  },
  "coin-settings": {
    title: "Coin Settings",
    description: "Configure supported coins and network settings.",
  },
  "telegram-settings": {
    title: "Telegram Settings",
    description: "Configure Telegram notifications and bots.",
  },
  "support-presets": {
    title: "Support Presets",
    description: "Manage canned responses and support templates.",
  },
  "terms": {
    title: "Edit (Terms)",
    description: "Update terms and policy content.",
  },
  "settings": {
    title: "Settings",
    description: "Global platform configuration and preferences.",
  },
};

async function requireAdmin() {
  await requireAdminSession();
}

export default async function AdminSectionPage({ params }: { params: Promise<{ section: string }> }) {
  await requireAdmin();
  const { section } = await params;
  const config = sections[section];

  if (!config) redirect("/admin/users");

  return (
    <div className="min-h-dvh bg-gray-50">
      <div className="mx-auto max-w-none px-6 py-6">
        <div className="grid gap-6 min-w-0 lg:grid-cols-[260px_1fr] lg:items-start">
          <AdminNav current={`/admin/${section}`} />
          <div className="space-y-6 min-w-0">
            <div>
              <div className="text-sm text-gray-500">Admin</div>
              <h1 className="text-2xl font-semibold text-gray-900">{config.title}</h1>
              <p className="mt-1 text-sm text-gray-600">Section ready for wiring.</p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-600">
              {config.description}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
