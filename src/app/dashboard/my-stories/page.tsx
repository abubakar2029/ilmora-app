"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import MentorGuard from "@/components/mentor-guard";
import { deleteStory, listMyStories } from "@/lib/blog-api";
import type { Blog } from "@/lib/blogs";
import {
  canDeleteStory,
  canEditStory,
  previewContent,
  statusBadgeClass,
  statusLabel,
} from "@/lib/blogs";

export default function MyStoriesPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadDrafts = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      setBlogs(await listMyStories());
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

  async function handleDelete(blog: Blog) {
    if (!canDeleteStory(blog)) return;
    if (!window.confirm(`Delete "${blog.title}"? This cannot be undone.`)) return;
    setDeletingId(blog.id);
    try {
      await deleteStory(blog.id);
      await loadDrafts();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <MentorGuard>
      <div className="mx-auto max-w-3xl">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground lg:text-3xl">My stories</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Drafts, revisions, and published posts.{" "}
              <Link href="/blogs" className="font-medium text-primary hover:underline">
                Browse public stories
              </Link>
            </p>
          </div>
          <Link
            href="/dashboard/write"
            className="shrink-0 rounded-lg bg-primary px-4 py-2.5 text-center text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Write new story
          </Link>
        </header>

        {error ? (
          <p className="mb-4 text-sm text-red-500" role="alert">
            {error}
          </p>
        ) : null}

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 animate-pulse rounded-xl bg-muted/70" />
            ))}
          </div>
        ) : blogs.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-12 text-center">
            <p className="text-sm text-muted-foreground">You haven&apos;t written a story yet.</p>
            <Link
              href="/dashboard/write"
              className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Write your first story
            </Link>
          </div>
        ) : (
          <ul className="space-y-4">
            {blogs.map((b) => (
              <li key={b.id} className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h2 className="font-semibold text-foreground">{b.title}</h2>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{previewContent(b.content, 160)}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Submitted {new Date(b.created_at).toLocaleDateString(undefined, { dateStyle: "medium" })}
                      {b.published_at
                        ? ` · Published ${new Date(b.published_at).toLocaleDateString(undefined, { dateStyle: "medium" })}`
                        : null}
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

                <div className="mt-4 flex flex-wrap gap-2">
                  {canEditStory(b) ? (
                    <Link
                      href={`/dashboard/write?id=${b.id}`}
                      className="rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
                    >
                      Edit
                    </Link>
                  ) : null}
                  {b.status === "published" ? (
                    <Link
                      href={`/blogs/${b.id}`}
                      className="rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
                    >
                      View live
                    </Link>
                  ) : null}
                  {canDeleteStory(b) ? (
                    <button
                      type="button"
                      disabled={deletingId === b.id}
                      onClick={() => void handleDelete(b)}
                      className="rounded-lg border border-red-500/40 px-3 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-500/10 disabled:opacity-50 dark:text-red-400"
                    >
                      {deletingId === b.id ? "Deleting…" : "Delete"}
                    </button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </MentorGuard>
  );
}
