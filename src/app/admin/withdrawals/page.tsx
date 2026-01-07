export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/requireUser";
import AdminNav from "@/components/admin/AdminNav";
import { revalidatePath } from "next/cache";
import { applyWithdrawalStatusChange } from "@/lib/balance";

const STATUSES: ("PROCESSING" | "PAID" | "ERROR")[] = ["PROCESSING", "PAID", "ERROR"];

export default async function AdminWithdrawalsPage() {
  await requireAdmin();
  const withdrawals = await prisma.withdrawal.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: true },
  });

  return (
    <div className="min-h-dvh bg-gray-50">
      <div className="mx-auto max-w-none px-6 py-6">
        <div className="grid gap-6 min-w-0 lg:grid-cols-[260px_1fr] lg:items-start">
          <AdminNav current="/admin/withdrawals" />
          <div className="space-y-6 min-w-0">
            <div>
              <div className="text-sm text-gray-500">Admin</div>
              <h1 className="text-2xl font-semibold text-gray-900">Withdrawals</h1>
              <p className="mt-1 text-sm text-gray-600">Review and update user withdrawals.</p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white">
              <div className="grid grid-cols-12 bg-gray-50 px-4 py-3 text-xs font-semibold text-gray-600">
                <div className="col-span-3">User</div>
                <div className="col-span-2">Currency</div>
                <div className="col-span-2">Amount</div>
                <div className="col-span-3">Wallet</div>
                <div className="col-span-2">Status</div>
              </div>
              {withdrawals.length === 0 ? (
                <div className="px-4 py-6 text-sm text-gray-500">No withdrawals yet.</div>
              ) : (
                withdrawals.map((w) => (
                  <div key={w.id} className="grid grid-cols-12 px-4 py-3 text-sm border-t border-gray-100 items-center">
                    <div className="col-span-3">{w.user.email}</div>
                    <div className="col-span-2">{w.currency}</div>
                    <div className="col-span-2">{w.amount}</div>
                    <div className="col-span-3 break-all text-xs">{w.walletAddress}</div>
                    <div className="col-span-2">
                      <form
                        action={async (formData) => {
                          "use server";
                          await requireAdmin();
                          const status = formData.get("status") as string;
                          const current = await prisma.withdrawal.findUnique({ where: { id: w.id } });
                          if (!current) return;
                          const nextStatus = status as typeof current.status;
                          if (current.status !== nextStatus) {
                            await prisma.withdrawal.update({ where: { id: w.id }, data: { status: nextStatus } });
                            await applyWithdrawalStatusChange({
                              userId: current.userId,
                              amountXrp: current.amountXrp,
                              previousStatus: current.status,
                              nextStatus,
                            });
                          }
                          revalidatePath("/admin/withdrawals");
                        }}
                      >
                        <select
                          name="status"
                          defaultValue={w.status}
                          className="h-9 rounded-lg border border-gray-200 bg-white px-2 text-sm"
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                        <button type="submit" className="ml-2 rounded-lg bg-gray-900 px-3 py-1 text-xs font-semibold text-white">
                          Save
                        </button>
                      </form>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
