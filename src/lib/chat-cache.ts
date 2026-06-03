import { isConversationDetail, type ChatMessage, type ConversationDetail } from "@/lib/messaging-api";

/**
 * Merge a server conversation fetch with cached messages so optimistic / in-flight
 * sends are not dropped when a poll or refetch returns stale data.
 */
export function mergeConversationFromServer(
  cached: ConversationDetail | undefined,
  server: ConversationDetail,
): ConversationDetail {
  if (!cached || !isConversationDetail(cached) || cached.connection_id !== server.connection_id) {
    return server;
  }

  const serverById = new Map(server.messages.map((m) => [m.id, m]));
  const serverClientIds = new Set(
    server.messages.map((m) => m.client_id).filter((id) => id.length > 0),
  );

  const extra: ChatMessage[] = [];
  const recentCutoff = Date.now() - 3 * 60 * 1000;
  for (const m of cached.messages) {
    if (m.id > 0 && serverById.has(m.id)) continue;
    if (m.client_id && serverClientIds.has(m.client_id)) continue;
    const recent =
      Number.isFinite(new Date(m.created_at).getTime()) &&
      new Date(m.created_at).getTime() >= recentCutoff;
    if (
      m.id < 0 ||
      (m.is_mine && m.client_id && !serverClientIds.has(m.client_id)) ||
      (m.is_mine && m.id > 0 && !serverById.has(m.id) && recent)
    ) {
      extra.push(m);
    }
  }

  const merged = [...server.messages, ...extra];
  merged.sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );

  return {
    ...server,
    other_typing: server.other_typing || cached.other_typing,
    messages: merged,
  };
}

export function mergeServerMessage(
  prev: ConversationDetail,
  serverMsg: ChatMessage,
  clientId?: string,
): ConversationDetail {
  let messages = prev.messages.filter(
    (m) => !(clientId && m.client_id === clientId && m.id < 0),
  );
  if (messages.some((m) => m.id === serverMsg.id)) {
    messages = messages.map((m) => (m.id === serverMsg.id ? serverMsg : m));
  } else if (clientId) {
    const idx = messages.findIndex((m) => m.client_id === clientId);
    if (idx >= 0) {
      messages = [...messages];
      messages[idx] = serverMsg;
    } else {
      messages = [...messages, serverMsg];
    }
  } else {
    messages = [...messages, serverMsg];
  }
  messages.sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );
  return { ...prev, messages };
}
