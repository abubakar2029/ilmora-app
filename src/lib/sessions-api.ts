import { ApiError, apiFetch } from "@/lib/api";

export type BookableSlot = {
  scheduled_at: string;
  label: string;
  duration_minutes: number;
};

export type SessionItem = {
  id: number;
  connection_id: number;
  scheduled_at: string;
  note: string;
  status: "requested" | "confirmed" | "cancelled";
  created_at: string;
  student_id: number;
  student_email: string;
  student_headline: string;
  mentor_id: number;
  mentor_headline: string;
  counterpart_id: number;
  counterpart_label: string;
};

export type BookingSlotsResponse = {
  connection_id: number;
  mentor_id: number;
  has_availability: boolean;
  slots: BookableSlot[];
};

async function parseJson<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data);
  return data as T;
}

export async function fetchBookingSlots(connectionId: number): Promise<BookingSlotsResponse> {
  const res = await apiFetch(
    `/api/matches/booking-slots/?connection_id=${encodeURIComponent(String(connectionId))}`,
    { method: "GET" },
  );
  return parseJson(res);
}

export async function listSessions(when: "upcoming" | "past" | "all" = "upcoming"): Promise<SessionItem[]> {
  const res = await apiFetch(`/api/matches/sessions/?when=${encodeURIComponent(when)}`, {
    method: "GET",
  });
  const data = await parseJson<unknown>(res);
  return Array.isArray(data) ? (data as SessionItem[]) : [];
}

export async function updateSessionStatus(
  sessionId: number,
  status: "confirmed" | "cancelled",
): Promise<SessionItem> {
  const res = await apiFetch(`/api/matches/sessions/${sessionId}/`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
  return parseJson(res);
}

export type MentorDashboardSummary = {
  pending_connections: number;
  connected_count: number;
  upcoming_sessions: number;
  pending_session_requests: number;
  unread_messages: number;
};

export async function fetchMentorSummary(): Promise<MentorDashboardSummary> {
  const res = await apiFetch("/api/matches/mentor-summary/", { method: "GET" });
  return parseJson(res);
}
