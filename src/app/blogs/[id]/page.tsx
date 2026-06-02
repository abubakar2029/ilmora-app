"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import AppShell from "@/components/app-shell";
import BlogContent from "@/components/blog/blog-content";
import { ApiError, apiFetch } from "@/lib/api";
import type { Blog } from "@/lib/blogs";

export default function BlogDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : Array.isArray(params.id) ? params.id[0] : "";

  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setError(null);
    setLoading(true);
    try {
      const res = await apiFetch(`/api/blogs/${id}/`, { method: "GET" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new ApiError(res.status, data);
      setBlog(data as Blog);
    } catch (e) {
      setBlog(null);
      setError(e instanceof Error ? e.message : "Story not found");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <AppShell>
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 h-8 w-3/4 max-w-md animate-pulse rounded-lg bg-muted" />
          <div className="mb-4 h-4 w-48 animate-pulse rounded bg-muted/80" />
          <div className="space-y-3">
            <div className="h-4 animate-pulse rounded bg-muted/60" />
            <div className="h-4 animate-pulse rounded bg-muted/60" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-muted/60" />
          </div>
        </div>
      </AppShell>
    );
  }

  if (error || !blog) {
    return (
      <AppShell>
        <div className="mx-auto max-w-3xl">
          <p className="text-sm text-red-500" role="alert">
            {error ?? "This story could not be loaded."}
          </p>
          <Link href="/blogs" className="mt-4 inline-block text-sm font-semibold text-primary hover:underline">
            ← Back to stories
          </Link>
        </div>
      </AppShell>
    );
  }

  const dateStr = blog.published_at
    ? new Date(blog.published_at).toLocaleDateString(undefined, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;
  const authorLabel = blog.author?.email ?? "Author";

  return (
    <AppShell>
      <article className="mx-auto max-w-3xl">
        <Link href="/blogs" className="mb-6 inline-block text-sm font-medium text-muted-foreground hover:text-primary">
          ← All stories
        </Link>

        <header className="border-b border-border pb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{blog.title}</h1>
          <p className="mt-4 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{authorLabel}</span>
            {dateStr ? <span className="before:mx-2 before:content-['·']">{dateStr}</span> : null}
          </p>
        </header>

        <BlogContent content={blog.content} className="mt-10" />
      </article>
    </AppShell>
  );
}
