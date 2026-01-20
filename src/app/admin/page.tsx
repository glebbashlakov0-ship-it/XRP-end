import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/auth/adminAuth";

export default async function AdminIndexPage() {
  await requireAdminSession();
  redirect("/admin/users");
}
