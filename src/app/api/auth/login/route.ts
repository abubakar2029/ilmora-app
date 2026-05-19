import { NextResponse } from "next/server";

import { getBackendBaseUrl } from "@/lib/server/backend-url";
import { applyRefreshCookie } from "@/lib/server/auth-cookies";

export async function POST(request: Request) {
  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ detail: "Invalid JSON body" }, { status: 400 });
  }

  const backend = getBackendBaseUrl();
  const res = await fetch(`${backend}/api/auth/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: body.email,
      password: body.password,
    }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    return NextResponse.json(data, { status: res.status });
  }

  const access = typeof data.access === "string" ? data.access : "";
  const refresh = typeof data.refresh === "string" ? data.refresh : "";

  if (!access || !refresh) {
    return NextResponse.json({ detail: "Invalid token response from server" }, { status: 502 });
  }

  const response = NextResponse.json({ access });
  applyRefreshCookie(response, refresh);
  return response;
}
