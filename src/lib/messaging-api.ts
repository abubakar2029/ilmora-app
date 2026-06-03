import { ApiError, apiFetch } from "@/lib/api";

export type ChatThread = {
  connection_id: number;
  conversation_id: number;
  other_user_id: number;
  other_email: string;
  other_role: string;
  last_message: string;
  last_message_at: string | null;
  last_message_sender_id: number | null;
  unread_count: number;
};

export type ChatMessage = {
  id: number;
  sender_id: number;
  body: string;
  client_id: string;
  read_at: string | null;
  created_at: string;
  is_mine: boolean;
};

export type ConversationDetail = {
  connection_id: number;
  conversation_id: number;
  other_user_id: number;
  other_email: string;
  other_role: string;
  other_typing: boolean;
  messages: ChatMessage[];
};

export function isConversationDetail(data: unknown): data is ConversationDetail {
  if (!data || typeof data !== "object") return false;
  const d = data as ConversationDetail;
  return (
    typeof d.other_email === "string" &&
    typeof d.other_role === "string" &&
    Array.isArray(d.messages)
  );
}

export function conversationFromThread(
  thread: ChatThread,
  messages: ChatMessage[] = [],
  other_typing = false,
): ConversationDetail {
  return {
    connection_id: thread.connection_id,
    conversation_id: thread.conversation_id,
    other_user_id: thread.other_user_id,
    other_email: thread.other_email,
    other_role: thread.other_role,
    other_typing,
    messages,
  };
}

export async function listChatThreads(): Promise<ChatThread[]> {
  const res = await apiFetch("/api/messages/conversations/", { method: "GET" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data);
  return Array.isArray(data) ? data : [];
}

export async function fetchConversation(
  connectionId: number,
  afterId?: number,
  signal?: AbortSignal,
): Promise<ConversationDetail> {
  const q = afterId ? `?after=${afterId}` : "";
  const res = await apiFetch(`/api/messages/conversations/${connectionId}/${q}`, {
    method: "GET",
    signal,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data);
  if (!isConversationDetail(data)) {
    throw new ApiError(res.status, { detail: "Invalid conversation response from server." });
  }
  return data;
}

function normalizeChatMessage(data: unknown): ChatMessage {
  if (!data || typeof data !== "object") {
    throw new ApiError(500, data, "Invalid message response from server.");
  }
  const m = data as ChatMessage;
  if (typeof m.id !== "number" || typeof m.body !== "string") {
    throw new ApiError(500, data, "Invalid message response from server.");
  }
  return {
    id: m.id,
    sender_id: typeof m.sender_id === "number" ? m.sender_id : 0,
    body: m.body,
    client_id: typeof m.client_id === "string" ? m.client_id : "",
    read_at: m.read_at ?? null,
    created_at: typeof m.created_at === "string" ? m.created_at : new Date().toISOString(),
    is_mine: Boolean(m.is_mine),
  };
}

export async function sendChatMessage(
  connectionId: number,
  body: string,
  clientId?: string,
): Promise<ChatMessage> {
  const res = await apiFetch(`/api/messages/conversations/${connectionId}/send/`, {
    method: "POST",
    body: JSON.stringify({ body, client_id: clientId ?? "" }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data);
  return normalizeChatMessage(data);
}

export async function markChatRead(connectionId: number, upToMessageId?: number): Promise<void> {
  const res = await apiFetch(`/api/messages/conversations/${connectionId}/read/`, {
    method: "POST",
    body: JSON.stringify(
      upToMessageId != null ? { up_to_message_id: upToMessageId } : {},
    ),
  });
  if (!res.ok) throw new ApiError(res.status, await res.json().catch(() => ({})));
}

export async function sendTypingPing(connectionId: number): Promise<void> {
  await apiFetch(`/api/messages/conversations/${connectionId}/typing/`, { method: "POST" });
}

export async function inviteStudent(studentUserId: number): Promise<void> {
  const res = await apiFetch(`/api/matches/invite/${studentUserId}/`, { method: "POST" });
  if (!res.ok) throw new ApiError(res.status, await res.json().catch(() => ({})));
}
