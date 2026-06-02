"use client";

import type { ReactNode } from "react";

import AdminGuard from "@/components/admin/admin-guard";
import AdminNav from "@/components/admin/admin-nav";
import AdminShell from "@/components/admin/admin-shell";
import { ToastProvider } from "@/components/toast";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <AdminShell>
        <AdminGuard>
          <div>
            <header className="mb-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground lg:text-3xl">
                Admin panel
              </h1>
            </header>
            <AdminNav />
            {children}
          </div>
        </AdminGuard>
      </AdminShell>
    </ToastProvider>
  );
}
