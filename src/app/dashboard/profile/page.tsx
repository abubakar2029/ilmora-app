"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { ApiError, apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const inputClass =
  "w-full rounded-lg border border-border bg-card px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-ring";

const labelClass = "text-sm font-medium text-foreground";

const PROFILES_ME = "/api/profiles/me/";

export type StudentProfileDto = {
  id: number;
  user: number;
  headline: string;
  skills: string;
  goals: string;
  background: string;
};

export type MentorProfileDto = {
  id: number;
  user: number;
  headline: string;
  expertise: string;
  availability: string;
};

function isStudentProfile(p: StudentProfileDto | MentorProfileDto): p is StudentProfileDto {
  return "goals" in p && "background" in p;
}

function ProcessingBanner({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div
      role="status"
      className="mb-6 flex flex-col gap-2 rounded-lg border border-primary/30 bg-secondary px-4 py-3 text-sm text-secondary-foreground sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="text-pretty">
        Your profile is being processed. Your journey and matches will be ready shortly.
      </p>
      <button
        type="button"
        onClick={onDismiss}
        className="shrink-0 text-xs font-medium text-primary underline-offset-2 hover:underline"
      >
        Dismiss
      </button>
    </div>
  );
}

export default function DashboardProfilePage() {
  const { user, isLoading: authLoading } = useAuth();
  const role = typeof user?.role === "string" ? user.role : undefined;

  const [loadState, setLoadState] = useState<"loading" | "ready">("loading");
  const [profile, setProfile] = useState<StudentProfileDto | MentorProfileDto | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  const [showBanner, setShowBanner] = useState(false);

  const [student, setStudent] = useState({
    headline: "",
    skills: "",
    goals: "",
    background: "",
  });
  const [mentor, setMentor] = useState({
    headline: "",
    expertise: "",
    availability: "",
  });

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const hydrateForm = useCallback((p: StudentProfileDto | MentorProfileDto) => {
    if (isStudentProfile(p)) {
      setStudent({
        headline: p.headline,
        skills: p.skills,
        goals: p.goals,
        background: p.background,
      });
    } else {
      setMentor({
        headline: p.headline,
        expertise: p.expertise,
        availability: p.availability,
      });
    }
  }, []);

  const fetchProfile = useCallback(async () => {
    setLoadError(null);
    setLoadState("loading");
    try {
      const res = await apiFetch(PROFILES_ME, { method: "GET" });
      if (res.status === 404) {
        setProfile(null);
        setEditing(true);
        setLoadState("ready");
        return;
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new ApiError(res.status, body);
      }
      const data = (await res.json()) as StudentProfileDto | MentorProfileDto;
      setProfile(data);
      hydrateForm(data);
      setEditing(false);
      setLoadState("ready");
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Could not load profile");
      setLoadState("ready");
    }
  }, [hydrateForm]);

  useEffect(() => {
    if (authLoading) return;
    void fetchProfile();
  }, [authLoading, fetchProfile]);

  async function parseApiError(e: unknown): Promise<string> {
    if (e instanceof ApiError) {
      const b = e.body as Record<string, unknown>;
      if (typeof b.detail === "string") return b.detail;
      const k = Object.keys(b)[0];
      const v = k ? b[k] : null;
      if (Array.isArray(v) && typeof v[0] === "string") return v[0];
    }
    if (e instanceof Error) return e.message;
    return "Something went wrong";
  }

  async function submitStudent(create: boolean) {
    setSubmitError(null);
    setSubmitting(true);
    try {
      const method = create ? "POST" : "PATCH";
      const res = await apiFetch(PROFILES_ME, {
        method,
        body: JSON.stringify(student),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new ApiError(res.status, data);
      }
      setProfile(data as StudentProfileDto);
      hydrateForm(data as StudentProfileDto);
      setEditing(false);
      setShowBanner(true);
    } catch (e) {
      setSubmitError(await parseApiError(e));
    } finally {
      setSubmitting(false);
    }
  }

  async function submitMentor(create: boolean) {
    setSubmitError(null);
    setSubmitting(true);
    try {
      const method = create ? "POST" : "PATCH";
      const res = await apiFetch(PROFILES_ME, {
        method,
        body: JSON.stringify(mentor),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new ApiError(res.status, data);
      }
      setProfile(data as MentorProfileDto);
      hydrateForm(data as MentorProfileDto);
      setEditing(false);
      setShowBanner(true);
    } catch (e) {
      setSubmitError(await parseApiError(e));
    } finally {
      setSubmitting(false);
    }
  }

  if (authLoading || loadState === "loading") {
    return (
      <>
        <div className="mx-auto max-w-2xl py-8 text-sm text-muted-foreground">Loading profile…</div>
      </>
    );
  }

  if (loadError) {
    return (
      <>
        <div className="mx-auto max-w-2xl py-8">
          <p className="text-sm text-red-500">{loadError}</p>
          <button
            type="button"
            onClick={() => void fetchProfile()}
            className="mt-4 text-sm font-medium text-primary hover:underline"
          >
            Try again
          </button>
        </div>
      </>
    );
  }

  const isAdmin = role === "admin";
  const isStudentRole = role === "student";
  const isMentorRole = role === "mentor";

  return (
    <>
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground lg:text-3xl">Profile</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Set up how others see you. You can update this anytime.
            </p>
          </div>
          <Link href="/dashboard" className="text-sm font-medium text-primary hover:underline">
            ← Dashboard
          </Link>
        </div>

        {showBanner ? <ProcessingBanner onDismiss={() => setShowBanner(false)} /> : null}

        {isAdmin ? (
          <p className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
            Admin accounts do not have a mentor or student profile.
          </p>
        ) : profile === null ? (
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-foreground">Create your profile</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {isStudentRole && "Tell us about your skills and goals."}
              {isMentorRole && "Share how you can help students."}
              {!isStudentRole && !isMentorRole && "Sign in as a student or mentor to create a profile."}
            </p>

            {isStudentRole ? (
              <form
                className="mt-6 flex flex-col gap-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  void submitStudent(true);
                }}
              >
                <Field label="Headline" htmlFor="s-headline">
                  <input
                    id="s-headline"
                    required
                    value={student.headline}
                    onChange={(e) => setStudent((s) => ({ ...s, headline: e.target.value }))}
                    className={inputClass}
                    placeholder="e.g. Computer Science student at XYZ University"
                    disabled={submitting}
                  />
                </Field>
                <Field label="Skills" htmlFor="s-skills">
                  <textarea
                    id="s-skills"
                    required
                    rows={3}
                    value={student.skills}
                    onChange={(e) => setStudent((s) => ({ ...s, skills: e.target.value }))}
                    className={inputClass}
                    placeholder="e.g. Python, Machine Learning, Data Analysis"
                    disabled={submitting}
                  />
                </Field>
                <Field label="Goals" htmlFor="s-goals">
                  <textarea
                    id="s-goals"
                    required
                    rows={3}
                    value={student.goals}
                    onChange={(e) => setStudent((s) => ({ ...s, goals: e.target.value }))}
                    className={inputClass}
                    placeholder="e.g. Land a data science internship, build an ML project"
                    disabled={submitting}
                  />
                </Field>
                <Field label="Background" htmlFor="s-bg">
                  <textarea
                    id="s-bg"
                    required
                    rows={4}
                    value={student.background}
                    onChange={(e) => setStudent((s) => ({ ...s, background: e.target.value }))}
                    className={inputClass}
                    placeholder="e.g. Final year student, studied at..."
                    disabled={submitting}
                  />
                </Field>
                {submitError ? <p className="text-sm text-red-500">{submitError}</p> : null}
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
                >
                  {submitting ? "Saving…" : "Save profile"}
                </button>
              </form>
            ) : null}

            {isMentorRole ? (
              <form
                className="mt-6 flex flex-col gap-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  void submitMentor(true);
                }}
              >
                <Field label="Headline" htmlFor="m-headline">
                  <input
                    id="m-headline"
                    required
                    value={mentor.headline}
                    onChange={(e) => setMentor((m) => ({ ...m, headline: e.target.value }))}
                    className={inputClass}
                    placeholder="e.g. Senior ML engineer, former lecturer"
                    disabled={submitting}
                  />
                </Field>
                <Field label="Expertise" htmlFor="m-exp">
                  <textarea
                    id="m-exp"
                    required
                    rows={4}
                    value={mentor.expertise}
                    onChange={(e) => setMentor((m) => ({ ...m, expertise: e.target.value }))}
                    className={inputClass}
                    placeholder="Areas you mentor in, experience, topics you enjoy teaching"
                    disabled={submitting}
                  />
                </Field>
                <Field label="Availability" htmlFor="m-av">
                  <textarea
                    id="m-av"
                    required
                    rows={3}
                    value={mentor.availability}
                    onChange={(e) => setMentor((m) => ({ ...m, availability: e.target.value }))}
                    className={inputClass}
                    placeholder="e.g. Weekends, 2 hours/week, prefer async"
                    disabled={submitting}
                  />
                </Field>
                {submitError ? <p className="text-sm text-red-500">{submitError}</p> : null}
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
                >
                  {submitting ? "Saving…" : "Save profile"}
                </button>
              </form>
            ) : null}
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-foreground">Your profile</h2>
              {!editing ? (
                <button
                  type="button"
                  onClick={() => {
                    if (profile) hydrateForm(profile);
                    setEditing(true);
                    setSubmitError(null);
                  }}
                  className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted"
                >
                  Edit
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (profile) hydrateForm(profile);
                      setEditing(false);
                      setSubmitError(null);
                    }}
                    className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() =>
                      isStudentProfile(profile) ? void submitStudent(false) : void submitMentor(false)
                    }
                    className="rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
                  >
                    {submitting ? "Saving…" : "Save changes"}
                  </button>
                </div>
              )}
            </div>

            {isStudentProfile(profile) ? (
              <div className="mt-6 flex flex-col gap-4">
                <Field label="Headline" htmlFor="es-headline">
                  <input
                    id="es-headline"
                    readOnly={!editing}
                    value={student.headline}
                    onChange={(e) => setStudent((s) => ({ ...s, headline: e.target.value }))}
                    className={`${inputClass} ${!editing ? "cursor-default bg-muted/40" : ""}`}
                    placeholder="e.g. Computer Science student at XYZ University"
                  />
                </Field>
                <Field label="Skills" htmlFor="es-skills">
                  <textarea
                    id="es-skills"
                    readOnly={!editing}
                    rows={3}
                    value={student.skills}
                    onChange={(e) => setStudent((s) => ({ ...s, skills: e.target.value }))}
                    className={`${inputClass} ${!editing ? "cursor-default resize-none bg-muted/40" : ""}`}
                    placeholder="e.g. Python, Machine Learning, Data Analysis"
                  />
                </Field>
                <Field label="Goals" htmlFor="es-goals">
                  <textarea
                    id="es-goals"
                    readOnly={!editing}
                    rows={3}
                    value={student.goals}
                    onChange={(e) => setStudent((s) => ({ ...s, goals: e.target.value }))}
                    className={`${inputClass} ${!editing ? "cursor-default resize-none bg-muted/40" : ""}`}
                    placeholder="e.g. Land a data science internship, build an ML project"
                  />
                </Field>
                <Field label="Background" htmlFor="es-bg">
                  <textarea
                    id="es-bg"
                    readOnly={!editing}
                    rows={4}
                    value={student.background}
                    onChange={(e) => setStudent((s) => ({ ...s, background: e.target.value }))}
                    className={`${inputClass} ${!editing ? "cursor-default resize-none bg-muted/40" : ""}`}
                    placeholder="e.g. Final year student, studied at..."
                  />
                </Field>
              </div>
            ) : (
              <div className="mt-6 flex flex-col gap-4">
                <Field label="Headline" htmlFor="em-headline">
                  <input
                    id="em-headline"
                    readOnly={!editing}
                    value={mentor.headline}
                    onChange={(e) => setMentor((m) => ({ ...m, headline: e.target.value }))}
                    className={`${inputClass} ${!editing ? "cursor-default bg-muted/40" : ""}`}
                    placeholder="e.g. Senior ML engineer, former lecturer"
                  />
                </Field>
                <Field label="Expertise" htmlFor="em-exp">
                  <textarea
                    id="em-exp"
                    readOnly={!editing}
                    rows={4}
                    value={mentor.expertise}
                    onChange={(e) => setMentor((m) => ({ ...m, expertise: e.target.value }))}
                    className={`${inputClass} ${!editing ? "cursor-default resize-none bg-muted/40" : ""}`}
                    placeholder="Areas you mentor in, experience, topics you enjoy teaching"
                  />
                </Field>
                <Field label="Availability" htmlFor="em-av">
                  <textarea
                    id="em-av"
                    readOnly={!editing}
                    rows={3}
                    value={mentor.availability}
                    onChange={(e) => setMentor((m) => ({ ...m, availability: e.target.value }))}
                    className={`${inputClass} ${!editing ? "cursor-default resize-none bg-muted/40" : ""}`}
                    placeholder="e.g. Weekends, 2 hours/week, prefer async"
                  />
                </Field>
              </div>
            )}

            {submitError ? <p className="mt-4 text-sm text-red-500">{submitError}</p> : null}
          </div>
        )}
      </div>
    </>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className={labelClass}>
        {label}
      </label>
      {children}
    </div>
  );
}
