import type { AvailabilitySlot } from "@/lib/mentor-api";

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function parseHhmm(value: string): number {
  const [h, m] = value.split(":").map((x) => parseInt(x, 10));
  if (Number.isNaN(h) || Number.isNaN(m)) return 0;
  return h * 60 + m;
}

export function weeklyHoursFromSlots(slots: AvailabilitySlot[]): number {
  let totalMinutes = 0;
  for (const slot of slots) {
    totalMinutes += Math.max(0, parseHhmm(slot.end) - parseHhmm(slot.start));
  }
  return Math.round((totalMinutes / 60) * 10) / 10;
}

function formatHoursLabel(hours: number): string {
  if (hours <= 0) return "0 hrs";
  if (hours === 1) return "1 hr";
  if (hours === Math.floor(hours)) return `${Math.floor(hours)} hrs`;
  return `${hours} hrs`;
}

export function formatSlotSchedule(slots: AvailabilitySlot[]): string {
  return slots
    .map((s) => `${DAY_NAMES[s.weekday] ?? `Day ${s.weekday}`} ${s.start}–${s.end}`)
    .join("; ");
}

/** Matches backend `availability_summary_from_slots` for UI display. */
export function availabilitySummaryFromSlots(slots: AvailabilitySlot[]): string {
  if (!slots.length) return "";
  const hours = weeklyHoursFromSlots(slots);
  const schedule = formatSlotSchedule(slots);
  const label = formatHoursLabel(hours);
  return schedule ? `${label}/week (${schedule})` : `${label}/week`;
}
