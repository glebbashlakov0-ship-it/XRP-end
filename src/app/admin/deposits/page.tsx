export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/requireUser";
import AdminNav from "@/components/admin/AdminNav";
import { revalidatePath } from "next/cache";
import { applyDepositStatusChange } from "@/lib/balance";

const STATUSES: ("PROCESSING" | "PAID" | "ERROR")[] = ["PROCESSING", "PAID", "ERROR"];
const STATUS_STYLES: Record<string, string> = {
  PAID: "text-emerald-600",
  ERROR: "text-rose-600",
  PROCESSING: "text-amber-600",
};

export default async function AdminDepositsPage() {
  await requireAdmin();
  const deposits = await prisma.deposit.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: true },
  });

  return (
    <div className="min-h-dvh bg-gray-50">
      <div className="mx-auto max-w-none px-6 py-6">
        <div className="grid gap-6 min-w-0 lg:grid-cols-[260px_1fr] lg:items-start">
          <AdminNav current="/admin/deposits" />
          <div className="space-y-6 min-w-0">
            <div>
              <div className="text-sm text-gray-500">Admin</div>
              <h1 className="text-2xl font-semibold text-gray-900">Deposits</h1>
              <p className="mt-1 text-sm text-gray-600">Review and update user deposits.</p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white">
              <div className="grid grid-cols-12 bg-gray-50 px-4 py-3 text-xs font-semibold text-gray-600">
                <div className="col-span-3">User</div>
                <div className="col-span-2">Currency</div>
                <div className="col-span-2">Amount</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-3">Created</div>
              </div>
              {deposits.length === 0 ? (
                <div className="px-4 py-6 text-sm text-gray-500">No deposits yet.</div>
              ) : (
                deposits.map((d) => (
                  <div key={d.id} className="grid grid-cols-12 px-4 py-3 text-sm border-t border-gray-100 items-center">
                    <div className="col-span-3">{d.user.email}</div>
                    <div className="col-span-2">{d.currency}</div>
                    <div className="col-span-2">{d.amount}</div>
                    <div className="col-span-2">
                      <form
                        action={async (formData) => {
                          "use server";
                          await requireAdmin();
                          const status = formData.get("status") as string;
                          const current = await prisma.deposit.findUnique({ where: { id: d.id } });
                          if (!current) return;
                          const nextStatus = status as typeof current.status;
                          if (current.status !== nextStatus) {
                            await prisma.deposit.update({ where: { id: d.id }, data: { status: nextStatus } });
                            await applyDepositStatusChange({
                              userId: current.userId,
                              amountXrp: current.amountXrp,
                              previousStatus: current.status,
                              nextStatus,
                            });
                          }
                          revalidatePath("/admin/deposits");
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <select
                            name="status"
                            defaultValue={d.status}
                            className="h-9 rounded-lg border border-gray-200 bg-white px-2 text-sm"
                          >
                            {STATUSES.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                          <button type="submit" className="rounded-lg bg-gray-900 px-3 py-1 text-xs font-semibold text-white">
                            Save
                          </button>
                        </div>
                        <div className={`mt-1 text-xs font-semibold ${STATUS_STYLES[d.status] ?? "text-gray-500"}`}>
                          {d.status}
                        </div>
                      </form>
                    </div>
                    <div className="col-span-3 text-gray-500">{new Date(d.createdAt).toLocaleString()}</div>
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
