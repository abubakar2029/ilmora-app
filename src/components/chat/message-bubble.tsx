"use client";

import ChatMessageBody from "@/components/chat/chat-message-body";
import type { ChatMessage } from "@/lib/messaging-api";

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

function ReadTicks({ read }: { read: boolean }) {
  return (
    <span className={`ml-1 text-[10px] ${read ? "text-sky-200" : "text-white/70"}`} aria-hidden>
      {read ? "✓✓" : "✓"}
    </span>
  );
}

export default function MessageBubble({ message }: { message: ChatMessage }) {
  const mine = message.is_mine;
  const read = Boolean(message.read_at);

  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div
        className={`relative max-w-[min(85%,20rem)] rounded-2xl px-3.5 py-2 text-[14px] leading-snug shadow-sm
          ${mine ? "rounded-br-md bg-[#0d9b83] text-white" : "rounded-bl-md border border-border/80 bg-card text-foreground"}
        `}
      >
        <ChatMessageBody text={message.body} />
        <div
          className={`mt-1 flex items-center justify-end gap-0.5 text-[10px] ${mine ? "text-white/75" : "text-muted-foreground"}`}
        >
          <time dateTime={message.created_at}>{formatTime(message.created_at)}</time>
          {mine ? <ReadTicks read={read} /> : null}
        </div>
      </div>
    </div>
  );
}
