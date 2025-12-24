import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import LkShell from "@/components/lk/LkShell";
import WithdrawClient from "./WithdrawClient";

export default async function WithdrawPage() {
  const me = await getSessionUser();
  if (!me) redirect("/login");

  return (
    <LkShell email={me.email} verified={!!me.emailVerifiedAt}>
      <WithdrawClient />
    </LkShell>
  );
}
