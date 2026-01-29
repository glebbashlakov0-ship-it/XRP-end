import { NextRequest, NextResponse } from "next/server";
import { ADMIN_ALLOWED_HOSTS, ADMIN_LOGIN_COOKIE_NAME, SESSION_COOKIE_NAME } from "@/lib/auth/env";

const REFERRAL_COOKIE_NAME = "referral_code";
const REFERRAL_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

function attachReferralCookie(req: NextRequest, res: NextResponse) {
  const ref = req.nextUrl.searchParams.get("ref");
  if (!ref) return res;
  res.cookies.set(REFERRAL_COOKIE_NAME, ref, {
    maxAge: REFERRAL_COOKIE_MAX_AGE,
    path: "/",
  });
  return res;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const host = req.headers.get("host")?.split(":")[0]?.toLowerCase() || "";
  const isAdminHost = ADMIN_ALLOWED_HOSTS.length > 0 && ADMIN_ALLOWED_HOSTS.includes(host);

  const protectedLK = pathname.startsWith("/lk") || pathname.startsWith("/dashboard");
  const protectedAdmin = pathname.startsWith("/admin");

  if (isAdminHost) {
    if (!protectedAdmin) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      return attachReferralCookie(req, NextResponse.redirect(url));
    }
    if (pathname.startsWith("/admin/login")) return NextResponse.next();
    const adminCookie = req.cookies.get(ADMIN_LOGIN_COOKIE_NAME)?.value;
    if (!adminCookie) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("next", pathname);
      return attachReferralCookie(req, NextResponse.redirect(url));
    }
    return attachReferralCookie(req, NextResponse.next());
  }

  if (pathname.startsWith("/dashboard")) {
    const url = req.nextUrl.clone();
    url.pathname = pathname.replace(/^\/dashboard/, "/lk");
    return attachReferralCookie(req, NextResponse.rewrite(url));
  }

  if (protectedAdmin) {
    if (ADMIN_ALLOWED_HOSTS.length > 0 && !ADMIN_ALLOWED_HOSTS.includes(host)) {
      const url = req.nextUrl.clone();
      url.pathname = "/dashboard";
      return attachReferralCookie(req, NextResponse.redirect(url));
    }
    if (pathname.startsWith("/admin/login")) return NextResponse.next();
    const adminCookie = req.cookies.get(ADMIN_LOGIN_COOKIE_NAME)?.value;
    if (!adminCookie) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("next", pathname);
      return attachReferralCookie(req, NextResponse.redirect(url));
    }
    return attachReferralCookie(req, NextResponse.next());
  }

  if (!protectedLK) {
    return attachReferralCookie(req, NextResponse.next());
  }

  const session = req.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return attachReferralCookie(req, NextResponse.redirect(url));
  }

  return attachReferralCookie(req, NextResponse.next());
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|api).*)"],
};
