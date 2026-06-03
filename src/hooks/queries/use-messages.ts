"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/context/AuthContext";
import {
  fetchConversation,
  isConversationDetail,
  listChatThreads,
  markChatRead,
  sendChatMessage,
  sendTypingPing,
  type ChatMessage,
  type ChatThread,
  type ConversationDetail,
} from "@/lib/messaging-api";
import { mergeConversationFromServer, mergeServerMessage } from "@/lib/chat-cache";
import { trackError } from "@/lib/error-tracker";
import {
  markPendingFailed,
  mergePendingMessages,
  registerPendingMessage,
  resolvePendingMessage,
} from "@/lib/pending-messages";
import { queryKeys } from "@/lib/query-keys";

/** Keep sidebar unread badge in sync without waiting for a threads refetch. */
export function patchThreadUnread(
  queryClient: ReturnType<typeof useQueryClient>,
  connectionId: number,
  unreadCount: number,
) {
  queryClient.setQueryData<ChatThread[]>(queryKeys.messages.threads, (threads) => {
    if (!threads) return threads;
    return threads.map((t) =>
      t.connection_id === connectionId ? { ...t, unread_count: unreadCount } : t,
    );
  });
}

export function patchThreadPreview(
  queryClient: ReturnType<typeof useQueryClient>,
  connectionId: number,
  message: Pick<ChatMessage, "body" | "created_at" | "sender_id" | "is_mine">,
  unreadCount?: number,
) {
  queryClient.setQueryData<ChatThread[]>(queryKeys.messages.threads, (threads) => {
    if (!threads) return threads;
    return threads.map((t) => {
      if (t.connection_id !== connectionId) return t;
      return {
        ...t,
        last_message: message.body.slice(0, 200),
        last_message_at: message.created_at,
        last_message_sender_id: message.sender_id,
        unread_count: unreadCount ?? (message.is_mine ? t.unread_count : t.unread_count + 1),
      };
    });
  });
}

export function maxUnreadIncomingId(messages: ChatMessage[]): number | null {
  const ids = messages
    .filter((m) => !m.is_mine && m.id > 0 && !m.read_at)
    .map((m) => m.id);
  return ids.length ? Math.max(...ids) : null;
}

function resolveUserId(user: Record<string, unknown> | null | undefined): number | undefined {
  const raw = user?.user_id ?? user?.sub;
  if (typeof raw === "number" && !Number.isNaN(raw)) return raw;
  if (typeof raw === "string") {
    const n = Number.parseInt(raw, 10);
    if (!Number.isNaN(n)) return n;
  }
  return undefined;
}

export function useChatThreads() {
  const { user, isLoading: authLoading } = useAuth();

  return useQuery({
    queryKey: queryKeys.messages.threads,
    queryFn: listChatThreads,
    enabled: !authLoading && Boolean(user),
    staleTime: 10 * 1000,
    refetchInterval: 12_000,
    refetchIntervalInBackground: false,
  });
}

type ConversationOptions = {
  /** Poll conversation when WebSocket is disconnected (ms). */
  pollIntervalMs?: number;
};

export function useConversation(
  connectionId: number | null,
  options?: ConversationOptions,
) {
  const queryClient = useQueryClient();
  const { user, isLoading: authLoading } = useAuth();
  const pollMs = options?.pollIntervalMs ?? 0;
  const conversationKey =
    connectionId != null && connectionId > 0
      ? queryKeys.messages.conversation(connectionId)
      : null;

  return useQuery({
    queryKey: queryKeys.messages.conversation(connectionId ?? 0),
    queryFn: async ({ signal }) => {
      const server = await fetchConversation(connectionId!, undefined, signal);
      if (!conversationKey) return server;
      const cached = queryClient.getQueryData<ConversationDetail>(conversationKey);
      const merged = mergeConversationFromServer(cached, server);
      return {
        ...merged,
        messages: mergePendingMessages(connectionId!, merged.messages),
      };
    },
    enabled: !authLoading && Boolean(user) && connectionId != null && connectionId > 0,
    staleTime: 15_000,
    gcTime: 10 * 60_000,
    structuralSharing: false,
    refetchOnWindowFocus: true,
    refetchInterval: (query) => {
      if (
        typeof document === "undefined" ||
        document.visibilityState !== "visible" ||
        !isConversationDetail(query.state.data)
      ) {
        return false;
      }
      return pollMs > 0 ? pollMs : false;
    },
  });
}

export function useMessageMutations(connectionId: number | null) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const currentUserId = resolveUserId(user ?? undefined);

  const conversationKey =
    connectionId != null && connectionId > 0
      ? queryKeys.messages.conversation(connectionId)
      : null;

  const refreshThreads = () => {
    void queryClient.refetchQueries({ queryKey: queryKeys.messages.threads });
  };

  const sendMessage = useMutation({
    mutationFn: ({
      body,
      clientId,
    }: {
      body: string;
      clientId?: string;
    }) => sendChatMessage(connectionId!, body, clientId),
    onMutate: async ({ body, clientId }) => {
      if (!conversationKey || !connectionId || !currentUserId) return;
      const fetchState = queryClient.getQueryState(conversationKey);
      if (fetchState?.status !== "success") return;

      const prev = queryClient.getQueryData<ConversationDetail>(conversationKey);
      if (!prev || !isConversationDetail(prev)) return;

      const optimistic: ChatMessage = {
        id: -Date.now(),
        sender_id: currentUserId,
        body,
        client_id: clientId ?? "",
        read_at: null,
        created_at: new Date().toISOString(),
        is_mine: true,
      };

      registerPendingMessage(connectionId, optimistic, "sending");

      queryClient.setQueryData(conversationKey, {
        ...prev,
        messages: mergePendingMessages(connectionId, [...prev.messages, optimistic]),
      });
      return { prev, clientId };
    },
    onError: (err, variables, ctx) => {
      trackError("chat:send", err, {
        connectionId: connectionId ?? undefined,
        clientId: variables.clientId,
      });
      if (connectionId && variables.clientId) {
        markPendingFailed(connectionId, variables.clientId);
      }
      if (conversationKey && connectionId && variables.clientId) {
        queryClient.setQueryData<ConversationDetail>(conversationKey, (current) => {
          const base =
            current && isConversationDetail(current)
              ? current
              : ctx?.prev && isConversationDetail(ctx.prev)
                ? ctx.prev
                : null;
          if (!base) return current;
          return {
            ...base,
            messages: mergePendingMessages(connectionId, base.messages),
          };
        });
      }
      if (conversationKey) {
        void queryClient.refetchQueries({ queryKey: conversationKey });
      }
    },
    onSuccess: (serverMsg, variables) => {
      if (!conversationKey || !connectionId) return;
      if (variables.clientId) {
        resolvePendingMessage(connectionId, variables.clientId);
      }
      const fetchState = queryClient.getQueryState(conversationKey);
      const prev = queryClient.getQueryData<ConversationDetail>(conversationKey);

      if (fetchState?.status === "success" && prev && isConversationDetail(prev)) {
        queryClient.setQueryData<ConversationDetail>(conversationKey, (current) => {
          const base = current && isConversationDetail(current) ? current : prev;
          const merged = mergeServerMessage(base, serverMsg, variables.clientId);
          return {
            ...merged,
            messages: mergePendingMessages(connectionId, merged.messages),
          };
        });
      } else {
        void queryClient.refetchQueries({ queryKey: conversationKey });
      }
      if (connectionId) {
        patchThreadPreview(queryClient, connectionId, serverMsg, 0);
      }
      refreshThreads();
    },
  });

  const typing = useMutation({
    mutationFn: () => sendTypingPing(connectionId!),
  });

  const markRead = useMutation({
    mutationFn: (upToMessageId?: number) => markChatRead(connectionId!, upToMessageId),
    onSuccess: (_, upToMessageId) => {
      if (!conversationKey || !connectionId) return;
      queryClient.setQueryData<ConversationDetail>(conversationKey, (prev) => {
        if (!prev || !isConversationDetail(prev)) return prev;
        return {
          ...prev,
          messages: prev.messages.map((m) =>
            !m.is_mine && (upToMessageId == null || m.id <= upToMessageId)
              ? { ...m, read_at: m.read_at ?? new Date().toISOString() }
              : m,
          ),
        };
      });
      patchThreadUnread(queryClient, connectionId, 0);
      refreshThreads();
    },
  });

  return { sendMessage, typing, markRead, refreshThreads };
}
