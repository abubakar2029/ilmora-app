import { ApiError, apiFetch } from "@/lib/api";
import type { Blog, PaginatedBlogs } from "@/lib/blogs";

export function parsePaginatedBlogs(data: unknown): PaginatedBlogs {
  if (!data || typeof data !== "object") {
    return { count: 0, next: null, previous: null, results: [] };
  }
  const o = data as Record<string, unknown>;
  const results = Array.isArray(o.results) ? (o.results as Blog[]) : [];
  return {
    count: typeof o.count === "number" ? o.count : 0,
    next: typeof o.next === "string" ? o.next : null,
    previous: typeof o.previous === "string" ? o.previous : null,
    results,
  };
}

async function parseBlogResponse(res: Response): Promise<Blog> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data);
  return data as Blog;
}

export async function listMyStories(pageSize = 50): Promise<Blog[]> {
  const res = await apiFetch(`/api/blogs/my-drafts/?page_size=${pageSize}`, { method: "GET" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data);
  return parsePaginatedBlogs(data).results;
}

export async function getMyStory(id: number): Promise<Blog> {
  const res = await apiFetch(`/api/blogs/my-drafts/${id}/`, { method: "GET" });
  return parseBlogResponse(res);
}

export async function createStory(title: string, content: string): Promise<Blog> {
  const res = await apiFetch("/api/blogs/", {
    method: "POST",
    body: JSON.stringify({ title, content }),
  });
  return parseBlogResponse(res);
}

export async function updateStory(id: number, title: string, content: string): Promise<Blog> {
  const res = await apiFetch(`/api/blogs/my-drafts/${id}/`, {
    method: "PATCH",
    body: JSON.stringify({ title, content }),
  });
  return parseBlogResponse(res);
}

export async function deleteStory(id: number): Promise<void> {
  const res = await apiFetch(`/api/blogs/my-drafts/${id}/`, { method: "DELETE" });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new ApiError(res.status, data);
  }
}
