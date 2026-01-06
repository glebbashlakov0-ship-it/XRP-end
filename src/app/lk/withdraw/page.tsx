import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth/session";
import LkShell from "@/components/lk/LkShell";
import WithdrawClient from "./WithdrawClient";

export default async function WithdrawPage() {
  const me = await getSessionUser();
  if (!me) redirect("/login");

  const balance = await prisma.userBalance.findUnique({ where: { userId: me.id } });
  const availableXrp = balance?.totalXrp ?? 0;

  return (
    <LkShell email={me.email} verified={!!me.emailVerifiedAt}>
      <WithdrawClient availableXrp={availableXrp} />
    </LkShell>
  );
}
