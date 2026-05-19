"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { ApiError, apiFetch } from "@/lib/api";
import type { AppNotification } from "@/lib/notifications";
import { parseNotificationsResponse } from "@/lib/notifications";
import { formatTimeAgo } from "@/lib/time-ago";

const API_FIRST = "/api/notifications/?page=1";

export default function NotificationsHistoryPage() {
  const [items, setItems] = useState<AppNotification[]>([]);
  const [nextUrl, setNextUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [markingId, setMarkingId] = useState<number | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadUrl = useCallback(async (url: string, append: boolean) => {
    const res = await apiFetch(url, { method: "GET" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new ApiError(res.status, data);
    const parsed = parseNotificationsResponse(data);
    setNextUrl(parsed.next);
    setItems((prev) => (append ? [...prev, ...parsed.results] : parsed.results));
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setError(null);
      setLoading(true);
      try {
        await loadUrl(API_FIRST, false);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load notifications");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadUrl]);

  const loadMore = useCallback(async () => {
    if (!nextUrl || loadingMore) return;
    setLoadingMore(true);
    setError(null);
    try {
      await loadUrl(nextUrl, true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load more");
    } finally {
      setLoadingMore(false);
    }
  }, [nextUrl, loadingMore, loadUrl]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !nextUrl) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) void loadMore();
      },
      { rootMargin: "120px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [nextUrl, loadMore]);

  async function markRead(n: AppNotification) {
    if (n.is_read || markingId === n.id) return;
    setMarkingId(n.id);
    try {
      const res = await apiFetch(`/api/notifications/${n.id}/read/`, { method: "PATCH" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new ApiError(res.status, data);
      const updated = data as AppNotification;
      setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, ...updated, is_read: true } : x)));
    } catch {
      /* ignore */
    } finally {
      setMarkingId(null);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 h-9 w-64 animate-pulse rounded-lg bg-muted" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-muted/70" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground lg:text-3xl">Notifications</h1>
        <p className="mt-2 text-sm text-muted-foreground">Full history of your in-app notifications.</p>
      </header>

      {error ? (
        <p className="mb-4 text-sm text-red-500" role="alert">
          {error}
        </p>
      ) : null}

      {items.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border bg-muted/20 px-4 py-10 text-center text-sm text-muted-foreground">
          You don&apos;t have any notifications yet.
        </p>
      ) : (
        <ul className="space-y-2">
          {items.map((n) => (
            <li key={n.id}>
              <button
                type="button"
                disabled={markingId === n.id}
                onClick={() => void markRead(n)}
                className="flex w-full gap-3 rounded-xl border border-border bg-card px-4 py-3 text-left shadow-sm transition-colors hover:bg-muted/40 disabled:opacity-60"
              >
                <span className="mt-1 flex w-5 shrink-0 justify-center" aria-hidden>
                  {!n.is_read ? <span className="block h-2 w-2 rounded-full bg-primary" /> : null}
                </span>
                <span className="min-w-0 flex-1">
                  <span className={`text-sm text-pretty ${n.is_read ? "text-muted-foreground" : "text-foreground"}`}>
                    {n.message}
                  </span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {formatTimeAgo(n.created_at)}
                    {n.notif_type ? ` · ${n.notif_type.replace(/_/g, " ")}` : ""}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <div ref={sentinelRef} className="h-4 w-full" aria-hidden />

      {loadingMore ? (
        <p className="py-4 text-center text-xs text-muted-foreground">Loading more…</p>
      ) : null}
      {!nextUrl && items.length > 0 ? (
        <p className="py-4 text-center text-xs text-muted-foreground">You&apos;re all caught up.</p>
      ) : null}
    </div>
  );
}
