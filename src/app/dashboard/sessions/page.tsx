"use client";

import Link from "next/link";
import { useState } from "react";

import { ListSkeleton, PageSkeleton } from "@/components/ui/loading";
import { useAuth } from "@/context/AuthContext";
import { useSessionMutations, useSessions } from "@/hooks/queries";
import type { SessionItem } from "@/lib/sessions-api";

type WhenFilter = "upcoming" | "past" | "all";

function statusPill(status: string) {
  if (status === "confirmed") {
    return (
      <span className="rounded-full bg-emerald-500/12 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
        Confirmed
      </span>
    );
  }
  if (status === "requested") {
    return (
      <span className="rounded-full bg-amber-500/12 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800 dark:text-amber-400">
        Pending
      </span>
    );
  }
  return (
    <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
      Cancelled
    </span>
  );
}

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function SessionCard({
  session,
  role,
  busy,
  onConfirm,
  onCancel,
}: {
  session: SessionItem;
  role: string | undefined;
  busy: boolean;
  onConfirm: (id: number) => void;
  onCancel: (id: number) => void;
}) {
  const isMentor = role === "mentor";
  const canConfirm = isMentor && session.status === "requested";
  const canCancel =
    session.status === "requested" || session.status === "confirmed";

  return (
    <li className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-base font-semibold text-foreground">{session.counterpart_label}</p>
          <p className="mt-1 text-sm text-muted-foreground">{formatWhen(session.scheduled_at)}</p>
        </div>
        {statusPill(session.status)}
      </div>
      {session.note ? (
        <p className="mt-3 rounded-lg bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Note: </span>
          {session.note}
        </p>
      ) : null}
      <div className="mt-4 flex flex-wrap gap-2 border-t border-border/60 pt-4">
        <Link
          href={`/dashboard/messages?connection=${session.connection_id}`}
          className="text-sm font-semibold text-primary hover:underline"
        >
          Message
        </Link>
        {canConfirm ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => onConfirm(session.id)}
            className="rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
          >
            Confirm
          </button>
        ) : null}
        {canCancel ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => onCancel(session.id)}
            className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium disabled:opacity-50"
          >
            Cancel
          </button>
        ) : null}
      </div>
    </li>
  );
}

export default function SessionsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const role = typeof user?.role === "string" ? user.role : undefined;
  const [when, setWhen] = useState<WhenFilter>("upcoming");
  const { data: sessions = [], isLoading, error } = useSessions(when);
  const { updateStatus } = useSessionMutations();
  const [busyId, setBusyId] = useState<number | null>(null);

  async function handleConfirm(id: number) {
    setBusyId(id);
    try {
      await updateStatus.mutateAsync({ sessionId: id, status: "confirmed" });
    } finally {
      setBusyId(null);
    }
  }

  async function handleCancel(id: number) {
    if (!window.confirm("Cancel this session? Both parties will be notified.")) return;
    setBusyId(id);
    try {
      await updateStatus.mutateAsync({ sessionId: id, status: "cancelled" });
    } finally {
      setBusyId(null);
    }
  }

  if (authLoading) {
    return <PageSkeleton label="Loading sessions…" />;
  }

  if (role !== "student" && role !== "mentor") {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-border bg-card p-8 text-center">
        <h1 className="text-lg font-semibold text-foreground">Sessions</h1>
        <p className="mt-2 text-sm text-muted-foreground">Available for student and mentor accounts.</p>
      </div>
    );
  }

  const title = role === "mentor" ? "Session inbox" : "My sessions";
  const subtitle =
    role === "mentor"
      ? "Review booking requests, confirm times, and manage your calendar."
      : "Sessions you booked with connected mentors.";

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header>
        <Link href="/dashboard" className="text-[13px] font-medium text-primary hover:underline">
          ← Dashboard
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>
      </header>

      <div className="flex flex-wrap gap-2">
        {(["upcoming", "past", "all"] as const).map((w) => (
          <button
            key={w}
            type="button"
            onClick={() => setWhen(w)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium capitalize ${
              when === w
                ? "bg-primary text-primary-foreground"
                : "bg-muted/50 text-muted-foreground hover:bg-muted"
            }`}
          >
            {w}
          </button>
        ))}
      </div>

      {error ? (
        <p className="text-sm text-red-500" role="alert">
          Could not load sessions.
        </p>
      ) : isLoading ? (
        <ListSkeleton rows={4} />
      ) : sessions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 px-6 py-12 text-center">
          <p className="text-sm text-muted-foreground">
            {when === "upcoming"
              ? "No upcoming sessions."
              : when === "past"
                ? "No past sessions yet."
                : "No sessions yet."}
          </p>
          {role === "student" && when === "upcoming" ? (
            <Link
              href="/dashboard/inbox"
              className="mt-4 inline-block text-sm font-semibold text-primary hover:underline"
            >
              Go to matches →
            </Link>
          ) : null}
        </div>
      ) : (
        <ul className="space-y-3">
          {sessions.map((s) => (
            <SessionCard
              key={s.id}
              session={s}
              role={role}
              busy={busyId === s.id}
              onConfirm={handleConfirm}
              onCancel={handleCancel}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
