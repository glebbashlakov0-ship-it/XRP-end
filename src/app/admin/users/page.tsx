export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { sha256 } from "@/lib/auth/crypto";
import { SESSION_COOKIE_NAME } from "@/lib/auth/env";
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

  return session.user;
}

export default async function AdminUsersPage() {
  await requireAdmin();

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, email: true, createdAt: true, emailVerifiedAt: true, status: true, role: true },
  });

  return (
    <div className="min-h-dvh bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col items-start gap-3">
          <div>
            <div className="text-sm text-gray-500">Admin</div>
            <h1 className="text-2xl font-semibold text-gray-900">User Directory</h1>
            <p className="mt-1 text-sm text-gray-600">
              Access is restricted to admin accounts only. No public links are exposed.
            </p>
          </div>
        </div>

        <AdminNav current="/admin/users" />

        <div className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm text-gray-600 inline-flex">
          Total users: <span className="ml-1 font-semibold text-gray-900">{users.length}</span>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
          <div className="grid grid-cols-12 bg-gray-50 px-4 py-3 text-xs font-medium text-gray-600">
            <div className="col-span-4">Email</div>
            <div className="col-span-2">Created</div>
            <div className="col-span-2">Verified</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Role</div>
          </div>
          {users.map((u) => (
            <Link
              key={u.id}
              href={`/admin/users/${u.id}`}
              className="grid grid-cols-12 px-4 py-4 border-t border-gray-200 text-sm hover:bg-gray-50"
            >
              <div className="col-span-4 font-medium text-gray-900">{u.email}</div>
              <div className="col-span-2 text-gray-600">{u.createdAt.toISOString().slice(0, 10)}</div>
              <div className="col-span-2 text-gray-600">{u.emailVerifiedAt ? "Yes" : "No"}</div>
              <div className="col-span-2 text-gray-600">{u.status}</div>
              <div className="col-span-2 text-gray-600">{u.role}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
