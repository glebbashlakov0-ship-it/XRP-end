export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth/adminAuth";
import Link from "next/link";
import AdminNav from "@/components/admin/AdminNav";

async function requireAdmin() {
  await requireAdminSession();
}

export default async function AdminVerificationPage() {
  await requireAdmin();

  const unverified = await prisma.user.findMany({
    where: { emailVerifiedAt: null },
    orderBy: { createdAt: "desc" },
    select: { id: true, email: true, createdAt: true, lastVerificationEmailSentAt: true, status: true },
  });

  return (
    <div className="min-h-dvh bg-gray-50">
      <div className="mx-auto max-w-none px-6 py-6">
        <div className="grid gap-6 min-w-0 lg:grid-cols-[260px_1fr] lg:items-start">
          <AdminNav current="/admin/verification" />
          <div className="space-y-6 min-w-0">
            <div className="flex flex-col items-start gap-3">
              <div>
                <div className="text-sm text-gray-500">Admin</div>
                <h1 className="text-2xl font-semibold text-gray-900">Verification Links</h1>
              </div>
            </div>

            <div className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm text-gray-600 inline-flex">
              Unverified users: <span className="ml-1 font-semibold text-gray-900">{unverified.length}</span>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white">
              <div className="overflow-x-auto">
                <div className="min-w-[720px]">
                  <div className="grid grid-cols-12 bg-gray-50 px-4 py-3 text-xs font-medium text-gray-600">
                    <div className="col-span-4">Email</div>
                    <div className="col-span-3">Created</div>
                    <div className="col-span-3">Last verification email</div>
                    <div className="col-span-2">Status</div>
                  </div>
                  {unverified.length === 0 ? (
                    <div className="px-4 py-8 text-sm text-gray-500">No unverified users.</div>
                  ) : (
                    unverified.map((u) => (
                      <Link
                        key={u.id}
                        href={`/admin/users/${u.id}`}
                        className="grid grid-cols-12 px-4 py-4 border-t border-gray-200 text-sm"
                      >
                        <div className="col-span-4 font-medium text-gray-900">{u.email}</div>
                        <div className="col-span-3 text-gray-600">{u.createdAt.toISOString()}</div>
                        <div className="col-span-3 text-gray-600">
                          {u.lastVerificationEmailSentAt ? u.lastVerificationEmailSentAt.toISOString() : "Never"}
                        </div>
                        <div className="col-span-2 text-gray-600">{u.status}</div>
                      </Link>
                    ))
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
