"use client";

import Link from "next/link";
import { useState } from "react";

import NotificationItem from "@/components/NotificationItem";
import DashboardCard from "@/components/dashboard/dashboard-card";
import { InlineLoader, ListSkeleton } from "@/components/ui/loading";
import {
  useDashboardNotificationsPreview,
  useNotificationMutations,
} from "@/hooks/queries";
import type { AppNotification } from "@/lib/notifications";

export default function DashboardNotificationsPanel() {
  const { data: items = [], isLoading: loading, error } = useDashboardNotificationsPreview();
  const { markRead, markAllRead } = useNotificationMutations();
  const [markingId, setMarkingId] = useState<number | null>(null);

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

  const unread = items.filter((n) => !n.is_read).length;
  const errorMessage = error instanceof Error ? error.message : null;

  return (
    <DashboardCard
      title="Notifications"
      description="Story updates, matches, and connection activity."
      action={
        <Link
          href="/dashboard/notifications"
          className="text-xs font-semibold text-primary hover:underline"
        >
          View all →
        </Link>
      }
      bodyClassName="flex flex-col"
    >
      {loading ? (
        <div className="p-4">
          <InlineLoader label="Loading notifications…" className="mb-3 justify-center" />
          <ListSkeleton count={4} itemClassName="h-14 w-full rounded-lg" />
        </div>
      ) : errorMessage ? (
        <p className="p-5 text-sm text-red-500" role="alert">
          {errorMessage}
        </p>
      ) : items.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center px-5 py-10 text-center">
          <span className="text-2xl opacity-40" aria-hidden>
            🔔
          </span>
          <p className="mt-3 text-sm text-muted-foreground">You&apos;re all caught up — no notifications yet.</p>
        </div>
      ) : (
        <>
          {unread > 0 ? (
            <div className="flex items-center justify-between gap-2 border-b border-border/60 bg-primary/[0.04] px-4 py-2.5">
              <span className="text-xs font-semibold text-primary">{unread} unread</span>
              <button
                type="button"
                disabled={markAllRead.isPending}
                onClick={() => void markAllRead.mutate()}
                className="text-xs font-semibold text-foreground hover:text-primary disabled:opacity-60"
              >
                Mark all read
              </button>
            </div>
          ) : null}
          <ul className="max-h-[min(22rem,42vh)] flex-1 divide-y divide-border overflow-y-auto">
            {items.map((n) => (
              <li key={n.id}>
                <NotificationItem
                  notification={n}
                  compact
                  disabled={markingId === n.id}
                  onMarkRead={() => void handleMarkRead(n)}
                />
              </li>
            ))}
          </ul>
        </>
      )}
    </DashboardCard>
  );
}
