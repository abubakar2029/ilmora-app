import { ApiError, apiFetch } from "@/lib/api";
import type { Blog } from "@/lib/blogs";

export type AdminMentorProfile = {
  headline: string;
  expertise: string;
  contact_email: string;
  linkedin_url: string;
  instagram_url: string;
  facebook_url: string;
};

export type AdminUser = {
  id: number;
  email: string;
  role: string;
  is_active: boolean;
  needs_role_selection: boolean;
  is_staff: boolean;
  date_joined: string;
  mentor_profile?: AdminMentorProfile | null;
};

export type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export type AdminOverview = {
  users: {
    total: number;
    students: number;
    mentors: number;
    admins: number;
    active: number;
  };
  blogs: {
    pending: number;
    needs_revision: number;
    published: number;
    total: number;
  };
  connections: {
    total: number;
    connected: number;
    suggested: number;
  };
  sessions: {
    upcoming: number;
    pending_requests: number;
  };
};

export type AnnouncementResult = {
  audience: string;
  recipients: number;
  notified: number;
  emailed: number;
  failed: number;
};

export function parsePaginated<T>(data: unknown): Paginated<T> {
  if (!data || typeof data !== "object") {
    return { count: 0, next: null, previous: null, results: [] };
  }
  const o = data as Record<string, unknown>;
  return {
    count: typeof o.count === "number" ? o.count : 0,
    next: typeof o.next === "string" ? o.next : null,
    previous: typeof o.previous === "string" ? o.previous : null,
    results: Array.isArray(o.results) ? (o.results as T[]) : [],
  };
}

async function parseJson<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data);
  return data as T;
}

export async function fetchAdminOverview(): Promise<AdminOverview> {
  const res = await apiFetch("/api/admin-panel/overview/", { method: "GET" });
  return parseJson(res);
}

export async function sendAdminAnnouncement(payload: {
  title: string;
  body: string;
  audience: "community" | "student" | "mentor" | "all";
}): Promise<AnnouncementResult> {
  const res = await apiFetch("/api/admin-panel/announcements/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return parseJson(res);
}

export async function listAdminBlogs(params?: {
  status?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}): Promise<Paginated<Blog>> {
  const q = new URLSearchParams();
  if (params?.status) q.set("status", params.status);
  if (params?.search?.trim()) q.set("search", params.search.trim());
  q.set("page", String(params?.page ?? 1));
  q.set("page_size", String(params?.pageSize ?? 20));
  const res = await apiFetch(`/api/admin-panel/blogs/?${q}`, { method: "GET" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data);
  return parsePaginated<Blog>(data);
}

export async function getAdminBlog(id: number): Promise<Blog> {
  const res = await apiFetch(`/api/admin-panel/blogs/${id}/`, { method: "GET" });
  return parseJson<Blog>(res);
}

export async function approveAdminBlog(id: number): Promise<Blog> {
  const res = await apiFetch(`/api/admin-panel/blogs/${id}/approve/`, { method: "PATCH" });
  return parseJson<Blog>(res);
}

export async function deleteAdminBlog(id: number): Promise<void> {
  const res = await apiFetch(`/api/admin-panel/blogs/${id}/`, { method: "DELETE" });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new ApiError(res.status, data);
  }
}

export async function reviseAdminBlog(id: number, comment: string): Promise<Blog> {
  const res = await apiFetch(`/api/admin-panel/blogs/${id}/revise/`, {
    method: "PATCH",
    body: JSON.stringify({ comment }),
  });
  return parseJson<Blog>(res);
}

export async function listAdminUsers(params?: {
  role?: string;
  isActive?: boolean | "all";
  search?: string;
  page?: number;
  pageSize?: number;
}): Promise<Paginated<AdminUser>> {
  const q = new URLSearchParams();
  if (params?.role && params.role !== "all") q.set("role", params.role);
  if (params?.isActive === true) q.set("is_active", "true");
  if (params?.isActive === false) q.set("is_active", "false");
  if (params?.search?.trim()) q.set("search", params.search.trim());
  q.set("page", String(params?.page ?? 1));
  q.set("page_size", String(params?.pageSize ?? 20));
  const res = await apiFetch(`/api/admin-panel/users/?${q}`, { method: "GET" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data);
  return parsePaginated<AdminUser>(data);
}

export async function getAdminUser(id: number): Promise<AdminUser> {
  const res = await apiFetch(`/api/admin-panel/users/${id}/`, { method: "GET" });
  return parseJson<AdminUser>(res);
}

export async function updateAdminUser(
  id: number,
  payload: Partial<Pick<AdminUser, "email" | "role" | "is_active" | "needs_role_selection" | "is_staff">>,
): Promise<AdminUser> {
  const res = await apiFetch(`/api/admin-panel/users/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return parseJson<AdminUser>(res);
}

export async function deleteAdminUser(id: number): Promise<void> {
  const res = await apiFetch(`/api/admin-panel/users/${id}/`, { method: "DELETE" });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new ApiError(res.status, data);
  }
}
