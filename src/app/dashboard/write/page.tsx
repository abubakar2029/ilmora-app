"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";

import StoryEditor from "@/components/blog/story-editor";
import MentorGuard from "@/components/mentor-guard";
import { createStory, getMyStory, updateStory } from "@/lib/blog-api";
import type { Blog } from "@/lib/blogs";
import { statusBadgeClass, statusLabel } from "@/lib/blogs";

function WriteStoryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");
  const storyId = editId ? Number.parseInt(editId, 10) : null;

  const [loading, setLoading] = useState(Boolean(storyId));
  const [existing, setExisting] = useState<Blog | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadStory = useCallback(async () => {
    if (!storyId || Number.isNaN(storyId)) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const blog = await getMyStory(storyId);
      setExisting(blog);
      setTitle(blog.title);
      setContent(blog.content);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load story");
    } finally {
      setLoading(false);
    }
  }, [storyId]);

  useEffect(() => {
    void loadStory();
  }, [loadStory]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const t = title.trim();
    const c = content.trim();
    if (!t || !c) {
      setError("Title and content are required.");
      return;
    }
    setSaving(true);
    try {
      if (storyId && existing) {
        await updateStory(storyId, t, c);
      } else {
        await createStory(t, c);
      }
      router.push("/dashboard/my-stories");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="h-9 w-56 animate-pulse rounded-lg bg-muted" />
        <div className="mt-8 h-96 animate-pulse rounded-xl bg-muted/70" />
      </div>
    );
  }

  if (storyId && error && !existing) {
    return (
      <div className="mx-auto max-w-3xl">
        <p className="text-sm text-red-500" role="alert">
          {error}
        </p>
        <Link href="/dashboard/my-stories" className="mt-4 inline-block text-sm font-medium text-primary hover:underline">
          Back to my stories
        </Link>
      </div>
    );
  }

  const isEdit = Boolean(storyId && existing);

  return (
    <div className="mx-auto max-w-3xl">
      <header className="mb-8">
        <Link
          href="/dashboard/my-stories"
          className="text-sm font-medium text-muted-foreground hover:text-primary"
        >
          ← My stories
        </Link>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-foreground lg:text-3xl">
            {isEdit ? "Edit story" : "Write a story"}
          </h1>
          {existing ? (
            <span
              className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${statusBadgeClass(existing.status)}`}
            >
              {statusLabel(existing.status)}
            </span>
          ) : null}
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          {isEdit
            ? "Update your draft and resubmit for review."
            : "Share your mentorship journey with students on Ilmora."}
        </p>
      </header>

      {existing?.status === "needs_revision" && existing.admin_comment ? (
        <div
          className="mb-6 rounded-xl border border-orange-500/40 bg-orange-500/10 px-4 py-4 text-sm"
          role="alert"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-orange-800 dark:text-orange-200">
            Revision requested
          </p>
          <p className="mt-2 whitespace-pre-wrap text-orange-950 dark:text-orange-100">
            {existing.admin_comment}
          </p>
        </div>
      ) : null}

      <form onSubmit={(e) => void handleSubmit(e)} className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <StoryEditor
          title={title}
          content={content}
          onTitleChange={setTitle}
          onContentChange={setContent}
          disabled={saving}
        />

        {error ? (
          <p className="mt-4 text-sm text-red-500" role="alert">
            {error}
          </p>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-3 border-t border-border pt-6">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving…" : isEdit ? "Save changes" : "Submit for review"}
          </button>
          <Link
            href="/dashboard/my-stories"
            className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

export default function WriteStoryPage() {
  return (
    <MentorGuard>
      <Suspense
        fallback={
          <div className="mx-auto max-w-3xl">
            <div className="h-9 w-56 animate-pulse rounded-lg bg-muted" />
            <div className="mt-8 h-96 animate-pulse rounded-xl bg-muted/70" />
          </div>
        }
      >
        <WriteStoryContent />
      </Suspense>
    </MentorGuard>
  );
}
