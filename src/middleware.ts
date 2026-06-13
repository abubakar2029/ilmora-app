import { type NextRequest, NextResponse } from "next/server";

import { decodeJwtPayload, isJwtExpired } from "@/lib/jwt-decode";

import { REFRESH_COOKIE_NAME } from "@/lib/auth-constants";

function hasValidRefreshSession(request: NextRequest): boolean {
  const token = request.cookies.get(REFRESH_COOKIE_NAME)?.value;
  if (!token) return false;
  const payload = decodeJwtPayload<{ exp?: unknown }>(token);
  if (!payload) return false;
  return !isJwtExpired(payload);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authed = hasValidRefreshSession(request);

  if (pathname === "/") {
    return NextResponse.redirect(new URL(authed ? "/journey" : "/about", request.url));
  }

  const isProtected =
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/") ||
    pathname === "/journey" ||
    pathname.startsWith("/journey/") ||
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname === "/onboarding/role";

  if (!isProtected) {
    return NextResponse.next();
  }

  if (!authed) {
    return NextResponse.redirect(new URL("/about", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/dashboard",
    "/dashboard/:path*",
    "/journey",
    "/journey/:path*",
    "/admin",
    "/admin/:path*",
    "/onboarding/role",
  ],
};
