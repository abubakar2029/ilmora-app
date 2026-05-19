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
  published_at: string | null;
};

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
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max).trim()}…`;
}
