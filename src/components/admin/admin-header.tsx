"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthContext";
import { displayFirstName, displayInitial } from "@/lib/display-name";

/** Fixed bar height so logo, profile, and logout share one vertical center line. */
const BAR_HEIGHT = "h-16";

export default function AdminHeader() {
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();

  const email = typeof user?.email === "string" ? user.email : "";
  const firstName = displayFirstName(email);
  const initial = displayInitial(email);

  return (
    <header className="mb-8 border-b border-border">
      <div className={`flex ${BAR_HEIGHT} items-center justify-between gap-4`}>
        <div className={`flex ${BAR_HEIGHT} min-w-0 items-center gap-3`}>
          <Link
            href="/admin/blogs"
            className="inline-flex h-9 items-center text-lg font-bold leading-none tracking-tight text-primary"
          >
            ilmora
          </Link>
          <span
            className={`hidden ${BAR_HEIGHT} items-center border-l border-border pl-3 text-sm leading-none text-muted-foreground sm:inline-flex`}
          >
            Admin
          </span>
        </div>

        <div className={`flex ${BAR_HEIGHT} shrink-0 items-center gap-3`}>
          {!isLoading && user ? (
            <>
              <div className={`hidden ${BAR_HEIGHT} items-center gap-2.5 sm:flex`}>
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold leading-none text-primary"
                  aria-hidden
                >
                  {initial}
                </div>
                <div className="flex flex-col justify-center gap-0.5">
                  <p className="truncate text-sm font-medium leading-none text-foreground">
                    {firstName}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">Administrator</p>
                </div>
              </div>
              <button
                type="button"
                onClick={async () => {
                  await logout();
                  router.push("/about");
                  router.refresh();
                }}
                className="inline-flex h-9 shrink-0 items-center justify-center rounded-lg border border-border px-4 text-sm font-semibold leading-none text-foreground transition-colors hover:bg-muted"
              >
                Logout
              </button>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}
