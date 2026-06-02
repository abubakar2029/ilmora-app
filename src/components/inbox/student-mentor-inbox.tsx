"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import BookSessionModal from "@/components/matching/book-session-modal";
import MentorCard, { type MentorCardData } from "@/components/inbox/mentor-card";
import { InlineLoader, ListSkeleton } from "@/components/ui/loading";
import {
  useInboxMutations,
  useMatchMutations,
  useMatchesBundle,
  useStudentMentorInbox,
  useToggleSaveMentor,
} from "@/hooks/queries";
import type { MentorBadge, StudentMentorInboxItem } from "@/lib/mentor-api";

type MentorMatch = {
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

type Filter = "all" | "suggested" | "connected" | "declined" | "discover" | "saved";

function FilterBar({ filter, setFilter }: { filter: Filter; setFilter: (f: Filter) => void }) {
  const tabs: { id: Filter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "suggested", label: "Pending" },
    { id: "connected", label: "Connected" },
    { id: "declined", label: "Declined" },
    { id: "discover", label: "Discover" },
    { id: "saved", label: "Saved" },
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

function inboxToCard(item: StudentMentorInboxItem): MentorCardData {
  return {
    connectionId: item.id,
    mentorId: item.mentor_id,
    headline: item.mentor_headline || item.mentor_email,
    email: item.mentor_email,
    expertise: item.mentor_expertise,
    score: item.similarity_score,
    status: item.status,
    initiatedBy: item.initiated_by,
    matchedAt: item.matched_at,
    badges: item.badges,
  };
}

function matchToCard(m: MentorMatch): MentorCardData {
  return {
    connectionId: m.connection_id ?? null,
    mentorId: m.user_id,
    headline: m.headline,
    email: "",
    expertise: m.expertise,
    score: m.score,
    status: m.connection_status ?? "discover",
    initiatedBy: m.initiated_by ?? undefined,
    badges: m.badges,
    matchReasons: m.match_reasons,
    isSaved: m.is_saved,
  };
}

function mergeMentors(inbox: StudentMentorInboxItem[], mentors: MentorMatch[]) {
  const inboxCards = inbox.map(inboxToCard);
  const inboxMentorIds = new Set(inbox.map((i) => i.mentor_id));
  const mentorMeta = new Map(mentors.map((m) => [m.user_id, m]));

  const enrichedInbox = inboxCards.map((c) => {
    const m = mentorMeta.get(c.mentorId);
    if (!m) return c;
    return {
      ...c,
      matchReasons: m.match_reasons ?? c.matchReasons,
      isSaved: m.is_saved ?? c.isSaved,
      badges: c.badges?.length ? c.badges : m.badges,
    };
  });

  const discover = mentors
    .filter((m) => !inboxMentorIds.has(m.user_id))
    .map(matchToCard);

  return { inboxCards: enrichedInbox, discover };
}

export default function StudentMentorInbox() {
  const searchParams = useSearchParams();
  const [filter, setFilter] = useState<Filter>(
    searchParams.get("saved") === "1" ? "saved" : "all",
  );
  const [busyId, setBusyId] = useState<number | null>(null);
  const [bookTarget, setBookTarget] = useState<{ connectionId: number; label: string } | null>(
    null,
  );

  const autoFindRan = useRef(false);

  useEffect(() => {
    if (searchParams.get("saved") === "1") setFilter("saved");
  }, [searchParams]);

  const statusFilter =
    filter === "all" || filter === "discover" || filter === "saved" ? undefined : filter;
  const studentInbox = useStudentMentorInbox(statusFilter);
  const { mentors, isFetching: matchesFetching } = useMatchesBundle<
    MentorMatch,
    unknown,
    unknown
  >();
  const { acceptOrDecline } = useInboxMutations();
  const { findMentors, connectToMentor, updateConnection } = useMatchMutations();
  const toggleSave = useToggleSaveMentor();

  useEffect(() => {
    if (searchParams.get("find") !== "1" || autoFindRan.current) return;
    autoFindRan.current = true;
    void findMentors.mutate();
  }, [searchParams, findMentors]);

  const inboxItems = studentInbox.data ?? [];
  const { inboxCards, discover } = useMemo(
    () => mergeMentors(inboxItems, mentors),
    [inboxItems, mentors],
  );

  const displayed = useMemo(() => {
    if (filter === "discover") return discover;
    if (filter === "saved") {
      return [...inboxCards, ...discover].filter((c) => c.isSaved);
    }
    if (filter === "all") return [...inboxCards, ...discover];
    return inboxCards;
  }, [filter, inboxCards, discover]);

  const loading = studentInbox.isLoading;
  const finding = findMentors.isPending;
  const queryError = studentInbox.error;
  const mutationError =
    acceptOrDecline.error ??
    connectToMentor.error ??
    updateConnection.error ??
    findMentors.error ??
    toggleSave.error;
  const error =
    (queryError instanceof Error ? queryError.message : null) ??
    (mutationError instanceof Error ? mutationError.message : null);

  async function runFind() {
    await findMentors.mutateAsync();
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

  async function connect(mentorId: number) {
    setBusyId(mentorId);
    try {
      await connectToMentor.mutateAsync(mentorId);
    } finally {
      setBusyId(null);
    }
  }

  async function handleToggleSave(mentorId: number) {
    setBusyId(mentorId);
    try {
      await toggleSave.mutateAsync(mentorId);
    } finally {
      setBusyId(null);
    }
  }

  function isBusy(data: MentorCardData) {
    return busyId === data.mentorId || busyId === data.connectionId;
  }

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Find mentors, save favorites, accept invites, and message connections — all in one place.
        </p>
        <button
          type="button"
          disabled={finding}
          onClick={() => void runFind()}
          className="shrink-0 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-60"
        >
          {finding ? "Searching…" : "Find mentors"}
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
        <ListSkeleton count={6} itemClassName="h-44 w-full sm:w-[calc(50%-0.375rem)] lg:w-[calc(33.333%-0.5rem)]" />
      ) : displayed.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/80 bg-muted/20 px-6 py-12 text-center">
          <p className="text-sm text-muted-foreground">
            {filter === "discover"
              ? "No new mentor matches yet. Run Find mentors for AI suggestions."
              : filter === "saved"
                ? "No saved mentors yet. Tap Save on a match card to bookmark one."
                : "No mentors in this list yet."}
          </p>
          {filter === "discover" || filter === "all" ? (
            <button
              type="button"
              disabled={finding}
              onClick={() => void runFind()}
              className="mt-4 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
            >
              {finding ? "Searching…" : "Find mentors"}
            </button>
          ) : null}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {displayed.map((data) => (
            <MentorCard
              key={`${data.mentorId}-${data.connectionId ?? "new"}`}
              data={data}
              busy={isBusy(data)}
              onAccept={(id) => void accept(id)}
              onDecline={(id) => void decline(id)}
              onConnect={(id) => void connect(id)}
              onToggleSave={(id) => void handleToggleSave(id)}
              onBookSession={(connectionId, label) => setBookTarget({ connectionId, label })}
            />
          ))}
        </div>
      )}

      {bookTarget ? (
        <BookSessionModal
          open
          connectionId={bookTarget.connectionId}
          mentorLabel={bookTarget.label}
          onClose={() => setBookTarget(null)}
          onBooked={() => setBookTarget(null)}
        />
      ) : null}
    </>
  );
}
