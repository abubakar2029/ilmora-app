"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import MenteeCard, { type MenteeCardData } from "@/components/inbox/mentee-card";
import { InlineLoader, ListSkeleton } from "@/components/ui/loading";
import { useInboxMutations, useMatchMutations, useMatchesBundle, useMentorInbox } from "@/hooks/queries";
import type { MenteeInboxItem } from "@/lib/mentor-api";

type StudentMatch = {
  user_id: number;
  headline: string;
  goals: string;
  score: number;
  connection_id?: number | null;
  connection_status?: string | null;
  initiated_by?: string | null;
};

type Filter = "all" | "suggested" | "connected" | "declined" | "discover";

function FilterBar({ filter, setFilter }: { filter: Filter; setFilter: (f: Filter) => void }) {
  const tabs: { id: Filter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "suggested", label: "Pending" },
    { id: "connected", label: "Connected" },
    { id: "declined", label: "Declined" },
    { id: "discover", label: "Discover" },
  ];
  return (
    <div className="mb-5 flex flex-wrap gap-2">
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => setFilter(t.id)}
          className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
            filter === t.id
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

function inboxToCard(item: MenteeInboxItem): MenteeCardData {
  return {
    connectionId: item.id,
    studentId: item.student_id,
    headline: item.student_headline || item.student_email,
    email: item.student_email,
    goals: item.student_goals,
    score: item.similarity_score,
    status: item.status,
    initiatedBy: item.initiated_by,
    mentorNote: item.mentor_note,
    matchedAt: item.matched_at,
  };
}

function matchToCard(s: StudentMatch): MenteeCardData {
  return {
    connectionId: s.connection_id ?? null,
    studentId: s.user_id,
    headline: s.headline,
    email: "",
    goals: s.goals,
    score: s.score,
    status: s.connection_status ?? "discover",
    initiatedBy: s.initiated_by ?? undefined,
  };
}

function mergeMentees(inbox: MenteeInboxItem[], students: StudentMatch[]) {
  const inboxCards = inbox.map(inboxToCard);
  const inboxStudentIds = new Set(inbox.map((i) => i.student_id));
  const discover = students
    .filter((s) => !inboxStudentIds.has(s.user_id))
    .map(matchToCard);
  return { inboxCards, discover };
}

export default function MentorMenteeInbox() {
  const searchParams = useSearchParams();
  const [filter, setFilter] = useState<Filter>("all");
  const [busyId, setBusyId] = useState<number | null>(null);
  const autoFindRan = useRef(false);

  const statusFilter = filter === "all" || filter === "discover" ? undefined : filter;
  const mentorInbox = useMentorInbox(statusFilter);
  const { students, isFetching: matchesFetching } = useMatchesBundle<
    unknown,
    StudentMatch,
    unknown
  >();
  const { acceptOrDecline, saveNote } = useInboxMutations();
  const { findStudents, inviteStudent, updateConnection } = useMatchMutations();

  useEffect(() => {
    if (searchParams.get("find") !== "1" || autoFindRan.current) return;
    autoFindRan.current = true;
    void findStudents.mutate();
  }, [searchParams, findStudents]);

  const inboxItems = mentorInbox.data ?? [];
  const { inboxCards, discover } = useMemo(
    () => mergeMentees(inboxItems, students),
    [inboxItems, students],
  );

  const displayed = useMemo(() => {
    if (filter === "discover") return discover;
    if (filter === "all") return [...inboxCards, ...discover];
    return inboxCards;
  }, [filter, inboxCards, discover]);

  const loading = mentorInbox.isLoading;
  const finding = findStudents.isPending;
  const queryError = mentorInbox.error;
  const mutationError =
    acceptOrDecline.error ??
    saveNote.error ??
    inviteStudent.error ??
    updateConnection.error ??
    findStudents.error;
  const error =
    (queryError instanceof Error ? queryError.message : null) ??
    (mutationError instanceof Error ? mutationError.message : null);

  async function runFind() {
    await findStudents.mutateAsync();
  }

  async function accept(connectionId: number) {
    setBusyId(connectionId);
    try {
      await acceptOrDecline.mutateAsync({ matchId: connectionId, status: "connected" });
    } finally {
      setBusyId(null);
    }
  }

  async function decline(connectionId: number) {
    setBusyId(connectionId);
    try {
      await acceptOrDecline.mutateAsync({ matchId: connectionId, status: "declined" });
    } finally {
      setBusyId(null);
    }
  }

  async function invite(studentId: number) {
    setBusyId(studentId);
    try {
      await inviteStudent.mutateAsync(studentId);
    } finally {
      setBusyId(null);
    }
  }

  async function handleSaveNote(connectionId: number, note: string) {
    setBusyId(connectionId);
    try {
      await saveNote.mutateAsync({ matchId: connectionId, note });
    } finally {
      setBusyId(null);
    }
  }

  function isBusy(data: MenteeCardData) {
    return (
      busyId === data.connectionId ||
      busyId === data.studentId ||
      (data.connectionId != null && busyId === data.connectionId)
    );
  }

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Review requests, message mentees, and discover new student matches in one place.
        </p>
        <button
          type="button"
          disabled={finding}
          onClick={() => void runFind()}
          className="shrink-0 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-60"
        >
          {finding ? "Searching…" : "Find students"}
        </button>
      </div>

      {matchesFetching && !finding ? (
        <div className="mb-3 flex justify-end">
          <InlineLoader label="Refreshing matches…" className="text-xs" />
        </div>
      ) : null}

      <FilterBar filter={filter} setFilter={setFilter} />

      {error ? (
        <p className="mb-4 text-sm text-red-500" role="alert">
          {error}
        </p>
      ) : null}

      {loading ? (
        <ListSkeleton count={6} itemClassName="h-40 w-full sm:w-[calc(50%-0.375rem)] lg:w-[calc(33.333%-0.5rem)]" />
      ) : displayed.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/80 bg-muted/20 px-6 py-12 text-center">
          <p className="text-sm text-muted-foreground">
            {filter === "discover"
              ? "No new student matches yet. Run Find students to get AI suggestions."
              : "No mentees in this list yet."}
          </p>
          {filter === "discover" || filter === "all" ? (
            <button
              type="button"
              disabled={finding}
              onClick={() => void runFind()}
              className="mt-4 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
            >
              {finding ? "Searching…" : "Find students"}
            </button>
          ) : null}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {displayed.map((data) => (
            <MenteeCard
              key={`${data.studentId}-${data.connectionId ?? "new"}`}
              data={data}
              busy={isBusy(data)}
              onAccept={(id) => void accept(id)}
              onDecline={(id) => void decline(id)}
              onInvite={(id) => void invite(id)}
              onSaveNote={(id, note) => void handleSaveNote(id, note)}
            />
          ))}
        </div>
      )}
    </>
  );
}
