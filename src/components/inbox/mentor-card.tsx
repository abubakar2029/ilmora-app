"use client";

import Link from "next/link";
import { useState } from "react";

import MatchPercentBadge from "@/components/matching/match-percent-badge";
import MentorBadgeIcons from "@/components/mentor/mentor-badge-icons";
import type { MentorBadge } from "@/lib/mentor-api";

export type MentorCardData = {
  connectionId: number | null;
  mentorId: number;
  headline: string;
  email: string;
  expertise: string;
  score: number;
  status: string;
  initiatedBy?: string;
  matchedAt?: string;
  badges?: MentorBadge[];
  matchReasons?: string[];
  isSaved?: boolean;
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
    const inviteReceived = initiatedBy === "mentor";
    return (
      <span className="rounded-full bg-amber-500/12 px-2 py-0.5 text-[10px] font-semibold text-amber-800 dark:text-amber-400">
        {inviteReceived ? "Invite" : "Pending"}
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
  data: MentorCardData;
  busy?: boolean;
  onAccept?: (connectionId: number) => void;
  onDecline?: (connectionId: number) => void;
  onConnect?: (mentorId: number) => void;
  onToggleSave?: (mentorId: number) => void;
  onBookSession?: (connectionId: number, label: string) => void;
};

export default function MentorCard({
  data,
  busy,
  onAccept,
  onDecline,
  onConnect,
  onToggleSave,
  onBookSession,
}: Props) {
  const [reasonsOpen, setReasonsOpen] = useState(false);
  const isDiscover = !data.connectionId && data.status !== "connected";
  const inviteReceived =
    data.status === "suggested" && data.initiatedBy === "mentor" && data.connectionId;
  const requestSent =
    data.status === "suggested" && data.initiatedBy === "student" && data.connectionId;
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

      {data.expertise ? (
        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{data.expertise}</p>
      ) : null}

      {data.badges?.length ? (
        <MentorBadgeIcons badges={data.badges} variant="stack" className="mt-2" max={4} />
      ) : null}

      {data.matchReasons?.length ? (
        <div className="mt-2">
          <button
            type="button"
            onClick={() => setReasonsOpen((o) => !o)}
            className="text-[11px] font-medium text-primary hover:underline"
          >
            {reasonsOpen ? "Hide why this mentor" : "Why this mentor?"}
          </button>
          {reasonsOpen ? (
            <ul className="mt-1 list-inside list-disc space-y-0.5 text-[11px] text-muted-foreground">
              {data.matchReasons.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      {data.matchedAt && !isDiscover ? (
        <p className="mt-2 text-[10px] text-muted-foreground">
          {data.initiatedBy === "mentor" ? "Invited" : "Requested"}{" "}
          {new Date(data.matchedAt).toLocaleDateString(undefined, { dateStyle: "medium" })}
        </p>
      ) : null}

      <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-3">
        {onToggleSave ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => onToggleSave(data.mentorId)}
            aria-pressed={Boolean(data.isSaved)}
            className={`rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold disabled:opacity-50 ${
              data.isSaved
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:border-primary/30"
            }`}
          >
            {data.isSaved ? "Saved" : "Save"}
          </button>
        ) : null}
        {connected && data.connectionId ? (
          <>
            <Link
              href={`/dashboard/messages?connection=${data.connectionId}`}
              className="rounded-lg bg-primary px-3 py-1.5 text-[11px] font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Message
            </Link>
            <button
              type="button"
              onClick={() => onBookSession?.(data.connectionId!, data.headline)}
              className="rounded-lg border border-border px-3 py-1.5 text-[11px] font-medium hover:bg-muted"
            >
              Book
            </button>
          </>
        ) : null}
        {inviteReceived && data.connectionId ? (
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
        {requestSent ? (
          <span className="py-1.5 text-[11px] text-muted-foreground">Request sent</span>
        ) : null}
        {isDiscover && !declined ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => onConnect?.(data.mentorId)}
            className="rounded-lg bg-primary px-3 py-1.5 text-[11px] font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {busy ? "Sending…" : "Connect"}
          </button>
        ) : null}
        {declined ? (
          <span className="py-1.5 text-[11px] text-muted-foreground">Declined</span>
        ) : null}
        <Link
          href={`/mentors/${data.mentorId}`}
          className="inline-flex items-center px-1 py-1.5 text-[11px] font-medium text-primary hover:underline"
        >
          Profile →
        </Link>
      </div>
    </article>
  );
}
