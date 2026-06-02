"use client";

import Link from "next/link";
import { Suspense } from "react";

import MentorMenteeInbox from "@/components/inbox/mentor-mentee-inbox";
import StudentMentorInbox from "@/components/inbox/student-mentor-inbox";
import { PageSkeleton } from "@/components/ui/loading";
import { useAuth } from "@/context/AuthContext";

function InboxContent() {
  const { user, isLoading: authLoading } = useAuth();
  const role = typeof user?.role === "string" ? user.role : "";
  const isMentor = role === "mentor";
  const isStudent = role === "student";

  if (authLoading) {
    return <PageSkeleton className="mx-auto max-w-5xl" label="Loading inbox…" />;
  }

  if (!isMentor && !isStudent) {
    return (
      <div className="mx-auto max-w-lg rounded-xl border border-border bg-card p-8 text-center shadow-sm">
        <h1 className="text-lg font-bold text-foreground">Inbox unavailable</h1>
        <p className="mt-2 text-sm text-muted-foreground">The inbox is for student and mentor accounts.</p>
        <Link
          href="/dashboard"
          className="mt-6 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-8">
        <Link href="/dashboard" className="text-sm font-medium text-primary hover:underline">
          ← Dashboard
        </Link>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-foreground lg:text-3xl">
          {isMentor ? "Mentee inbox" : "Mentor inbox"}
        </h1>
      </header>

      {isMentor ? <MentorMenteeInbox /> : <StudentMentorInbox />}
    </div>
  );
}

export default function InboxPage() {
  return (
    <Suspense fallback={<PageSkeleton className="mx-auto max-w-5xl" label="Loading inbox…" />}>
      <InboxContent />
    </Suspense>
  );
}
