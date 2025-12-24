import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/auth/env";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const protectedLK = pathname.startsWith("/lk");
  const protectedAdmin = pathname.startsWith("/admin");

  if (!protectedLK && !protectedAdmin) return NextResponse.next();

  const session = req.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // ADMIN role is checked on the /admin server page (avoid prisma in middleware).
  return NextResponse.next();
}

export const config = {
  matcher: ["/lk/:path*", "/admin/:path*"],
};
