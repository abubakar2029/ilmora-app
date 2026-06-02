"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthContext";
import { displayFirstName, displayInitial } from "@/lib/display-name";

export default function AdminHeader() {
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();

  const email = typeof user?.email === "string" ? user.email : "";
  const firstName = displayFirstName(email);
  const initial = displayInitial(email);

  return (
    <header className="mb-8 flex min-h-14 flex-nowrap items-center justify-between gap-4 border-b border-border py-4">
      <div className="flex min-w-0 shrink-0 items-center gap-4">
        <Link
          href="/admin/blogs"
          className="inline-flex items-center text-lg font-bold leading-none tracking-tight text-primary"
        >
          ilmora
        </Link>
        <span className="hidden text-sm leading-none text-muted-foreground sm:inline">Admin</span>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        {!isLoading && user ? (
          <>
            <div className="hidden items-center gap-2 sm:flex">
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold leading-none text-primary"
                aria-hidden
              >
                {initial}
              </div>
              <div className="flex min-w-0 flex-col justify-center text-right leading-tight">
                <p className="truncate text-sm font-medium text-foreground">{firstName}</p>
                <p className="text-xs text-muted-foreground">Administrator</p>
              </div>
            </div>
            <button
              type="button"
              onClick={async () => {
                await logout();
                router.push("/login");
                router.refresh();
              }}
              className="inline-flex h-9 shrink-0 items-center justify-center rounded-lg border border-border px-4 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
            >
              Logout
            </button>
          </>
        ) : null}
      </div>
    </header>
  );
}
