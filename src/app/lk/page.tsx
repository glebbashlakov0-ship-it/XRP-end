import { prisma } from "@/lib/prisma";
import { auditLog } from "@/lib/auth/audit";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import LkClient from "./LkClient";
import LkShell from "@/components/lk/LkShell";
import { getSessionUser } from "@/lib/auth/session";

export default async function LKPage() {
  const me = await getSessionUser();

  if (!me) {
    redirect("/login");
  }

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || null;
  const ua = h.get("user-agent") || null;

  await auditLog({ userId: me.id, event: "LK_OPEN", ip, userAgent: ua, metadata: {} });

  const balance = await prisma.userBalance.findUnique({
    where: { userId: me.id },
  });

  return (
    <LkShell email={me.email} verified={!!me.emailVerifiedAt}>
      <LkClient
        balance={{
          totalXrp: balance?.totalXrp ?? 0,
          totalUsd: balance?.totalUsd ?? 0,
          activeStakesXrp: balance?.activeStakesXrp ?? 0,
          rewardsXrp: balance?.rewardsXrp ?? 0,
        }}
      />
    </LkShell>
  );
}
