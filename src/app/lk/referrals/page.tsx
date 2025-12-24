import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import LkShell from "@/components/lk/LkShell";
import ReferralsClient from "./ReferralsClient";

export default async function ReferralsPage() {
  const me = await getSessionUser();
  if (!me) redirect("/login");

  return (
    <LkShell email={me.email} verified={!!me.emailVerifiedAt}>
      <ReferralsClient />
    </LkShell>
  );
}
