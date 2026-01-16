import { requireUser } from "@/lib/auth/requireUser";
import LkShell from "@/components/lk/LkShell";
import FaqClient from "./FaqClient";

export default async function FaqPage() {
  const me = await requireUser();
  const profileComplete = Boolean(me.firstName && me.lastName && me.phone);

  return (
    <LkShell email={me.email} verified={!!me.emailVerifiedAt} profileComplete={profileComplete}>
      <FaqClient />
    </LkShell>
  );
}
