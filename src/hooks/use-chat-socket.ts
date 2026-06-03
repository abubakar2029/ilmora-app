"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";

import { mergeServerMessage } from "@/lib/chat-cache";
import { getAccessToken } from "@/lib/auth";
import { getChatWebSocketUrl, parseChatWsEvent, type ChatWsEvent } from "@/lib/chat-ws";
import { trackError } from "@/lib/error-tracker";
import { patchThreadPreview, patchThreadUnread } from "@/hooks/queries/use-messages";
import { isConversationDetail, type ChatMessage, type ConversationDetail } from "@/lib/messaging-api";
import { queryKeys } from "@/lib/query-keys";

type Options = {
  connectionId: number | null;
  currentUserId?: number;
  enabled?: boolean;
  onTyping?: () => void;
  /** Called when the other party sends a message (chat is open). */
  onIncomingMessage?: (message: ChatMessage) => void;
};

export function useChatSocket({
  connectionId,
  currentUserId,
  enabled = true,
  onTyping,
  onIncomingMessage,
}: Options) {
  const queryClient = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [connected, setConnected] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);
  const typingClearRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const appendMessage = useCallback(
    (msg: ChatMessage) => {
      if (!connectionId) return;
      queryClient.setQueryData<ConversationDetail>(
        queryKeys.messages.conversation(connectionId),
        (prev) => {
          if (!prev || !isConversationDetail(prev)) return prev;
          if (msg.id > 0 && prev.messages.some((m) => m.id === msg.id)) {
            return prev;
          }
          if (msg.client_id) {
            const existing = prev.messages.find((m) => m.client_id === msg.client_id);
            if (existing && existing.id === msg.id) return prev;
          }
          const chatMsg: ChatMessage = {
            id: msg.id,
            sender_id: msg.sender_id,
            body: msg.body,
            client_id: msg.client_id,
            read_at: msg.read_at,
            created_at: msg.created_at,
            is_mine: msg.is_mine,
          };
          if (msg.client_id) {
            return mergeServerMessage(prev, chatMsg, msg.client_id);
          }
          return mergeServerMessage(prev, chatMsg);
        },
      );
      if (connectionId) {
        if (!msg.is_mine) {
          patchThreadUnread(queryClient, connectionId, 0);
          onIncomingMessage?.(msg);
        } else {
          patchThreadPreview(queryClient, connectionId, msg, undefined);
        }
      }
    },
    [connectionId, onIncomingMessage, queryClient],
  );

  const handleEvent = useCallback(
    (event: ChatWsEvent) => {
      if (event.type === "connected") {
        setConnected(true);
        return;
      }
      if (event.type === "message" && currentUserId) {
        const m = event.message;
        appendMessage({
          id: m.id,
          sender_id: m.sender_id,
          body: m.body,
          client_id: m.client_id,
          read_at: m.read_at,
          created_at: m.created_at,
          is_mine: m.sender_id === currentUserId,
        });
        return;
      }
      if (event.type === "typing") {
        setOtherTyping(true);
        onTyping?.();
        if (typingClearRef.current) clearTimeout(typingClearRef.current);
        typingClearRef.current = setTimeout(() => setOtherTyping(false), 4000);
        return;
      }
      if (event.type === "read" && connectionId) {
        queryClient.setQueryData<ConversationDetail>(
          queryKeys.messages.conversation(connectionId),
          (prev) => {
            if (!prev || !isConversationDetail(prev)) return prev;
            const upTo = event.up_to_message_id;
            return {
              ...prev,
              messages: prev.messages.map((m) =>
                m.is_mine && (!upTo || m.id <= upTo) ? { ...m, read_at: m.read_at ?? new Date().toISOString() } : m,
              ),
            };
          },
        );
      }
    },
    [appendMessage, connectionId, currentUserId, onTyping, queryClient],
  );

  const connect = useCallback(() => {
    if (!connectionId || !enabled) return;
    const token = getAccessToken();
    if (!token) return;

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    const ws = new WebSocket(getChatWebSocketUrl(connectionId, token));
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);
    ws.onclose = () => {
      setConnected(false);
      if (enabled && connectionId) {
        reconnectRef.current = setTimeout(connect, 2500);
      }
    };
    ws.onerror = () => {
      trackError("chat:ws", "WebSocket error", { connectionId });
      ws.close();
    };
    ws.onmessage = (ev) => {
      try {
        const parsed = parseChatWsEvent(JSON.parse(String(ev.data)));
        if (parsed) handleEvent(parsed);
      } catch (err) {
        trackError("chat:ws", err, { connectionId, phase: "parse" });
      }
    };
  }, [connectionId, enabled, handleEvent]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      if (typingClearRef.current) clearTimeout(typingClearRef.current);
      wsRef.current?.close();
      wsRef.current = null;
      setConnected(false);
      setOtherTyping(false);
    };
  }, [connect]);

  const sendTyping = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "typing" }));
    }
  }, []);

  return { connected, otherTyping, sendTyping };
}
