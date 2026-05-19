/**
 * Decode JWT payload without verifying the signature (client / edge routing only).
 */
export function decodeJwtPayload<T extends Record<string, unknown> = Record<string, unknown>>(
  token: string,
): T | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const json = atob(padded);
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

export function isJwtExpired(payload: { exp?: unknown }): boolean {
  if (typeof payload.exp !== "number") return true;
  return payload.exp * 1000 <= Date.now();
}
