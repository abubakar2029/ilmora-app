"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import AppShell from "@/components/app-shell";
import { ApiError, apiFetch } from "@/lib/api";

type StudentPublic = {
  headline: string;
  skills: string;
  goals: string;
  background: string;
};

export default function PublicProfilePage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : params.id?.[0];

  const [profile, setProfile] = useState<StudentPublic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await apiFetch(`/api/profiles/${id}/`, { method: "GET" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new ApiError(res.status, data);
      setProfile(data as StudentPublic);
    } catch (e) {
      setProfile(null);
      setError(e instanceof Error ? e.message : "Profile not found");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl">
        <Link href="/dashboard/inbox" className="text-sm font-medium text-primary hover:underline">
          ← Inbox
        </Link>
        {loading ? (
          <div className="mt-6 h-40 animate-pulse rounded-xl bg-muted/70" />
        ) : error || !profile ? (
          <p className="mt-6 text-sm text-red-500">{error ?? "Not found"}</p>
        ) : (
          <article className="mt-6 rounded-xl border border-border bg-card p-6 shadow-sm">
            <h1 className="text-xl font-bold text-foreground">{profile.headline}</h1>
            <div className="mt-6 space-y-4 text-sm">
              <div>
                <h2 className="font-semibold text-foreground">Goals</h2>
                <p className="mt-1 whitespace-pre-wrap text-muted-foreground">{profile.goals}</p>
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Skills</h2>
                <p className="mt-1 whitespace-pre-wrap text-muted-foreground">{profile.skills}</p>
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Background</h2>
                <p className="mt-1 whitespace-pre-wrap text-muted-foreground">{profile.background}</p>
              </div>
            </div>
          </article>
        )}
      </div>
    </AppShell>
  );
}
