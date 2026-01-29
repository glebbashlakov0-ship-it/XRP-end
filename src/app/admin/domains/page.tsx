export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth/adminAuth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import AdminNav from "@/components/admin/AdminNav";
import ConfirmDeleteButton from "@/components/admin/ConfirmDeleteButton";

function normalizeHost(value: string) {
  return value.trim().toLowerCase();
}

export default async function AdminDomainsPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string; success?: string }>;
}) {
  await requireAdminSession();

  const domains = await prisma.domain.findMany({
    orderBy: { createdAt: "desc" },
  });

  const resolvedSearch = searchParams ? await searchParams : {};
  const error = resolvedSearch?.error;
  const success = resolvedSearch?.success;

  return (
    <div className="min-h-dvh bg-gray-50">
      <div className="mx-auto max-w-none px-6 py-6">
        <div className="grid gap-6 min-w-0 lg:grid-cols-[260px_1fr] lg:items-start">
          <AdminNav current="/admin/domains" />
          <div className="space-y-6 min-w-0">
            <div>
              <div className="text-sm text-gray-500">Admin</div>
              <h1 className="text-2xl font-semibold text-gray-900">Domains</h1>
              <p className="mt-1 text-sm text-gray-600">
                Add or remove domains used by the platform.
              </p>
            </div>

            {error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error === "missing_host"
                  ? "Enter a domain."
                  : error === "invalid_host"
                  ? "Enter a valid domain."
                  : error === "exists"
                  ? "Domain already exists."
                  : "Action failed."}
              </div>
            ) : null}
            {success ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {success === "created" ? "Domain added." : "Action completed."}
              </div>
            ) : null}

            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="text-sm font-semibold text-gray-900">Add domain</div>
              <form
                className="mt-3 flex flex-wrap items-center gap-3"
                action={async (formData) => {
                  "use server";
                  await requireAdminSession();
                  const raw = String(formData.get("host") || "");
                  const host = normalizeHost(raw);
                  if (!host) redirect("/admin/domains?error=missing_host");
                  if (!/^[a-z0-9.-]+$/.test(host)) {
                    redirect("/admin/domains?error=invalid_host");
                  }
                  const existing = await prisma.domain.findUnique({ where: { host } });
                  if (existing) redirect("/admin/domains?error=exists");
                  await prisma.domain.create({ data: { host } });
                  redirect("/admin/domains?success=created");
                }}
              >
                <input
                  name="host"
                  placeholder="example.com"
                  className="h-10 min-w-[240px] flex-1 rounded-lg border border-gray-200 bg-white px-3 text-sm"
                />
                <button className="h-10 px-4 rounded-lg bg-gray-900 text-white text-sm" type="submit">
                  Add domain
                </button>
              </form>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white">
              <div className="grid grid-cols-12 bg-gray-50 px-4 py-3 text-xs font-medium text-gray-600">
                <div className="col-span-7">Domain</div>
                <div className="col-span-3">Created</div>
                <div className="col-span-2 text-right">Actions</div>
              </div>
              {domains.length === 0 ? (
                <div className="px-4 py-8 text-sm text-gray-500">No domains yet.</div>
              ) : (
                domains.map((domain) => (
                  <div
                    key={domain.id}
                    className="grid grid-cols-12 items-center gap-3 px-4 py-4 border-t border-gray-200 text-sm"
                  >
                    <div className="col-span-7 font-medium text-gray-900 break-all">{domain.host}</div>
                    <div className="col-span-3 text-xs text-gray-500">
                      {domain.createdAt.toISOString().slice(0, 10)}
                    </div>
                    <div className="col-span-2 flex justify-end">
                      <ConfirmDeleteButton
                        className="h-7 px-2 rounded-md bg-red-600 text-white text-[11px]"
                        confirmText="Delete this domain?"
                        action={async () => {
                          "use server";
                          await requireAdminSession();
                          await prisma.domain.delete({ where: { id: domain.id } });
                          revalidatePath("/admin/domains");
                        }}
                      />
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
