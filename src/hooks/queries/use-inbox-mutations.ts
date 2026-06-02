"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateConnectionStatus, updateMentorNote } from "@/lib/mentor-api";
import { queryKeys } from "@/lib/query-keys";

export function useInboxMutations() {
  const queryClient = useQueryClient();

  const invalidateInbox = () => {
    void queryClient.invalidateQueries({ queryKey: ["inbox"] });
    void queryClient.invalidateQueries({ queryKey: queryKeys.matches.connections });
  };

  const acceptOrDecline = useMutation({
    mutationFn: ({
      matchId,
      status,
    }: {
      matchId: number;
      status: "connected" | "declined";
    }) => updateConnectionStatus(matchId, status),
    onSuccess: invalidateInbox,
  });

  const saveNote = useMutation({
    mutationFn: ({ matchId, note }: { matchId: number; note: string }) =>
      updateMentorNote(matchId, note),
    onSuccess: invalidateInbox,
  });

  return { acceptOrDecline, saveNote };
}
