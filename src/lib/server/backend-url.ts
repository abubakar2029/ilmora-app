/** Base URL for the Django API (server-side BFF only; no trailing slash). */
export function getBackendBaseUrl(): string {
  const raw =
    process.env.BACKEND_URL?.trim() ||
    process.env.NEXT_PUBLIC_API_URL?.trim() ||
    "http://127.0.0.1:8000";

  const withoutTrailingSlash = raw.replace(/\/$/, "");
  if (!withoutTrailingSlash) {
    return "http://127.0.0.1:8000";
  }

  if (/^https?:\/\//i.test(withoutTrailingSlash)) {
    return withoutTrailingSlash;
  }

  return `https://${withoutTrailingSlash}`;
}

/** True when deployed on Vercel but still pointing at a local backend URL. */
export function isMisconfiguredBackendUrl(url: string): boolean {
  if (!process.env.VERCEL) {
    return false;
  }
  return /localhost|127\.0\.0\.1/i.test(url);
}
