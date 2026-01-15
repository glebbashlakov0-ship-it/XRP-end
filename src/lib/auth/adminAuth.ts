import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { sha256 } from "@/lib/auth/crypto";
import {
  ADMIN_LOGIN_COOKIE_NAME,
  ADMIN_LOGIN_PASSWORD,
  ADMIN_LOGIN_TTL_DAYS,
  ADMIN_LOGIN_USERNAME,
} from "@/lib/auth/env";

type AdminAuthInfo = { username: string };

function getExpectedToken() {
  if (!ADMIN_LOGIN_USERNAME || !ADMIN_LOGIN_PASSWORD) return "";
  return sha256(`${ADMIN_LOGIN_USERNAME}:${ADMIN_LOGIN_PASSWORD}`);
}

function isValidToken(token: string | undefined) {
  const expected = getExpectedToken();
  return Boolean(expected) && Boolean(token) && token === expected;
}

function getCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ADMIN_LOGIN_TTL_DAYS * 24 * 60 * 60,
  };
}

export function verifyAdminCredentials(username: string, password: string) {
  return username === ADMIN_LOGIN_USERNAME && password === ADMIN_LOGIN_PASSWORD;
}

export function setAdminAuthCookie(res: NextResponse) {
  const token = getExpectedToken();
  if (!token) return;
  res.cookies.set(ADMIN_LOGIN_COOKIE_NAME, token, getCookieOptions());
}

export function clearAdminAuthCookie(res: NextResponse) {
  res.cookies.set(ADMIN_LOGIN_COOKIE_NAME, "", {
    ...getCookieOptions(),
    maxAge: 0,
  });
}

export async function requireAdminSession(): Promise<AdminAuthInfo> {
  const store = await cookies();
  const token = store.get(ADMIN_LOGIN_COOKIE_NAME)?.value;
  if (!isValidToken(token)) {
    redirect("/admin/login");
  }
  return { username: ADMIN_LOGIN_USERNAME || "admin" };
}

export async function requireAdminApi() {
  const store = await cookies();
  const token = store.get(ADMIN_LOGIN_COOKIE_NAME)?.value;
  if (!isValidToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return { username: ADMIN_LOGIN_USERNAME || "admin" };
}
