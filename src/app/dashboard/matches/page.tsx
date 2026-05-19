"use client";

import { useCallback, useEffect, useState } from "react";

import { ApiError, apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const API_MENTORS = "/api/matches/mentors/";
const API_STUDENTS = "/api/matches/students/";
const API_MY = "/api/matches/my-connections/";

type MentorMatch = {
  id: number;
  user_id: number;
  headline: string;
  expertise: string;
  score: number;
  connection_id?: number | null;
  connection_status?: string | null;
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

function asArray<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object" && Array.isArray((data as { results?: unknown }).results)) {
    return (data as { results: T[] }).results;
  }
  return [];
}

function scorePercent(score: number): number {
  const p = Math.round(score * 100);
  return Math.min(100, Math.max(0, p));
}

const cardClass =
  "flex flex-col rounded-xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md";

export default function MatchesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const role = typeof user?.role === "string" ? user.role : undefined;

  const [mentors, setMentors] = useState<MentorMatch[]>([]);
  const [students, setStudents] = useState<StudentMatch[]>([]);
  const [connections, setConnections] = useState<UserConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<number | null>(null);

  const loadStudentData = useCallback(async () => {
    const [mRes, cRes] = await Promise.all([
      apiFetch(API_MENTORS, { method: "GET" }),
      apiFetch(API_MY, { method: "GET" }),
    ]);
    const mData = await mRes.json().catch(() => []);
    const cData = await cRes.json().catch(() => []);
    if (!mRes.ok) throw new ApiError(mRes.status, mData);
    if (!cRes.ok) throw new ApiError(cRes.status, cData);
    setMentors(asArray<MentorMatch>(mData));
    setConnections(asArray<UserConnection>(cData));
  }, []);

  const loadMentorData = useCallback(async () => {
    const [sRes, cRes] = await Promise.all([
      apiFetch(API_STUDENTS, { method: "GET" }),
      apiFetch(API_MY, { method: "GET" }),
    ]);
    const sData = await sRes.json().catch(() => []);
    const cData = await cRes.json().catch(() => []);
    if (!sRes.ok) throw new ApiError(sRes.status, sData);
    if (!cRes.ok) throw new ApiError(cRes.status, cData);
    setStudents(asArray<StudentMatch>(sData));
    setConnections(asArray<UserConnection>(cData));
  }, []);

  const loadAll = useCallback(async () => {
    if (role !== "student" && role !== "mentor") {
      setLoading(false);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      if (role === "student") await loadStudentData();
      else await loadMentorData();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load matches");
    } finally {
      setLoading(false);
    }
  }, [role, loadStudentData, loadMentorData]);

  useEffect(() => {
    if (authLoading) return;
    void loadAll();
  }, [authLoading, loadAll]);

  async function connectToMentor(mentorUserId: number) {
    setActionId(mentorUserId);
    setError(null);
    try {
      const res = await apiFetch(`/api/matches/connect/${mentorUserId}/`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new ApiError(res.status, data);
      await loadStudentData();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Connect failed");
    } finally {
      setActionId(null);
    }
  }

  async function updateConnection(matchId: number, status: "connected" | "declined") {
    setActionId(matchId);
    setError(null);
    try {
      const res = await apiFetch(`/api/matches/${matchId}/`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new ApiError(res.status, data);
      await loadMentorData();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setActionId(null);
    }
  }

  const emptyMatches =
    role === "student" ? mentors.length === 0 : role === "mentor" ? students.length === 0 : true;

  if (authLoading || loading) {
    return (
      <>
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 h-9 w-48 animate-pulse rounded-lg bg-muted" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-48 animate-pulse rounded-xl bg-muted/70" />
            ))}
          </div>
        </div>
      </>
    );
  }

  if (role !== "student" && role !== "mentor") {
    return (
      <>
        <div className="mx-auto max-w-5xl">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Matches</h1>
          <p className="mt-2 text-sm text-muted-foreground">Matches are available for student and mentor accounts.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-5xl">
        <header className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-foreground lg:text-3xl">Matches</h1>
          <p className="mt-2 text-sm text-muted-foreground lg:text-base">
            {role === "student"
              ? "Discover mentors aligned with your profile and manage your connections."
              : "Review student suggestions and respond to connection requests."}
          </p>
        </header>

        {error ? (
          <p className="mb-4 text-sm text-red-500" role="alert">
            {error}
          </p>
        ) : null}

        {emptyMatches ? (
          <div className="mb-8 rounded-lg border border-dashed border-border bg-muted/20 px-4 py-6 text-center text-sm text-muted-foreground text-pretty">
            Your matches are being calculated. Complete your profile if you haven&apos;t already.
          </div>
        ) : null}

        {role === "student" ? (
          <section className="mb-12">
            <h2 className="mb-4 text-lg font-semibold text-foreground">Suggested mentors</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {mentors.map((m) => {
                const pct = scorePercent(m.score);
                const st = m.connection_status;
                const requested = st === "suggested";
                const connected = st === "connected";
                const busy = actionId === m.user_id;
                return (
                  <article key={m.user_id} className={cardClass}>
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <h3 className="text-sm font-semibold leading-snug text-foreground">{m.headline}</h3>
                      <span className="shrink-0 rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-semibold text-primary">
                        {pct}% match
                      </span>
                    </div>
                    <p className="line-clamp-2 flex-1 text-xs leading-relaxed text-muted-foreground">{m.expertise}</p>
                    <div className="mt-4">
                      {connected ? (
                        <span className="text-xs font-medium text-primary">Connected</span>
                      ) : requested ? (
                        <span className="text-xs font-medium text-muted-foreground">Requested</span>
                      ) : (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => void connectToMentor(m.user_id)}
                          className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                        >
                          {busy ? "…" : "Connect"}
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ) : (
          <section className="mb-12">
            <h2 className="mb-4 text-lg font-semibold text-foreground">Suggested students</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {students.map((s) => {
                const pct = scorePercent(s.score);
                const st = s.connection_status;
                const suggested = st === "suggested" && s.connection_id != null;
                const connected = st === "connected";
                const declined = st === "declined";
                const busy = s.connection_id != null && actionId === s.connection_id;
                return (
                  <article key={s.user_id} className={cardClass}>
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <h3 className="text-sm font-semibold leading-snug text-foreground">{s.headline}</h3>
                      <span className="shrink-0 rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-semibold text-primary">
                        {pct}% match
                      </span>
                    </div>
                    <p className="line-clamp-2 flex-1 text-xs leading-relaxed text-muted-foreground">{s.goals}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {connected ? (
                        <span className="text-xs font-medium text-primary">Connected</span>
                      ) : suggested ? (
                        <>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => void updateConnection(s.connection_id!, "connected")}
                            className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                          >
                            Accept
                          </button>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => void updateConnection(s.connection_id!, "declined")}
                            className="rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium text-foreground hover:bg-muted disabled:opacity-50"
                          >
                            Decline
                          </button>
                        </>
                      ) : declined ? (
                        <span className="text-xs font-medium text-muted-foreground">Declined</span>
                      ) : (
                        <span className="text-xs text-muted-foreground">Awaiting student request</span>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        <section>
          <h2 className="mb-4 text-lg font-semibold text-foreground">My connections</h2>
          {connections.length === 0 ? (
            <p className="text-sm text-muted-foreground">No accepted connections yet.</p>
          ) : (
            <ul className="space-y-3">
              {connections.map((c) => (
                <li
                  key={c.id}
                  className="flex flex-col gap-1 rounded-lg border border-border bg-card px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <span className="font-medium text-foreground">
                      {role === "student" ? c.mentor_email : c.student_email}
                    </span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      {scorePercent(c.similarity_score)}% · {c.status}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(c.matched_at).toLocaleDateString(undefined, { dateStyle: "medium" })}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
