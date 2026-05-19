import { NextResponse } from "next/server";

import { applyRefreshCookie } from "@/lib/server/auth-cookies";
import {
  consumeOAuthFrom,
  consumeOAuthState,
  exchangeWithBackend,
  getAppOrigin,
  oauthCallbackUrl,
  oauthErrorRedirect,
} from "@/lib/server/oauth";

function githubClientId(): string {
  return process.env.GITHUB_CLIENT_ID?.trim() || process.env.GITHUB_ID?.trim() || "";
}

function githubClientSecret(): string {
  return process.env.GITHUB_CLIENT_SECRET?.trim() || process.env.GITHUB_SECRET?.trim() || "";
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const oauthError = url.searchParams.get("error");

  if (oauthError) {
    return oauthErrorRedirect(request, "GitHub sign-in was cancelled.");
  }

  const { ok, role } = await consumeOAuthState("github", state);
  if (!ok || !code) {
    return oauthErrorRedirect(request, "Invalid GitHub sign-in state. Try again.");
  }

  const clientId = githubClientId();
  const clientSecret = githubClientSecret();
  if (!clientId || !clientSecret) {
    return oauthErrorRedirect(request, "GitHub OAuth is not configured.");
  }

  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: oauthCallbackUrl(request, "github"),
    }),
  });

  const tokenData = await tokenRes.json().catch(() => ({}));
  const accessToken =
    typeof (tokenData as { access_token?: unknown }).access_token === "string"
      ? (tokenData as { access_token: string }).access_token
      : "";

  if (!tokenRes.ok || !accessToken) {
    return oauthErrorRedirect(request, "Could not complete GitHub sign-in.");
  }

  const result = await exchangeWithBackend("github", accessToken, role);
  if ("error" in result) {
    return oauthErrorRedirect(request, result.error);
  }

  const next = await consumeOAuthFrom();
  const successUrl = new URL("/auth/oauth-complete", getAppOrigin(request));
  successUrl.searchParams.set("next", next);
  const response = NextResponse.redirect(successUrl);
  applyRefreshCookie(response, result.refresh);
  return response;
}
