import { NextResponse } from "next/server";

import { REFRESH_COOKIE_NAME } from "@/lib/auth-constants";

const REFRESH_MAX_AGE = 60 * 60 * 24 * 7;

export function applyRefreshCookie(response: NextResponse, refresh: string): NextResponse {
  response.cookies.set(REFRESH_COOKIE_NAME, refresh, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: REFRESH_MAX_AGE,
  });
  return response;
}
