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
}

export default async function AdminSupportPage() {
  await requireAdmin();

  const messages = await prisma.supportMessage.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { id: true, email: true } } },
    take: 200,
  });

  return (
    <div className="min-h-dvh bg-gray-50">
      <div className="mx-auto max-w-none px-6 py-6">
        <div className="grid gap-6 min-w-0 lg:grid-cols-[260px_1fr] lg:items-start">
          <AdminNav current="/admin/support" />
          <div className="space-y-6 min-w-0">
            <div className="flex flex-col items-start gap-3">
              <div>
                <div className="text-sm text-gray-500">Admin</div>
                <h1 className="text-2xl font-semibold text-gray-900">Support Inbox</h1>
                <p className="mt-1 text-sm text-gray-600">
                  All user messages are stored here and tied to the account that submitted them.
                </p>
              </div>
            </div>

            <div className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm text-gray-600 inline-flex">
              Total messages: <span className="ml-1 font-semibold text-gray-900">{messages.length}</span>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white">
              <div className="overflow-x-auto">
                <div className="min-w-[720px]">
                  <div className="grid grid-cols-12 bg-gray-50 px-4 py-3 text-xs font-medium text-gray-600">
                    <div className="col-span-3">User</div>
                    <div className="col-span-3">Subject</div>
                    <div className="col-span-4">Message</div>
                    <div className="col-span-2 text-right">Time</div>
                  </div>
                  {messages.map((m) => (
                    <div key={m.id} className="grid grid-cols-12 px-4 py-4 border-t border-gray-200 text-sm">
                      <div className="col-span-3 font-medium text-gray-900">
                        <Link className="underline decoration-gray-200 hover:decoration-gray-400" href={`/admin/users/${m.userId}`}>
                          {m.user.email}
                        </Link>
                      </div>
                      <div className="col-span-3 text-gray-700">{m.subject}</div>
                      <div className="col-span-4 text-gray-600 truncate">{m.message}</div>
                      <div className="col-span-2 text-right text-gray-500">{m.createdAt.toISOString()}</div>
                    </div>
                  ))}
                  {messages.length === 0 ? (
                    <div className="px-4 py-8 text-sm text-gray-500">No support messages yet.</div>
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
