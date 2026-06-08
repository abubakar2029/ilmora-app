"use client";

import { useEffect, useState } from "react";

import AvailabilityCalendar from "@/components/mentor/availability-calendar";
import { InlineLoader, Skeleton } from "@/components/ui/loading";
import { useMyAvailability, useUpdateAvailabilityMutation } from "@/hooks/queries";
import { availabilitySummaryFromSlots } from "@/lib/availability-summary";
import type { AvailabilitySlot } from "@/lib/mentor-api";

type Props = {
  /** When true, omit top border/margin (used inside dashboard card). */
  embedded?: boolean;
};

export default function MentorAvailabilitySection({ embedded = false }: Props) {
  const { data, isLoading: loading, error: loadError } = useMyAvailability();
  const updateMutation = useUpdateAvailabilityMutation();

  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (data?.availability_slots) {
      setSlots(data.availability_slots);
    }
  }, [data?.availability_slots]);

  async function handleSaveCalendar() {
    setSaved(false);
    try {
      await updateMutation.mutateAsync(slots);
      setSaved(true);
    } catch {
      /* error shown below */
    }
  }

  if (loading) {
    return (
      <div className={`flex flex-col gap-3 ${embedded ? "" : "mt-6"}`} role="status" aria-busy="true">
        <InlineLoader label="Loading availability…" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  const summary = availabilitySummaryFromSlots(slots);
  const error =
    (loadError instanceof Error ? loadError.message : null) ??
    (updateMutation.error instanceof Error ? updateMutation.error.message : null);

  return (
    <section className={embedded ? "" : "mt-8 border-t border-border pt-8"}>
      {!embedded ? (
        <>
          <h2 className="text-lg font-semibold text-foreground">Weekly availability</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Students can only book one-hour slots inside these windows. Hours are also used for AI matching.
          </p>
        </>
      ) : null}
      {summary ? (
        <p className="rounded-xl bg-primary/[0.06] px-3.5 py-2.5 text-[13px] font-medium text-foreground ring-1 ring-primary/15">
          {summary}
        </p>
      ) : (
        <p className="text-[13px] text-muted-foreground">No time blocks yet — add your first slot below.</p>
      )}
      <div className="mt-4">
        <AvailabilityCalendar slots={slots} onChange={setSlots} />
      </div>
      {error ? (
        <p className="mt-3 text-sm text-red-500" role="alert">
          {error}
        </p>
      ) : null}
      {saved ? (
        <p className="mt-3 text-sm text-primary" role="status">
          Weekly hours saved.
        </p>
      ) : null}
      <button
        type="button"
        disabled={updateMutation.isPending}
        onClick={() => void handleSaveCalendar()}
        className="mt-4 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
      >
        {updateMutation.isPending ? "Saving…" : "Save weekly hours"}
      </button>
    </section>
  );
}
