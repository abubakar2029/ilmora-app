import Link from "next/link";

/** Shown when a platform admin opens Profile — they use /admin, not student/mentor fields. */
export default function AdminProfileNotice() {
  return (
    <div className="mt-6 rounded-xl border border-dashed border-border bg-muted/20 p-6 sm:p-8">
      <p className="text-sm font-semibold text-foreground">You are signed in as Admin</p>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
        This page collects profile details for <strong className="text-foreground">students</strong> and{" "}
        <strong className="text-foreground">mentors</strong> (skills, goals, expertise, etc.) so our AI can
        power matches and journeys. Admin accounts moderate content instead — they do not fill out this form.
      </p>
      <p className="mt-3 text-sm text-muted-foreground text-pretty">
        To see and test the profile inputs, sign out and create a <strong className="text-foreground">Student</strong> or{" "}
        <strong className="text-foreground">Mentor</strong> account (email register or Google/GitHub).
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/register"
          className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          Create student / mentor account
        </Link>
        <Link
          href="/admin"
          className="rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
        >
          Go to dashboard
        </Link>
      </div>
    </div>
  );
}
