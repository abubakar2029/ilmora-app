"use client";

import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef } from "react";

import MessageBubble from "@/components/chat/message-bubble";
import ChatInput from "@/components/chat/chat-input";
import { InlineLoader } from "@/components/ui/loading";
import { usePendingMessagesRevision } from "@/hooks/use-pending-messages";
import { useChatSocket } from "@/hooks/use-chat-socket";
import {
  maxUnreadIncomingId,
  patchThreadUnread,
  useChatThreads,
  useConversation,
  useMessageMutations,
} from "@/hooks/queries";
import { useAuth } from "@/context/AuthContext";
import { displayFirstName } from "@/lib/display-name";
import { trackError } from "@/lib/error-tracker";
import { mergePendingMessages } from "@/lib/pending-messages";
import { isConversationDetail } from "@/lib/messaging-api";
import type { ChatMessage } from "@/lib/messaging-api";
import type { PendingChatMessage } from "@/lib/pending-messages";
import { queryKeys } from "@/lib/query-keys";

function dateLabel(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
}

type Row =
  | { type: "date"; key: string; label: string }
  | { type: "msg"; key: string; message: PendingChatMessage };

function buildRows(messages: PendingChatMessage[]): Row[] {
  const rows: Row[] = [];
  let lastDate = "";
  for (const m of messages) {
    const label = dateLabel(m.created_at);
    if (label !== lastDate) {
      rows.push({ type: "date", key: `d-${label}-${m.id}`, label });
      lastDate = label;
    }
    rows.push({ type: "msg", key: `m-${m.id}-${m.client_id}`, message: m });
  }
  return rows;
}

type Props = {
  connectionId: number;
  onBack?: () => void;
};

export default function ChatWindow({ connectionId, onBack }: Props) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const rawId = user?.user_id ?? user?.sub;
  const currentUserId =
    typeof rawId === "number"
      ? rawId
      : typeof rawId === "string"
        ? Number.parseInt(rawId, 10)
        : undefined;
  const { data: threads = [] } = useChatThreads();
  const thread = threads.find((t) => t.connection_id === connectionId);
  const pendingRevision = usePendingMessagesRevision();
  const { sendMessage, typing, markRead } = useMessageMutations(connectionId);
  const { mutate: markReadMutate } = markRead;

  const handleIncomingMessage = useCallback(
    (msg: ChatMessage) => {
      if (!msg.is_mine && msg.id > 0) {
        patchThreadUnread(queryClient, connectionId, 0);
        markReadMutate(msg.id);
      }
    },
    [connectionId, markReadMutate, queryClient],
  );

  const { connected: wsConnected, otherTyping: wsOtherTyping, sendTyping } = useChatSocket({
    connectionId,
    currentUserId,
    enabled: Boolean(connectionId),
    onIncomingMessage: handleIncomingMessage,
  });

  const { data, isFetching, error, isSuccess, isError, refetch: refetchConversation } =
    useConversation(connectionId, {
      pollIntervalMs: wsConnected ? 12_000 : 3_000,
    });

  const bottomRef = useRef<HTMLDivElement>(null);
  const lastMarkedIdRef = useRef(0);

  const conversation = isConversationDetail(data) ? data : undefined;

  useEffect(() => {
    lastMarkedIdRef.current = 0;
  }, [connectionId]);

  useEffect(() => {
    if (isError && error) {
      trackError("chat:conversation", error, { connectionId });
    }
  }, [isError, error, connectionId]);

  useEffect(() => {
    if (!isSuccess) return;
    patchThreadUnread(queryClient, connectionId, 0);
  }, [isSuccess, connectionId, queryClient]);

  const displayMessages = useMemo(
    () => mergePendingMessages(connectionId, conversation?.messages ?? []),
    [connectionId, conversation?.messages, pendingRevision],
  );

  const rows = useMemo(() => buildRows(displayMessages), [displayMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [displayMessages.length, conversation?.other_typing, wsOtherTyping]);

  useEffect(() => {
    if (!isSuccess || !conversation?.messages.length) return;
    const upTo = maxUnreadIncomingId(conversation.messages);
    if (upTo == null || upTo <= lastMarkedIdRef.current) return;
    lastMarkedIdRef.current = upTo;
    patchThreadUnread(queryClient, connectionId, 0);
    markReadMutate(upTo);
  }, [conversation?.messages, isSuccess, connectionId, markReadMutate, queryClient]);

  const handleSend = useCallback(
    (body: string) => {
      const clientId = `c-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      void sendMessage.mutate({ body, clientId });
    },
    [sendMessage],
  );

  const handleRefresh = useCallback(() => {
    void refetchConversation();
    void queryClient.refetchQueries({ queryKey: queryKeys.messages.threads });
  }, [queryClient, refetchConversation]);

  const waitingForConversation = !isSuccess && !isError;

  if (waitingForConversation) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <InlineLoader label="Loading messages…" />
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
        <p className="text-sm text-red-500" role="alert">
          {error instanceof Error ? error.message : "Chat unavailable"}
        </p>
        <Link href="/dashboard/messages" className="text-sm font-medium text-primary hover:underline">
          Back to messages
        </Link>
      </div>
    );
  }

  const name = displayFirstName(conversation.other_email || thread?.other_email || "Chat");

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col bg-[#e8ece9] dark:bg-muted/20">
      <header className="flex items-center gap-3 border-b border-border bg-card px-3 py-2.5 shadow-sm">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="rounded-lg px-2 py-1 text-sm font-medium text-primary hover:bg-muted md:hidden"
          >
            ←
          </button>
        ) : null}
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/12 text-sm font-semibold text-primary">
          {name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">{name}</p>
          {conversation.other_typing || wsOtherTyping || wsConnected ? (
            <p className="text-xs text-muted-foreground">
              {conversation.other_typing || wsOtherTyping ? (
                <span className="font-medium text-primary">typing…</span>
              ) : (
                <span className="text-emerald-600 dark:text-emerald-400">online</span>
              )}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={isFetching}
          aria-label="Refresh messages"
          title="Refresh messages"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
            aria-hidden
          >
            <path d="M21 12a9 9 0 1 1-2.64-6.36" />
            <path d="M21 3v6h-6" />
          </svg>
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-3 py-4">
        <div className="mx-auto flex max-w-2xl flex-col gap-2">
          {rows.map((row) =>
            row.type === "date" ? (
              <div key={row.key} className="my-3 flex justify-center">
                <span className="rounded-full bg-card/90 px-3 py-1 text-[11px] font-medium text-muted-foreground shadow-sm">
                  {row.label}
                </span>
              </div>
            ) : (
              <MessageBubble key={row.key} message={row.message} />
            ),
          )}
          {conversation.other_typing || wsOtherTyping ? (
            <div className="flex justify-start">
              <span className="rounded-2xl rounded-bl-md bg-card px-4 py-2.5 text-sm text-muted-foreground shadow-sm">
                <span className="inline-flex gap-1">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:0ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:120ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:240ms]" />
                </span>
              </span>
            </div>
          ) : null}
          <div ref={bottomRef} />
        </div>
      </div>

      <ChatInput
        disabled={!isSuccess || sendMessage.isPending}
        onSend={handleSend}
        onTyping={() => {
          sendTyping();
          void typing.mutate();
        }}
      />
    </div>
  );
}
