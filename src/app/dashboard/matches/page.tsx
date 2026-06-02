"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";

import BookSessionModal from "@/components/matching/book-session-modal";
import MatchPercentBadge from "@/components/matching/match-percent-badge";
import { InlineLoader, PageSkeleton } from "@/components/ui/loading";
import MentorBadgeIcons from "@/components/mentor/mentor-badge-icons";
import { useAuth } from "@/context/AuthContext";
import { useMatchMutations, useMatchesBundle, useToggleSaveMentor } from "@/hooks/queries";
import type { MentorBadge } from "@/lib/mentor-api";

type MentorMatch = {
  id: number;
  user_id: number;
  headline: string;
  expertise: string;
  score: number;
  badges?: MentorBadge[];
  connection_id?: number | null;
  connection_status?: string | null;
  initiated_by?: string | null;
  is_saved?: boolean;
  match_reasons?: string[];
};

type StudentMatch = {
  id: number;
  user_id: number;
  headline: string;
  goals: string;
  skills?: string;
  score: number;
  connection_id?: number | null;
  connection_status?: string | null;
  initiated_by?: string | null;
};

type UserConnection = {
  id: number;
  student: number;
  mentor: number;
  student_email: string;
  mentor_email: string;
  similarity_score: number;
  status: string;
  matched_at: string;
};

function scorePercent(score: number): number {
  return Math.min(100, Math.max(0, Math.round(score * 100)));
}

function connectionPill(status: string | null | undefined) {
  if (status === "connected") {
    return (
      <span className="rounded-full bg-emerald-500/12 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
        Connected
      </span>
    );
  }
  if (status === "suggested") {
    return (
      <span className="rounded-full bg-amber-500/12 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800 dark:text-amber-400">
        Pending
      </span>
    );
  }
  if (status === "declined") {
    return (
      <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
        Declined
      </span>
    );
  }
  return null;
}

function MatchesPageContent() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const role = typeof user?.role === "string" ? user.role : undefined;
  const searchParams = useSearchParams();

  useEffect(() => {
    if (authLoading || (role !== "mentor" && role !== "student")) return;
    const saved = searchParams.get("saved") === "1";
    const target = saved ? "/dashboard/inbox?saved=1" : "/dashboard/inbox";
    router.replace(target);
  }, [authLoading, role, router, searchParams]);
  const showSavedOnly = searchParams.get("saved") === "1";

  const { mentors, students, connections, isLoading, isFetching, error } = useMatchesBundle<
    MentorMatch,
    StudentMatch,
    UserConnection
  >();
  const { findMentors, findStudents, connectToMentor, updateConnection, inviteStudent } =
    useMatchMutations();
  const toggleSave = useToggleSaveMentor();
  const [actionId, setActionId] = useState<number | null>(null);
  const [bookTarget, setBookTarget] = useState<{ connectionId: number; label: string } | null>(
    null,
  );

  const finding = findMentors.isPending || findStudents.isPending;
  const errorMessage =
    error ?? (findMentors.error instanceof Error ? findMentors.error.message : null) ??
    (findStudents.error instanceof Error ? findStudents.error.message : null) ??
    (connectToMentor.error instanceof Error ? connectToMentor.error.message : null) ??
    (updateConnection.error instanceof Error ? updateConnection.error.message : null);

  const autoFindRan = useRef(false);
  useEffect(() => {
    if (authLoading || isLoading || autoFindRan.current) return;
    if (typeof window === "undefined") return;
    if (new URLSearchParams(window.location.search).get("find") !== "1") return;
    autoFindRan.current = true;
    if (role === "student") void findMentors.mutate();
    else if (role === "mentor") void findStudents.mutate();
  }, [authLoading, isLoading, role, findMentors, findStudents]);

  async function runFind() {
    if (role === "student") await findMentors.mutateAsync();
    else if (role === "mentor") await findStudents.mutateAsync();
  }

  async function handleConnectToMentor(mentorUserId: number) {
    setActionId(mentorUserId);
    try {
      await connectToMentor.mutateAsync(mentorUserId);
    } finally {
      setActionId(null);
    }
  }

  async function handleUpdateConnection(matchId: number, status: "connected" | "declined") {
    setActionId(matchId);
    try {
      await updateConnection.mutateAsync({ matchId, status });
    } finally {
      setActionId(null);
    }
  }

  const displayedMentors =
    role === "student" && showSavedOnly ? mentors.filter((m) => m.is_saved) : mentors;

  const emptyMatches =
    role === "student"
      ? displayedMentors.length === 0
      : role === "mentor"
        ? students.length === 0
        : true;

  const findLabel = role === "student" ? "Find mentors" : "Find students";

  async function handleToggleSave(mentorUserId: number) {
    setActionId(mentorUserId);
    try {
      await toggleSave.mutateAsync(mentorUserId);
    } finally {
      setActionId(null);
    }
  }

  if (authLoading || isLoading) {
    return <PageSkeleton label="Loading matches…" />;
  }

  if (role === "mentor" || role === "student") {
    return <PageSkeleton label="Opening inbox…" />;
  }

  if (role !== "student" && role !== "mentor") {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-border bg-card p-8 text-center">
        <h1 className="text-lg font-semibold text-foreground">Matches</h1>
        <p className="mt-2 text-sm text-muted-foreground">Available for student and mentor accounts.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-10">
      {isFetching && !finding ? (
        <div className="flex justify-end">
          <InlineLoader label="Refreshing…" className="text-xs" />
        </div>
      ) : null}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link href="/dashboard" className="text-[13px] font-medium text-primary hover:underline">
            ← Dashboard
          </Link>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground lg:text-[1.75rem]">
            {role === "student" ? "Find mentors" : "Student matches"}
          </h1>
          <p className="mt-1.5 max-w-md text-[13px] leading-relaxed text-muted-foreground">
            {role === "student"
              ? "AI-ranked mentors based on your profile. Connect to start a mentorship request."
              : "Review students who align with your expertise."}
          </p>
        </div>
        <button
          type="button"
          disabled={finding}
          onClick={() => void runFind()}
          className="shrink-0 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-60"
        >
          {finding ? "Searching…" : findLabel}
        </button>
      </header>

      {errorMessage ? (
        <p
          className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-600 dark:text-red-400"
          role="alert"
        >
          {errorMessage}
        </p>
      ) : null}

      {emptyMatches ? (
        <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 px-6 py-12 text-center">
          <p className="text-sm text-muted-foreground">
            No suggestions yet. Complete your profile, then run {findLabel.toLowerCase()}.
          </p>
          <button
            type="button"
            disabled={finding}
            onClick={() => void runFind()}
            className="mt-5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            {finding ? "Searching…" : findLabel}
          </button>
        </div>
      ) : null}

      {role === "student" && mentors.length > 0 ? (
        <section>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              {showSavedOnly ? "Saved mentors" : "Suggested for you"}
            </h2>
            <div className="flex gap-2 rounded-full border border-border p-0.5 text-xs font-medium">
              <Link
                href="/dashboard/matches"
                className={`rounded-full px-3 py-1.5 ${!showSavedOnly ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                All
              </Link>
              <Link
                href="/dashboard/matches?saved=1"
                className={`rounded-full px-3 py-1.5 ${showSavedOnly ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                Saved
              </Link>
            </div>
          </div>
          {showSavedOnly && displayedMentors.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border/80 bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">
              No saved mentors yet. Use the bookmark on a match card to save one for later.
            </p>
          ) : null}
          <ul className="space-y-3">
            {displayedMentors.map((m) => {
              const pct = scorePercent(m.score);
              const st = m.connection_status;
              const connected = st === "connected";
              const requested = st === "suggested" && m.initiated_by !== "mentor";
              const invitePending = st === "suggested" && m.initiated_by === "mentor";
              const busy = actionId === m.user_id || actionId === m.connection_id;

              return (
                <li
                  key={m.user_id}
                  className="rounded-xl border border-border bg-card p-5 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex min-w-0 flex-1 gap-3">
                      <div
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-base font-semibold text-primary"
                        aria-hidden
                      >
                        {m.headline.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <Link
                          href={`/mentors/${m.user_id}`}
                          className="text-base font-semibold text-foreground hover:text-primary"
                        >
                          {m.headline}
                        </Link>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => void handleToggleSave(m.user_id)}
                          disabled={actionId === m.user_id}
                          aria-pressed={Boolean(m.is_saved)}
                          aria-label={m.is_saved ? "Remove from saved" : "Save mentor"}
                          className={`rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors disabled:opacity-50 ${
                            m.is_saved
                              ? "border-primary/40 bg-primary/10 text-primary"
                              : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
                          }`}
                        >
                          {m.is_saved ? "Saved" : "Save"}
                        </button>
                        <MatchPercentBadge percent={pct} />
                      </div>
                      {connectionPill(st)}
                    </div>
                  </div>

                  {m.match_reasons?.length ? (
                    <div className="mt-3 rounded-lg border border-primary/15 bg-primary/[0.04] px-3 py-2.5">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-primary/90">
                        Why this mentor?
                      </p>
                      <ul className="mt-1.5 list-inside list-disc space-y-0.5 text-sm text-muted-foreground">
                        {m.match_reasons.map((r) => (
                          <li key={r}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{m.expertise}</p>
                  {m.badges?.length ? (
                    <MentorBadgeIcons badges={m.badges} variant="stack" className="mt-3" max={5} />
                  ) : null}

                  <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-border/60 pt-4">
                        {connected ? (
                          <>
                            <Link
                              href={`/dashboard/messages?connection=${m.connection_id}`}
                              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                            >
                              Message
                            </Link>
                            <button
                              type="button"
                              onClick={() =>
                                setBookTarget({
                                  connectionId: m.connection_id!,
                                  label: m.headline,
                                })
                              }
                              className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
                            >
                              Book session
                            </button>
                          </>
                        ) : invitePending && m.connection_id ? (
                          <>
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => void handleUpdateConnection(m.connection_id!, "connected")}
                              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                            >
                              Accept
                            </button>
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => void handleUpdateConnection(m.connection_id!, "declined")}
                              className="rounded-lg border border-border px-4 py-2 text-sm font-medium disabled:opacity-50"
                            >
                              Decline
                            </button>
                          </>
                        ) : requested ? (
                          <span className="text-sm text-muted-foreground">Request sent — awaiting mentor</span>
                        ) : (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void handleConnectToMentor(m.user_id)}
                        className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                      >
                        {busy ? "Sending…" : "Connect"}
                      </button>
                    )}
                    <Link
                      href={`/mentors/${m.user_id}`}
                      className="text-sm font-medium text-muted-foreground hover:text-foreground"
                    >
                      View profile →
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {role === "mentor" && students.length > 0 ? (
        <section>
          <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Suggested students
          </h2>
          <ul className="space-y-3">
            {students.map((s) => {
              const pct = scorePercent(s.score);
              const st = s.connection_status;
              const suggested =
                st === "suggested" &&
                s.connection_id != null &&
                s.initiated_by === "student";
              const inviteSent = st === "suggested" && s.initiated_by === "mentor";
              const connected = st === "connected";
              const declined = st === "declined";
              const noConnection = !s.connection_id && st !== "connected";
              const busy =
                actionId === s.user_id ||
                (s.connection_id != null && actionId === s.connection_id);

              return (
                <li key={s.user_id} className="rounded-xl border border-border bg-card p-5 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <h3 className="min-w-0 flex-1 text-base font-semibold text-foreground">{s.headline}</h3>
                    <div className="flex flex-col items-end gap-2">
                      <MatchPercentBadge percent={pct} />
                      {connectionPill(st)}
                    </div>
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{s.goals}</p>
                  <div className="mt-4 flex flex-wrap gap-2 border-t border-border/60 pt-4">
                    {connected ? (
                      <Link
                        href={`/dashboard/messages?connection=${s.connection_id}`}
                        className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
                      >
                        Message
                      </Link>
                    ) : suggested ? (
                      <>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => void handleUpdateConnection(s.connection_id!, "connected")}
                          className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-50"
                        >
                          Accept
                        </button>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => void handleUpdateConnection(s.connection_id!, "declined")}
                          className="rounded-full border border-border px-4 py-2 text-xs font-medium disabled:opacity-50"
                        >
                          Decline
                        </button>
                      </>
                    ) : inviteSent ? (
                      <span className="text-sm text-muted-foreground">Invitation sent</span>
                    ) : declined ? (
                      <span className="text-sm text-muted-foreground">Declined</span>
                    ) : noConnection ? (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void inviteStudent.mutateAsync(s.user_id)}
                        className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-50"
                      >
                        {busy ? "Sending…" : "Invite to connect"}
                      </button>
                    ) : (
                      <span className="text-sm text-muted-foreground">Awaiting request</span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <h2 className="text-base font-semibold text-foreground">Active connections</h2>
        {connections.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">None yet — connect and get accepted to appear here.</p>
        ) : (
          <ul className="mt-4 divide-y divide-border/60">
            {connections.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0 last:pb-0">
                <span className="font-medium text-foreground">
                  {role === "student" ? c.mentor_email : c.student_email}
                </span>
                <div className="flex items-center gap-3">
                  <Link
                    href={`/dashboard/messages?connection=${c.id}`}
                    className="text-sm font-semibold text-primary hover:underline"
                  >
                    Message
                  </Link>
                  {role === "student" ? (
                    <button
                      type="button"
                      onClick={() =>
                        setBookTarget({
                          connectionId: c.id,
                          label: c.mentor_email,
                        })
                      }
                      className="text-sm font-medium text-muted-foreground hover:text-foreground"
                    >
                      Book session
                    </button>
                  ) : null}
                  <span className="text-xs text-muted-foreground">
                    {scorePercent(c.similarity_score)}% match ·{" "}
                    {new Date(c.matched_at).toLocaleDateString(undefined, { dateStyle: "medium" })}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {bookTarget ? (
        <BookSessionModal
          open
          connectionId={bookTarget.connectionId}
          mentorLabel={bookTarget.label}
          onClose={() => setBookTarget(null)}
          onBooked={() => setBookTarget(null)}
        />
      ) : null}
    </div>
  );
}

export default function MatchesPage() {
  return (
    <Suspense fallback={<PageSkeleton label="Loading matches…" />}>
      <MatchesPageContent />
    </Suspense>
  );
}
