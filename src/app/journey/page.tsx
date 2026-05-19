"use client";

import { useCallback, useEffect, useState } from "react";

import AppShell from "@/components/app-shell";
import JourneyRoadmap, { type JourneyStep } from "@/components/journey-roadmap";
import { ToastProvider, useToast } from "@/components/toast";
import { ApiError, apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const JOURNEY_API = "/api/journey/";
const JOURNEY_REGENERATE = "/api/journey/regenerate/";

const STATUSES = new Set<JourneyStep["status"]>(["completed", "active", "upcoming"]);

function normalizeJourneyPayload(data: unknown): JourneyStep[] {
  const raw = Array.isArray(data) ? data : [];
  const out: JourneyStep[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const id = typeof o.id === "number" ? o.id : Number(o.id);
    const title = typeof o.title === "string" ? o.title : "";
    const description = typeof o.description === "string" ? o.description : "";
    const status = o.status;
    const color = typeof o.color === "string" ? o.color : "pink";
    if (!Number.isFinite(id) || !title) continue;
    if (typeof status !== "string" || !STATUSES.has(status as JourneyStep["status"])) continue;
    out.push({
      id,
      title,
      description,
      status: status as JourneyStep["status"],
      color,
    });
  }
  return out;
}

function JourneySkeleton() {
  return (
    <div className="w-full animate-pulse py-8" aria-busy="true" aria-label="Loading journey">
      <div className="hidden md:block">
        <div className="mb-6 flex gap-10">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 min-w-[240px] flex-1 rounded-xl bg-muted/60" />
          ))}
        </div>
        <div className="mx-8 h-0.5 bg-muted/40" />
        <div className="mt-6 flex gap-10 pl-[140px]">
          {[1, 2].map((i) => (
            <div key={i} className="h-40 min-w-[240px] flex-1 rounded-xl bg-muted/60" />
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-6 md:hidden">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="mx-auto h-36 w-full max-w-xs rounded-xl bg-muted/60" />
        ))}
      </div>
    </div>
  );
}

function JourneyContent() {
  const { isLoading: authLoading } = useAuth();
  const { showToast } = useToast();

  const [steps, setSteps] = useState<JourneyStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState(false);

  const loadJourney = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await apiFetch(JOURNEY_API, { method: "GET" });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new ApiError(res.status, data);
      }
      setSteps(normalizeJourneyPayload(data));
    } catch (e) {
      const msg = e instanceof ApiError ? String((e.body as { detail?: string })?.detail ?? e.message) : "Could not load journey";
      setError(typeof msg === "string" ? msg : "Could not load journey");
      setSteps([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    void loadJourney();
  }, [authLoading, loadJourney]);

  const empty = !loading && steps.length === 0;

  async function onRegenerate() {
    setRegenerating(true);
    try {
      const res = await apiFetch(JOURNEY_REGENERATE, { method: "POST" });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new ApiError(res.status, body);
      }
      showToast("Regenerating your journey... refresh in a few seconds", "success");
      setSteps([]);
    } catch (e) {
      const msg =
        e instanceof ApiError ? String((e.body as { detail?: string })?.detail ?? e.message) : "Regeneration failed";
      showToast(msg, "error");
    } finally {
      setRegenerating(false);
    }
  }

  return (
    <div className="relative w-full">
        {!loading && steps.length > 0 ? (
          <button
            type="button"
            onClick={() => void onRegenerate()}
            disabled={regenerating}
            className="absolute right-0 top-0 z-20 text-xs font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline disabled:opacity-50"
          >
            {regenerating ? "Regenerating…" : "Regenerate Journey"}
          </button>
        ) : null}

        {loading ? (
          <JourneySkeleton />
        ) : error ? (
          <div className="rounded-xl border border-border bg-card px-6 py-10 text-center">
            <p className="text-sm text-red-500">{error}</p>
            <button
              type="button"
              onClick={() => void loadJourney()}
              className="mt-4 text-sm font-medium text-primary hover:underline"
            >
              Try again
            </button>
          </div>
        ) : empty ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 px-6 py-16 text-center">
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground text-pretty">
              Your personalized journey is being prepared. Check back in a moment.
            </p>
            <button
              type="button"
              onClick={() => void loadJourney()}
              className="mt-6 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              Refresh
            </button>
          </div>
        ) : (
          <JourneyRoadmap steps={steps} />
        )}
      </div>
  );
}

export default function MyJourneyPage() {
  return (
    <AppShell>
      <ToastProvider>
        <div className="mx-auto">
          <header className="mb-10">
            <h1 className="text-2xl font-bold tracking-tight text-foreground lg:text-3xl text-balance">My Journey</h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground lg:text-base text-pretty">
              Track your progress, see where you are, and discover what comes next. Every step brings more clarity.
            </p>
          </header>

          <JourneyContent />

          {/* Legend */}
          <div className="mt-10 flex flex-wrap items-center gap-5 rounded-lg border border-border bg-card px-5 py-4">
            <div className="flex items-center gap-2">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary">
                <svg
                  className="h-2.5 w-2.5 text-primary-foreground"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </span>
              <span className="text-xs text-muted-foreground">Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-primary" />
              </span>
              <span className="text-xs text-muted-foreground">Active</span>
            </div>
            <div className="flex items-center gap-2">
              <svg
                className="h-4 w-4 text-muted-foreground"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span className="text-xs text-muted-foreground">Upcoming</span>
            </div>
          </div>
        </div>
      </ToastProvider>
    </AppShell>
  );
}
