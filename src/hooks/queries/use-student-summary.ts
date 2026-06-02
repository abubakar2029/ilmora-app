"use client";

import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/context/AuthContext";
import { ApiError, apiFetch } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";

export type StudentDashboardSummary = {
  pending_connections: number;
  connected_count: number;
  saved_mentors_count: number;
  upcoming_sessions: number;
  unread_messages: number;
  recent_chats: {
    connection_id: number;
    other_user_id: number;
    other_headline: string;
    last_message: string;
    last_message_at: string | null;
    unread_count: number;
  }[];
};

async function fetchSummary(): Promise<StudentDashboardSummary> {
  const res = await apiFetch("/api/matches/student-summary/", { method: "GET" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data);
  return data as StudentDashboardSummary;
}

export function useStudentDashboardSummary() {
  const { user, isLoading: authLoading } = useAuth();
  const enabled = !authLoading && user?.role === "student";

  return useQuery({
    queryKey: queryKeys.matches.studentSummary,
    queryFn: fetchSummary,
    enabled,
    staleTime: 45 * 1000,
  });
}
