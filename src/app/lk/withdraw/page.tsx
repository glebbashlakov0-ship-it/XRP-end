import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/requireUser";
import { applyDailyYieldIfNeeded } from "@/lib/balance";
import LkShell from "@/components/lk/LkShell";
import WithdrawClient from "./WithdrawClient";

export default async function WithdrawPage() {
  const me = await requireUser();

  const balance =
    (await applyDailyYieldIfNeeded(me.id)) ??
    (await prisma.userBalance.findUnique({ where: { userId: me.id } }));
  const availableXrp = balance?.totalXrp ?? 0;

  return (
    <LkShell email={me.email} verified={!!me.emailVerifiedAt}>
      <WithdrawClient availableXrp={availableXrp} />
    </LkShell>
  );
}
