"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/context/AuthContext";
import { getMyAvailability, updateMyAvailability, type AvailabilitySlot } from "@/lib/mentor-api";
import { queryKeys } from "@/lib/query-keys";

export function useMyAvailability() {
  const { user, isLoading: authLoading } = useAuth();

  return useQuery({
    queryKey: queryKeys.availability.me,
    queryFn: getMyAvailability,
    enabled: !authLoading && user?.role === "mentor",
    staleTime: 2 * 60 * 1000,
  });
}

export function useUpdateAvailabilityMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slots: AvailabilitySlot[]) =>
      updateMyAvailability({ availability_slots: slots }),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.availability.me, data);
      void queryClient.invalidateQueries({ queryKey: queryKeys.profile.me });
    },
  });
}
