import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getBackendBaseUrl } from "@/lib/server/backend-url";
import { applyRefreshCookie } from "@/lib/server/auth-cookies";

const OAUTH_STATE_COOKIE = "oauth_state";
const OAUTH_ROLE_COOKIE = "oauth_role";
const OAUTH_FROM_COOKIE = "oauth_from";

export function getAppOrigin(request: Request): string {
  const fromEnv = process.env.NEXTAUTH_URL?.trim() || process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  const url = new URL(request.url);
  return url.origin;
}

export function oauthCallbackUrl(request: Request, provider: "google" | "github"): string {
  return `${getAppOrigin(request)}/api/auth/oauth/${provider}/callback`;
}

export async function setOAuthState(provider: string, role: string, from?: string): Promise<string> {
  const state = crypto.randomUUID();
  const jar = await cookies();
  jar.set(OAUTH_STATE_COOKIE, `${provider}:${state}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });
  jar.set(OAUTH_ROLE_COOKIE, role, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });
  if (from && from.startsWith("/")) {
    jar.set(OAUTH_FROM_COOKIE, from, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 600,
    });
  }
  return state;
}

export async function consumeOAuthFrom(): Promise<string> {
  const jar = await cookies();
  const from = jar.get(OAUTH_FROM_COOKIE)?.value;
  jar.delete(OAUTH_FROM_COOKIE);
  return from && from.startsWith("/") ? from : "/journey";
}

export async function consumeOAuthState(
  provider: string,
  state: string | null,
): Promise<{ ok: boolean; role: string }> {
  const jar = await cookies();
  const expected = jar.get(OAUTH_STATE_COOKIE)?.value;
  const role = jar.get(OAUTH_ROLE_COOKIE)?.value || "student";
  jar.delete(OAUTH_STATE_COOKIE);
  jar.delete(OAUTH_ROLE_COOKIE);

  if (!state || !expected || expected !== `${provider}:${state}`) {
    return { ok: false, role };
  }
  return { ok: true, role };
}

export async function exchangeWithBackend(
  provider: "google" | "github",
  token: string,
  role: string,
): Promise<{ access: string; refresh: string } | { error: string; status: number }> {
  const backend = getBackendBaseUrl();
  const res = await fetch(`${backend}/api/auth/oauth/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ provider, token, role }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail =
      typeof (data as { detail?: unknown }).detail === "string"
        ? (data as { detail: string }).detail
        : "OAuth sign-in failed";
    return { error: detail, status: res.status };
  }
  const access = typeof (data as { access?: unknown }).access === "string" ? (data as { access: string }).access : "";
  const refresh =
    typeof (data as { refresh?: unknown }).refresh === "string" ? (data as { refresh: string }).refresh : "";
  if (!access || !refresh) {
    return { error: "Invalid token response from server", status: 502 };
  }
  return { access, refresh };
}

export function oauthErrorRedirect(request: Request, message: string): NextResponse {
  const url = new URL("/login", getAppOrigin(request));
  url.searchParams.set("error", message);
  return NextResponse.redirect(url);
}
