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
    <header className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
      <div className="flex min-w-0 items-center gap-4">
        <Link href="/admin/blogs" className="text-lg font-bold tracking-tight text-primary">
          ilmora
        </Link>
        <span className="hidden text-sm text-muted-foreground sm:inline">Admin</span>
      </div>

      <div className="flex items-center gap-3">
        {!isLoading && user ? (
          <>
            <div className="hidden items-center gap-2 sm:flex">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary"
                aria-hidden
              >
                {initial}
              </div>
              <div className="min-w-0 text-right">
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
              className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
            >
              Logout
            </button>
          </>
        ) : null}
      </div>
    </header>
  );
}
