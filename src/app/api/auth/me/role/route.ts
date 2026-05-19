import { NextResponse } from "next/server";

import { applyRefreshCookie } from "@/lib/server/auth-cookies";
import { getAccessTokenFromRequest } from "@/lib/server/auth-request";
import { getBackendBaseUrl } from "@/lib/server/backend-url";

export async function PATCH(request: Request) {
  const access = getAccessTokenFromRequest(request);
  if (!access) {
    return NextResponse.json({ detail: "Authentication required" }, { status: 401 });
  }

  let body: { role?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ detail: "Invalid JSON body" }, { status: 400 });
  }

  const backend = getBackendBaseUrl();
  const res = await fetch(`${backend}/api/auth/me/role/`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${access}`,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return NextResponse.json(data, { status: res.status });
  }

  const newAccess = typeof (data as { access?: unknown }).access === "string" ? (data as { access: string }).access : "";
  const refresh =
    typeof (data as { refresh?: unknown }).refresh === "string" ? (data as { refresh: string }).refresh : "";

  const response = NextResponse.json({
    access: newAccess,
    user: (data as { user?: unknown }).user,
  });
  if (refresh) {
    applyRefreshCookie(response, refresh);
  }
  return response;
}
