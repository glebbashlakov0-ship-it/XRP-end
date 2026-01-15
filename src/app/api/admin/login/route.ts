import { NextResponse } from "next/server";
import { z } from "zod";
import { setAdminAuthCookie, verifyAdminCredentials } from "@/lib/auth/adminAuth";

const BodySchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const username = parsed.data.username.trim();
  const password = parsed.data.password;
  if (!process.env.ADMIN_LOGIN_USERNAME || !process.env.ADMIN_LOGIN_PASSWORD) {
    return NextResponse.json({ error: "Admin login is not configured" }, { status: 500 });
  }
  if (!verifyAdminCredentials(username, password)) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  setAdminAuthCookie(res);
  return res;
}

export const runtime = "nodejs";
