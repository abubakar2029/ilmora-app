import { getAccessToken, refreshToken } from "@/lib/auth";

export class ApiError extends Error {
  constructor(
    public status: number,
    public body: unknown,
    message?: string,
  ) {
    super(message ?? ApiError.messageFromBody(body, status));
    this.name = "ApiError";
  }

  static messageFromBody(body: unknown, status = 0): string {
    if (body && typeof body === "object") {
      const o = body as Record<string, unknown>;
      if (typeof o.detail === "string") return o.detail;
      for (const val of Object.values(o)) {
        if (Array.isArray(val) && typeof val[0] === "string") return val[0];
        if (typeof val === "string") return val;
      }
    }
    return status ? `Request failed (${status})` : "Request failed";
  }
}

function getApiBase(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL?.trim();
  return (raw && raw.replace(/\/$/, "")) || "http://127.0.0.1:8000";
}

/**
 * Same-origin or absolute `path` fetch to the Django API, with Bearer JWT when available.
 * On 401, attempts one token refresh and retries the request once.
 */
export async function apiFetch(
  path: string,
  init: RequestInit & { signal?: AbortSignal } = {},
  allowRefreshRetry = true,
): Promise<Response> {
  const base = getApiBase();
  const url = path.startsWith("http")
    ? path
    : `${base}${path.startsWith("/") ? "" : "/"}${path}`;

  const headers = new Headers(init.headers);
  const token = getAccessToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const hasBody = init.body !== undefined && init.body !== null;
  if (hasBody && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(url, { ...init, headers });

  if (res.status === 401 && allowRefreshRetry) {
    const refreshed = await refreshToken();
    if (refreshed) {
      return apiFetch(path, init, false);
    }
  }

  return res;
}

export async function apiJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await apiFetch(path, init);
  const data = (await res.json().catch(() => ({}))) as T;
  if (!res.ok) {
    throw new ApiError(res.status, data);
  }
  return data;
}
