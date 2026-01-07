import { requireUser } from "@/lib/auth/requireUser";
import LkShell from "@/components/lk/LkShell";
import DepositClient from "./DepositClient";

export default async function DepositPage() {
  const me = await requireUser();

  return (
    <LkShell email={me.email} verified={!!me.emailVerifiedAt}>
      <DepositClient />
    </LkShell>
  );
}
