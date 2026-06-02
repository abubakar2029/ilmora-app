"use client";

import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/context/AuthContext";
import { apiJson } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";

export type AuthMe = {
  id?: number;
  email?: string;
  role?: string;
  needs_role_selection?: boolean;
};

async function fetchAuthMe(): Promise<AuthMe> {
  return apiJson<AuthMe>("/api/auth/me/", { method: "GET" });
}

/** Cached session user details (email, role flags). JWT remains source of truth for role. */
export function useAuthMe() {
  const { user, isLoading: authLoading } = useAuth();

  return useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: fetchAuthMe,
    enabled: !authLoading && Boolean(user),
    staleTime: 5 * 60 * 1000,
  });
}
