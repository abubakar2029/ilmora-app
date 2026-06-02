"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/context/AuthContext";
import { ApiError, apiFetch } from "@/lib/api";
import { findMentorMatches, findStudentMatches } from "@/lib/matching-api";
import { queryKeys } from "@/lib/query-keys";

function asArray<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object" && Array.isArray((data as { results?: unknown }).results)) {
    return (data as { results: T[] }).results;
  }
  return [];
}

async function fetchMentorMatches<T>(): Promise<T[]> {
  const res = await apiFetch("/api/matches/mentors/", { method: "GET" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data);
  return asArray<T>(data);
}

async function fetchStudentMatches<T>(): Promise<T[]> {
  const res = await apiFetch("/api/matches/students/", { method: "GET" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data);
  return asArray<T>(data);
}

async function fetchConnections<T>(): Promise<T[]> {
  const res = await apiFetch("/api/matches/my-connections/", { method: "GET" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data);
  return asArray<T>(data);
}

export function useMatchesBundle<TMentor, TStudent, TConn>() {
  const { user, isLoading: authLoading } = useAuth();
  const role = typeof user?.role === "string" ? user.role : "";
  const isStudent = role === "student";
  const isMentor = role === "mentor";
  const enabled = !authLoading && (isStudent || isMentor);

  const mentorsQuery = useQuery({
    queryKey: queryKeys.matches.mentors,
    queryFn: () => fetchMentorMatches<TMentor>(),
    enabled: enabled && isStudent,
    staleTime: 2 * 60 * 1000,
  });

  const studentsQuery = useQuery({
    queryKey: queryKeys.matches.students,
    queryFn: () => fetchStudentMatches<TStudent>(),
    enabled: enabled && isMentor,
    staleTime: 2 * 60 * 1000,
  });

  const connectionsQuery = useQuery({
    queryKey: queryKeys.matches.connections,
    queryFn: () => fetchConnections<TConn>(),
    enabled,
    staleTime: 60 * 1000,
  });

  // Disabled queries stay `isPending` in TanStack Query v5 — only count active fetches.
  const mentorsLoading = isStudent && mentorsQuery.isLoading;
  const studentsLoading = isMentor && studentsQuery.isLoading;
  const connectionsLoading = connectionsQuery.isLoading;
  const isLoading = enabled && (mentorsLoading || studentsLoading || connectionsLoading);

  const error =
    (mentorsQuery.error as Error | null) ??
    (studentsQuery.error as Error | null) ??
    (connectionsQuery.error as Error | null);

  return {
    role,
    mentors: mentorsQuery.data ?? [],
    students: studentsQuery.data ?? [],
    connections: connectionsQuery.data ?? [],
    isLoading,
    isFetching:
      mentorsQuery.isFetching || studentsQuery.isFetching || connectionsQuery.isFetching,
    error: error?.message ?? null,
    refetch: async () => {
      await Promise.all([
        mentorsQuery.refetch(),
        studentsQuery.refetch(),
        connectionsQuery.refetch(),
      ]);
    },
  };
}

export function useMatchMutations() {
  const queryClient = useQueryClient();

  const invalidateMatches = () => {
    void queryClient.invalidateQueries({ queryKey: ["matches"] });
    void queryClient.invalidateQueries({ queryKey: ["inbox"] });
    void queryClient.invalidateQueries({ queryKey: queryKeys.messages.threads });
    void queryClient.invalidateQueries({ queryKey: queryKeys.matches.studentSummary });
  };

  const findMentors = useMutation({
    mutationFn: () => findMentorMatches(),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.matches.mentors, data);
      void queryClient.invalidateQueries({ queryKey: queryKeys.matches.connections });
    },
  });

  const findStudents = useMutation({
    mutationFn: () => findStudentMatches(),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.matches.students, data);
      void queryClient.invalidateQueries({ queryKey: queryKeys.matches.connections });
    },
  });

  const connectToMentor = useMutation({
    mutationFn: async (mentorUserId: number) => {
      const res = await apiFetch(`/api/matches/connect/${mentorUserId}/`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new ApiError(res.status, data);
      return data;
    },
    onSuccess: invalidateMatches,
  });

  const updateConnection = useMutation({
    mutationFn: async ({
      matchId,
      status,
    }: {
      matchId: number;
      status: "connected" | "declined";
    }) => {
      const res = await apiFetch(`/api/matches/${matchId}/`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new ApiError(res.status, data);
      return data;
    },
    onSuccess: invalidateMatches,
  });

  const inviteStudent = useMutation({
    mutationFn: async (studentUserId: number) => {
      const res = await apiFetch(`/api/matches/invite/${studentUserId}/`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new ApiError(res.status, data);
      return data;
    },
    onSuccess: invalidateMatches,
  });

  return {
    findMentors,
    findStudents,
    connectToMentor,
    updateConnection,
    inviteStudent,
    invalidateMatches,
  };
}
