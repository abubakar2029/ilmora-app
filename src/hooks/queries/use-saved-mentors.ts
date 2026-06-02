"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/context/AuthContext";
import { ApiError, apiFetch } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";

export type SavedMentorItem = {
  mentor_id: number;
  headline: string;
  expertise: string;
  badges: { id: string; label: string; description: string }[];
  saved_at: string;
};

type SavedResponse = {
  mentor_ids: number[];
  items: SavedMentorItem[];
};

async function fetchSaved(): Promise<SavedResponse> {
  const res = await apiFetch("/api/matches/saved/", { method: "GET" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data);
  return data as SavedResponse;
}

export function useSavedMentors() {
  const { user, isLoading: authLoading } = useAuth();
  const enabled = !authLoading && user?.role === "student";

  return useQuery({
    queryKey: queryKeys.matches.saved,
    queryFn: fetchSaved,
    enabled,
    staleTime: 60 * 1000,
  });
}

export function useToggleSaveMentor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (mentorId: number) => {
      const res = await apiFetch("/api/matches/saved/", {
        method: "POST",
        body: JSON.stringify({ mentor_id: mentorId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new ApiError(res.status, data);
      return data as { saved: boolean; mentor_id: number };
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.matches.saved });
      void queryClient.invalidateQueries({ queryKey: queryKeys.matches.mentors });
      void queryClient.invalidateQueries({ queryKey: queryKeys.matches.studentSummary });
    },
  });
}
