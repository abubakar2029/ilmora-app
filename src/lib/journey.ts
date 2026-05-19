import type { JourneyStep } from "@/components/journey-roadmap";

export type JourneyDemoReason =
  | "none"
  | "incomplete_profile"
  | "missing_api_key"
  | "missing_sdk"
  | "generating"
  | "quota_exceeded"
  | "model_error"
  | "ai_failed"
  | "wrong_role";

export type JourneyApiResponse = {
  steps: JourneyStep[];
  is_demo: boolean;
  has_profile: boolean;
  demo_reason: JourneyDemoReason;
  missing_fields: string[];
  message?: string | null;
};

const STATUSES = new Set<JourneyStep["status"]>(["completed", "active", "upcoming"]);

const DEMO_REASONS = new Set<JourneyDemoReason>([
  "none",
  "incomplete_profile",
  "missing_api_key",
  "missing_sdk",
  "generating",
  "quota_exceeded",
  "model_error",
  "ai_failed",
  "wrong_role",
]);

function parseDemoReason(value: unknown): JourneyDemoReason {
  if (typeof value === "string" && DEMO_REASONS.has(value as JourneyDemoReason)) {
    return value as JourneyDemoReason;
  }
  return "none";
}

export function parseJourneyResponse(data: unknown): JourneyApiResponse {
  if (!data || typeof data !== "object") {
    return {
      steps: [],
      is_demo: true,
      has_profile: false,
      demo_reason: "ai_failed",
      missing_fields: [],
      message: "Could not load journey data.",
    };
  }
  const o = data as Record<string, unknown>;
  const rawSteps = Array.isArray(o.steps) ? o.steps : [];
  const steps: JourneyStep[] = [];
  for (const item of rawSteps) {
    if (!item || typeof item !== "object") continue;
    const s = item as Record<string, unknown>;
    const id = typeof s.id === "number" ? s.id : Number(s.id);
    const title = typeof s.title === "string" ? s.title : "";
    const description = typeof s.description === "string" ? s.description : "";
    const status = s.status;
    const color = typeof s.color === "string" ? s.color : "pink";
    if (!Number.isFinite(id) || !title) continue;
    if (typeof status !== "string" || !STATUSES.has(status as JourneyStep["status"])) continue;
    steps.push({
      id,
      title,
      description,
      status: status as JourneyStep["status"],
      color,
    });
  }

  const is_demo = Boolean(o.is_demo);
  let demo_reason = parseDemoReason(o.demo_reason);
  if (is_demo && demo_reason === "none") {
    demo_reason = o.has_profile ? "ai_failed" : "incomplete_profile";
  }

  const missing_fields = Array.isArray(o.missing_fields)
    ? o.missing_fields.filter((f): f is string => typeof f === "string")
    : [];

  return {
    steps,
    is_demo,
    has_profile: Boolean(o.has_profile),
    demo_reason,
    missing_fields,
    message: typeof o.message === "string" ? o.message : null,
  };
}

export function journeyToastForResult(parsed: JourneyApiResponse): { text: string; variant: "success" | "error" } {
  if (!parsed.is_demo) {
    return { text: "Journey updated with your personalized roadmap.", variant: "success" };
  }
  switch (parsed.demo_reason) {
    case "generating":
      return { text: "Generating your roadmap… refresh in a moment.", variant: "success" };
    case "incomplete_profile":
      return { text: "Complete your profile to generate a personalized journey.", variant: "success" };
    case "missing_api_key":
      return { text: "Gemini API key missing on the server.", variant: "error" };
    case "missing_sdk":
      return { text: "Install google-generativeai in the backend Python environment.", variant: "error" };
    case "quota_exceeded":
      return { text: "Gemini quota exceeded — check Google AI Studio billing.", variant: "error" };
    case "model_error":
      return { text: "Gemini model not available — update GEMINI_MODEL in backend/.env.", variant: "error" };
    default:
      return { text: parsed.message || "Showing demo roadmap — AI generation did not succeed.", variant: "error" };
  }
}
