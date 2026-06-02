"use client";

import { useEffect, useRef, useState } from "react";

import NotificationItem from "@/components/NotificationItem";
import { InlineLoader, PageSkeleton } from "@/components/ui/loading";
import { useNotificationMutations, useNotificationsInfinite } from "@/hooks/queries";
import type { AppNotification } from "@/lib/notifications";

export default function NotificationsHistoryPage() {
  const { data, isLoading: loading, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useNotificationsInfinite();
  const { markRead, markAllRead } = useNotificationMutations();
  const [markingId, setMarkingId] = useState<number | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const items = data?.pages.flatMap((p) => p.results) ?? [];
  const nextUrl = hasNextPage ? "more" : null;
  const errorMessage = error instanceof Error ? error.message : null;

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !nextUrl || isFetchingNextPage) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) void fetchNextPage();
      },
      { rootMargin: "120px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [nextUrl, isFetchingNextPage, fetchNextPage]);

  async function handleMarkRead(n: AppNotification) {
    if (n.is_read || markingId === n.id) return;
    setMarkingId(n.id);
    try {
      await markRead.mutateAsync(n.id);
    } catch {
      /* ignore */
    } finally {
      setMarkingId(null);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl">
        <PageSkeleton className="max-w-2xl" label="Loading notifications…" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground lg:text-3xl">Notifications</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Story approvals, match digests (monthly &amp; Saturdays), and connection updates appear here.
          </p>
        </div>
        {items.some((n) => !n.is_read) ? (
          <button
            type="button"
            disabled={markAllRead.isPending}
            onClick={() => void markAllRead.mutate()}
            className="shrink-0 rounded-lg border border-border px-3 py-2 text-sm font-semibold text-foreground hover:bg-muted disabled:opacity-60"
          >
            Mark all read
          </button>
        ) : null}
      </header>

      {errorMessage ? (
        <p className="mb-4 text-sm text-red-500" role="alert">
          {errorMessage}
        </p>
      ) : null}

      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
          No notifications yet.
        </p>
      ) : (
        <ul className="divide-y divide-border rounded-xl border border-border bg-card">
          {items.map((n) => (
            <li key={n.id}>
              <NotificationItem
                notification={n}
                disabled={markingId === n.id}
                onMarkRead={() => void handleMarkRead(n)}
              />
            </li>
          ))}
        </ul>
      )}

      <div ref={sentinelRef} className="h-4" aria-hidden />
      {isFetchingNextPage ? (
        <p className="mt-4 flex justify-center">
          <InlineLoader label="Loading more…" className="text-xs" />
        </p>
      ) : null}
    </div>
  );
}
