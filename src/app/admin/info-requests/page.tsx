export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import AdminNav from "@/components/admin/AdminNav";
import { requireAdminSession } from "@/lib/auth/adminAuth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  await requireAdminSession();
}

export default async function AdminInfoRequestsPage() {
  await requireAdmin();

  const infoRequests = await prisma.infoRequest.findMany({
    orderBy: { createdAt: "desc" },
    take: 300,
  });

  return (
    <div className="min-h-dvh bg-gray-50">
      <div className="mx-auto max-w-none px-6 py-6">
        <div className="grid min-w-0 items-start gap-6 lg:grid-cols-[260px_1fr]">
          <AdminNav current="/admin/info-requests" />
          <div className="min-w-0 space-y-6">
            <div className="flex flex-col gap-3">
              <div>
                <div className="text-sm text-gray-500">Admin</div>
                <h1 className="text-2xl font-semibold text-gray-900">Info requests</h1>
                <p className="mt-1 text-sm text-gray-600">
                  Leads submitted from the footer form for users requesting onboarding details before registration.
                </p>
              </div>
            </div>

            <div className="inline-flex rounded-full border border-gray-200 bg-white px-4 py-2 text-sm text-gray-600">
              Total requests: <span className="ml-1 font-semibold text-gray-900">{infoRequests.length}</span>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white">
              <div className="overflow-x-auto">
                <div className="min-w-[720px]">
                  <div className="grid grid-cols-12 bg-gray-50 px-4 py-3 text-xs font-medium text-gray-600">
                    <div className="col-span-3">Name</div>
                    <div className="col-span-3">Email</div>
                    <div className="col-span-3">Phone</div>
                    <div className="col-span-3 text-right">Received</div>
                  </div>
                  {infoRequests.map((item) => (
                    <div key={item.id} className="grid grid-cols-12 border-t border-gray-200 px-4 py-4 text-sm">
                      <div className="col-span-3 font-medium text-gray-900">{`${item.firstName} ${item.lastName}`}</div>
                      <div className="col-span-3 text-gray-700">{item.email}</div>
                      <div className="col-span-3 text-gray-700">{item.phone}</div>
                      <div className="col-span-3 text-right text-gray-500">{item.createdAt.toISOString()}</div>
                    </div>
                  ))}
                  {infoRequests.length === 0 ? (
                    <div className="px-4 py-8 text-sm text-gray-500">No info requests yet.</div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
