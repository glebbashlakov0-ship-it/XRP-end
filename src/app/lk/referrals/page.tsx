import { requireUser } from "@/lib/auth/requireUser";
import LkShell from "@/components/lk/LkShell";
import ReferralsClient from "./ReferralsClient";

export default async function ReferralsPage() {
  const me = await requireUser();
  const profileComplete = Boolean(me.firstName && me.lastName && me.phone);

  return (
    <LkShell email={me.email} verified={!!me.emailVerifiedAt} profileComplete={profileComplete}>
      <ReferralsClient />
    </LkShell>
  );
}
