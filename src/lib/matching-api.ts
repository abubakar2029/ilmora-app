import { ApiError, apiFetch } from "@/lib/api";

function asArray<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object" && Array.isArray((data as { results?: unknown }).results)) {
    return (data as { results: T[] }).results;
  }
  return [];
}

async function parseArray<T>(res: Response): Promise<T[]> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data);
  return asArray<T>(data);
}

export async function findMentorMatches<T>() {
  const res = await apiFetch("/api/matches/mentors/", { method: "POST" });
  return parseArray<T>(res);
}

export async function findStudentMatches<T>() {
  const res = await apiFetch("/api/matches/students/", { method: "POST" });
  return parseArray<T>(res);
}

export async function findBlogFeed<T>() {
  const res = await apiFetch("/api/blogs/my-feed/", { method: "POST" });
  return parseArray<T>(res);
}
