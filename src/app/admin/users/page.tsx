"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import Link from "next/link";

import AdminPagination from "@/components/admin/admin-pagination";
import MentorSocialLinks from "@/components/mentor/mentor-social-links";
import { useToast } from "@/components/toast";
import { ListSkeleton } from "@/components/ui/loading";
import { useAdminMutations, useAdminUsers } from "@/hooks/queries/use-admin";
import type { AdminUser } from "@/lib/admin-api";

const cardClass = "rounded-xl border border-border bg-card shadow-sm overflow-hidden";

const ROLES = [
  { value: "student", label: "Student" },
  { value: "mentor", label: "Mentor" },
  { value: "admin", label: "Admin" },
];

function AdminUsersContent() {
  const { showToast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { updateUser, deleteUser, ADMIN_PAGE_SIZE } = useAdminMutations();

  const initialSearch = searchParams.get("search") ?? "";
  const [roleFilter, setRoleFilter] = useState("all");
  const [search, setSearch] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [form, setForm] = useState({ email: "", role: "student" });

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
      const q = search.trim();
      const url = q ? `/admin/users?search=${encodeURIComponent(q)}` : "/admin/users";
      router.replace(url, { scroll: false });
    }, 300);
    return () => clearTimeout(t);
  }, [search, router]);

  useEffect(() => {
    setPage(1);
  }, [roleFilter]);

  const { data, isLoading, error, isFetching } = useAdminUsers({
    role: roleFilter,
    search: debouncedSearch,
    page,
  });

  const users = data?.results ?? [];
  const total = data?.count ?? 0;
  const saving = updateUser.isPending;
  const deletingId = deleteUser.isPending ? deleteUser.variables : null;

  function openEdit(u: AdminUser) {
    setEditing(u);
    setForm({ email: u.email, role: u.role });
  }

  async function saveEdit() {
    if (!editing) return;
    try {
      await updateUser.mutateAsync({
        id: editing.id,
        payload: { email: form.email.trim(), role: form.role },
      });
      showToast("User updated.", "success");
      setEditing(null);
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Update failed", "error");
    }
  }

  async function handleDelete(u: AdminUser) {
    if (!window.confirm(`Delete user ${u.email}?`)) return;
    try {
      await deleteUser.mutateAsync(u.id);
      showToast("User deleted.", "success");
      if (editing?.id === u.id) setEditing(null);
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Delete failed", "error");
    }
  }

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor="user-search" className="block text-xs font-medium text-muted-foreground">
            Search email
          </label>
          <input
            id="user-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="name@example.com"
            className="mt-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div>
          <label htmlFor="role-filter" className="block text-xs font-medium text-muted-foreground">
            Role
          </label>
          <select
            id="role-filter"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="mt-1 rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="all">All roles</option>
            <option value="student">Student</option>
            <option value="mentor">Mentor</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        {isFetching && !isLoading ? (
          <span className="text-xs text-muted-foreground">Refreshing…</span>
        ) : null}
      </div>

      {error ? (
        <p className="mb-4 text-sm text-red-500" role="alert">
          Failed to load users.
        </p>
      ) : null}

      {isLoading ? (
        <ListSkeleton count={6} />
      ) : users.length === 0 ? (
        <p className="text-sm text-muted-foreground">No users match your filters.</p>
      ) : (
        <div className={cardClass}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="px-4 py-3 font-semibold">User</th>
                  <th className="px-4 py-3 font-semibold">Role</th>
                  <th className="px-4 py-3 font-semibold">Mentor links</th>
                  <th className="px-4 py-3 font-semibold">Joined</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{u.email}</p>
                      {u.role === "mentor" && u.mentor_profile?.headline ? (
                        <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                          {u.mentor_profile.headline}
                        </p>
                      ) : null}
                      {u.role === "mentor" ? (
                        <Link
                          href={`/mentors/${u.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 inline-block text-[11px] font-medium text-primary hover:underline"
                        >
                          Public profile ↗
                        </Link>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 capitalize text-muted-foreground">{u.role}</td>
                    <td className="px-4 py-3">
                      {u.role === "mentor" && u.mentor_profile ? (
                        <MentorSocialLinks links={u.mentor_profile} size="sm" />
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(u.date_joined).toLocaleDateString(undefined, { dateStyle: "medium" })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(u)}
                          className="rounded-lg border border-border px-2.5 py-1 text-xs font-semibold hover:bg-muted"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          disabled={deletingId === u.id}
                          onClick={() => void handleDelete(u)}
                          className="rounded-lg border border-red-500/40 px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-500/10 disabled:opacity-50 dark:text-red-400"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <AdminPagination
            page={page}
            pageSize={ADMIN_PAGE_SIZE}
            total={total}
            onPageChange={setPage}
          />
        </div>
      )}

      {editing ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4"
          onClick={() => setEditing(null)}
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-foreground">Edit user</h2>
            <p className="mt-1 text-xs text-muted-foreground">User ID {editing.id}</p>
            <div className="mt-4 space-y-4">
              <div>
                <label htmlFor="edit-email" className="text-xs font-medium text-muted-foreground">
                  Email
                </label>
                <input
                  id="edit-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label htmlFor="edit-role" className="text-xs font-medium text-muted-foreground">
                  Role
                </label>
                <select
                  id="edit-role"
                  value={form.role}
                  onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                >
                  {ROLES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                disabled={saving}
                onClick={() => setEditing(null)}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => void saveEdit()}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default function AdminUsersPage() {
  return (
    <Suspense fallback={<ListSkeleton count={6} />}>
      <AdminUsersContent />
    </Suspense>
  );
}
