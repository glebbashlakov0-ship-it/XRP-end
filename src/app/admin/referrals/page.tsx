export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth/adminAuth";
import { APP_URL } from "@/lib/auth/env";
import { randomToken } from "@/lib/auth/crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import AdminNav from "@/components/admin/AdminNav";
import ReferralRow from "./ReferralRow";

function formatDate(value: Date) {
  return value.toISOString().slice(0, 10);
}

async function generateReferralCode() {
  for (let i = 0; i < 6; i += 1) {
    const code = `XRP-${randomToken(4).toUpperCase()}`;
    const exists = await prisma.referralLink.findUnique({ where: { code } });
    if (!exists) return code;
  }
  throw new Error("Unable to generate referral code");
}

function profileCompleteFilter() {
  return {
    AND: [
      { firstName: { not: null } },
      { firstName: { not: "" } },
      { lastName: { not: null } },
      { lastName: { not: "" } },
      { phone: { not: null } },
      { phone: { not: "" } },
    ],
  };
}

export default async function AdminReferralsPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string; success?: string; domain?: string }>;
}) {
  await requireAdminSession();

  const links = await prisma.referralLink.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      code: true,
      createdAt: true,
      _count: { select: { users: true } },
    },
  });

  const resolvedSearch = searchParams ? await searchParams : {};
  const selectedDomain = resolvedSearch?.domain?.toLowerCase() || "";

  const domains = await prisma.domain.findMany({
    orderBy: { createdAt: "desc" },
    select: { host: true },
  });

  const domain = selectedDomain
    ? { host: selectedDomain }
    : await prisma.domain.findFirst({
        where: { host: { not: { startsWith: "adm-" } } },
        orderBy: { createdAt: "desc" },
      });
  const baseUrl = domain?.host ? `https://${domain.host}` : APP_URL;

  const withCounts = await Promise.all(
    links.map(async (link) => {
      const verified = await prisma.user.count({
        where: { referralLinkId: link.id, ...profileCompleteFilter() },
      });
      const total = link._count.users;
      return { ...link, total, verified, unverified: Math.max(total - verified, 0) };
    })
  );

  const error = resolvedSearch?.error;
  const success = resolvedSearch?.success;

  return (
    <div className="min-h-dvh bg-gray-50">
      <div className="mx-auto max-w-none px-6 py-6">
        <div className="grid gap-6 min-w-0 lg:grid-cols-[260px_1fr] lg:items-start">
          <AdminNav current="/admin/referrals" />
          <div className="space-y-6 min-w-0">
            <div>
              <div className="text-sm text-gray-500">Admin</div>
              <h1 className="text-2xl font-semibold text-gray-900">Referral Links</h1>
              <p className="mt-1 text-sm text-gray-600">
                Create named referral links and track who signed up through each link.
              </p>
            </div>

            {error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error === "missing_name" ? "Enter a name for the referral link." : "Action failed."}
              </div>
            ) : null}
            {success ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {success === "created" ? "Referral link created." : "Action completed."}
              </div>
            ) : null}

            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="text-sm font-semibold text-gray-900">Create new referral link</div>
              <form
                className="mt-3 flex flex-wrap items-center gap-3"
                action={async (formData) => {
                  "use server";
                  await requireAdminSession();
                  const name = String(formData.get("name") || "").trim();
                  if (!name) redirect("/admin/referrals?error=missing_name");

                  const code = await generateReferralCode();
                  await prisma.referralLink.create({ data: { name, code } });
                  redirect("/admin/referrals?success=created");
                }}
              >
                <input
                  name="name"
                  placeholder="Partner name"
                  className="h-10 min-w-[240px] flex-1 rounded-lg border border-gray-200 bg-white px-3 text-sm"
                />
                <button className="h-10 px-4 rounded-lg bg-gray-900 text-white text-sm" type="submit">
                  Create link
                </button>
              </form>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm text-gray-600 inline-flex">
                Referral links: <span className="ml-1 font-semibold text-gray-900">{withCounts.length}</span>
              </div>
              <form className="flex flex-wrap items-center gap-2" action="/admin/referrals" method="get">
                <select
                  name="domain"
                  defaultValue={selectedDomain || ""}
                  className="h-9 rounded-lg border border-gray-200 bg-white px-2 text-xs"
                >
                  <option value="">Auto domain</option>
                  {domains.map((d) => (
                    <option key={d.host} value={d.host}>
                      {d.host}
                    </option>
                  ))}
                </select>
                <button className="h-9 px-3 rounded-lg bg-gray-900 text-white text-xs" type="submit">
                  Use domain
                </button>
              </form>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white">
              <div className="grid grid-cols-12 bg-gray-50 px-4 py-3 text-xs font-medium text-gray-600">
                <div className="col-span-3">Name / Code</div>
                <div className="col-span-4">Referral link</div>
                <div className="col-span-2">Counts</div>
                <div className="col-span-2">Actions</div>
                <div className="col-span-1">Created</div>
              </div>
              {withCounts.length === 0 ? (
                <div className="px-4 py-8 text-sm text-gray-500">No referral links yet.</div>
              ) : (
                withCounts.map((link) => (
                  <ReferralRow
                    key={link.id}
                    id={link.id}
                    name={link.name}
                    code={link.code}
                    url={`${baseUrl}/register?ref=${encodeURIComponent(link.code)}`}
                    total={link.total}
                    verified={link.verified}
                    unverified={link.unverified}
                    createdAt={formatDate(link.createdAt)}
                    onDelete={async () => {
                      "use server";
                      await requireAdminSession();
                      await prisma.referralLink.delete({ where: { id: link.id } });
                      revalidatePath("/admin/referrals");
                    }}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
