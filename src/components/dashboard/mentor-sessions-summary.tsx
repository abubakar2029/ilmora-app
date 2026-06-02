"use client";

import Link from "next/link";

import DashboardCard from "@/components/dashboard/dashboard-card";
import { InlineLoader, Skeleton } from "@/components/ui/loading";
import { useMentorDashboardSummary } from "@/hooks/queries";

export default function MentorSessionsSummary() {
  const { data, isLoading, error } = useMentorDashboardSummary();

  return (
    <DashboardCard
      title="Sessions & connections"
      description="Booking requests and mentorship activity."
      bodyClassName="px-5 py-5"
    >
      {isLoading ? (
        <div className="space-y-3" role="status" aria-busy="true">
          <InlineLoader label="Loading…" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : error ? (
        <p className="text-sm text-muted-foreground">Could not load summary.</p>
      ) : data ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat
              label="Pending requests"
              value={String(data.pending_session_requests)}
              href="/dashboard/sessions"
              highlight={data.pending_session_requests > 0}
            />
            <Stat label="Upcoming" value={String(data.upcoming_sessions)} href="/dashboard/sessions" />
            <Stat label="Connected" value={String(data.connected_count)} href="/dashboard/inbox" />
            <Stat label="Unread" value={String(data.unread_messages)} href="/dashboard/messages" />
          </div>
          {data.pending_session_requests > 0 ? (
            <Link
              href="/dashboard/sessions"
              className="inline-flex text-sm font-semibold text-primary hover:underline"
            >
              Review {data.pending_session_requests} pending session
              {data.pending_session_requests === 1 ? "" : "s"} →
            </Link>
          ) : (
            <Link
              href="/dashboard/sessions"
              className="inline-flex text-sm font-medium text-muted-foreground hover:text-primary"
            >
              Open session inbox →
            </Link>
          )}
        </div>
      ) : null}
    </DashboardCard>
  );
}

function Stat({
  label,
  value,
  href,
  highlight,
}: {
  label: string;
  value: string;
  href: string;
  highlight?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`rounded-xl border px-3 py-3 text-center transition-colors hover:border-primary/30 hover:bg-primary/5 ${
        highlight ? "border-primary/40 bg-primary/5" : "border-border/80 bg-muted/20"
      }`}
    >
      <p className="text-lg font-semibold tabular-nums text-foreground">{value}</p>
      <p className="mt-0.5 text-[11px] font-medium text-muted-foreground">{label}</p>
    </Link>
  );
}
