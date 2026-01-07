import { requireUser } from "@/lib/auth/requireUser";
import LkShell from "@/components/lk/LkShell";
import ReferralsClient from "./ReferralsClient";

export default async function ReferralsPage() {
  const me = await requireUser();

  return (
    <LkShell email={me.email} verified={!!me.emailVerifiedAt}>
      <ReferralsClient />
    </LkShell>
  );
}
