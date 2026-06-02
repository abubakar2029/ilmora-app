"use client";

import type { ReactNode } from "react";

import AdminHeader from "@/components/admin/admin-header";

/** Admin routes: full-width layout without the main app sidebar. */
export default function AdminShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-background">
      <main className="mx-auto min-h-dvh max-w-6xl px-4 py-6 lg:px-8">
        <AdminHeader />
        {children}
      </main>
    </div>
  );
}
