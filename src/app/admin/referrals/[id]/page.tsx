export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth/adminAuth";
import { redirect } from "next/navigation";
import AdminNav from "@/components/admin/AdminNav";
import { revalidatePath } from "next/cache";
import { SUPPORTED_CURRENCIES, SUPPORTED_PRICES } from "@/lib/wallets";
import ConfirmDeleteButton from "@/components/admin/ConfirmDeleteButton";

function isProfileComplete(user: { firstName: string | null; lastName: string | null; phone: string | null }) {
  return Boolean(user.firstName?.trim() && user.lastName?.trim() && user.phone?.trim());
}

function toNumber(value: FormDataEntryValue | null) {
  const num = Number(value ?? 0);
  return Number.isFinite(num) ? num : 0;
}

function toNonNegativeNumber(value: FormDataEntryValue | null) {
  const num = toNumber(value);
  return num < 0 ? 0 : num;
}

export default async function AdminReferralDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ domain?: string }>;
}) {
  await requireAdminSession();

  const resolvedParams = await params;
  const resolvedSearch = searchParams ? await searchParams : {};
  const selectedDomain = resolvedSearch?.domain?.toLowerCase() || "";

  const domains = await prisma.domain.findMany({
    orderBy: { createdAt: "desc" },
    select: { host: true },
  });
  const referral = await prisma.referralLink.findUnique({
    where: { id: resolvedParams.id },
    select: { id: true, name: true, code: true },
  });

  if (!referral) redirect("/admin/referrals");

  const users = await prisma.user.findMany({
    where: {
      referralLinkId: referral.id,
      ...(selectedDomain ? { signupDomain: selectedDomain } : {}),
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      createdAt: true,
      emailVerifiedAt: true,
      status: true,
      balance: { select: { totalXrp: true, activeStakesXrp: true } },
    },
  });

  const verified = users.filter((u) => isProfileComplete(u)).length;
  const unverified = Math.max(users.length - verified, 0);

  return (
    <div className="min-h-dvh bg-gray-50">
      <div className="mx-auto max-w-none px-6 py-6">
        <div className="grid gap-6 min-w-0 lg:grid-cols-[260px_1fr] lg:items-start">
          <AdminNav current="/admin/referrals" />
          <div className="space-y-6 min-w-0">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Admin</div>
                <h1 className="text-2xl font-semibold text-gray-900">{referral.name}</h1>
                <p className="mt-1 text-sm text-gray-600">Code: {referral.code}</p>
              </div>
              <Link className="text-sm text-gray-600 underline" href="/admin/referrals">
                Back to referrals
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm">
              <div className="rounded-full border border-gray-200 bg-white px-4 py-2">
                Total: <span className="ml-1 font-semibold text-gray-900">{users.length}</span>
              </div>
              <div className="rounded-full border border-gray-200 bg-white px-4 py-2">
                Verified profiles: <span className="ml-1 font-semibold text-gray-900">{verified}</span>
              </div>
              <div className="rounded-full border border-gray-200 bg-white px-4 py-2">
                Not verified: <span className="ml-1 font-semibold text-gray-900">{unverified}</span>
              </div>
              <form className="flex flex-wrap items-center gap-2" action={`/admin/referrals/${referral.id}`} method="get">
                <select
                  name="domain"
                  defaultValue={selectedDomain || ""}
                  className="h-9 rounded-lg border border-gray-200 bg-white px-2 text-xs"
                >
                  <option value="">All domains</option>
                  {domains.map((d) => (
                    <option key={d.host} value={d.host}>
                      {d.host}
                    </option>
                  ))}
                </select>
                <button className="h-9 px-3 rounded-lg bg-gray-900 text-white text-xs" type="submit">
                  Filter
                </button>
              </form>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white">
              <div className="grid grid-cols-12 bg-gray-50 px-4 py-3 text-xs font-medium text-gray-600">
                <div className="col-span-3">Email</div>
                <div className="col-span-1">Total</div>
                <div className="col-span-1">Active stakes</div>
                <div className="col-span-1">Top up</div>
                <div className="col-span-1">Amount</div>
                <div className="col-span-2">Actions</div>
                <div className="col-span-2">Created / Verified</div>
                <div className="col-span-1">Status</div>
              </div>
              {users.length === 0 ? (
                <div className="px-4 py-8 text-sm text-gray-500">No users registered with this link yet.</div>
              ) : (
                users.map((u) => (
                  <form
                    key={u.id}
                    className="grid grid-cols-12 px-4 py-4 border-t border-gray-200 text-sm items-center"
                    action={async (formData) => {
                      "use server";
                      await requireAdminSession();
                      const current = await prisma.userBalance.findUnique({ where: { userId: u.id } });
                      const totalXrp = current?.totalXrp ?? 0;
                      const activeStakesXrp = current?.activeStakesXrp ?? 0;
                      const topUpCurrency =
                        typeof formData.get("topUpCurrency") === "string"
                          ? String(formData.get("topUpCurrency")).toUpperCase()
                          : "XRP";
                      const topUpAmount = toNonNegativeNumber(formData.get("topUpAmount"));
                      const price =
                        SUPPORTED_PRICES[topUpCurrency as (typeof SUPPORTED_CURRENCIES)[number]] ?? 1;
                      const topUpXrp = topUpAmount > 0 ? topUpAmount * price : 0;

                      const baseTotal = Math.max(totalXrp, activeStakesXrp);
                      const baseRewards = Math.max(baseTotal - activeStakesXrp, 0);
                      const nextActive = activeStakesXrp + topUpXrp;
                      const nextTotal = baseTotal + topUpXrp;
                      const rewardsXrp = Math.max(nextTotal - nextActive, baseRewards, 0);

                      await prisma.userBalance.upsert({
                        where: { userId: u.id },
                        update: {
                          totalXrp: nextTotal,
                          totalUsd: nextTotal,
                          activeStakesXrp: nextActive,
                          rewardsXrp,
                          lastYieldAt: new Date(),
                        },
                        create: {
                          userId: u.id,
                          totalXrp: nextTotal,
                          totalUsd: nextTotal,
                          activeStakesXrp: nextActive,
                          rewardsXrp,
                          lastYieldAt: new Date(),
                        },
                      });

                      await prisma.portfolioSnapshot.create({
                        data: { userId: u.id, totalXrp: nextTotal, totalUsd: nextTotal },
                      });

                      revalidatePath(`/admin/referrals/${referral.id}`);
                      revalidatePath("/admin/users");
                    }}
                  >
                    <div className="col-span-3 font-medium text-gray-900">
                      <div>{u.email}</div>
                      <div className="mt-1 text-xs text-gray-500">
                        {`${u.firstName || ""} ${u.lastName || ""}`.trim() || "-"} - {u.phone || "-"}
                      </div>
                    </div>
                    <div className="col-span-1 text-gray-700">{u.balance?.totalXrp ?? 0}</div>
                    <div className="col-span-1 text-gray-700">{u.balance?.activeStakesXrp ?? 0}</div>
                    <div className="col-span-1">
                      <select
                        name="topUpCurrency"
                        defaultValue="XRP"
                        className="h-9 rounded-lg border border-gray-200 bg-white px-2 text-xs"
                      >
                        {SUPPORTED_CURRENCIES.map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-1">
                      <input
                        name="topUpAmount"
                        className="h-9 w-24 rounded-lg border border-gray-200 px-2 text-xs"
                        type="number"
                        step="0.0001"
                        min="0"
                        placeholder="0"
                      />
                    </div>
                    <div className="col-span-2 flex flex-wrap items-center gap-2">
                      <button className="h-9 px-3 rounded-lg bg-gray-900 text-white text-xs" type="submit">
                        Save
                      </button>
                      <Link className="text-blue-600 hover:text-blue-800 text-xs" href={`/admin/users/${u.id}`}>
                        View
                      </Link>
                      <ConfirmDeleteButton
                        className="h-7 px-2 rounded-md bg-red-600 text-white text-[11px]"
                        confirmText="Delete this user permanently?"
                        action={async () => {
                          "use server";
                          await requireAdminSession();
                          await prisma.user.delete({ where: { id: u.id } });
                          revalidatePath(`/admin/referrals/${referral.id}`);
                          revalidatePath("/admin/referrals");
                          revalidatePath("/admin/users");
                        }}
                      />
                    </div>
                    <div className="col-span-2 text-gray-600 text-xs">
                      {u.createdAt.toISOString().slice(0, 10)} - {u.emailVerifiedAt ? "Yes" : "No"}
                    </div>
                    <div className="col-span-1 text-gray-600 text-xs">
                      {u.status}
                    </div>
                  </form>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
