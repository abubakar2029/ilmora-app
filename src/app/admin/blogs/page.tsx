"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import AdminPagination from "@/components/admin/admin-pagination";
import BlogQueuePreview from "@/components/admin/blog-queue-preview";
import { useToast } from "@/components/toast";
import { ListSkeleton } from "@/components/ui/loading";
import { useAdminBlog, useAdminBlogs, useAdminMutations } from "@/hooks/queries/use-admin";
import type { Blog } from "@/lib/blogs";
import { previewContent, statusBadgeClass, statusLabel } from "@/lib/blogs";

type Filter = "pending" | "all" | "published" | "needs_revision";

const cardClass = "rounded-xl border border-border bg-card shadow-sm overflow-hidden";

function canApproveInList(status: Blog["status"]): boolean {
  return status === "pending" || status === "needs_revision";
}

export default function AdminBlogsPage() {
  const { showToast } = useToast();
  const { approveBlog, deleteBlog, reviseBlog, ADMIN_PAGE_SIZE } = useAdminMutations();
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [filter]);

  const statusParam = filter === "all" ? undefined : filter;
  const { data, isLoading, error, isFetching } = useAdminBlogs({
    status: statusParam,
    search: debouncedSearch,
    page,
  });

  const { data: previewBlog, isLoading: previewLoading } = useAdminBlog(selectedId);

  const blogs = data?.results ?? [];
  const total = data?.count ?? 0;

  useEffect(() => {
    if (blogs.length > 0 && selectedId == null) {
      setSelectedId(blogs[0].id);
    }
    if (selectedId != null && blogs.length > 0 && !blogs.some((b) => b.id === selectedId)) {
      setSelectedId(blogs[0].id);
    }
    if (blogs.length === 0) setSelectedId(null);
  }, [blogs, selectedId]);

  const busy = approveBlog.isPending || deleteBlog.isPending || reviseBlog.isPending;

  async function handleApprove(id: number) {
    try {
      await approveBlog.mutateAsync(id);
      showToast("Story approved and published.", "success");
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Approve failed", "error");
    }
  }

  async function handleDelete(id: number) {
    const b = blogs.find((x) => x.id === id) ?? previewBlog;
    if (!b || !window.confirm(`Delete "${b.title}"?`)) return;
    try {
      await deleteBlog.mutateAsync(id);
      showToast("Story deleted.", "success");
      if (selectedId === id) setSelectedId(null);
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Delete failed", "error");
    }
  }

  async function handleRevise(id: number, comment: string) {
    try {
      await reviseBlog.mutateAsync({ id, comment });
      showToast("Revision request sent.", "success");
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Request failed", "error");
    }
  }

  const filterBtn = (id: Filter, label: string) => (
    <button
      type="button"
      onClick={() => setFilter(id)}
      className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
        filter === id
          ? "bg-primary text-primary-foreground"
          : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );

  return (
    <section>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {filterBtn("all", "All")}
          {filterBtn("pending", "Pending")}
          {filterBtn("needs_revision", "Revision")}
          {filterBtn("published", "Published")}
        </div>
        <div className="flex w-full items-center gap-2 sm:w-auto sm:min-w-[min(100%,280px)] sm:max-w-md">
          <input
            id="blog-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search stories…"
            aria-label="Search stories by title, content, or author"
            className="h-10 w-full rounded-lg border-2 border-foreground/15 bg-card px-3 text-sm shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/40 focus:ring-2 focus:ring-ring/30"
          />
          {isFetching && !isLoading ? (
            <span className="shrink-0 text-xs text-muted-foreground">Refreshing…</span>
          ) : null}
        </div>
      </div>

      {error ? (
        <p className="mb-4 text-sm text-red-500" role="alert">
          Failed to load stories.
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_minmax(280px,360px)]">
        <div className={cardClass}>
          {isLoading ? (
            <div className="p-6">
              <ListSkeleton count={5} />
            </div>
          ) : blogs.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">No stories match your filters.</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/40">
                      <th className="px-4 py-3 font-semibold">Title</th>
                      <th className="px-4 py-3 font-semibold">Author</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {blogs.map((b) => {
                      const selected = selectedId === b.id;
                      return (
                        <tr
                          key={b.id}
                          onClick={() => setSelectedId(b.id)}
                          className={`cursor-pointer border-b border-border last:border-0 ${
                            selected ? "bg-primary/8" : "hover:bg-muted/20"
                          }`}
                        >
                          <td className="max-w-[220px] px-4 py-3">
                            <span className="font-medium text-foreground line-clamp-1">{b.title}</span>
                            <span className="mt-0.5 block text-xs text-muted-foreground line-clamp-1">
                              {previewContent(b.content, 60)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <Link
                              href={`/admin/users?search=${encodeURIComponent(b.author?.email ?? "")}`}
                              onClick={(e) => e.stopPropagation()}
                              className="text-xs text-primary hover:underline"
                            >
                              {b.author?.email ?? "—"}
                            </Link>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize ${statusBadgeClass(b.status)}`}
                            >
                              {statusLabel(b.status)}
                            </span>
                            {canApproveInList(b.status) ? (
                              <button
                                type="button"
                                disabled={busy}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  void handleApprove(b.id);
                                }}
                                className="mt-1 block text-[10px] font-semibold text-primary hover:underline disabled:opacity-50"
                              >
                                Quick approve
                              </button>
                            ) : null}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <AdminPagination
                page={page}
                pageSize={ADMIN_PAGE_SIZE}
                total={total}
                onPageChange={setPage}
              />
            </>
          )}
        </div>

        <BlogQueuePreview
          blog={previewBlog ?? null}
          loading={previewLoading && selectedId != null}
          busy={busy}
          onApprove={() => selectedId && void handleApprove(selectedId)}
          onDelete={() => selectedId && void handleDelete(selectedId)}
          onRevise={(c) => selectedId && void handleRevise(selectedId, c)}
        />
      </div>
    </section>
  );
}
