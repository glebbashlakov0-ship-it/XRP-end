export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { sha256 } from "@/lib/auth/crypto";
import { APP_URL, DEV_ONLY_ADMIN_LINKS, SESSION_COOKIE_NAME } from "@/lib/auth/env";
import { redirect } from "next/navigation";
import Link from "next/link";
import AdminNav from "@/components/admin/AdminNav";

async function requireAdmin() {
  const sessionToken = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  if (!sessionToken) redirect("/login");

  const hash = sha256(sessionToken);
  const session = await prisma.session.findUnique({
    where: { sessionTokenHash: hash },
    include: { user: true },
  });

  if (!session || session.expiresAt.getTime() < Date.now()) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/lk");
}

export default async function AdminVerificationPage() {
  await requireAdmin();

  const unverified = await prisma.user.findMany({
    where: { emailVerifiedAt: null },
    orderBy: { createdAt: "desc" },
    select: { id: true, email: true, createdAt: true, lastVerificationEmailSentAt: true, status: true },
  });

  const links = await prisma.devVerificationLink.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { id: true, email: true } } },
    take: 200,
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
                <p className="mt-1 text-sm text-gray-600">
                  DEV ONLY: these links are stored to speed up testing. Disable before production.
                </p>
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

            <div className="rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-700 inline-flex">
              DEV ONLY
            </div>

            {!DEV_ONLY_ADMIN_LINKS ? (
              <div className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-600">
                DEV_ONLY_ADMIN_LINKS is disabled. No verification links are stored.
              </div>
            ) : null}

            <div className="rounded-2xl border border-gray-200 bg-white">
              <div className="overflow-x-auto">
                <div className="min-w-[720px]">
                  <div className="grid grid-cols-12 bg-gray-50 px-4 py-3 text-xs font-medium text-gray-600">
                    <div className="col-span-3">User</div>
                    <div className="col-span-3">Purpose</div>
                    <div className="col-span-4">Link</div>
                    <div className="col-span-2 text-right">Expires</div>
                  </div>
                  {links.map((item) => {
                    const url = `${APP_URL}/verify-email?token=${encodeURIComponent(item.token)}`;
                    return (
                      <div key={item.id} className="grid grid-cols-12 px-4 py-4 border-t border-gray-200 text-sm">
                        <div className="col-span-3 font-medium text-gray-900">
                          <Link className="underline decoration-gray-200 hover:decoration-gray-400" href={`/admin/users/${item.userId}`}>
                            {item.user.email}
                          </Link>
                        </div>
                        <div className="col-span-3 text-gray-700">{item.purpose}</div>
                        <div className="col-span-4 text-gray-600 break-all">{url}</div>
                        <div className="col-span-2 text-right text-gray-500">{item.expiresAt.toISOString()}</div>
                      </div>
                    );
                  })}
                  {links.length === 0 ? (
                    <div className="px-4 py-8 text-sm text-gray-500">No verification links stored yet.</div>
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
