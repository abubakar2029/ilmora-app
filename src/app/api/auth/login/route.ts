import { NextResponse } from "next/server";

import { applyRefreshCookie } from "@/lib/server/auth-cookies";
import { getBackendBaseUrl, isMisconfiguredBackendUrl } from "@/lib/server/backend-url";

export async function POST(request: Request) {
  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ detail: "Invalid JSON body" }, { status: 400 });
  }

  const backend = getBackendBaseUrl();
  if (isMisconfiguredBackendUrl(backend)) {
    return NextResponse.json(
      {
        detail:
          "Backend URL is not configured on Vercel. Set BACKEND_URL to https://web-production-0723e.up.railway.app and redeploy.",
      },
      { status: 503 },
    );
  }

  let res: Response;
  try {
    res = await fetch(`${backend}/api/auth/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: body.email,
        password: body.password,
      }),
    });
  } catch {
    return NextResponse.json(
      {
        detail: `Cannot reach backend at ${backend}. Check BACKEND_URL on Vercel and that Railway is online.`,
      },
      { status: 502 },
    );
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    return NextResponse.json(data, { status: res.status });
  }

  const access = typeof data.access === "string" ? data.access : "";
  const refresh = typeof data.refresh === "string" ? data.refresh : "";

  if (!access || !refresh) {
    return NextResponse.json({ detail: "Invalid token response from server" }, { status: 502 });
  }

  try {
    const response = NextResponse.json({ access });
    applyRefreshCookie(response, refresh);
    return response;
  } catch {
    return NextResponse.json({ detail: "Could not set session cookie" }, { status: 500 });
  }
}
