import { requireUser } from "@/lib/auth/requireUser";
import LkShell from "@/components/lk/LkShell";
import ProfileClient from "./ProfileClient";

export default async function ProfilePage() {
  const me = await requireUser();

  const firstName = me.firstName || "";
  const lastName = me.lastName || "";
  const phone = me.phone || "";
  const profileComplete = Boolean(firstName && lastName && phone);

  return (
    <LkShell email={me.email} verified={!!me.emailVerifiedAt} profileComplete={profileComplete}>
      <ProfileClient
        email={me.email}
        createdAt={me.createdAt.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
        firstName={firstName}
        lastName={lastName}
        phone={phone}
      />
    </LkShell>
  );
}
