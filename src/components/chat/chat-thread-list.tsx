"use client";

import Link from "next/link";

import { InlineLoader } from "@/components/ui/loading";
import { useChatThreads } from "@/hooks/queries";
import { displayFirstName } from "@/lib/display-name";
import type { ChatThread } from "@/lib/messaging-api";

function formatPreviewTime(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const sameDay =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();
  if (sameDay) {
    return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  }
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function ThreadRow({ thread, active }: { thread: ChatThread; active: boolean }) {
  const name = displayFirstName(thread.other_email);
  const initial = name.charAt(0).toUpperCase();

  return (
    <Link
      href={`/dashboard/messages?connection=${thread.connection_id}`}
      className={`flex items-center gap-3 border-b border-border/60 px-4 py-3 transition-colors hover:bg-muted/40
        ${active ? "bg-primary/[0.08]" : ""}
      `}
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/12 text-sm font-semibold text-primary">
        {initial}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className="truncate text-sm font-semibold text-foreground">{name}</p>
          <span className="shrink-0 text-[10px] text-muted-foreground">
            {formatPreviewTime(thread.last_message_at)}
          </span>
        </div>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {thread.last_message || "No messages yet"}
        </p>
      </div>
      {!active && thread.unread_count > 0 ? (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
          {thread.unread_count > 9 ? "9+" : thread.unread_count}
        </span>
      ) : null}
    </Link>
  );
}

export default function ChatThreadList({ selectedConnectionId }: { selectedConnectionId: number | null }) {
  const { data: threads = [], isLoading, error } = useChatThreads();

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <InlineLoader label="Loading chats…" />
      </div>
    );
  }

  if (error) {
    return (
      <p className="p-6 text-center text-sm text-red-500" role="alert">
        {error instanceof Error ? error.message : "Could not load chats"}
      </p>
    );
  }

  if (threads.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <p className="text-sm font-medium text-foreground">No conversations yet</p>
        <p className="mt-2 text-xs text-muted-foreground">
          Connect with a mentor or mentee and accept the request to start chatting.
        </p>
        <Link
          href="/dashboard/inbox"
          className="mt-4 text-sm font-semibold text-primary hover:underline"
        >
          Go to Matches →
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {threads.map((t) => (
        <ThreadRow key={t.connection_id} thread={t} active={t.connection_id === selectedConnectionId} />
      ))}
    </div>
  );
}
