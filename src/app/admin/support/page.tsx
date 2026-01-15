export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth/adminAuth";
import AdminNav from "@/components/admin/AdminNav";
import SupportMessageRow from "./SupportMessageRow";

async function requireAdmin() {
  await requireAdminSession();
}

export default async function AdminSupportPage() {
  await requireAdmin();

  const messages = await prisma.supportMessage.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { id: true, email: true } } },
    take: 200,
  });
  const supportMessages = messages.map((m) => ({
    id: m.id,
    userId: m.userId,
    userEmail: m.user.email,
    subject: m.subject,
    message: m.message,
    createdAt: m.createdAt.toISOString(),
    repliedAt: m.repliedAt ? m.repliedAt.toISOString() : null,
  }));

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
                    <div className="col-span-3">Message</div>
                    <div className="col-span-1 text-center">Status</div>
                    <div className="col-span-1 text-right">Time</div>
                    <div className="col-span-1 text-right">Action</div>
                  </div>
                  {supportMessages.map((m) => (
                    <SupportMessageRow key={m.id} {...m} />
                  ))}
                  {supportMessages.length === 0 ? (
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
