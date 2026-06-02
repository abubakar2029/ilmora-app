"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/context/AuthContext";
import { ApiError, apiFetch } from "@/lib/api";
import type { MentorBadge } from "@/lib/mentor-api";
import { queryKeys } from "@/lib/query-keys";

export type MentorProfileDto = {
  id?: number;
  user: number;
  headline: string;
  expertise: string;
  availability?: string;
  availability_slots?: { weekday: number; start: string; end: string }[];
  badges?: MentorBadge[];
  contact_email?: string;
  linkedin_url?: string;
  instagram_url?: string;
  facebook_url?: string;
};

export type StudentProfileDto = {
  id?: number;
  user: number;
  headline: string;
  skills: string;
  goals: string;
  background: string;
};

export function isStudentProfile(
  p: StudentProfileDto | MentorProfileDto,
): p is StudentProfileDto {
  return "goals" in p && "background" in p;
}

async function fetchMyProfile(): Promise<StudentProfileDto | MentorProfileDto | null> {
  const res = await apiFetch("/api/profiles/me/", { method: "GET" });
  const data = await res.json().catch(() => ({}));
  if (res.status === 404) return null;
  if (!res.ok) throw new ApiError(res.status, data);
  return data as StudentProfileDto | MentorProfileDto;
}

export function useMyProfile() {
  const { user, isLoading: authLoading } = useAuth();
  const role = typeof user?.role === "string" ? user.role : "";
  const enabled = !authLoading && (role === "student" || role === "mentor");

  return useQuery({
    queryKey: queryKeys.profile.me,
    queryFn: fetchMyProfile,
    enabled,
    staleTime: 2 * 60 * 1000,
  });
}

export function useSaveProfileMutation() {
  const queryClient = useQueryClient();
  const { syncUser } = useAuth();

  return useMutation({
    mutationFn: async ({
      body,
      create,
    }: {
      body: Record<string, string>;
      create: boolean;
    }) => {
      const res = await apiFetch("/api/profiles/me/", {
        method: create ? "POST" : "PATCH",
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new ApiError(res.status, data);
      return data as StudentProfileDto | MentorProfileDto;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.profile.me });
      void queryClient.invalidateQueries({ queryKey: queryKeys.matches.mentors });
      void queryClient.invalidateQueries({ queryKey: queryKeys.matches.students });
      syncUser();
    },
  });
}
