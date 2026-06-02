"use client";

import NotificationBell from "@/components/NotificationBell";
import { useAuth } from "@/context/AuthContext";
import { useAuthMe } from "@/hooks/queries";
import { displayFirstName, displayInitial } from "@/lib/display-name";
import { roleLabel } from "@/lib/profile-fields";

export default function AppTopBar() {
  const { user, isLoading } = useAuth();
  const { data: authMe } = useAuthMe();

  const email =
    typeof user?.email === "string"
      ? user.email
      : typeof authMe?.email === "string"
        ? authMe.email
        : undefined;

  const role = typeof user?.role === "string" ? user.role : "";
  const firstName = displayFirstName(email);
  const initial = displayInitial(email);

  if (isLoading || !user) {
    return null;
  }

  const roleText = role ? roleLabel(role) : "Account";

  return (
    <header className="mb-8 flex items-center justify-between gap-4">
      <div className="min-w-0 flex-1 lg:hidden" />
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 text-sm font-semibold text-primary ring-2 ring-background"
          aria-hidden
        >
          {initial}
        </div>
        <div className="min-w-0 text-left">
          <p className="truncate text-sm font-semibold text-foreground">{firstName}</p>
          <p className="text-xs text-muted-foreground">{roleText}</p>
        </div>
      </div>
      <NotificationBell />
    </header>
  );
}
