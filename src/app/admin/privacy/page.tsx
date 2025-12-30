export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { sha256 } from "@/lib/auth/crypto";
import { SESSION_COOKIE_NAME } from "@/lib/auth/env";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import AdminNav from "@/components/admin/AdminNav";
import {
  DEFAULT_PRIVACY_BODY,
  DEFAULT_PRIVACY_INTRO,
  PRIVACY_BODY_KEY,
  PRIVACY_INTRO_KEY,
} from "@/lib/siteContent";

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

export default async function AdminPrivacyPage() {
  await requireAdmin();

  const items = await prisma.siteContent.findMany({
    where: { key: { in: [PRIVACY_INTRO_KEY, PRIVACY_BODY_KEY] } },
  });
  const content = new Map(items.map((item) => [item.key, item.value]));
  const intro = content.get(PRIVACY_INTRO_KEY) ?? DEFAULT_PRIVACY_INTRO;
  const body = content.get(PRIVACY_BODY_KEY) ?? DEFAULT_PRIVACY_BODY;

  return (
    <div className="min-h-dvh bg-gray-50">
      <div className="mx-auto max-w-none px-6 py-6">
        <div className="grid gap-6 lg:grid-cols-[260px_1fr] lg:items-start">
          <AdminNav current="/admin/privacy" />
          <div className="space-y-6">
            <div>
              <div className="text-sm text-gray-500">Admin</div>
              <h1 className="text-2xl font-semibold text-gray-900">Edit Privacy Policy</h1>
              <p className="mt-1 text-sm text-gray-600">
                Update the Privacy Policy content shown on the public site.
              </p>
            </div>

            <form
              className="rounded-2xl border border-gray-200 bg-white p-6 space-y-5"
              action={async (formData) => {
                "use server";
                await requireAdmin();
                const nextIntro = String(formData.get("intro") ?? "").trim();
                const nextBody = String(formData.get("body") ?? "").trim();

                await prisma.siteContent.upsert({
                  where: { key: PRIVACY_INTRO_KEY },
                  update: { value: nextIntro },
                  create: { key: PRIVACY_INTRO_KEY, value: nextIntro },
                });

                await prisma.siteContent.upsert({
                  where: { key: PRIVACY_BODY_KEY },
                  update: { value: nextBody },
                  create: { key: PRIVACY_BODY_KEY, value: nextBody },
                });

                revalidatePath("/privacy");
                revalidatePath("/admin/privacy");
              }}
            >
              <label className="grid gap-2 text-sm">
                <span className="font-medium text-gray-700">Intro text</span>
                <textarea
                  name="intro"
                  defaultValue={intro}
                  className="min-h-[120px] rounded-xl border border-gray-200 px-3 py-2"
                />
              </label>

              <label className="grid gap-2 text-sm">
                <span className="font-medium text-gray-700">Privacy body</span>
                <textarea
                  name="body"
                  defaultValue={body}
                  className="min-h-[320px] rounded-xl border border-gray-200 px-3 py-2"
                />
              </label>

              <div>
                <button className="h-11 px-5 rounded-full bg-gray-900 text-white" type="submit">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
