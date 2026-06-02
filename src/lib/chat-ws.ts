function getApiBase(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL?.trim();
  return (raw && raw.replace(/\/$/, "")) || "http://127.0.0.1:8000";
}

export function getChatWebSocketUrl(connectionId: number, accessToken: string): string {
  const httpBase = getApiBase();
  const wsBase = httpBase.replace(/^https:/i, "wss:").replace(/^http:/i, "ws:");
  const token = encodeURIComponent(accessToken);
  return `${wsBase}/ws/chat/${connectionId}/?token=${token}`;
}

export type ChatWsEvent =
  | { type: "connected"; connection_id: number }
  | { type: "message"; message: {
      id: number;
      sender_id: number;
      body: string;
      client_id: string;
      read_at: string | null;
      created_at: string;
    } }
  | { type: "typing"; user_id: number }
  | { type: "read"; user_id: number; up_to_message_id?: number }
  | { type: "pong" };

export function parseChatWsEvent(data: unknown): ChatWsEvent | null {
  if (!data || typeof data !== "object") return null;
  const o = data as Record<string, unknown>;
  if (o.type === "connected" && typeof o.connection_id === "number") {
    return { type: "connected", connection_id: o.connection_id };
  }
  if (o.type === "typing" && typeof o.user_id === "number") {
    return { type: "typing", user_id: o.user_id };
  }
  if (o.type === "read" && typeof o.user_id === "number") {
    return {
      type: "read",
      user_id: o.user_id,
      up_to_message_id: typeof o.up_to_message_id === "number" ? o.up_to_message_id : undefined,
    };
  }
  if (o.type === "message" && o.message && typeof o.message === "object") {
    const m = o.message as Record<string, unknown>;
    if (
      typeof m.id === "number" &&
      typeof m.sender_id === "number" &&
      typeof m.body === "string" &&
      typeof m.created_at === "string"
    ) {
      return {
        type: "message",
        message: {
          id: m.id,
          sender_id: m.sender_id,
          body: m.body,
          client_id: typeof m.client_id === "string" ? m.client_id : "",
          read_at: typeof m.read_at === "string" ? m.read_at : null,
          created_at: m.created_at,
        },
      };
    }
  }
  return null;
}
