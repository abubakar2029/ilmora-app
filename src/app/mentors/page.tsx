"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import AppShell from "@/components/app-shell";
import MentorBadgeGrid from "@/components/mentor/mentor-badge-grid";
import { listMentors } from "@/lib/mentor-api";

const cardClass =
  "block rounded-xl border border-border bg-card p-5 shadow-sm transition-shadow hover:border-primary/40 hover:shadow-md";

export default function MentorsDirectoryPage() {
  const [mentors, setMentors] = useState<
    { id: number; user: number; headline: string; expertise: string; badges?: { id: string; label: string }[] }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        setMentors(await listMentors());
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load mentors");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl">
        <header className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-foreground lg:text-3xl">Find a mentor</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Browse mentor profiles, see availability, and read their stories.
          </p>
        </header>

        {error ? <p className="text-sm text-red-500">{error}</p> : null}

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 animate-pulse rounded-xl bg-muted/70" />
            ))}
          </div>
        ) : mentors.length === 0 ? (
          <p className="text-sm text-muted-foreground">No mentor profiles yet.</p>
        ) : (
          <ul className="space-y-4">
            {mentors.map((m) => (
              <li key={m.user}>
                <Link href={`/mentors/${m.user}`} className={cardClass}>
                  <h2 className="font-semibold text-foreground">{m.headline}</h2>
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{m.expertise}</p>
                  {m.badges?.length ? (
                    <div className="mt-3">
                      <MentorBadgeGrid badges={m.badges} />
                    </div>
                  ) : null}
                  <span className="mt-3 inline-block text-sm font-semibold text-primary">View profile →</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AppShell>
  );
}
