import type { ChatMessage } from "@/lib/messaging-api";

export type PendingStatus = "sending" | "failed";

export type PendingChatMessage = ChatMessage & {
  pendingStatus?: PendingStatus;
};

type PendingEntry = {
  connectionId: number;
  message: PendingChatMessage;
};

const pending = new Map<string, PendingEntry>();
const listeners = new Set<() => void>();

function entryKey(connectionId: number, clientId: string): string {
  return `${connectionId}:${clientId}`;
}

function notify(): void {
  listeners.forEach((fn) => fn());
}

export function subscribePendingMessages(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function registerPendingMessage(
  connectionId: number,
  message: ChatMessage,
  status: PendingStatus = "sending",
): void {
  if (!message.client_id) return;
  pending.set(entryKey(connectionId, message.client_id), {
    connectionId,
    message: { ...message, pendingStatus: status },
  });
  notify();
}

export function resolvePendingMessage(connectionId: number, clientId: string): void {
  pending.delete(entryKey(connectionId, clientId));
  notify();
}

export function markPendingFailed(connectionId: number, clientId: string): void {
  const key = entryKey(connectionId, clientId);
  const entry = pending.get(key);
  if (!entry) return;
  pending.set(key, {
    ...entry,
    message: { ...entry.message, pendingStatus: "failed" },
  });
  notify();
}

/** Merge in-flight sends into any message list (survives React Query cache replacement). */
export function mergePendingMessages(
  connectionId: number,
  messages: ChatMessage[],
): PendingChatMessage[] {
  const serverIds = new Set(messages.map((m) => m.id));
  const serverClientIds = new Set(
    messages.map((m) => m.client_id).filter((id) => id.length > 0),
  );

  const extra: PendingChatMessage[] = [];
  for (const { connectionId: cid, message: p } of pending.values()) {
    if (cid !== connectionId) continue;
    if (!p.client_id) continue;
    if (serverClientIds.has(p.client_id)) continue;
    if (p.id > 0 && serverIds.has(p.id)) continue;
    extra.push(p);
  }

  const merged: PendingChatMessage[] = [...messages, ...extra];
  merged.sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );
  return merged;
}

export function getPendingForConnection(connectionId: number): PendingChatMessage[] {
  return [...pending.values()]
    .filter((e) => e.connectionId === connectionId)
    .map((e) => e.message);
}
