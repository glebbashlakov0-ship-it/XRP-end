import { requireUser } from "@/lib/auth/requireUser";
import LkShell from "@/components/lk/LkShell";
import ProfileClient from "./ProfileClient";

export default async function ProfilePage() {
  const me = await requireUser();

  const nameParts = (me.name || "").split(" ").filter(Boolean);
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ");

  return (
    <LkShell email={me.email} verified={!!me.emailVerifiedAt}>
      <ProfileClient
        email={me.email}
        createdAt={me.createdAt.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
        firstName={firstName}
        lastName={lastName}
      />
    </LkShell>
  );
}
