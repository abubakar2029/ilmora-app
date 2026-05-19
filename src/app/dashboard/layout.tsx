"use client";

import type { ReactNode } from "react";

import AppShell from "@/components/app-shell";
import NotificationBell from "@/components/NotificationBell";
import { useAuth } from "@/context/AuthContext";

function DashboardTopNav() {
  const { user } = useAuth();
  const role = typeof user?.role === "string" ? user.role : "";
  const initial = role ? role.charAt(0).toUpperCase() : "U";

  return (
    <div className="mb-6 flex items-center justify-end gap-3 border-b border-border pb-4">
      <div className="flex items-center gap-2">
        <span className="hidden max-w-[200px] truncate text-right text-sm font-medium capitalize text-muted-foreground sm:inline">
          {role || "Account"}
        </span>
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary"
          title={role || "Signed in"}
        >
          {initial}
        </div>
      </div>
      <NotificationBell />
    </div>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <AppShell topBar={<DashboardTopNav />}>{children}</AppShell>;
}
