export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import Container from "@/components/ui/Container";
import Divider from "@/components/ui/Divider";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  DEFAULT_PRIVACY_BODY,
  DEFAULT_PRIVACY_INTRO,
  PRIVACY_BODY_KEY,
  PRIVACY_INTRO_KEY,
} from "@/lib/siteContent";

export default async function PrivacyPage() {
  const items = await prisma.siteContent.findMany({
    where: { key: { in: [PRIVACY_INTRO_KEY, PRIVACY_BODY_KEY] } },
  });
  const content = new Map(items.map((item) => [item.key, item.value]));
  const intro = content.get(PRIVACY_INTRO_KEY) ?? DEFAULT_PRIVACY_INTRO;
  const body = content.get(PRIVACY_BODY_KEY) ?? DEFAULT_PRIVACY_BODY;

  return (
    <div className="min-h-dvh bg-white">
      <div className="border-b border-gray-200">
        <Container className="py-5 flex items-center justify-between">
          <div className="font-semibold tracking-tight">XRP Restaking</div>
          <Link className="text-sm text-gray-600 hover:text-gray-900" href="/">
            Back to landing
          </Link>
        </Container>
      </div>

      <Container className="py-12">
        <div className="max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Privacy Policy</h1>
          <p className="mt-3 text-gray-600 leading-relaxed">{intro}</p>

          <Divider className="my-8" />

          <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">{body}</div>
        </div>
      </Container>
    </div>
  );
}
