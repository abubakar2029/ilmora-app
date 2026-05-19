import { type NextRequest, NextResponse } from "next/server";

import { REFRESH_COOKIE_NAME } from "@/lib/auth-constants";
import { getBackendBaseUrl } from "@/lib/server/backend-url";

export async function POST(request: NextRequest) {
  const refresh = request.cookies.get(REFRESH_COOKIE_NAME)?.value;

  if (refresh) {
    const backend = getBackendBaseUrl();
    await fetch(`${backend}/api/auth/logout/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    }).catch(() => {});
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.delete(REFRESH_COOKIE_NAME);
  return response;
}
