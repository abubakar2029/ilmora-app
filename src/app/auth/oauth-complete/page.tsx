"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { refreshToken } from "@/lib/auth";

function OAuthCompleteInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const ok = await refreshToken();
      if (cancelled) return;
      if (!ok) {
        setError("Could not start your session. Please sign in again.");
        return;
      }
      const next = searchParams.get("next");
      router.replace(next && next.startsWith("/") ? next : "/journey");
      router.refresh();
    })();
    return () => {
      cancelled = true;
    };
  }, [router, searchParams]);

  if (error) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center shadow-sm">
        <p className="text-sm text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-8 text-center shadow-sm">
      <p className="text-sm text-muted-foreground">Finishing sign-in…</p>
    </div>
  );
}

export default function OAuthCompletePage() {
  return (
    <div className="min-h-dvh bg-background px-4 py-12">
      <div className="mx-auto w-full max-w-md">
        <Suspense
          fallback={
            <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground shadow-sm">
              Loading…
            </div>
          }
        >
          <OAuthCompleteInner />
        </Suspense>
      </div>
    </div>
  );
}
