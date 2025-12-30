export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { sha256 } from "@/lib/auth/crypto";
import { SESSION_COOKIE_NAME } from "@/lib/auth/env";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
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

function toNumber(value: FormDataEntryValue | null) {
  const num = Number(value ?? 0);
  return Number.isFinite(num) ? num : 0;
}

function toNonNegativeNumber(value: FormDataEntryValue | null) {
  const num = toNumber(value);
  return num < 0 ? 0 : num;
}

export default async function AdminUserPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      avatar: true,
      passwordHash: true,
      createdAt: true,
      updatedAt: true,
      emailVerifiedAt: true,
      lastVerificationEmailSentAt: true,
      role: true,
      status: true,
    },
  });

  if (!user) redirect("/admin/users");

  const balance = await prisma.userBalance.findUnique({
    where: { userId: user.id },
  });

  const logs = await prisma.auditLog.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const isBlocked = user.status === "BLOCKED";
  const userId = user.id;
  const userPath = `/admin/users/${id}`;
  const nextStatus = isBlocked ? "ACTIVE" : "BLOCKED";

  return (
    <div className="min-h-dvh bg-gray-50">
      <div className="mx-auto max-w-none px-6 py-6">
        <div className="grid gap-6 lg:grid-cols-[260px_1fr] lg:items-start">
          <AdminNav current="/admin/users" />
          <div className="space-y-6">
            <div className="flex flex-col items-start gap-3">
              <div>
                <Link className="text-sm text-gray-600 underline" href="/admin/users">Back to users</Link>
                <h1 className="mt-2 text-2xl font-semibold text-gray-900">User details</h1>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <div className="flex flex-col items-start gap-4">
            <div>
              <h2 className="text-lg font-semibold">Account details</h2>
              <p className="mt-1 text-sm text-gray-500">Registration data and security status for this user.</p>
            </div>
            <form
              action={async () => {
                "use server";
                await requireAdmin();
                await prisma.user.update({
                  where: { id: userId },
                  data: { status: nextStatus },
                });
                revalidatePath(userPath);
              }}
            >
              <button
                className={`h-10 px-4 rounded-full text-sm font-semibold ${
                  isBlocked ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
                }`}
                type="submit"
              >
                {isBlocked ? "Unblock user" : "Block user"}
              </button>
            </form>
          </div>

          <div className="mt-4 grid gap-3 text-sm text-gray-700">
            <div><span className="font-medium text-gray-700">User ID:</span> {user.id}</div>
            <div><span className="font-medium text-gray-700">Login (email):</span> {user.email}</div>
            <div className="grid gap-1">
              <span className="font-medium text-gray-700">Password (hash):</span>
              <span className="font-mono text-xs text-gray-600 break-all">{user.passwordHash}</span>
            </div>
            <div><span className="font-medium text-gray-700">Name:</span> {user.name || "-"}</div>
            <div><span className="font-medium text-gray-700">Avatar:</span> {user.avatar || "-"}</div>
            <div><span className="font-medium text-gray-700">Created:</span> {user.createdAt.toISOString()}</div>
            <div><span className="font-medium text-gray-700">Updated:</span> {user.updatedAt.toISOString()}</div>
            <div>
              <span className="font-medium text-gray-700">Email verified:</span>{" "}
              {user.emailVerifiedAt ? user.emailVerifiedAt.toISOString() : "No"}
            </div>
            <div>
              <span className="font-medium text-gray-700">Verification email sent:</span>{" "}
              {user.lastVerificationEmailSentAt ? user.lastVerificationEmailSentAt.toISOString() : "Never"}
            </div>
            <div><span className="font-medium text-gray-700">Status:</span> {user.status}</div>
            <div><span className="font-medium text-gray-700">Role:</span> {user.role}</div>
          </div>

          <form
            className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto]"
            action={async (formData) => {
              "use server";
              await requireAdmin();
              const nextRole = formData.get("role");
              if (nextRole !== "USER" && nextRole !== "ADMIN") return;
              await prisma.user.update({
                where: { id: userId },
                data: { role: nextRole },
              });
              revalidatePath(userPath);
            }}
          >
            <label className="grid gap-2 text-sm">
              <span className="font-medium text-gray-700">Change role</span>
              <select
                name="role"
                defaultValue={user.role}
                className="h-11 rounded-xl border border-gray-200 px-3 bg-white"
              >
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
              </select>
            </label>
            <div className="sm:self-end">
              <button className="h-11 px-5 rounded-full bg-gray-900 text-white" type="submit">
                Save
              </button>
            </div>
          </form>
        </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold">Top up balance</h2>
          <p className="mt-1 text-sm text-gray-500">
            Add amounts to the user&apos;s total balances.
          </p>

          <form
            className="mt-4 grid gap-4 sm:grid-cols-2"
            action={async (formData) => {
              "use server";
              await requireAdmin();
              const addXrp = toNonNegativeNumber(formData.get("addXrp"));
              const addUsd = toNonNegativeNumber(formData.get("addUsd"));

              const current = await prisma.userBalance.findUnique({
                where: { userId },
              });

              const totalXrp = (current?.totalXrp ?? 0) + addXrp;
              const totalUsd = (current?.totalUsd ?? 0) + addUsd;

              await prisma.userBalance.upsert({
                where: { userId },
                update: { totalXrp, totalUsd },
                create: {
                  userId,
                  totalXrp,
                  totalUsd,
                  activeStakesXrp: 0,
                  rewardsXrp: 0,
                },
              });

              await prisma.portfolioSnapshot.create({
                data: { userId, totalXrp, totalUsd },
              });

              revalidatePath(userPath);
            }}
          >
            <label className="grid gap-2 text-sm">
              <span className="font-medium text-gray-700">Add to total XRP</span>
              <input
                name="addXrp"
                className="h-11 rounded-xl border border-gray-200 px-3"
                type="number"
                step="0.0001"
                min="0"
              />
            </label>
            <label className="grid gap-2 text-sm">
              <span className="font-medium text-gray-700">Add to total USD</span>
              <input
                name="addUsd"
                className="h-11 rounded-xl border border-gray-200 px-3"
                type="number"
                step="0.01"
                min="0"
              />
            </label>

            <div className="sm:col-span-2">
              <button className="h-11 px-5 rounded-full bg-gray-900 text-white" type="submit">
                Top up balance
              </button>
            </div>
          </form>
        </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold">Portfolio settings</h2>
          <p className="mt-1 text-sm text-gray-500">
            Update user balances to refresh the dashboard and create a new chart snapshot.
          </p>

          <form
            className="mt-4 grid gap-4 sm:grid-cols-2"
            action={async (formData) => {
              "use server";
              await requireAdmin();
              const totalXrp = toNumber(formData.get("totalXrp"));
              const totalUsd = toNumber(formData.get("totalUsd"));
              const activeStakesXrp = toNumber(formData.get("activeStakesXrp"));
              const rewardsXrp = toNumber(formData.get("rewardsXrp"));

              await prisma.userBalance.upsert({
                where: { userId },
                update: { totalXrp, totalUsd, activeStakesXrp, rewardsXrp },
                create: { userId, totalXrp, totalUsd, activeStakesXrp, rewardsXrp },
              });

              await prisma.portfolioSnapshot.create({
                data: { userId, totalXrp, totalUsd },
              });

              revalidatePath(userPath);
            }}
          >
            <label className="grid gap-2 text-sm">
              <span className="font-medium text-gray-700">Total balance (XRP)</span>
              <input
                name="totalXrp"
                defaultValue={balance?.totalXrp ?? 0}
                className="h-11 rounded-xl border border-gray-200 px-3"
                type="number"
                step="0.0001"
                min="0"
              />
            </label>
            <label className="grid gap-2 text-sm">
              <span className="font-medium text-gray-700">Total balance (USD)</span>
              <input
                name="totalUsd"
                defaultValue={balance?.totalUsd ?? 0}
                className="h-11 rounded-xl border border-gray-200 px-3"
                type="number"
                step="0.01"
                min="0"
              />
            </label>
            <label className="grid gap-2 text-sm">
              <span className="font-medium text-gray-700">Active stakes (XRP)</span>
              <input
                name="activeStakesXrp"
                defaultValue={balance?.activeStakesXrp ?? 0}
                className="h-11 rounded-xl border border-gray-200 px-3"
                type="number"
                step="0.0001"
                min="0"
              />
            </label>
            <label className="grid gap-2 text-sm">
              <span className="font-medium text-gray-700">Rewards (XRP)</span>
              <input
                name="rewardsXrp"
                defaultValue={balance?.rewardsXrp ?? 0}
                className="h-11 rounded-xl border border-gray-200 px-3"
                type="number"
                step="0.0001"
                min="0"
              />
            </label>

            <div className="sm:col-span-2">
              <button className="h-11 px-5 rounded-full bg-gray-900 text-white" type="submit">
                Save portfolio values
              </button>
            </div>
          </form>
        </div>

            <div className="rounded-2xl border border-gray-200 bg-white">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Audit logs</h2>
          </div>
          <div className="grid grid-cols-12 bg-gray-50 px-6 py-3 text-xs font-medium text-gray-600">
            <div className="col-span-3">Event</div>
            <div className="col-span-3">Time</div>
            <div className="col-span-3">IP</div>
            <div className="col-span-3">User-Agent</div>
          </div>
          {logs.map((l) => (
            <div key={l.id} className="grid grid-cols-12 px-6 py-4 border-t border-gray-200 text-xs">
              <div className="col-span-3 font-medium">{l.event}</div>
              <div className="col-span-3 text-gray-700">{l.createdAt.toISOString()}</div>
              <div className="col-span-3 text-gray-700">{l.ip || "-"}</div>
              <div className="col-span-3 text-gray-700 truncate">{l.userAgent || "-"}</div>
            </div>
          ))}
        </div>
          </div>
        </div>
      </div>
    </div>
  );
}
