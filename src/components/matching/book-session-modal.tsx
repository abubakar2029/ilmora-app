"use client";

import { useEffect, useMemo, useState } from "react";

import Modal from "@/components/ui/modal";
import { InlineLoader } from "@/components/ui/loading";
import { useQueryClient } from "@tanstack/react-query";

import { useBookingSlots } from "@/hooks/queries";
import { ApiError, apiFetch } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";

type Props = {
  open: boolean;
  onClose: () => void;
  connectionId: number;
  mentorLabel: string;
  onBooked?: () => void;
};

export default function BookSessionModal({
  open,
  onClose,
  connectionId,
  mentorLabel,
  onBooked,
}: Props) {
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading, error: loadError } = useBookingSlots(connectionId, open);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setSubmitting(false);
    setSelectedSlot(null);
    setNote("");
  }, [open, connectionId]);

  const slotsByDate = useMemo(() => {
    const map = new Map<string, { scheduled_at: string; label: string }[]>();
    for (const slot of data?.slots ?? []) {
      const dayKey = slot.scheduled_at.slice(0, 10);
      const list = map.get(dayKey) ?? [];
      list.push(slot);
      map.set(dayKey, list);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [data?.slots]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSlot) {
      setError("Select a time slot from the mentor's calendar.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await apiFetch("/api/matches/book-session/", {
        method: "POST",
        body: JSON.stringify({
          connection_id: connectionId,
          scheduled_at: selectedSlot,
          note,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new ApiError(res.status, body);
      void queryClient.invalidateQueries({ queryKey: ["sessions"] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.sessions.slots(connectionId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.notifications.preview });
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
      onBooked?.();
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        const b = err.body as Record<string, unknown>;
        if (typeof b.detail === "string") setError(b.detail);
        else if (Array.isArray(b.scheduled_at)) setError(String(b.scheduled_at[0]));
        else setError("Could not book session. Try again.");
      } else {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    } finally {
      setSubmitting(false);
    }
  }

  const noAvailability = data && !data.has_availability;
  const noSlots = data?.has_availability && (data.slots.length === 0);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Book a session"
      description={`Choose a one-hour slot within ${mentorLabel}'s weekly hours. Only times they set on their dashboard can be booked.`}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="book-session-form"
            disabled={submitting || !selectedSlot || noAvailability || Boolean(noSlots)}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
          >
            {submitting ? "Sending…" : "Send request"}
          </button>
        </>
      }
    >
      <form id="book-session-form" onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
        {isLoading ? (
          <InlineLoader label="Loading open slots…" />
        ) : loadError ? (
          <p className="text-sm text-red-500" role="alert">
            Could not load availability. Try again.
          </p>
        ) : noAvailability ? (
          <p className="rounded-lg border border-amber-500/25 bg-amber-500/5 px-3 py-3 text-sm text-foreground">
            This mentor has not set weekly hours yet. Ask them to add availability on their dashboard
            before booking.
          </p>
        ) : noSlots ? (
          <p className="rounded-lg border border-border bg-muted/30 px-3 py-3 text-sm text-muted-foreground">
            No open slots in the next few weeks within this mentor&apos;s weekly hours. Check back later or
            message them to adjust availability.
          </p>
        ) : (
          <>
            {data?.availability_summary ? (
              <p className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2.5 text-sm text-foreground">
                <span className="font-semibold text-primary">Weekly hours: </span>
                {data.availability_summary}
              </p>
            ) : null}
            <p className="text-xs text-muted-foreground">
              Each button is a one-hour session inside the mentor&apos;s saved availability.
            </p>
            <div className="max-h-64 space-y-4 overflow-y-auto pr-1">
            {slotsByDate.map(([day, daySlots]) => (
              <div key={day}>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {new Date(`${day}T12:00:00`).toLocaleDateString(undefined, {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {daySlots.map((slot) => {
                    const active = selectedSlot === slot.scheduled_at;
                    return (
                      <li key={slot.scheduled_at}>
                        <button
                          type="button"
                          disabled={submitting}
                          onClick={() => setSelectedSlot(slot.scheduled_at)}
                          className={`rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                            active
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-background text-foreground hover:border-primary/40"
                          }`}
                        >
                          {slot.label.split(" · ")[1] ?? slot.label}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
            </div>
          </>
        )}

        <label className="block text-sm">
          <span className="font-medium text-foreground">Note (optional)</span>
          <textarea
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            disabled={submitting}
            placeholder="What would you like to focus on?"
            className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
        </label>
        {error ? (
          <p className="text-sm text-red-500" role="alert">
            {error}
          </p>
        ) : null}
      </form>
    </Modal>
  );
}
