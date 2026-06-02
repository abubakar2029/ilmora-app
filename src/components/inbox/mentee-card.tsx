"use client";

import Link from "next/link";
import { useState } from "react";

import MatchPercentBadge from "@/components/matching/match-percent-badge";

export type MenteeCardData = {
  connectionId: number | null;
  studentId: number;
  headline: string;
  email: string;
  goals: string;
  score: number;
  status: string;
  initiatedBy?: string;
  mentorNote?: string;
  matchedAt?: string;
};

function scorePercent(score: number): number {
  return Math.min(100, Math.max(0, Math.round(score * 100)));
}

function statusPill(status: string, initiatedBy?: string) {
  if (status === "connected") {
    return (
      <span className="rounded-full bg-emerald-500/12 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
        Connected
      </span>
    );
  }
  if (status === "declined") {
    return (
      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
        Declined
      </span>
    );
  }
  if (status === "suggested") {
    return (
      <span className="rounded-full bg-amber-500/12 px-2 py-0.5 text-[10px] font-semibold text-amber-800 dark:text-amber-400">
        {initiatedBy === "mentor" ? "Invite sent" : "Pending"}
      </span>
    );
  }
  return (
    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
      New match
    </span>
  );
}

type Props = {
  data: MenteeCardData;
  busy?: boolean;
  onAccept?: (connectionId: number) => void;
  onDecline?: (connectionId: number) => void;
  onInvite?: (studentId: number) => void;
  onSaveNote?: (connectionId: number, note: string) => void;
};

export default function MenteeCard({
  data,
  busy,
  onAccept,
  onDecline,
  onInvite,
  onSaveNote,
}: Props) {
  const [noteOpen, setNoteOpen] = useState(Boolean(data.mentorNote?.trim()));
  const isDiscover = !data.connectionId && data.status !== "connected";
  const isPending =
    data.status === "suggested" && data.initiatedBy !== "mentor" && data.connectionId;
  const inviteSent = data.status === "suggested" && data.initiatedBy === "mentor";
  const connected = data.status === "connected" && data.connectionId;
  const declined = data.status === "declined";
  const initial = (data.headline || data.email || "?").charAt(0).toUpperCase();

  return (
    <article className="flex h-full flex-col rounded-xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-semibold text-primary"
          aria-hidden
        >
          {initial}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-semibold text-foreground">{data.headline}</h2>
          {data.email ? (
            <p className="truncate text-[11px] text-muted-foreground">{data.email}</p>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <MatchPercentBadge percent={scorePercent(data.score)} className="px-2 py-0.5 text-[10px]" />
          {statusPill(data.status, data.initiatedBy)}
        </div>
      </div>

      {data.goals ? (
        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{data.goals}</p>
      ) : null}

      {data.matchedAt && !isDiscover ? (
        <p className="mt-2 text-[10px] text-muted-foreground">
          {new Date(data.matchedAt).toLocaleDateString(undefined, { dateStyle: "medium" })}
        </p>
      ) : null}

      {connected && data.connectionId && onSaveNote ? (
        <div className="mt-2">
          <button
            type="button"
            onClick={() => setNoteOpen((o) => !o)}
            className="text-[11px] font-medium text-primary hover:underline"
          >
            {noteOpen ? "Hide note" : "Private note"}
          </button>
          {noteOpen ? (
            <textarea
              defaultValue={data.mentorNote ?? ""}
              rows={2}
              disabled={busy}
              placeholder="Session plans, follow-ups…"
              className="mt-1 w-full resize-y rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs"
              onBlur={(e) => {
                if (data.connectionId && e.target.value !== (data.mentorNote ?? "")) {
                  onSaveNote(data.connectionId, e.target.value);
                }
              }}
            />
          ) : null}
        </div>
      ) : null}

      <div className="mt-auto flex flex-wrap gap-1.5 pt-3">
        {connected && data.connectionId ? (
          <Link
            href={`/dashboard/messages?connection=${data.connectionId}`}
            className="rounded-lg bg-primary px-3 py-1.5 text-[11px] font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Message
          </Link>
        ) : null}
        {isPending && data.connectionId ? (
          <>
            <button
              type="button"
              disabled={busy}
              onClick={() => onAccept?.(data.connectionId!)}
              className="rounded-lg bg-primary px-3 py-1.5 text-[11px] font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              Accept
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => onDecline?.(data.connectionId!)}
              className="rounded-lg border border-border px-3 py-1.5 text-[11px] font-medium hover:bg-muted disabled:opacity-50"
            >
              Decline
            </button>
          </>
        ) : null}
        {inviteSent ? (
          <span className="py-1.5 text-[11px] text-muted-foreground">Awaiting response</span>
        ) : null}
        {isDiscover && !declined ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => onInvite?.(data.studentId)}
            className="rounded-lg bg-primary px-3 py-1.5 text-[11px] font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {busy ? "Sending…" : "Invite"}
          </button>
        ) : null}
        {declined ? (
          <span className="py-1.5 text-[11px] text-muted-foreground">Declined</span>
        ) : null}
        <Link
          href={`/profiles/${data.studentId}`}
          className="inline-flex items-center px-1 py-1.5 text-[11px] font-medium text-primary hover:underline"
        >
          Profile →
        </Link>
      </div>
    </article>
  );
}
