"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

import { ApiError, apiFetch } from "@/lib/api";
import type { Blog, PaginatedBlogs } from "@/lib/blogs";

const API_DRAFTS = "/api/blogs/my-drafts/";

function parsePaginated(data: unknown): PaginatedBlogs {
  if (!data || typeof data !== "object") {
    return { count: 0, next: null, previous: null, results: [] };
  }
  const o = data as Record<string, unknown>;
  const results = Array.isArray(o.results) ? (o.results as Blog[]) : [];
  return {
    count: typeof o.count === "number" ? o.count : 0,
    next: typeof o.next === "string" ? o.next : null,
    previous: typeof o.previous === "string" ? o.previous : null,
    results,
  };
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

function statusLabel(status: string): string {
  return status.replace(/_/g, " ");
}

type ModalMode = "create" | "edit" | null;

export default function MyStoriesPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalMode>(null);
  const [editing, setEditing] = useState<Blog | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loadDrafts = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await apiFetch(`${API_DRAFTS}?page_size=50`, { method: "GET" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new ApiError(res.status, data);
      setBlogs(parsePaginated(data).results);
    } catch (e) {
      setBlogs([]);
      setError(e instanceof Error ? e.message : "Failed to load your stories");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDrafts();
  }, [loadDrafts]);

  function openCreate() {
    setEditing(null);
    setTitle("");
    setContent("");
    setFormError(null);
    setModal("create");
  }

  function openEdit(blog: Blog) {
    setEditing(blog);
    setTitle(blog.title);
    setContent(blog.content);
    setFormError(null);
    setModal("edit");
  }

  function resetModal() {
    setModal(null);
    setEditing(null);
    setFormError(null);
  }

  function closeModal() {
    if (saving) return;
    resetModal();
  }

  async function submitForm() {
    setFormError(null);
    const t = title.trim();
    const c = content.trim();
    if (!t || !c) {
      setFormError("Title and content are required.");
      return;
    }
    setSaving(true);
    try {
      if (modal === "create") {
        const res = await apiFetch("/api/blogs/", {
          method: "POST",
          body: JSON.stringify({ title: t, content: c }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new ApiError(res.status, data);
      } else if (modal === "edit" && editing) {
        const res = await apiFetch(`/api/blogs/${editing.id}/`, {
          method: "PATCH",
          body: JSON.stringify({ title: t, content: c }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new ApiError(res.status, data);
      }
      resetModal();
      await loadDrafts();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  const canEdit = (b: Blog) => b.status === "pending" || b.status === "needs_revision";

  if (loading) {
    return (
      <>
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 h-9 w-48 animate-pulse rounded-lg bg-muted" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-xl bg-muted/70" />
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-3xl">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground lg:text-3xl">My stories</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Drafts, revisions, and published posts you&apos;ve shared.{" "}
              <Link href="/blogs" className="font-medium text-primary hover:underline">
                Browse public stories
              </Link>
            </p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="shrink-0 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Submit new story
          </button>
        </header>

        {error ? (
          <p className="mb-4 text-sm text-red-500" role="alert">
            {error}
          </p>
        ) : null}

        {blogs.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-muted/20 px-4 py-10 text-center text-sm text-muted-foreground">
            You haven&apos;t submitted a story yet. Use <strong className="text-foreground">Submit new story</strong> to
            get started.
          </div>
        ) : (
          <ul className="space-y-4">
            {blogs.map((b) => (
              <li
                key={b.id}
                className="rounded-xl border border-border bg-card p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h2 className="font-semibold text-foreground">{b.title}</h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Submitted {new Date(b.created_at).toLocaleDateString(undefined, { dateStyle: "medium" })}
                      {b.published_at ? ` · Published ${new Date(b.published_at).toLocaleDateString(undefined, { dateStyle: "medium" })}` : null}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${statusBadgeClass(b.status)}`}
                  >
                    {statusLabel(b.status)}
                  </span>
                </div>

                {b.status === "needs_revision" && b.admin_comment ? (
                  <div className="mt-4 rounded-lg border border-orange-500/40 bg-orange-500/10 px-4 py-3 text-sm text-orange-950 dark:text-orange-100">
                    <p className="text-xs font-semibold uppercase tracking-wide text-orange-800 dark:text-orange-200">
                      Admin feedback
                    </p>
                    <p className="mt-1 whitespace-pre-wrap">{b.admin_comment}</p>
                  </div>
                ) : null}

                {canEdit(b) ? (
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => openEdit(b)}
                      className="rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
                    >
                      Edit
                    </button>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}

        {modal ? (
          <div
            className="fixed inset-0 z-100 flex items-end justify-center bg-foreground/40 p-4 sm:items-center"
            onClick={() => closeModal()}
            role="presentation"
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="story-modal-title"
              className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-border bg-card p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 id="story-modal-title" className="text-lg font-bold text-foreground">
                {modal === "create" ? "New story" : "Edit story"}
              </h2>
              <div className="mt-4 space-y-4">
                <div>
                  <label htmlFor="story-title" className="block text-xs font-medium text-muted-foreground">
                    Title
                  </label>
                  <input
                    id="story-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none ring-primary focus:ring-2"
                    maxLength={300}
                  />
                </div>
                <div>
                  <label htmlFor="story-content" className="block text-xs font-medium text-muted-foreground">
                    Content
                  </label>
                  <textarea
                    id="story-content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={10}
                    className="mt-1 w-full resize-y rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none ring-primary focus:ring-2"
                  />
                </div>
                {formError ? (
                  <p className="text-sm text-red-500" role="alert">
                    {formError}
                  </p>
                ) : null}
              </div>
              <div className="mt-6 flex flex-wrap justify-end gap-2">
                <button
                  type="button"
                  disabled={saving}
                  onClick={closeModal}
                  className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void submitForm()}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}
