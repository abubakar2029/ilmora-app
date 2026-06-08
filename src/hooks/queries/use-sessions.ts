"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/context/AuthContext";
import {
  fetchBookingSlots,
  fetchMentorSummary,
  listSessions,
  updateSessionStatus,
  type MentorDashboardSummary,
} from "@/lib/sessions-api";
import { queryKeys } from "@/lib/query-keys";

export function useBookingSlots(connectionId: number | null, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.sessions.slots(connectionId ?? 0),
    queryFn: () => fetchBookingSlots(connectionId!),
    enabled: enabled && connectionId != null && connectionId > 0,
    staleTime: 0,
    refetchOnMount: "always",
  });
}

export function useSessions(when: "upcoming" | "past" | "all") {
  const { user, isLoading: authLoading } = useAuth();
  const role = user?.role;
  const enabled = !authLoading && (role === "student" || role === "mentor");

  return useQuery({
    queryKey: queryKeys.sessions.list(when),
    queryFn: () => listSessions(when),
    enabled,
    staleTime: 30 * 1000,
  });
}

export function useSessionMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["sessions"] });
    void queryClient.invalidateQueries({ queryKey: queryKeys.matches.studentSummary });
    void queryClient.invalidateQueries({ queryKey: queryKeys.matches.mentorSummary });
    void queryClient.invalidateQueries({ queryKey: queryKeys.notifications.preview });
  };

  const updateStatus = useMutation({
    mutationFn: ({ sessionId, status }: { sessionId: number; status: "confirmed" | "cancelled" }) =>
      updateSessionStatus(sessionId, status),
    onSuccess: invalidate,
  });

  return { updateStatus, invalidate };
}

export function useMentorDashboardSummary() {
  const { user, isLoading: authLoading } = useAuth();
  const enabled = !authLoading && user?.role === "mentor";

  return useQuery({
    queryKey: queryKeys.matches.mentorSummary,
    queryFn: fetchMentorSummary,
    enabled,
    staleTime: 45 * 1000,
  });
}

export type { MentorDashboardSummary };
