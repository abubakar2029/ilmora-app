"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { useAuth } from "@/context/AuthContext";

export default function MentorGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const role = typeof user?.role === "string" ? user.role : "";

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/about");
      return;
    }
    if (role !== "mentor") {
      router.replace("/dashboard");
    }
  }, [isLoading, user, role, router]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-3">
        <div className="h-9 w-48 animate-pulse rounded-lg bg-muted" />
        <div className="h-64 animate-pulse rounded-xl bg-muted/70" />
      </div>
    );
  }

  if (role !== "mentor") {
    return (
      <div className="mx-auto max-w-lg rounded-xl border border-border bg-card p-8 text-center shadow-sm">
        <h1 className="text-lg font-bold text-foreground">Mentors only</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Story writing is available for mentor accounts. Students can read stories and use My Feed.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          Back to dashboard
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
