"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import NotificationItem from "@/components/NotificationItem";
import { useNotificationMutations, useNotificationsPreview } from "@/hooks/queries";
import type { AppNotification } from "@/lib/notifications";

function BellIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}

export default function NotificationBell() {
  const { data: items = [] } = useNotificationsPreview();
  const { markRead } = useNotificationMutations();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const [markingId, setMarkingId] = useState<number | null>(null);

  useEffect(() => {
    if (!open) return;
    function onDocMouseDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, [open]);

  const unreadCount = items.filter((n) => !n.is_read).length;
  const badge = unreadCount > 99 ? "99+" : unreadCount > 0 ? String(unreadCount) : null;
  const dropdownItems = items.slice(0, 10);

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

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={unreadCount ? `Notifications, ${unreadCount} unread` : "Notifications"}
      >
        <BellIcon className="h-5 w-5" />
        {badge ? (
          <span className="absolute -right-0.5 -top-0.5 flex min-h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold leading-none text-white">
            {badge}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          className="absolute right-0 top-full z-100 mt-2 w-[min(100vw-2rem,22rem)] rounded-xl border border-border bg-card py-2 shadow-lg"
          role="menu"
        >
          <div className="border-b border-border px-3 pb-2 pt-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Notifications</p>
          </div>
          <ul className="max-h-[min(70vh,24rem)] overflow-y-auto">
            {dropdownItems.length === 0 ? (
              <li className="px-3 py-6 text-center text-sm text-muted-foreground">No notifications yet.</li>
            ) : (
              dropdownItems.map((n) => (
                <li key={n.id} className="border-b border-border last:border-b-0">
                  <NotificationItem
                    notification={n}
                    compact
                    disabled={markingId === n.id}
                    onMarkRead={() => void handleMarkRead(n)}
                  />
                </li>
              ))
            )}
          </ul>
          <div className="border-t border-border px-2 py-2">
            <Link
              href="/dashboard/notifications"
              className="block rounded-lg px-2 py-2 text-center text-sm font-semibold text-primary hover:bg-primary/10"
              onClick={() => setOpen(false)}
            >
              View all
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
