"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

import BlogContent from "@/components/blog/blog-content";
import { useToast } from "@/components/toast";
import { PageSkeleton } from "@/components/ui/loading";
import { useAdminBlog, useAdminMutations } from "@/hooks/queries/use-admin";
import { REVISION_TEMPLATES } from "@/lib/admin-revision-templates";
import { statusBadgeClass, statusLabel } from "@/lib/blogs";

export default function AdminBlogReadPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const { approveBlog, deleteBlog, reviseBlog } = useAdminMutations();
  const id = Number(typeof params.id === "string" ? params.id : params.id?.[0]);

  const { data: blog, isLoading, error } = useAdminBlog(Number.isNaN(id) ? null : id);
  const [reviseComment, setReviseComment] = useState("");
  const [showRevise, setShowRevise] = useState(false);

  const busy = approveBlog.isPending || deleteBlog.isPending || reviseBlog.isPending;
  const canModerate = blog?.status === "pending" || blog?.status === "needs_revision";

  async function handleApprove() {
    if (!blog) return;
    try {
      await approveBlog.mutateAsync(blog.id);
      showToast("Story approved and published.", "success");
      router.push("/admin/blogs");
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Approve failed", "error");
    }
  }

  async function handleDelete() {
    if (!blog || !window.confirm(`Delete "${blog.title}"?`)) return;
    try {
      await deleteBlog.mutateAsync(blog.id);
      showToast("Story deleted.", "success");
      router.push("/admin/blogs");
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Delete failed", "error");
    }
  }

  async function handleRevise() {
    if (!blog) return;
    const c = reviseComment.trim();
    if (!c) {
      showToast("Enter feedback for the mentor.", "error");
      return;
    }
    try {
      await reviseBlog.mutateAsync({ id: blog.id, comment: c });
      showToast("Revision request sent.", "success");
      router.push("/admin/blogs");
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Request failed", "error");
    }
  }

  if (isLoading) {
    return <PageSkeleton label="Loading story…" />;
  }

  if (error || !blog) {
    return (
      <div>
        <p className="text-sm text-red-500" role="alert">
          Story not found
        </p>
        <Link href="/admin/blogs" className="mt-4 inline-block text-sm font-medium text-primary hover:underline">
          ← Back to queue
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
      <article>
        <Link href="/admin/blogs" className="text-sm font-medium text-muted-foreground hover:text-primary">
          ← Back to queue
        </Link>

        <header className="mt-4 border-b border-border pb-6">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${statusBadgeClass(blog.status)}`}
            >
              {statusLabel(blog.status)}
            </span>
          </div>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-foreground">{blog.title}</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            By{" "}
            <Link
              href={`/admin/users?search=${encodeURIComponent(blog.author?.email ?? "")}`}
              className="font-medium text-primary hover:underline"
            >
              {blog.author?.email ?? "Unknown"}
            </Link>
            {blog.author?.role === "mentor" && blog.author?.id ? (
              <>
                {" · "}
                <Link
                  href={`/mentors/${blog.author.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Public profile ↗
                </Link>
              </>
            ) : null}
          </p>
        </header>

        {blog.admin_comment ? (
          <div className="mt-6 rounded-lg border border-orange-500/40 bg-orange-500/10 px-4 py-3 text-sm">
            <p className="text-xs font-semibold uppercase text-orange-800 dark:text-orange-200">
              Previous admin feedback
            </p>
            <p className="mt-1 whitespace-pre-wrap">{blog.admin_comment}</p>
          </div>
        ) : null}

        <BlogContent content={blog.content} className="mt-8" />
      </article>

      <aside className="lg:sticky lg:top-6 lg:self-start">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-foreground">Moderation</h3>
          {canModerate ? (
            <div className="mt-4 space-y-3">
              <button
                type="button"
                disabled={busy}
                onClick={() => void handleApprove()}
                className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
              >
                Approve & publish
              </button>
              {!showRevise ? (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setShowRevise(true)}
                  className="w-full rounded-lg border border-border py-2.5 text-sm font-medium disabled:opacity-50"
                >
                  Request changes
                </button>
              ) : (
                <div className="space-y-2">
                  <select
                    className="w-full rounded-lg border border-border bg-background px-2 py-1.5 text-xs"
                    defaultValue=""
                    onChange={(e) => {
                      const t = REVISION_TEMPLATES.find((x) => x.id === e.target.value);
                      if (t) setReviseComment(t.text);
                      e.target.value = "";
                    }}
                  >
                    <option value="">Insert template…</option>
                    {REVISION_TEMPLATES.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                  <textarea
                    value={reviseComment}
                    onChange={(e) => setReviseComment(e.target.value)}
                    rows={4}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  />
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void handleRevise()}
                    className="w-full rounded-lg bg-orange-600 py-2 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    Send revision request
                  </button>
                </div>
              )}
              <button
                type="button"
                disabled={busy}
                onClick={() => void handleDelete()}
                className="w-full rounded-lg border border-red-500/40 py-2 text-sm font-semibold text-red-600 disabled:opacity-50 dark:text-red-400"
              >
                Delete story
              </button>
            </div>
          ) : (
            <button
              type="button"
              disabled={busy}
              onClick={() => void handleDelete()}
              className="mt-4 w-full rounded-lg border border-red-500/40 py-2 text-sm font-semibold text-red-600 disabled:opacity-50 dark:text-red-400"
            >
              Delete story
            </button>
          )}
          {blog.status === "published" ? (
            <Link
              href={`/blogs/${blog.id}`}
              className="mt-4 block text-center text-sm font-medium text-primary hover:underline"
            >
              View public page
            </Link>
          ) : null}
        </div>
      </aside>
    </div>
  );
}
