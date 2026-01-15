import { NextResponse } from "next/server";
import { getSessionUser } from "./session";
import { requireAdminApi } from "./adminAuth";

export async function requireApiUser() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!user.emailVerifiedAt) {
    return NextResponse.json({ error: "Email not verified" }, { status: 403 });
  }
  return user;
}

export async function requireApiAdmin() {
  return await requireAdminApi();
}
