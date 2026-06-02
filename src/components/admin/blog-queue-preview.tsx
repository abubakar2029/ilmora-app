"use client";

import Link from "next/link";
import { useState } from "react";

import BlogContent from "@/components/blog/blog-content";
import { REVISION_TEMPLATES } from "@/lib/admin-revision-templates";
import type { Blog } from "@/lib/blogs";
import { statusBadgeClass, statusLabel } from "@/lib/blogs";

type Props = {
  blog: Blog | null;
  loading?: boolean;
  busy?: boolean;
  onApprove: () => void;
  onDelete: () => void;
  onRevise: (comment: string) => void;
};

export default function BlogQueuePreview({
  blog,
  loading,
  busy,
  onApprove,
  onDelete,
  onRevise,
}: Props) {
  const [reviseComment, setReviseComment] = useState("");
  const [showRevise, setShowRevise] = useState(false);

  if (loading) {
    return (
      <div className="flex h-full min-h-[320px] items-center justify-center rounded-xl border border-border bg-muted/20">
        <p className="text-sm text-muted-foreground">Loading preview…</p>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="flex h-full min-h-[320px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/10 px-6 text-center">
        <p className="text-sm font-medium text-foreground">Select a story</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Click a row in the queue to preview and moderate without leaving the page.
        </p>
      </div>
    );
  }

  const canModerate = blog.status === "pending" || blog.status === "needs_revision";
  const authorId = blog.author?.id;

  return (
    <div className="flex max-h-[calc(100vh-12rem)] flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="shrink-0 border-b border-border px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold capitalize ${statusBadgeClass(blog.status)}`}
          >
            {statusLabel(blog.status)}
          </span>
          <Link
            href={`/admin/blogs/${blog.id}`}
            className="text-xs font-semibold text-primary hover:underline"
          >
            Open full page →
          </Link>
        </div>
        <h3 className="mt-2 line-clamp-2 text-base font-semibold text-foreground">{blog.title}</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          By{" "}
          <Link
            href={`/admin/users?search=${encodeURIComponent(blog.author?.email ?? "")}`}
            className="font-medium text-primary hover:underline"
          >
            {blog.author?.email ?? "Unknown"}
          </Link>
          {blog.author?.role === "mentor" && authorId ? (
            <>
              {" · "}
              <Link
                href={`/mentors/${authorId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Public profile ↗
              </Link>
            </>
          ) : null}
        </p>
      </div>

      {blog.admin_comment ? (
        <div className="shrink-0 border-b border-orange-500/20 bg-orange-500/5 px-4 py-2 text-xs text-orange-900 dark:text-orange-100">
          <span className="font-semibold">Prior feedback: </span>
          {blog.admin_comment}
        </div>
      ) : null}

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <BlogContent content={blog.content} className="text-sm" />
      </div>

      <div className="shrink-0 space-y-2 border-t border-border bg-muted/20 px-4 py-3">
        {canModerate ? (
          <>
            <button
              type="button"
              disabled={busy}
              onClick={onApprove}
              className="w-full rounded-lg bg-primary py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
            >
              Approve & publish
            </button>
            {!showRevise ? (
              <button
                type="button"
                disabled={busy}
                onClick={() => setShowRevise(true)}
                className="w-full rounded-lg border border-border py-2 text-sm font-medium disabled:opacity-50"
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
                  rows={3}
                  value={reviseComment}
                  onChange={(e) => setReviseComment(e.target.value)}
                  placeholder="Feedback for mentor"
                  className="w-full rounded-lg border border-border bg-background px-2 py-1.5 text-xs"
                />
                <button
                  type="button"
                  disabled={busy || !reviseComment.trim()}
                  onClick={() => {
                    onRevise(reviseComment.trim());
                    setShowRevise(false);
                    setReviseComment("");
                  }}
                  className="w-full rounded-lg bg-orange-600 py-2 text-xs font-semibold text-white disabled:opacity-50"
                >
                  Send revision request
                </button>
              </div>
            )}
          </>
        ) : null}
        <button
          type="button"
          disabled={busy}
          onClick={onDelete}
          className="w-full rounded-lg border border-red-500/40 py-2 text-xs font-semibold text-red-600 disabled:opacity-50 dark:text-red-400"
        >
          Delete story
        </button>
      </div>
    </div>
  );
}
