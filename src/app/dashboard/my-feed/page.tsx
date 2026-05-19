"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

import { ApiError, apiFetch } from "@/lib/api";
import type { FeedItem } from "@/lib/blogs";
import { previewContent } from "@/lib/blogs";
import { useAuth } from "@/context/AuthContext";

const API_FEED = "/api/blogs/my-feed/";

const cardClass =
  "flex flex-col rounded-xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md";

function asFeedList(data: unknown): FeedItem[] {
  if (Array.isArray(data)) return data as FeedItem[];
  return [];
}

export default function MyFeedPage() {
  const { user, isLoading: authLoading } = useAuth();
  const role = typeof user?.role === "string" ? user.role : undefined;

  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (role !== "student") {
      setLoading(false);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await apiFetch(API_FEED, { method: "GET" });
      const data = await res.json().catch(() => []);
      if (!res.ok) throw new ApiError(res.status, data);
      setItems(asFeedList(data));
    } catch (e) {
      setItems([]);
      setError(e instanceof Error ? e.message : "Failed to load feed");
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => {
    if (authLoading) return;
    void load();
  }, [authLoading, load]);

  if (authLoading || loading) {
    return (
      <>
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 h-9 w-56 animate-pulse rounded-lg bg-muted" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 animate-pulse rounded-xl bg-muted/70" />
            ))}
          </div>
        </div>
      </>
    );
  }

  if (role !== "student") {
    return (
      <>
        <div className="mx-auto max-w-3xl">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">My feed</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your personalized story feed is available for student accounts only.
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-3xl">
        <header className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-foreground lg:text-3xl">My feed</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Stories matched to your profile.{" "}
            <Link href="/blogs" className="font-medium text-primary hover:underline">
              View all public stories
            </Link>
          </p>
        </header>

        {error ? (
          <p className="mb-4 text-sm text-red-500" role="alert">
            {error}
          </p>
        ) : null}

        {items.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground text-pretty">
            Your personalized feed will appear here once more stories are published.
          </p>
        ) : (
          <ul className="space-y-6">
            {items.map((item) => {
              const pct = Math.round(Math.min(100, Math.max(0, item.score * 100)));
              return (
                <li key={item.id}>
                  <article className={cardClass}>
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <h2 className="text-base font-semibold leading-snug text-foreground">{item.title}</h2>
                      <span className="shrink-0 rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-semibold text-primary">
                        {pct}% match
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground">{previewContent(item.content, 220)}</p>
                    <div className="mt-4 rounded-lg border border-border bg-muted/30 px-3 py-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Why this matches you
                      </p>
                    </div>
                    <Link
                      href={`/blogs/${item.id}`}
                      className="mt-4 inline-flex text-sm font-semibold text-primary hover:underline"
                    >
                      Read full story
                    </Link>
                  </article>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}
