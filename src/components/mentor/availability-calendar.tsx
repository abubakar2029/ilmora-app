"use client";

import type { AvailabilitySlot } from "@/lib/mentor-api";

const DAYS = [
  { value: 0, label: "Monday" },
  { value: 1, label: "Tuesday" },
  { value: 2, label: "Wednesday" },
  { value: 3, label: "Thursday" },
  { value: 4, label: "Friday" },
  { value: 5, label: "Saturday" },
  { value: 6, label: "Sunday" },
];

const emptySlot = (): AvailabilitySlot => ({ weekday: 1, start: "09:00", end: "17:00" });

type Props = {
  slots: AvailabilitySlot[];
  onChange: (slots: AvailabilitySlot[]) => void;
  readOnly?: boolean;
};

export function formatSlotsForDisplay(slots: AvailabilitySlot[]): { day: string; time: string }[] {
  return slots.map((s) => ({
    day: DAYS.find((d) => d.value === s.weekday)?.label ?? `Day ${s.weekday}`,
    time: `${s.start} – ${s.end}`,
  }));
}

export default function AvailabilityCalendar({ slots, onChange, readOnly = false }: Props) {
  function updateSlot(index: number, patch: Partial<AvailabilitySlot>) {
    onChange(slots.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  }

  function removeSlot(index: number) {
    onChange(slots.filter((_, i) => i !== index));
  }

  function addSlot() {
    onChange([...slots, emptySlot()]);
  }

  if (readOnly) {
    const rows = formatSlotsForDisplay(slots);
    if (!rows.length) {
      return <p className="text-sm text-muted-foreground">No weekly hours set yet.</p>;
    }
    return (
      <ul className="space-y-2">
        {rows.map((r, i) => (
          <li
            key={`${r.day}-${i}`}
            className="flex justify-between rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm"
          >
            <span className="font-medium text-foreground">{r.day}</span>
            <span className="text-muted-foreground">{r.time}</span>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Add when you are generally available for students. Shown on your public mentor page.
      </p>
      {slots.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
          No time blocks yet. Add your first slot below.
        </p>
      ) : (
        <ul className="space-y-3">
          {slots.map((slot, index) => (
            <li
              key={index}
              className="flex flex-wrap items-end gap-3 rounded-lg border border-border bg-card p-3"
            >
              <div className="min-w-[140px] flex-1">
                <label className="text-xs font-medium text-muted-foreground">Day</label>
                <select
                  value={slot.weekday}
                  onChange={(e) => updateSlot(index, { weekday: Number(e.target.value) })}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-2 py-2 text-sm"
                >
                  {DAYS.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">From</label>
                <input
                  type="time"
                  value={slot.start}
                  onChange={(e) => updateSlot(index, { start: e.target.value })}
                  className="mt-1 block rounded-lg border border-border bg-background px-2 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">To</label>
                <input
                  type="time"
                  value={slot.end}
                  onChange={(e) => updateSlot(index, { end: e.target.value })}
                  className="mt-1 block rounded-lg border border-border bg-background px-2 py-2 text-sm"
                />
              </div>
              <button
                type="button"
                onClick={() => removeSlot(index)}
                className="rounded-lg px-2 py-2 text-xs font-medium text-red-600 hover:bg-red-500/10 dark:text-red-400"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
      <button
        type="button"
        onClick={addSlot}
        className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted"
      >
        + Add time slot
      </button>
    </div>
  );
}
