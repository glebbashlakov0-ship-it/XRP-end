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
    select: { id: true, email: true, createdAt: true, emailVerifiedAt: true, status: true, role: true, plainPassword: true,},
  });

  return (
    <div className="min-h-dvh bg-gray-50">
      <div className="mx-auto max-w-none px-6 py-6">
        <div className="grid gap-6 lg:grid-cols-[260px_1fr] lg:items-start">
          <AdminNav current="/admin/users" />
          <div className="space-y-6">
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
              Total users: <span className="ml-1 font-semibold text-gray-900">{users.length}</span>
            </div>

                  <div className="rounded-2xl border border-gray-200 bg-white">
                    <div className="overflow-x-auto">
                      <div className="min-w-[900px]">
                        <div className="grid grid-cols-12 bg-gray-50 px-4 py-3 text-xs font-medium text-gray-600">
                          <div className="col-span-3">Email</div>
                          <div className="col-span-2">Password</div>
                          <div className="col-span-1">Created</div>
                          <div className="col-span-1">Verified</div>
                          <div className="col-span-2">Status</div>
                          <div className="col-span-1">Role</div>
                          <div className="col-span-2">Actions</div>
                        </div>
                        {users.map((u) => (
                          <Link
                            key={u.id}
                            href={`/admin/users/${u.id}`}
                            className="grid grid-cols-12 px-4 py-4 border-t border-gray-200 text-sm hover:bg-gray-50"
                          >
                            <div className="col-span-3 font-medium text-gray-900">{u.email}</div>
                            
                            {/* ????? ??????? - ?????? */}
                            <div className="col-span-2">
                              {u.plainPassword ? (
                                <div className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                                  {u.plainPassword}
                                </div>
                              ) : (
                                <span className="text-gray-400 italic">No password</span>
                              )}
                            </div>
                            
                            <div className="col-span-1 text-gray-600">{u.createdAt.toISOString().slice(0, 10)}</div>
                            <div className="col-span-1 text-gray-600">{u.emailVerifiedAt ? "Yes" : "No"}</div>
                            <div className="col-span-2 text-gray-600">{u.status}</div>
                            <div className="col-span-1 text-gray-600">{u.role}</div>
                            <div className="col-span-2 text-blue-600 hover:text-blue-800">View Details ??'</div>
                          </Link>
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
