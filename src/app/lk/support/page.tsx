import { requireUser } from "@/lib/auth/requireUser";
import LkShell from "@/components/lk/LkShell";
import SupportClient from "./SupportClient";

export default async function SupportPage() {
  const me = await requireUser();

  return (
    <LkShell email={me.email} verified={!!me.emailVerifiedAt}>
      <SupportClient />
    </LkShell>
  );
}
