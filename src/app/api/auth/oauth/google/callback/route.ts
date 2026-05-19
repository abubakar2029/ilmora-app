import { NextResponse } from "next/server";

import {
  consumeOAuthFrom,
  consumeOAuthState,
  exchangeWithBackend,
  getAppOrigin,
  oauthCallbackUrl,
  oauthErrorRedirect,
} from "@/lib/server/oauth";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const oauthError = url.searchParams.get("error");

  if (oauthError) {
    return oauthErrorRedirect(request, "Google sign-in was cancelled.");
  }

  const { ok, role } = await consumeOAuthState("google", state);
  if (!ok || !code) {
    return oauthErrorRedirect(request, "Invalid Google sign-in state. Try again.");
  }

  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) {
    return oauthErrorRedirect(request, "Google OAuth is not configured.");
  }

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: oauthCallbackUrl(request, "google"),
      grant_type: "authorization_code",
    }),
  });

  const tokenData = await tokenRes.json().catch(() => ({}));
  const idToken = typeof (tokenData as { id_token?: unknown }).id_token === "string"
    ? (tokenData as { id_token: string }).id_token
    : "";

  if (!tokenRes.ok || !idToken) {
    return oauthErrorRedirect(request, "Could not complete Google sign-in.");
  }

  const result = await exchangeWithBackend("google", idToken);
  if ("error" in result) {
    return oauthErrorRedirect(request, result.error);
  }

  const next = result.needsRoleSelection
    ? "/onboarding/role"
    : await consumeOAuthFrom();
  const successUrl = new URL("/auth/oauth-complete", getAppOrigin(request));
  successUrl.searchParams.set("next", next);
  if (result.needsRoleSelection) {
    successUrl.searchParams.set("setup_role", "1");
  }
  const response = NextResponse.redirect(successUrl);
  const { applyRefreshCookie } = await import("@/lib/server/auth-cookies");
  applyRefreshCookie(response, result.refresh);
  return response;
}
