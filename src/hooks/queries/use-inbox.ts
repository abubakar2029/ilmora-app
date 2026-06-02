"use client";

import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/context/AuthContext";
import {
  listMenteeInbox,
  listStudentMentorInbox,
  type MenteeInboxItem,
  type StudentMentorInboxItem,
} from "@/lib/mentor-api";
import { queryKeys } from "@/lib/query-keys";

export function useMentorInbox(status?: string) {
  const { user, isLoading: authLoading } = useAuth();
  const filter = status && status !== "all" ? status : undefined;

  return useQuery<MenteeInboxItem[]>({
    queryKey: queryKeys.inbox.mentor(filter),
    queryFn: () => listMenteeInbox(filter),
    enabled: !authLoading && user?.role === "mentor",
    staleTime: 60 * 1000,
  });
}

export function useStudentMentorInbox(status?: string) {
  const { user, isLoading: authLoading } = useAuth();
  const filter = status && status !== "all" ? status : undefined;

  return useQuery<StudentMentorInboxItem[]>({
    queryKey: queryKeys.inbox.student(filter),
    queryFn: () => listStudentMentorInbox(filter),
    enabled: !authLoading && user?.role === "student",
    staleTime: 60 * 1000,
  });
}
