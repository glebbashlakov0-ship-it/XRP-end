export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth/adminAuth";
import { redirect } from "next/navigation";
import AdminNav from "@/components/admin/AdminNav";

function isProfileComplete(user: { firstName: string | null; lastName: string | null; phone: string | null }) {
  return Boolean(user.firstName?.trim() && user.lastName?.trim() && user.phone?.trim());
}

export default async function AdminReferralDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminSession();

  const resolvedParams = await params;
  const referral = await prisma.referralLink.findUnique({
    where: { id: resolvedParams.id },
    select: { id: true, name: true, code: true },
  });

  if (!referral) redirect("/admin/referrals");

  const users = await prisma.user.findMany({
    where: { referralLinkId: referral.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      createdAt: true,
      emailVerifiedAt: true,
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

            <div className="flex flex-wrap gap-3 text-sm">
              <div className="rounded-full border border-gray-200 bg-white px-4 py-2">
                Total: <span className="ml-1 font-semibold text-gray-900">{users.length}</span>
              </div>
              <div className="rounded-full border border-gray-200 bg-white px-4 py-2">
                Verified profiles: <span className="ml-1 font-semibold text-gray-900">{verified}</span>
              </div>
              <div className="rounded-full border border-gray-200 bg-white px-4 py-2">
                Not verified: <span className="ml-1 font-semibold text-gray-900">{unverified}</span>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white">
              <div className="grid grid-cols-12 bg-gray-50 px-4 py-3 text-xs font-medium text-gray-600">
                <div className="col-span-4">User</div>
                <div className="col-span-3">Profile</div>
                <div className="col-span-2">Verified</div>
                <div className="col-span-2">Created</div>
                <div className="col-span-1">Action</div>
              </div>
              {users.length === 0 ? (
                <div className="px-4 py-8 text-sm text-gray-500">No users registered with this link yet.</div>
              ) : (
                users.map((u) => {
                  const profileComplete = isProfileComplete(u);
                  return (
                    <div key={u.id} className="grid grid-cols-12 px-4 py-4 border-t border-gray-200 text-sm">
                      <div className="col-span-4 font-medium text-gray-900">{u.email}</div>
                      <div className="col-span-3 text-gray-600 text-xs">
                        {`${u.firstName || ""} ${u.lastName || ""}`.trim() || "-"} • {u.phone || "-"}
                      </div>
                      <div className="col-span-2 text-gray-600 text-xs">
                        {profileComplete ? "Complete" : "Missing info"}
                      </div>
                      <div className="col-span-2 text-gray-600 text-xs">
                        {u.createdAt.toISOString().slice(0, 10)}
                      </div>
                      <div className="col-span-1 text-xs">
                        <Link className="text-blue-600 hover:text-blue-800" href={`/admin/users/${u.id}`}>
                          View
                        </Link>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
