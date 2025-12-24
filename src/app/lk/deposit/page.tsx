import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import LkShell from "@/components/lk/LkShell";
import DepositClient from "./DepositClient";

export default async function DepositPage() {
  const me = await getSessionUser();
  if (!me) redirect("/login");

  return (
    <LkShell email={me.email} verified={!!me.emailVerifiedAt}>
      <DepositClient />
    </LkShell>
  );
}
