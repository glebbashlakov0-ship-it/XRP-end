export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { sha256 } from "@/lib/auth/crypto";
import { hashPassword } from "@/lib/auth/password";
import { ADMIN_EMAILS, SESSION_COOKIE_NAME } from "@/lib/auth/env";
import { redirect } from "next/navigation";
import AdminNav from "@/components/admin/AdminNav";
import Link from "next/link";

type AdminSearchParams = {
  error?: string;
  success?: string;
};

type PageProps = {
  searchParams?: Promise<AdminSearchParams>;
};

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

function getMessage(searchParams?: AdminSearchParams) {
  const error = searchParams?.error;
  const success = searchParams?.success;
  if (success === "added") return { tone: "success" as const, text: "Admin added." };
  if (error === "missing_email") return { tone: "error" as const, text: "Email is required." };
  if (error === "missing_password") return { tone: "error" as const, text: "Password is required." };
  if (error === "password_mismatch") return { tone: "error" as const, text: "Passwords do not match." };
  if (error === "not_found") return { tone: "error" as const, text: "User not found." };
  return null;
}

export default async function AdminAdminsPage({ searchParams }: PageProps) {
  await requireAdmin();

  const admins = await prisma.user.findMany({
    where: { role: "ADMIN" },
    orderBy: { createdAt: "desc" },
    select: { id: true, email: true, createdAt: true, status: true },
  });
  const resolvedSearchParams = await searchParams;
  const message = getMessage(resolvedSearchParams);

  return (
    <div className="min-h-dvh bg-gray-50">
      <div className="mx-auto max-w-none px-6 py-6">
        <div className="grid gap-6 min-w-0 lg:grid-cols-[260px_1fr] lg:items-start">
          <AdminNav current="/admin/admins" />
          <div className="space-y-6 min-w-0">
            <div className="flex flex-col items-start gap-3">
              <div>
                <div className="text-sm text-gray-500">Admin</div>
                <h1 className="text-2xl font-semibold text-gray-900">Admin Accounts</h1>
                <p className="mt-1 text-sm text-gray-600">
                  Manage admin access separately from public registrations.
                </p>
              </div>
            </div>

            {message ? (
              <div
                className={`rounded-xl border px-4 py-3 text-sm ${
                  message.tone === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-red-200 bg-red-50 text-red-700"
                }`}
              >
                {message.text}
              </div>
            ) : null}

            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <div className="text-sm font-semibold text-gray-900">Add admin by email</div>
              <form
                className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center"
                action={async (formData) => {
                  "use server";
                  await requireAdmin();
                  const email = String(formData.get("email") || "").trim().toLowerCase();
                  const password = String(formData.get("password") || "");
                  const confirmPassword = String(formData.get("confirmPassword") || "");
                  if (!email) redirect("/admin/admins?error=missing_email");
                  if (!password) redirect("/admin/admins?error=missing_password");
                  if (password !== confirmPassword) redirect("/admin/admins?error=password_mismatch");

                  const user = await prisma.user.findUnique({ where: { email } });
                  const passwordHash = await hashPassword(password);
                  const now = new Date();

                  if (!user) {
                    await prisma.user.create({
                      data: {
                        email,
                        passwordHash,
                        plainPassword: password,
                        role: "ADMIN",
                        emailVerifiedAt: now,
                      },
                    });
                  } else {
                    await prisma.user.update({
                      where: { id: user.id },
                      data: {
                        role: "ADMIN",
                        passwordHash,
                        plainPassword: password,
                        emailVerifiedAt: user.emailVerifiedAt ?? now,
                      },
                    });
                  }
                  redirect("/admin/admins?success=added");
                }}
              >
                <input
                  className="h-11 w-full rounded-lg border border-gray-200 px-3 text-sm sm:w-80"
                  type="email"
                  name="email"
                  placeholder="user@example.com"
                  required
                />
                <input
                  className="h-11 w-full rounded-lg border border-gray-200 px-3 text-sm sm:w-64"
                  type="password"
                  name="password"
                  placeholder="Password"
                  required
                />
                <input
                  className="h-11 w-full rounded-lg border border-gray-200 px-3 text-sm sm:w-64"
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm password"
                  required
                />
                <button
                  className="h-11 rounded-lg bg-gray-900 px-4 text-sm font-semibold text-white"
                  type="submit"
                >
                  Add admin
                </button>
              </form>
            </div>

            <div className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm text-gray-600 inline-flex">
              Admins: <span className="ml-1 font-semibold text-gray-900">{admins.length}</span>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white">
              <div className="overflow-x-auto">
                <div className="min-w-[720px]">
                  <div className="grid grid-cols-12 bg-gray-50 px-4 py-3 text-xs font-medium text-gray-600">
                    <div className="col-span-6">Email</div>
                    <div className="col-span-3">Created</div>
                    <div className="col-span-3">Status</div>
                  </div>
                  {admins.length === 0 ? (
                    <div className="px-4 py-8 text-sm text-gray-500">No admin users yet.</div>
                  ) : (
                    admins.map((u) => (
                      <div key={u.id} className="grid grid-cols-12 px-4 py-4 border-t border-gray-200 text-sm">
                        <div className="col-span-6 font-medium text-gray-900">
                          <Link className="underline decoration-gray-200 hover:decoration-gray-400" href={`/admin/users/${u.id}`}>
                            {u.email}
                          </Link>
                        </div>
                        <div className="col-span-3 text-gray-600">{u.createdAt.toISOString()}</div>
                        <div className="col-span-3 text-gray-600">{u.status}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {ADMIN_EMAILS.length > 0 ? (
              <div className="rounded-2xl border border-gray-200 bg-white p-6">
                <div className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">Reserved admin emails</div>
                <div className="mt-2 text-sm text-gray-700">{ADMIN_EMAILS.join(", ")}</div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
