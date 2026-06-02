"use client";

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/context/AuthContext";
import { ApiError, apiFetch } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import type { AppNotification, PaginatedNotifications } from "@/lib/notifications";
import { parseNotificationsResponse } from "@/lib/notifications";

const PREVIEW_URL = "/api/notifications/?page_size=100";
const DASHBOARD_PREVIEW_URL = "/api/notifications/?page=1&page_size=8";
const LIST_FIRST_URL = "/api/notifications/?page=1";

async function fetchNotificationsPreview(): Promise<AppNotification[]> {
  const res = await apiFetch(PREVIEW_URL, { method: "GET" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data);
  return parseNotificationsResponse(data).results;
}

async function fetchDashboardNotificationsPreview(): Promise<AppNotification[]> {
  const res = await apiFetch(DASHBOARD_PREVIEW_URL, { method: "GET" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data);
  return parseNotificationsResponse(data).results;
}

async function fetchNotificationsPage(url: string): Promise<PaginatedNotifications> {
  const res = await apiFetch(url, { method: "GET" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data);
  return parseNotificationsResponse(data);
}

/** Bell + dashboard preview — shared cache, light polling when tab visible. */
export function useNotificationsPreview() {
  const { user, isLoading: authLoading } = useAuth();

  return useQuery({
    queryKey: queryKeys.notifications.preview,
    queryFn: fetchNotificationsPreview,
    enabled: !authLoading && Boolean(user),
    staleTime: 30 * 1000,
    refetchInterval: (query) =>
      typeof document !== "undefined" && document.visibilityState === "visible" && query.state.data
        ? 30_000
        : false,
  });
}

/** Dashboard card — 8 items, shares invalidation with bell/history. */
export function useDashboardNotificationsPreview() {
  const { user, isLoading: authLoading } = useAuth();

  return useQuery({
    queryKey: [...queryKeys.notifications.preview, "dashboard"] as const,
    queryFn: fetchDashboardNotificationsPreview,
    enabled: !authLoading && Boolean(user),
    staleTime: 30 * 1000,
  });
}

/** Full notifications page with infinite scroll. */
export function useNotificationsInfinite() {
  const { user, isLoading: authLoading } = useAuth();

  return useInfiniteQuery({
    queryKey: ["notifications", "infinite"] as const,
    queryFn: ({ pageParam }) => fetchNotificationsPage(pageParam),
    initialPageParam: LIST_FIRST_URL,
    getNextPageParam: (last) => last.next ?? undefined,
    enabled: !authLoading && Boolean(user),
    staleTime: 60 * 1000,
  });
}

export function useNotificationMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["notifications"] });
  };

  const markRead = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiFetch(`/api/notifications/${id}/read/`, { method: "PATCH" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new ApiError(res.status, data);
      return data as AppNotification;
    },
    onSuccess: invalidate,
  });

  const markAllRead = useMutation({
    mutationFn: async () => {
      const res = await apiFetch("/api/notifications/read-all/", { method: "POST" });
      if (!res.ok) throw new ApiError(res.status, await res.json().catch(() => ({})));
    },
    onSuccess: invalidate,
  });

  return { markRead, markAllRead, invalidate };
}
