import { NextResponse } from "next/server";

import { getAccessTokenFromRequest } from "@/lib/server/auth-request";
import { getBackendBaseUrl } from "@/lib/server/backend-url";

export async function GET(request: Request) {
  const access = getAccessTokenFromRequest(request);
  if (!access) {
    return NextResponse.json({ detail: "Authentication required" }, { status: 401 });
  }

  const backend = getBackendBaseUrl();
  const res = await fetch(`${backend}/api/auth/me/`, {
    headers: { Authorization: `Bearer ${access}` },
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
