"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

import AppShell from "@/components/app-shell";
import { ApiError, apiFetch } from "@/lib/api";
import type { Blog, PaginatedBlogs } from "@/lib/blogs";
import { previewContent } from "@/lib/blogs";

const API_LIST = "/api/blogs/";

const cardClass =
  "flex flex-col rounded-xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md";

function parsePaginated(data: unknown): PaginatedBlogs {
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

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [nextUrl, setNextUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadInitial = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await apiFetch(API_LIST, { method: "GET" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new ApiError(res.status, data);
      const p = parsePaginated(data);
      setBlogs(p.results);
      setNextUrl(p.next);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load stories");
      setBlogs([]);
      setNextUrl(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadInitial();
  }, [loadInitial]);

  async function loadMore() {
    if (!nextUrl || loadingMore) return;
    setLoadingMore(true);
    setError(null);
    try {
      const res = await apiFetch(nextUrl, { method: "GET" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new ApiError(res.status, data);
      const p = parsePaginated(data);
      setBlogs((prev) => [...prev, ...p.results]);
      setNextUrl(p.next);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load more");
    } finally {
      setLoadingMore(false);
    }
  }

  if (loading) {
    return (
      <AppShell>
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 h-9 w-56 animate-pulse rounded-lg bg-muted" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-48 animate-pulse rounded-xl bg-muted/70" />
            ))}
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl">
        <header className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-foreground lg:text-3xl">Success stories</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground lg:text-base">
            Read experiences shared by students and mentors in our community.
          </p>
        </header>

        {error ? (
          <p className="mb-4 text-sm text-red-500" role="alert">
            {error}
          </p>
        ) : null}

        {blogs.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">
            No published stories yet. Check back soon.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {blogs.map((blog) => {
                const dateStr = blog.published_at
                  ? new Date(blog.published_at).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                  : null;
                const authorLabel = blog.author?.email ?? "Author";
                return (
                  <article key={blog.id} className={cardClass}>
                    <h2 className="text-base font-semibold leading-snug text-foreground line-clamp-2">{blog.title}</h2>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {authorLabel}
                      {dateStr ? ` · ${dateStr}` : ""}
                    </p>
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-4">
                      {previewContent(blog.content, 100)}
                    </p>
                    <Link
                      href={`/blogs/${blog.id}`}
                      className="mt-4 inline-flex text-sm font-semibold text-primary hover:underline"
                    >
                      Read more
                    </Link>
                  </article>
                );
              })}
            </div>

            {nextUrl ? (
              <div className="mt-8 flex justify-center">
                <button
                  type="button"
                  disabled={loadingMore}
                  onClick={() => void loadMore()}
                  className="rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-muted disabled:opacity-50"
                >
                  {loadingMore ? "Loading…" : "Load more"}
                </button>
              </div>
            ) : null}
          </>
        )}
      </div>
    </AppShell>
  );
}
