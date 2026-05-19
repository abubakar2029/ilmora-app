import { NextResponse } from "next/server";

import { getAppOrigin, oauthCallbackUrl, setOAuthState } from "@/lib/server/oauth";

export async function GET(request: Request) {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  if (!clientId) {
    return NextResponse.json({ detail: "Google OAuth is not configured" }, { status: 503 });
  }

  const url = new URL(request.url);
  const role = url.searchParams.get("role") === "mentor" ? "mentor" : "student";
  const from = url.searchParams.get("from");
  const state = await setOAuthState("google", role, from ?? undefined);

  const redirectUri = oauthCallbackUrl(request, "google");
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
    access_type: "online",
    prompt: "select_account",
  });
  return NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
}
