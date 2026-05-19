import Link from "next/link";

import type { JourneyDemoReason } from "@/lib/journey";

const FIELD_LABELS: Record<string, string> = {
  headline: "Headline",
  skills: "Skills & strengths",
  goals: "Goals",
  background: "Background",
};

function titleForReason(reason: JourneyDemoReason): string {
  switch (reason) {
    case "incomplete_profile":
      return "Demo roadmap — profile incomplete";
    case "missing_api_key":
      return "Demo roadmap — Gemini API key missing";
    case "missing_sdk":
      return "Demo roadmap — Gemini SDK not installed";
    case "generating":
      return "Demo roadmap — generating…";
    case "quota_exceeded":
      return "Demo roadmap — Gemini quota exceeded";
    case "model_error":
      return "Demo roadmap — Gemini model error";
    case "ai_failed":
      return "Demo roadmap — AI generation failed";
    case "wrong_role":
      return "Demo roadmap — students only";
    default:
      return "Demo roadmap";
  }
}

export default function JourneyDemoBanner({
  reason,
  message,
  missingFields,
}: {
  reason: JourneyDemoReason;
  message?: string | null;
  missingFields?: string[];
}) {
  const showProfileLink = reason === "incomplete_profile" || reason === "generating";
  const missing =
    missingFields && missingFields.length > 0
      ? missingFields.map((f) => FIELD_LABELS[f] ?? f).join(", ")
      : null;

  const detail =
    message ||
    (reason === "incomplete_profile" && missing
      ? `Complete these fields: ${missing}.`
      : "You are viewing a sample journey until a personalized one is available.");

  return (
    <div
      role="status"
      className="mb-6 flex w-full flex-col gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-950 sm:flex-row sm:items-center sm:justify-between dark:text-amber-100"
    >
      <p className="w-full text-pretty font-medium leading-snug">
        <span className="font-semibold">{titleForReason(reason)} — </span>
        {detail}
      </p>
      {showProfileLink ? (
        <Link
          href="/dashboard/profile"
          className="shrink-0 text-sm font-semibold text-primary underline-offset-2 hover:underline"
        >
          {reason === "generating" ? "View profile →" : "Complete profile →"}
        </Link>
      ) : null}
    </div>
  );
}
