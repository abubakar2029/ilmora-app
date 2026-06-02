"use client";

import { getNotificationDisplay } from "@/lib/notification-display";
import type { AppNotification } from "@/lib/notifications";
import { formatTimeAgo } from "@/lib/time-ago";

type Props = {
  notification: AppNotification;
  onMarkRead?: () => void;
  disabled?: boolean;
  compact?: boolean;
};

export default function NotificationItem({ notification: n, onMarkRead, disabled, compact }: Props) {
  const display = getNotificationDisplay(n.notif_type);

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onMarkRead}
      className={`flex w-full gap-2 text-left transition-colors hover:bg-muted/80 disabled:opacity-60 ${
        compact ? "px-3 py-2.5" : "gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-sm hover:bg-muted/40"
      }`}
    >
      <span
        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm ${display.accentClass}`}
        aria-hidden
      >
        {display.icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className={`text-xs font-semibold ${n.is_read ? "text-muted-foreground" : "text-foreground"}`}>
            {display.label}
          </span>
          {!n.is_read ? <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-label="Unread" /> : null}
        </span>
        <span className={`mt-0.5 block text-pretty ${compact ? "text-sm" : "text-sm"} ${n.is_read ? "text-muted-foreground" : "text-foreground"}`}>
          {n.message}
        </span>
        <span className="mt-1 block text-xs text-muted-foreground">{formatTimeAgo(n.created_at)}</span>
      </span>
    </button>
  );
}
