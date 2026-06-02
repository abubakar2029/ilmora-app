"use client";

import { useState } from "react";

import { useToast } from "@/components/toast";
import { InlineLoader } from "@/components/ui/loading";
import { useAdminMutations } from "@/hooks/queries/use-admin";

type Audience = "community" | "student" | "mentor" | "all";

const AUDIENCE_OPTIONS: { value: Audience; label: string; hint: string }[] = [
  {
    value: "community",
    label: "Students & mentors",
    hint: "Default community — active students and mentors.",
  },
  {
    value: "student",
    label: "Students only",
    hint: "All active student accounts.",
  },
  {
    value: "mentor",
    label: "Mentors only",
    hint: "All active mentor accounts.",
  },
  {
    value: "all",
    label: "Everyone",
    hint: "Includes admins and staff.",
  },
];

export default function AdminAnnouncementsPage() {
  const { showToast } = useToast();
  const { sendAnnouncement } = useAdminMutations();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState<Audience>("community");
  const [lastResult, setLastResult] = useState<{
    recipients: number;
    notified: number;
    failed: number;
  } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      showToast("Title and message are required.", "error");
      return;
    }
    const audienceLabel = AUDIENCE_OPTIONS.find((o) => o.value === audience)?.label ?? audience;
    if (
      !window.confirm(
        `Send this announcement to "${audienceLabel}"? Each person will get an in-app notification and email.`,
      )
    ) {
      return;
    }
    try {
      const result = await sendAnnouncement.mutateAsync({
        title: title.trim(),
        body: body.trim(),
        audience,
      });
      setLastResult(result);
      showToast(
        `Sent to ${result.notified} of ${result.recipients} recipients${result.failed ? ` (${result.failed} failed)` : ""}.`,
        result.failed ? "error" : "success",
      );
      setTitle("");
      setBody("");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Send failed", "error");
    }
  }

  const sending = sendAnnouncement.isPending;

  return (
    <section className="max-w-xl">
      <p className="text-sm text-muted-foreground">
        Broadcast a message to the Ilmora community. Recipients receive an in-app notification and an
        email (when email is configured).
      </p>

      <form onSubmit={(e) => void handleSubmit(e)} className="mt-6 space-y-5 rounded-xl border border-border bg-card p-6 shadow-sm">
        <div>
          <label htmlFor="ann-audience" className="text-sm font-medium text-foreground">
            Audience
          </label>
          <select
            id="ann-audience"
            value={audience}
            onChange={(e) => setAudience(e.target.value as Audience)}
            disabled={sending}
            className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            {AUDIENCE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-muted-foreground">
            {AUDIENCE_OPTIONS.find((o) => o.value === audience)?.hint}
          </p>
        </div>

        <div>
          <label htmlFor="ann-title" className="text-sm font-medium text-foreground">
            Title
          </label>
          <input
            id="ann-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={sending}
            maxLength={200}
            placeholder="e.g. Scheduled maintenance this Sunday"
            className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label htmlFor="ann-body" className="text-sm font-medium text-foreground">
            Message
          </label>
          <textarea
            id="ann-body"
            rows={6}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            disabled={sending}
            placeholder="Write the full announcement…"
            className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
        </div>

        {sending ? <InlineLoader label="Sending to community…" /> : null}

        {lastResult ? (
          <p className="rounded-lg bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
            Last send: {lastResult.notified}/{lastResult.recipients} notified
            {lastResult.failed > 0 ? ` · ${lastResult.failed} failed` : ""}.
          </p>
        ) : null}

        <button
          type="submit"
          disabled={sending}
          className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
        >
          {sending ? "Sending…" : "Send announcement"}
        </button>
      </form>
    </section>
  );
}
