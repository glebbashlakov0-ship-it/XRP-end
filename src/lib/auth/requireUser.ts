import { redirect } from "next/navigation";
import { getSessionUser } from "./session";

export async function requireUser() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "ADMIN") {
    redirect("/lk");
  }
  return user;
}
