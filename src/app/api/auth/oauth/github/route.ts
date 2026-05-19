import { NextResponse } from "next/server";

import { getAppOrigin, oauthCallbackUrl, setOAuthState } from "@/lib/server/oauth";

function githubClientId(): string {
  return process.env.GITHUB_CLIENT_ID?.trim() || process.env.GITHUB_ID?.trim() || "";
}

export async function GET(request: Request) {
  const clientId = githubClientId();
  if (!clientId) {
    return NextResponse.json({ detail: "GitHub OAuth is not configured" }, { status: 503 });
  }

  const url = new URL(request.url);
  const role = url.searchParams.get("role") === "mentor" ? "mentor" : "student";
  const from = url.searchParams.get("from");
  const state = await setOAuthState("github", role, from ?? undefined);

  const redirectUri = oauthCallbackUrl(request, "github");
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: "read:user user:email",
    state,
  });
  return NextResponse.redirect(`https://github.com/login/oauth/authorize?${params.toString()}`);
}
