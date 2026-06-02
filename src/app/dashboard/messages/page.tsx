"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

import ChatThreadList from "@/components/chat/chat-thread-list";
import ChatWindow from "@/components/chat/chat-window";

function MessagesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const raw = searchParams.get("connection");
  const connectionId = raw ? Number.parseInt(raw, 10) : null;
  const validId = connectionId != null && !Number.isNaN(connectionId) && connectionId > 0;

  return (
    <div className="mx-auto flex h-[calc(100dvh-7rem)] max-w-5xl flex-col">
      <header className="mb-4 shrink-0">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Messages</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Chat with your connected mentors and mentees.
        </p>
      </header>

      <div className="flex min-h-0 flex-1 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <aside
          className={`flex w-full flex-col border-border md:w-[min(100%,20rem)] md:border-r
            ${validId ? "hidden md:flex" : "flex"}
          `}
        >
          <div className="border-b border-border px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Chats</p>
          </div>
          <ChatThreadList selectedConnectionId={validId ? connectionId : null} />
        </aside>

        <main
          className={`min-h-0 flex-1 flex-col
            ${validId ? "flex" : "hidden md:flex"}
          `}
        >
          {validId ? (
            <ChatWindow
              connectionId={connectionId!}
              onBack={() => router.push("/dashboard/messages")}
            />
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center bg-[#e8ece9]/50 px-6 text-center dark:bg-muted/10">
              <div className="rounded-full bg-primary/10 p-4 text-3xl" aria-hidden>
                💬
              </div>
              <p className="mt-4 text-sm font-medium text-foreground">Select a conversation</p>
              <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                Choose a chat from the list or connect with someone from Matches.
              </p>
              <Link
                href="/dashboard/inbox"
                className="mt-4 text-sm font-semibold text-primary hover:underline"
              >
                Find connections →
              </Link>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-5xl py-12 text-center text-sm text-muted-foreground">Loading…</div>
      }
    >
      <MessagesContent />
    </Suspense>
  );
}
