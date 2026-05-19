"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import AppShell from "@/components/app-shell";
import { ToastProvider, useToast } from "@/components/toast";
import { ApiError, apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const API_BLOGS = "/api/admin-panel/blogs/";
const API_USERS = "/api/admin-panel/users/";

type TabId = "pending" | "all" | "users";

type BlogAuthor = {
  id: number;
  email: string;
  role: string;
  date_joined: string;
};

type AdminBlog = {
  id: number;
  title: string;
  content: string;
  status: string;
  author: BlogAuthor;
  created_at: string;
  published_at: string | null;
};

type AdminUser = {
  id: number;
  email: string;
  role: string;
  date_joined: string;
};

const cardClass =
  "rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md";

function parsePaginated<T>(data: unknown): { results: T[]; next: string | null } {
  if (!data || typeof data !== "object") return { results: [], next: null };
  const o = data as Record<string, unknown>;
  const results = Array.isArray(o.results) ? (o.results as T[]) : [];
  const next = typeof o.next === "string" ? o.next : null;
  return { results, next };
}

function statusBadgeClass(status: string): string {
  switch (status) {
    case "pending":
      return "bg-muted text-muted-foreground border-border";
    case "needs_revision":
      return "bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/30";
    case "published":
      return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30";
    case "approved":
      return "bg-sky-500/15 text-sky-800 dark:text-sky-200 border-sky-500/30";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

function AdminPanelInner() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { showToast } = useToast();

  const role = typeof user?.role === "string" ? user.role : "";
  const isAdmin = role === "admin";

  const [tab, setTab] = useState<TabId>("pending");
  const [pendingBlogs, setPendingBlogs] = useState<AdminBlog[]>([]);
  const [allBlogs, setAllBlogs] = useState<AdminBlog[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [reviseForId, setReviseForId] = useState<number | null>(null);
  const [reviseComment, setReviseComment] = useState("");
  const [loadingBlogs, setLoadingBlogs] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<number | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!isAdmin) {
      router.replace("/dashboard");
    }
  }, [authLoading, isAdmin, router]);

  const loadBlogs = useCallback(
    async (status: "pending" | null) => {
      setError(null);
      setLoadingBlogs(true);
      try {
        const q = status ? `?status=${encodeURIComponent(status)}&page_size=100` : "?page_size=100";
        const res = await apiFetch(`${API_BLOGS}${q}`, { method: "GET" });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new ApiError(res.status, data);
        const { results } = parsePaginated<AdminBlog>(data);
        if (status === "pending") setPendingBlogs(results);
        else setAllBlogs(results);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load blogs");
        if (status === "pending") setPendingBlogs([]);
        else setAllBlogs([]);
      } finally {
        setLoadingBlogs(false);
      }
    },
    [],
  );

  const loadUsers = useCallback(async () => {
    setError(null);
    setLoadingUsers(true);
    try {
      const roleQ = roleFilter !== "all" ? `?role=${encodeURIComponent(roleFilter)}&page_size=100` : "?page_size=100";
      const res = await apiFetch(`${API_USERS}${roleQ}`, { method: "GET" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new ApiError(res.status, data);
      const { results } = parsePaginated<AdminUser>(data);
      setUsers(results);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load users");
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  }, [roleFilter]);

  useEffect(() => {
    if (authLoading || !isAdmin) return;
    if (tab === "pending") void loadBlogs("pending");
    if (tab === "all") void loadBlogs(null);
  }, [authLoading, isAdmin, tab, loadBlogs]);

  useEffect(() => {
    if (authLoading || !isAdmin) return;
    if (tab === "users") void loadUsers();
  }, [authLoading, isAdmin, tab, loadUsers]);

  async function approveBlog(id: number) {
    setActionId(id);
    setError(null);
    try {
      const res = await apiFetch(`/api/admin-panel/blogs/${id}/approve/`, { method: "PATCH" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new ApiError(res.status, data);
      setPendingBlogs((prev) => prev.filter((b) => b.id !== id));
      setAllBlogs((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: "published", published_at: new Date().toISOString() } : b)),
      );
      setExpandedId((e) => (e === id ? null : e));
      setReviseForId(null);
      showToast("Blog approved and published.", "success");
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Approve failed", "error");
    } finally {
      setActionId(null);
    }
  }

  async function submitRevision(id: number) {
    const c = reviseComment.trim();
    if (!c) {
      showToast("Please enter a comment for the author.", "error");
      return;
    }
    setActionId(id);
    setError(null);
    try {
      const res = await apiFetch(`/api/admin-panel/blogs/${id}/revise/`, {
        method: "PATCH",
        body: JSON.stringify({ comment: c }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new ApiError(res.status, data);
      setPendingBlogs((prev) => prev.filter((b) => b.id !== id));
      setAllBlogs((prev) => prev.map((b) => (b.id === id ? { ...b, status: "needs_revision" } : b)));
      setReviseForId(null);
      setReviseComment("");
      setExpandedId((e) => (e === id ? null : e));
      showToast("Revision requested.", "success");
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Request failed", "error");
    } finally {
      setActionId(null);
    }
  }

  const tabBtn = (id: TabId, label: string) => (
    <button
      type="button"
      onClick={() => {
        setTab(id);
        setExpandedId(null);
        setReviseForId(null);
        setReviseComment("");
      }}
      className={`border-b-2 px-1 pb-2 text-sm font-semibold transition-colors sm:px-3 ${
        tab === id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );

  const blogRows = useMemo(() => (tab === "pending" ? pendingBlogs : allBlogs), [tab, pendingBlogs, allBlogs]);

  if (authLoading || !isAdmin) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 h-9 w-48 animate-pulse rounded-lg bg-muted" />
        <div className="h-40 animate-pulse rounded-xl bg-muted/70" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground lg:text-3xl">Admin</h1>
          <p className="mt-2 text-sm text-muted-foreground">Moderate blogs and browse users.</p>
        </div>
        <Link href="/dashboard" className="text-sm font-medium text-primary hover:underline">
          ← Dashboard
        </Link>
      </header>

      <div className="mb-6 flex flex-wrap gap-4 border-b border-border">
        {tabBtn("pending", "Pending blogs")}
        {tabBtn("all", "All blogs")}
        {tabBtn("users", "Users")}
      </div>

      {error ? (
        <p className="mb-4 text-sm text-red-500" role="alert">
          {error}
        </p>
      ) : null}

      {tab === "users" ? (
        <section>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <label htmlFor="role-filter" className="text-sm font-medium text-foreground">
              Role
            </label>
            <select
              id="role-filter"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">All roles</option>
              <option value="student">Student</option>
              <option value="mentor">Mentor</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {loadingUsers ? (
            <div className="h-48 animate-pulse rounded-xl bg-muted/70" />
          ) : users.length === 0 ? (
            <p className="text-sm text-muted-foreground">No users match this filter.</p>
          ) : (
            <div className={`overflow-x-auto ${cardClass}`}>
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="px-4 py-3 font-semibold text-foreground">Email</th>
                    <th className="px-4 py-3 font-semibold text-foreground">Role</th>
                    <th className="px-4 py-3 font-semibold text-foreground">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-3 text-foreground">{u.email}</td>
                      <td className="px-4 py-3 capitalize text-muted-foreground">{u.role}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(u.date_joined).toLocaleDateString(undefined, { dateStyle: "medium" })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ) : loadingBlogs ? (
        <div className="h-48 animate-pulse rounded-xl bg-muted/70" />
      ) : blogRows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No blogs in this list.</p>
      ) : (
        <ul className="space-y-3">
          {blogRows.map((b) => {
            const expanded = expandedId === b.id;
            const busy = actionId === b.id;
            return (
              <li key={b.id} className={cardClass}>
                <button
                  type="button"
                  onClick={() => setExpandedId(expanded ? null : b.id)}
                  className="flex w-full flex-col gap-1 px-4 py-3 text-left sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <span className="font-semibold text-foreground">{b.title}</span>
                    <span className="mt-0.5 block text-xs text-muted-foreground sm:mt-0 sm:inline sm:before:mx-2 sm:before:content-['·']">
                      {b.author?.email ?? "—"}
                    </span>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    {tab === "all" ? (
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${statusBadgeClass(b.status)}`}
                      >
                        {b.status.replace(/_/g, " ")}
                      </span>
                    ) : null}
                    <span className="text-xs text-muted-foreground">
                      {new Date(b.created_at).toLocaleDateString(undefined, { dateStyle: "medium" })}
                    </span>
                    <span className="text-xs font-medium text-primary">{expanded ? "Hide" : "Show"} content</span>
                  </div>
                </button>

                {expanded ? (
                  <div className="border-t border-border px-4 py-3">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{b.content}</p>

                    {tab === "pending" ? (
                      <div className="mt-4 space-y-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            disabled={busy}
                            onClick={(e) => {
                              e.stopPropagation();
                              void approveBlog(b.id);
                            }}
                            className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                          >
                            {busy ? "…" : "Approve"}
                          </button>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={(e) => {
                              e.stopPropagation();
                              setReviseForId((prev) => (prev === b.id ? null : b.id));
                              setReviseComment("");
                            }}
                            className="rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted disabled:opacity-50"
                          >
                            Request revision
                          </button>
                        </div>

                        {reviseForId === b.id ? (
                          <div className="rounded-lg border border-border bg-muted/30 p-3">
                            <label htmlFor={`revise-${b.id}`} className="text-xs font-medium text-muted-foreground">
                              Comment for author
                            </label>
                            <textarea
                              id={`revise-${b.id}`}
                              value={reviseComment}
                              onChange={(e) => setReviseComment(e.target.value)}
                              rows={3}
                              className="mt-2 w-full resize-y rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
                              placeholder="What should they change?"
                            />
                            <div className="mt-2 flex gap-2">
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() => void submitRevision(b.id)}
                                className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                              >
                                Send revision request
                              </button>
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() => {
                                  setReviseForId(null);
                                  setReviseComment("");
                                }}
                                className="rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default function AdminPage() {
  return (
    <ToastProvider>
      <AppShell>
        <AdminPanelInner />
      </AppShell>
    </ToastProvider>
  );
}
