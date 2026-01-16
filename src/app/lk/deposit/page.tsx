import { requireUser } from "@/lib/auth/requireUser";
import LkShell from "@/components/lk/LkShell";
import DepositClient from "./DepositClient";

export default async function DepositPage() {
  const me = await requireUser();
  const profileComplete = Boolean(me.firstName && me.lastName && me.phone);

  return (
    <LkShell email={me.email} verified={!!me.emailVerifiedAt} profileComplete={profileComplete}>
      <DepositClient />
    </LkShell>
  );
}
