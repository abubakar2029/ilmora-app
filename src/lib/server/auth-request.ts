import { cookies } from "next/headers";

import { REFRESH_COOKIE_NAME } from "@/lib/auth-constants";

/** Bearer token from Authorization header (client calls with access token). */
export function getAccessTokenFromRequest(request: Request): string | null {
  const auth = request.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) {
    return auth.slice(7).trim();
  }
  return null;
}

export async function getRefreshFromCookies(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(REFRESH_COOKIE_NAME)?.value ?? null;
}
