"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import AppShell from "@/components/app-shell";
import BookSessionModal from "@/components/matching/book-session-modal";
import AvailabilityCalendar from "@/components/mentor/availability-calendar";
import MentorBadgeGrid from "@/components/mentor/mentor-badge-grid";
import MentorSocialLinks from "@/components/mentor/mentor-social-links";
import { ApiError, apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { getPublicMentor, type PublicMentorProfile } from "@/lib/mentor-api";

export default function PublicMentorPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const id = Number(typeof params.id === "string" ? params.id : params.id?.[0]);

  const [mentor, setMentor] = useState<PublicMentorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [bookOpen, setBookOpen] = useState(false);

  const load = useCallback(async () => {
    if (!id || Number.isNaN(id)) return;
    setLoading(true);
    setError(null);
    try {
      setMentor(await getPublicMentor(id));
    } catch (e) {
      setMentor(null);
      setError(e instanceof Error ? e.message : "Mentor not found");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleConnect() {
    if (!mentor) return;
    setConnecting(true);
    setError(null);
    try {
      const res = await apiFetch(`/api/matches/connect/${mentor.user_id}/`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new ApiError(res.status, data);
      router.push("/dashboard/inbox");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Connect failed");
    } finally {
      setConnecting(false);
    }
  }

  const isStudent = user?.role === "student";

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl">
        {loading ? (
          <div className="h-64 animate-pulse rounded-xl bg-muted/70" />
        ) : error || !mentor ? (
          <div>
            <p className="text-sm text-red-500">{error ?? "Not found"}</p>
            <Link href="/blogs" className="mt-4 inline-block text-sm font-medium text-primary hover:underline">
              ← Back to stories
            </Link>
          </div>
        ) : (
          <>
            <Link href="/blogs" className="text-sm font-medium text-muted-foreground hover:text-primary">
              ← All stories
            </Link>

            <header className="mt-4 border-b border-border pb-6">
              <h1 className="text-2xl font-bold tracking-tight text-foreground lg:text-3xl">{mentor.headline}</h1>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                {mentor.expertise}
              </p>
              {mentor.availability ? (
                <p className="mt-3 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-sm text-foreground">
                  <span className="font-semibold text-primary">Weekly availability: </span>
                  {mentor.availability}
                </p>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">Weekly hours not set yet.</p>
              )}
              <p className="mt-2 text-xs text-muted-foreground">
                {mentor.connected_mentees_count} active mentee
                {mentor.connected_mentees_count === 1 ? "" : "s"}
              </p>
              <MentorSocialLinks links={mentor} className="mt-4" />
            </header>

            <section className="mt-6">
              <h2 className="text-sm font-semibold text-foreground">Badges</h2>
              <div className="mt-3">
                <MentorBadgeGrid badges={mentor.badges} />
              </div>
            </section>

            <section className="mt-8 rounded-xl border border-border bg-card p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-foreground">Weekly calendar</h2>
              <div className="mt-4">
                <AvailabilityCalendar slots={mentor.availability_slots} onChange={() => {}} readOnly />
              </div>
            </section>

            {mentor.published_stories.length > 0 ? (
              <section className="mt-8">
                <h2 className="text-lg font-semibold text-foreground">Published stories</h2>
                <ul className="mt-4 space-y-3">
                  {mentor.published_stories.map((s) => (
                    <li key={s.id}>
                      <Link
                        href={`/blogs/${s.id}`}
                        className="block rounded-lg border border-border bg-card px-4 py-3 text-sm font-medium text-foreground hover:border-primary/40 hover:bg-primary/5"
                      >
                        {s.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {isStudent ? (
              <div className="mt-8 rounded-xl border border-primary/30 bg-primary/5 p-6">
                {mentor.connection_status === "connected" && mentor.connection_id ? (
                  <>
                    <h2 className="text-sm font-semibold text-foreground">You are connected</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Message or book a session — both of you will be notified by email.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Link
                        href={`/dashboard/messages?connection=${mentor.connection_id}`}
                        className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                      >
                        Message
                      </Link>
                      <button
                        type="button"
                        onClick={() => setBookOpen(true)}
                        className="rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-semibold hover:bg-muted"
                      >
                        Book session
                      </button>
                    </div>
                    {bookOpen ? (
                      <BookSessionModal
                        open
                        connectionId={mentor.connection_id}
                        mentorLabel={mentor.headline}
                        onClose={() => setBookOpen(false)}
                      />
                    ) : null}
                  </>
                ) : mentor.connection_status === "suggested" ? (
                  <>
                    <h2 className="text-sm font-semibold text-foreground">Connection pending</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Your request is waiting for the mentor, or check your inbox for an invitation.
                    </p>
                    <Link
                      href="/dashboard/inbox"
                      className="mt-4 inline-block text-sm font-semibold text-primary hover:underline"
                    >
                      Open inbox →
                    </Link>
                  </>
                ) : (
                  <>
                    <h2 className="text-sm font-semibold text-foreground">Connect with this mentor</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Send a connection request from your student account.
                    </p>
                    {error ? (
                      <p className="mt-2 text-sm text-red-500" role="alert">
                        {error}
                      </p>
                    ) : null}
                    <button
                      type="button"
                      disabled={connecting}
                      onClick={() => void handleConnect()}
                      className="mt-4 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
                    >
                      {connecting ? "Sending…" : "Request connection"}
                    </button>
                  </>
                )}
              </div>
            ) : !user ? (
              <p className="mt-8 text-sm text-muted-foreground">
                <Link href="/login" className="font-medium text-primary hover:underline">
                  Sign in as a student
                </Link>{" "}
                to connect with this mentor.
              </p>
            ) : null}
          </>
        )}
      </div>
    </AppShell>
  );
}
