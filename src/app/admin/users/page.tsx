export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth/adminAuth";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import AdminNav from "@/components/admin/AdminNav";
import { SUPPORTED_CURRENCIES, SUPPORTED_PRICES } from "@/lib/wallets";

function toNumber(value: FormDataEntryValue | null) {
  const num = Number(value ?? 0);
  return Number.isFinite(num) ? num : 0;
}

function toNonNegativeNumber(value: FormDataEntryValue | null) {
  const num = toNumber(value);
  return num < 0 ? 0 : num;
}

export default async function AdminUsersPage() {
  await requireAdminSession();

  const users = await prisma.user.findMany({
    where: { emailVerifiedAt: { not: null } },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      createdAt: true,
      emailVerifiedAt: true,
      status: true,
      balance: { select: { totalXrp: true, activeStakesXrp: true } },
    },
  });

  return (
    <div className="min-h-dvh bg-gray-50">
      <div className="mx-auto max-w-none px-6 py-6">
        <div className="grid gap-6 min-w-0 lg:grid-cols-[260px_1fr] lg:items-start">
          <AdminNav current="/admin/users" />
          <div className="space-y-6 min-w-0">
            <div className="flex flex-col items-start gap-3">
              <div>
                <div className="text-sm text-gray-500">Admin</div>
                <h1 className="text-2xl font-semibold text-gray-900">User Directory</h1>
                <p className="mt-1 text-sm text-gray-600">
                  Access is restricted to admin accounts only. No public links are exposed.
                </p>
              </div>
            </div>

            <div className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm text-gray-600 inline-flex">
              Verified users: <span className="ml-1 font-semibold text-gray-900">{users.length}</span>
            </div>

                  <div className="rounded-2xl border border-gray-200 bg-white">
                    <div className="overflow-x-auto">
                      <div className="min-w-[1200px]">
                        <div className="grid grid-cols-12 bg-gray-50 px-4 py-3 text-xs font-medium text-gray-600">
                          <div className="col-span-3">Email</div>
                          <div className="col-span-2">Total</div>
                          <div className="col-span-2">Active stakes</div>
                          <div className="col-span-1">Top up</div>
                          <div className="col-span-1">Amount</div>
                          <div className="col-span-1">Actions</div>
                          <div className="col-span-1">Created / Verified</div>
                          <div className="col-span-1">Status</div>
                        </div>
                        {users.map((u) => (
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

                              revalidatePath("/admin/users");
                            }}
                          >
                            <div className="col-span-3 font-medium text-gray-900">{u.email}</div>
                            <div className="col-span-2 text-gray-700">{u.balance?.totalXrp ?? 0}</div>
                            <div className="col-span-2 text-gray-700">{u.balance?.activeStakesXrp ?? 0}</div>
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
                            <div className="col-span-1 flex items-center gap-2">
                              <button className="h-9 px-3 rounded-lg bg-gray-900 text-white text-xs" type="submit">
                                Save
                              </button>
                              <Link className="text-blue-600 hover:text-blue-800 text-xs" href={`/admin/users/${u.id}`}>
                                View
                              </Link>
                            </div>
                            <div className="col-span-1 text-gray-600 text-xs">
                              {u.createdAt.toISOString().slice(0, 10)} · {u.emailVerifiedAt ? "Yes" : "No"}
                            </div>
                            <div className="col-span-1 text-gray-600 text-xs">
                              {u.status}
                            </div>
                          </form>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }
