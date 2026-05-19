"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

import { getAccessToken, setAccessTokenFromSession } from "@/lib/auth";
import { useAuth } from "@/context/AuthContext";

function RoleOnboardingInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { syncUser } = useAuth();
  const [role, setRole] = useState<"student" | "mentor">("student");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const next = searchParams.get("next");
  const after = next && next.startsWith("/") ? next : "/dashboard/profile";

  async function handleContinue(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const token = getAccessToken();
      const res = await fetch("/api/auth/me/role", {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ role }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const detail =
          typeof (data as { detail?: unknown }).detail === "string"
            ? (data as { detail: string }).detail
            : "Could not save account type";
        throw new Error(detail);
      }
      const access = typeof (data as { access?: unknown }).access === "string" ? (data as { access: string }).access : null;
      if (access) {
        setAccessTokenFromSession(access);
      }
      syncUser();
      router.replace(after);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
      <div className="mb-8 text-center">
        <span className="text-2xl font-bold tracking-tight text-primary">ilmora</span>
        <h1 className="mt-4 text-xl font-bold tracking-tight text-foreground">How will you use ilmora?</h1>
        <p className="mt-2 text-sm text-muted-foreground text-pretty">
          Choose your account type. This cannot be changed later from the profile page.
        </p>
      </div>

      <form onSubmit={handleContinue} className="flex flex-col gap-4">
        <fieldset className="grid gap-3 sm:grid-cols-2">
          <label
            className={`flex cursor-pointer flex-col rounded-xl border-2 p-4 transition-colors ${
              role === "student" ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
            }`}
          >
            <input
              type="radio"
              name="role"
              value="student"
              checked={role === "student"}
              onChange={() => setRole("student")}
              className="sr-only"
            />
            <span className="text-sm font-semibold text-foreground">Student</span>
            <span className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Personalized journey, mentor matches, and story feed.
            </span>
          </label>
          <label
            className={`flex cursor-pointer flex-col rounded-xl border-2 p-4 transition-colors ${
              role === "mentor" ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
            }`}
          >
            <input
              type="radio"
              name="role"
              value="mentor"
              checked={role === "mentor"}
              onChange={() => setRole("mentor")}
              className="sr-only"
            />
            <span className="text-sm font-semibold text-foreground">Mentor</span>
            <span className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Connect with students and share your expertise.
            </span>
          </label>
        </fieldset>

        {error ? <p className="text-sm text-red-500">{error}</p> : null}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
        >
          {submitting ? "Saving…" : "Continue"}
        </button>
      </form>
    </div>
  );
}

export default function RoleOnboardingPage() {
  return (
    <div className="min-h-dvh bg-background px-4 py-12">
      <div className="mx-auto w-full max-w-lg">
        <Suspense
          fallback={
            <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground shadow-sm">
              Loading…
            </div>
          }
        >
          <RoleOnboardingInner />
        </Suspense>
      </div>
    </div>
  );
}
