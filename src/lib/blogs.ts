import { stripMarkdown } from "@/lib/markdown";

export type BlogAuthor = {
  id: number;
  email: string;
  role: string;
  date_joined: string;
};

export type Blog = {
  id: number;
  author: BlogAuthor;
  title: string;
  content: string;
  status: string;
  admin_comment: string;
  created_at: string;
  updated_at?: string;
  published_at: string | null;
};

export function statusBadgeClass(status: string): string {
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

export function statusLabel(status: string): string {
  return status.replace(/_/g, " ");
}

export function canEditStory(b: Blog): boolean {
  return b.status === "pending" || b.status === "needs_revision";
}

export function canDeleteStory(b: Blog): boolean {
  return b.status === "pending";
}

export type PaginatedBlogs = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Blog[];
};

export type FeedItem = {
  id: number;
  title: string;
  content: string;
  author_id: number;
  score: number;
};

export function previewContent(text: string, max = 100): string {
  const t = stripMarkdown(text);
  if (t.length <= max) return t;
  return `${t.slice(0, max).trim()}…`;
}
