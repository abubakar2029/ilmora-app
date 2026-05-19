import { type NextRequest, NextResponse } from "next/server";

import { REFRESH_COOKIE_NAME } from "@/lib/auth-constants";
import { getBackendBaseUrl } from "@/lib/server/backend-url";

const REFRESH_MAX_AGE = 60 * 60 * 24 * 7;

export async function POST(request: NextRequest) {
  const refresh = request.cookies.get(REFRESH_COOKIE_NAME)?.value;
  if (!refresh) {
    return NextResponse.json({ detail: "No refresh token" }, { status: 401 });
  }

  const backend = getBackendBaseUrl();
  const res = await fetch(`${backend}/api/auth/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const response = NextResponse.json(data, { status: res.status });
    response.cookies.delete(REFRESH_COOKIE_NAME);
    return response;
  }

  const access = typeof data.access === "string" ? data.access : "";
  if (!access) {
    return NextResponse.json({ detail: "Invalid refresh response" }, { status: 502 });
  }

  const response = NextResponse.json({ access });
  if (typeof data.refresh === "string" && data.refresh) {
    response.cookies.set(REFRESH_COOKIE_NAME, data.refresh, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: REFRESH_MAX_AGE,
    });
  }
  return response;
}
