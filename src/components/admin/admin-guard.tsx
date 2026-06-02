"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { useAuth } from "@/context/AuthContext";

export default function AdminGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const role = typeof user?.role === "string" ? user.role : "";

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/login?from=/admin");
      return;
    }
    if (role !== "admin") {
      router.replace("/dashboard");
    }
  }, [isLoading, user, role, router]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl space-y-3">
        <div className="h-9 w-48 animate-pulse rounded-lg bg-muted" />
        <div className="h-64 animate-pulse rounded-xl bg-muted/70" />
      </div>
    );
  }

  if (role !== "admin") {
    return (
      <div className="mx-auto max-w-lg rounded-xl border border-border bg-card p-8 text-center shadow-sm">
        <h1 className="text-lg font-bold text-foreground">Admin access required</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This area is for platform administrators only.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          Sign in
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
