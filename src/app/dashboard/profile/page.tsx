"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import AccountTypeBadge from "@/components/profile/account-type-badge";
import AdminProfileNotice from "@/components/profile/admin-profile-notice";
import type { MentorBadge } from "@/lib/mentor-api";
import { ProfileAiNotice, ProfileFieldInput } from "@/components/profile/profile-field";
import { ApiError, apiFetch } from "@/lib/api";
import {
  MENTOR_PROFILE_FORM_FIELDS,
  STUDENT_PROFILE_FIELDS,
  type ProfileFieldDef,
} from "@/lib/profile-fields";
import { useAuth } from "@/context/AuthContext";

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
  availability_slots?: { weekday: number; start: string; end: string }[];
  badges?: MentorBadge[];
};

function isStudentProfile(p: StudentProfileDto | MentorProfileDto): p is StudentProfileDto {
  return "goals" in p && "background" in p;
}

function ProcessingBanner({ onDismiss, role }: { onDismiss: () => void; role?: string }) {
  return (
    <div
      role="status"
      className="mb-6 flex flex-col gap-3 rounded-lg border border-primary/30 bg-secondary px-4 py-3 text-sm text-secondary-foreground"
    >
      <p className="text-pretty">
        Profile saved. Run matching now — no need to wait for background processing.
      </p>
      <div className="flex flex-wrap gap-2">
        {role === "student" ? (
          <>
            <Link
              href="/dashboard/inbox?find=1"
              className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Find mentors
            </Link>
            <Link
              href="/dashboard/my-feed?find=1"
              className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted"
            >
              Find blogs
            </Link>
          </>
        ) : role === "mentor" ? (
          <>
            <Link
              href="/dashboard/inbox"
              className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Mentee inbox
            </Link>
            <Link
              href="/dashboard/inbox?find=1"
              className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted"
            >
              Find students
            </Link>
          </>
        ) : null}
        <button
          type="button"
          onClick={onDismiss}
          className="px-1 text-xs font-medium text-primary underline-offset-2 hover:underline"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}

export default function DashboardProfilePage() {
  const router = useRouter();
  const { user, isLoading: authLoading, syncUser } = useAuth();
  const role = typeof user?.role === "string" ? user.role : undefined;

  const [loadState, setLoadState] = useState<"loading" | "ready">("loading");
  const [profile, setProfile] = useState<StudentProfileDto | MentorProfileDto | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  const [student, setStudent] = useState({ headline: "", skills: "", goals: "", background: "" });
  const [mentor, setMentor] = useState({ headline: "", expertise: "" });
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const hydrateForm = useCallback((p: StudentProfileDto | MentorProfileDto) => {
    if (isStudentProfile(p)) {
      setStudent({ headline: p.headline, skills: p.skills, goals: p.goals, background: p.background });
    } else {
      setMentor({ headline: p.headline, expertise: p.expertise });
    }
  }, []);

  const checkRoleOnboarding = useCallback(async () => {
    const res = await apiFetch("/api/auth/me/", { method: "GET" });
    if (!res.ok) return;
    const data = (await res.json()) as { needs_role_selection?: boolean };
    if (data.needs_role_selection) {
      router.replace("/onboarding/role?next=/dashboard/profile");
    }
  }, [router]);

  const fetchProfile = useCallback(async () => {
    setLoadError(null);
    setLoadState("loading");
    try {
      await checkRoleOnboarding();
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
  }, [hydrateForm, checkRoleOnboarding]);

  useEffect(() => {
    if (authLoading) return;
    if (role === "mentor" || role === "student") {
      router.replace("/dashboard");
      return;
    }
    void fetchProfile();
  }, [authLoading, fetchProfile, role, router]);

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

  function studentValue(id: string): string {
    return student[id as keyof typeof student] ?? "";
  }

  function setStudentField(id: string, value: string) {
    setStudent((s) => ({ ...s, [id]: value }));
  }

  function mentorValue(id: string): string {
    return mentor[id as keyof typeof mentor] ?? "";
  }

  function setMentorField(id: string, value: string) {
    setMentor((m) => ({ ...m, [id]: value }));
  }

  async function submitStudent(create: boolean) {
    setSubmitError(null);
    setSubmitting(true);
    try {
      const res = await apiFetch(PROFILES_ME, {
        method: create ? "POST" : "PATCH",
        body: JSON.stringify(student),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new ApiError(res.status, data);
      setProfile(data as StudentProfileDto);
      hydrateForm(data as StudentProfileDto);
      setEditing(false);
      setShowBanner(true);
      syncUser();
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
      const res = await apiFetch(PROFILES_ME, {
        method: create ? "POST" : "PATCH",
        body: JSON.stringify(mentor),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new ApiError(res.status, data);
      setProfile(data as MentorProfileDto);
      hydrateForm(data as MentorProfileDto);
      setEditing(false);
      setShowBanner(true);
      syncUser();
    } catch (e) {
      setSubmitError(await parseApiError(e));
    } finally {
      setSubmitting(false);
    }
  }

  function renderFields(
    fields: ProfileFieldDef[],
    getValue: (id: string) => string,
    setValue: (id: string, v: string) => void,
    readOnly: boolean,
    idPrefix: string,
  ) {
    return fields.map((field) => (
      <ProfileFieldInput
        key={field.id}
        field={field}
        value={getValue(field.id)}
        onChange={(v) => setValue(field.id, v)}
        readOnly={readOnly}
        disabled={submitting}
        idPrefix={idPrefix}
      />
    ));
  }

  if (authLoading || loadState === "loading") {
    return <div className="mx-auto max-w-2xl py-8 text-sm text-muted-foreground">Loading profile…</div>;
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-2xl py-8">
        <p className="text-sm text-red-500">{loadError}</p>
        <button type="button" onClick={() => void fetchProfile()} className="mt-4 text-sm font-medium text-primary hover:underline">
          Try again
        </button>
      </div>
    );
  }

  const isAdmin = role === "admin";
  const isStudentRole = role === "student";
  const isMentorRole = role === "mentor";
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground lg:text-3xl">Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isMentorRole
            ? "Edit your headline, expertise, and weekly hours."
            : "Tell us about yourself so we can personalize matches and your journey."}
        </p>
      </div>

      {showBanner ? <ProcessingBanner onDismiss={() => setShowBanner(false)} role={role} /> : null}

      <AccountTypeBadge role={role} />

      {isAdmin ? (
        <AdminProfileNotice />
      ) : profile === null ? (
        <div className="mt-6 rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">Complete your profile</h2>
          <p className="mt-1 text-sm text-muted-foreground">Required before matches and journey features unlock.</p>
          <div className="mt-4">
            <ProfileAiNotice />
          </div>
          {isStudentRole || isMentorRole ? (
            <form
              className="mt-6 flex flex-col gap-5"
              onSubmit={(e) => {
                e.preventDefault();
                void (isStudentRole ? submitStudent(true) : submitMentor(true));
              }}
            >
              {isStudentRole
                ? renderFields(STUDENT_PROFILE_FIELDS, studentValue, setStudentField, false, "c-")
                : renderFields(MENTOR_PROFILE_FORM_FIELDS, mentorValue, setMentorField, false, "c-")}
              {submitError ? <p className="text-sm text-red-500">{submitError}</p> : null}
              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
              >
                {submitting ? "Saving…" : "Save profile"}
              </button>
            </form>
          ) : (
            <p className="mt-6 text-sm text-muted-foreground">
              <Link href="/onboarding/role" className="font-medium text-primary hover:underline">
                Choose your account type
              </Link>{" "}
              to continue.
            </p>
          )}
        </div>
      ) : (
        <div className="mt-6 rounded-xl border border-border bg-card p-6 shadow-sm">
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
                  onClick={() => void (isStudentProfile(profile) ? submitStudent(false) : submitMentor(false))}
                  className="rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
                >
                  {submitting ? "Saving…" : "Save changes"}
                </button>
              </div>
            )}
          </div>
          <div className="mt-4">
            <ProfileAiNotice />
          </div>
          <div className="mt-6 flex flex-col gap-5">
            {isStudentProfile(profile)
              ? renderFields(
                  STUDENT_PROFILE_FIELDS,
                  studentValue,
                  setStudentField,
                  !editing,
                  "e-",
                )
              : renderFields(MENTOR_PROFILE_FORM_FIELDS, mentorValue, setMentorField, !editing, "e-")}
          </div>
          {submitError ? <p className="mt-4 text-sm text-red-500">{submitError}</p> : null}
          {isMentorRole && profile && !isStudentProfile(profile) ? (
            <div className="mt-6 flex flex-wrap gap-2 border-t border-border pt-4">
              <Link
                href="/dashboard"
                className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                ← Dashboard
              </Link>
              <Link
                href="/dashboard/inbox?find=1"
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-semibold text-foreground hover:bg-muted"
              >
                Find students
              </Link>
            </div>
          ) : isStudentRole ? (
            <div className="mt-6 flex flex-wrap gap-2 border-t border-border pt-4">
              <Link
                href="/dashboard/inbox?find=1"
                className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                Find mentors
              </Link>
              <Link
                href="/dashboard/my-feed?find=1"
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-semibold text-foreground hover:bg-muted"
              >
                Find blogs
              </Link>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
