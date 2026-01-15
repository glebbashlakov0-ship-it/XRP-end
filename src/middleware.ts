import { NextRequest, NextResponse } from "next/server";
import { ADMIN_LOGIN_COOKIE_NAME, SESSION_COOKIE_NAME } from "@/lib/auth/env";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const protectedLK = pathname.startsWith("/lk");
  const protectedAdmin = pathname.startsWith("/admin");

  if (!protectedLK && !protectedAdmin) return NextResponse.next();

  if (protectedAdmin) {
    if (pathname.startsWith("/admin/login")) return NextResponse.next();
    const adminCookie = req.cookies.get(ADMIN_LOGIN_COOKIE_NAME)?.value;
    if (!adminCookie) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  const session = req.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/lk/:path*", "/admin/:path*"],
};
