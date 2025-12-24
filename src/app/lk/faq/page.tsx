import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import LkShell from "@/components/lk/LkShell";
import FaqClient from "./FaqClient";

export default async function FaqPage() {
  const me = await getSessionUser();
  if (!me) redirect("/login");

  return (
    <LkShell email={me.email} verified={!!me.emailVerifiedAt}>
      <FaqClient />
    </LkShell>
  );
}
