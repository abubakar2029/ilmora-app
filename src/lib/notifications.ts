export type AppNotification = {
  id: number;
  notif_type: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

export type PaginatedNotifications = {
  count: number;
  next: string | null;
  previous: string | null;
  results: AppNotification[];
};

export function parseNotificationsResponse(data: unknown): PaginatedNotifications {
  if (Array.isArray(data)) {
    return { count: data.length, next: null, previous: null, results: data as AppNotification[] };
  }
  if (!data || typeof data !== "object") {
    return { count: 0, next: null, previous: null, results: [] };
  }
  const o = data as Record<string, unknown>;
  if (Array.isArray(o.results)) {
    return {
      count: typeof o.count === "number" ? o.count : o.results.length,
      next: typeof o.next === "string" ? o.next : null,
      previous: typeof o.previous === "string" ? o.previous : null,
      results: o.results as AppNotification[],
    };
  }
  return { count: 0, next: null, previous: null, results: [] };
}
