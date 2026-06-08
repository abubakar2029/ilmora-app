import { decodeJwtPayload } from "@/lib/jwt-decode";

export type JwtUserPayload = Record<string, unknown> & {
  user_id?: number;
  email?: string;
  role?: string;
  token_type?: string;
  exp?: number;
  iat?: number;
};


let accessToken: string | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

function setAccessToken(token: string | null): void {
  accessToken = token;
}

/** After OAuth role onboarding or token refresh with new claims. */
export function setAccessTokenFromSession(token: string): void {
  setAccessToken(token);
}

async function readErrorMessage(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as Record<string, unknown>;
    if (typeof data.detail === "string") return data.detail;
    if (Array.isArray(data.detail) && data.detail[0] && typeof (data.detail[0] as { string?: string }).string === "string") {
      return String((data.detail[0] as { string: string }).string);
    }
    const firstKey = Object.keys(data)[0];
    const val = firstKey ? data[firstKey] : null;
    if (Array.isArray(val) && typeof val[0] === "string") return val[0];
    if (typeof val === "string") return val;
  } catch {
    /* ignore */
  }
  return res.statusText || "Request failed";
}

/**
 * Decode the in-memory access token payload (not verified; for UI only).
 */
export function getCurrentUser(): JwtUserPayload | null {
  const token = accessToken;
  if (!token) return null;
  return decodeJwtPayload<JwtUserPayload>(token);
}

export async function login(email: string, password: string): Promise<void> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    credentials: "include",
  });
  const data = (await res.json().catch(() => ({}))) as { access?: string; detail?: string };
  if (!res.ok) {
    const message =
      typeof data.detail === "string"
        ? data.detail
        : res.status === 500 && !data.detail
          ? "Login service error. Check Vercel BACKEND_URL points to your Railway API."
          : res.statusText || "Login failed";
    throw new Error(message);
  }
  if (!data.access) {
    throw new Error("Invalid login response");
  }
  setAccessToken(data.access);
}

/**
 * Register a new account. Does not set tokens (sign in via `login`).
 * `role` should match backend values, e.g. `student` | `mentor`.
 */
export async function register(
  email: string,
  password: string,
  role: string,
): Promise<void> {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      password,
      confirm_password: password,
      role,
    }),
  });
  const data = (await res.json().catch(() => ({}))) as { detail?: string };
  if (!res.ok) {
    throw new Error(
      typeof data.detail === "string" ? data.detail : res.statusText || "Registration failed",
    );
  }
}

export async function logout(): Promise<void> {
  await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  }).catch(() => {});
  setAccessToken(null);
}

export async function requestPasswordReset(email: string): Promise<string> {
  const res = await fetch("/api/auth/password-reset", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const data = (await res.json().catch(() => ({}))) as { detail?: string };
  if (!res.ok) {
    throw new Error(typeof data.detail === "string" ? data.detail : "Could not send reset email");
  }
  return (
    typeof data.detail === "string"
      ? data.detail
      : "If an account exists for that email, we sent a password reset link."
  );
}

export async function confirmPasswordReset(
  uid: string,
  token: string,
  password: string,
  confirmPassword: string,
): Promise<void> {
  const res = await fetch("/api/auth/password-reset/confirm", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ uid, token, password, confirm_password: confirmPassword }),
  });
  const data = (await res.json().catch(() => ({}))) as { detail?: string };
  if (!res.ok) {
    throw new Error(typeof data.detail === "string" ? data.detail : "Could not reset password");
  }
}

/**
 * Use refresh token from httpOnly cookie to obtain a new access token.
 */
export async function refreshToken(): Promise<boolean> {
  const res = await fetch("/api/auth/refresh", {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) {
    setAccessToken(null);
    return false;
  }
  const data = (await res.json().catch(() => ({}))) as { access?: string; refresh?: string };
  if (!data.access) {
    setAccessToken(null);
    return false;
  }
  setAccessToken(data.access);
  return true;
}
