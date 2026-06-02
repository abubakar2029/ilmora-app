"use client";

import Link from "next/link";

import DashboardCard from "@/components/dashboard/dashboard-card";
import { InlineLoader, Skeleton } from "@/components/ui/loading";
import { useStudentDashboardSummary } from "@/hooks/queries/use-student-summary";

export default function StudentActivitySummary() {
  const { data, isLoading, error } = useStudentDashboardSummary();

  return (
    <DashboardCard
      title="Connections & messages"
      description="Your mentorship activity at a glance."
      bodyClassName="px-5 py-5"
    >
      {isLoading ? (
        <div className="space-y-3" role="status" aria-busy="true">
          <InlineLoader label="Loading activity…" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : error ? (
        <p className="text-sm text-muted-foreground">Could not load activity summary.</p>
      ) : data ? (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            <Stat label="Connected" value={String(data.connected_count)} href="/dashboard/inbox" />
            <Stat label="Pending" value={String(data.pending_connections)} href="/dashboard/inbox" />
            <Stat label="Unread" value={String(data.unread_messages)} href="/dashboard/messages" />
            <Stat label="Saved" value={String(data.saved_mentors_count)} href="/dashboard/inbox?saved=1" />
            <Stat
              label="Sessions"
              value={String(data.upcoming_sessions ?? 0)}
              href="/dashboard/sessions"
            />
          </div>

          {data.recent_chats.length > 0 ? (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Recent chats
              </p>
              <ul className="mt-2 divide-y divide-border/60">
                {data.recent_chats.map((c) => (
                  <li key={c.connection_id} className="flex items-center justify-between gap-2 py-2.5 first:pt-0">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{c.other_headline}</p>
                      {c.last_message ? (
                        <p className="truncate text-xs text-muted-foreground">{c.last_message}</p>
                      ) : (
                        <p className="text-xs text-muted-foreground">No messages yet</p>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {c.unread_count > 0 ? (
                        <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
                          {c.unread_count}
                        </span>
                      ) : null}
                      <Link
                        href={`/dashboard/messages?connection=${c.connection_id}`}
                        className="text-xs font-semibold text-primary hover:underline"
                      >
                        Open
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Connect with a mentor to start messaging.{" "}
              <Link href="/dashboard/inbox?find=1" className="font-medium text-primary hover:underline">
                Find mentors →
              </Link>
            </p>
          )}
        </div>
      ) : null}
    </DashboardCard>
  );
}

function Stat({ label, value, href }: { label: string; value: string; href: string }) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-border/80 bg-muted/20 px-3 py-3 text-center transition-colors hover:border-primary/30 hover:bg-primary/5"
    >
      <p className="text-lg font-semibold tabular-nums text-foreground">{value}</p>
      <p className="mt-0.5 text-[11px] font-medium text-muted-foreground">{label}</p>
    </Link>
  );
}
