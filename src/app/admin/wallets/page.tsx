export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/requireUser";
import AdminNav from "@/components/admin/AdminNav";
import { SUPPORTED_CURRENCIES, getWalletConfig } from "@/lib/wallets";
import { revalidatePath } from "next/cache";

export default async function AdminWalletsPage() {
  await requireAdmin();
  const wallets = await getWalletConfig();

  return (
    <div className="min-h-dvh bg-gray-50">
      <div className="mx-auto max-w-none px-6 py-6">
        <div className="grid gap-6 min-w-0 lg:grid-cols-[260px_1fr] lg:items-start">
          <AdminNav current="/admin/wallets" />
          <div className="space-y-6 min-w-0">
            <div>
              <div className="text-sm text-gray-500">Admin</div>
              <h1 className="text-2xl font-semibold text-gray-900">Wallets</h1>
              <p className="mt-1 text-sm text-gray-600">Manage deposit addresses and QR codes.</p>
            </div>

            <div className="grid gap-4">
              {wallets.map((wallet) => (
                <form
                  key={wallet.currency}
                  className="rounded-2xl border border-gray-200 bg-white p-5 space-y-3"
                  action={async (formData) => {
                    "use server";
                    await requireAdmin();
                    const address = String(formData.get("address") || "").trim();
                    const qrImage = String(formData.get("qrImage") || "").trim();
                    await prisma.walletConfig.upsert({
                      where: { currency: wallet.currency },
                      update: { address, qrImage },
                      create: { currency: wallet.currency, address, qrImage },
                    });
                    revalidatePath("/admin/wallets");
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold">{wallet.currency}</div>
                      <div className="text-xs text-gray-500">Update wallet address and QR.</div>
                    </div>
                    <div className="text-xs text-gray-500">Supported: {SUPPORTED_CURRENCIES.join(", ")}</div>
                  </div>
                  <label className="grid gap-2 text-sm">
                    <span className="font-medium text-gray-700">Address</span>
                    <input
                      name="address"
                      defaultValue={wallet.address}
                      className="h-11 rounded-xl border border-gray-200 px-3"
                      required
                    />
                  </label>
                  <label className="grid gap-2 text-sm">
                    <span className="font-medium text-gray-700">QR image path</span>
                    <input
                      name="qrImage"
                      defaultValue={wallet.qrImage}
                      className="h-11 rounded-xl border border-gray-200 px-3"
                      required
                    />
                  </label>
                  <button type="submit" className="h-10 rounded-xl bg-gray-900 px-4 text-sm font-semibold text-white">
                    Save changes
                  </button>
                </form>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
