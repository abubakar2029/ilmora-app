import { ApiError, apiFetch } from "@/lib/api";

export type AvailabilitySlot = {
  weekday: number;
  start: string;
  end: string;
};

export type MentorBadge = {
  id: string;
  label: string;
  description: string;
};

export type MenteeInboxItem = {
  id: number;
  student_id: number;
  student_email: string;
  student_headline: string;
  student_goals: string;
  similarity_score: number;
  status: string;
  initiated_by?: string;
  mentor_note: string;
  matched_at: string;
};

export type StudentMentorInboxItem = {
  id: number;
  mentor_id: number;
  mentor_email: string;
  mentor_headline: string;
  mentor_expertise: string;
  badges: MentorBadge[];
  similarity_score: number;
  status: string;
  initiated_by?: string;
  matched_at: string;
};

export type MentorSocialLinks = {
  contact_email?: string;
  linkedin_url?: string;
  instagram_url?: string;
  facebook_url?: string;
};

export type PublicMentorProfile = MentorSocialLinks & {
  user_id: number;
  headline: string;
  expertise: string;
  availability: string;
  availability_slots: AvailabilitySlot[];
  badges: MentorBadge[];
  connected_mentees_count: number;
  connection_id?: number | null;
  connection_status?: string | null;
  published_stories: {
    id: number;
    title: string;
    published_at: string | null;
    created_at: string;
  }[];
};

async function parseJson<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data);
  return data as T;
}

export async function getMyAvailability(): Promise<{
  availability: string;
  availability_slots: AvailabilitySlot[];
  badges?: MentorBadge[];
}> {
  const res = await apiFetch("/api/profiles/me/availability/", { method: "GET" });
  return parseJson(res);
}

export async function updateMyAvailability(payload: {
  availability_slots: AvailabilitySlot[];
}): Promise<{
  availability: string;
  availability_slots: AvailabilitySlot[];
  badges?: MentorBadge[];
}> {
  const res = await apiFetch("/api/profiles/me/availability/", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return parseJson(res);
}

export async function listMenteeInbox(status?: string): Promise<MenteeInboxItem[]> {
  const url = status
    ? `/api/matches/inbox/?status=${encodeURIComponent(status)}`
    : "/api/matches/inbox/";
  const res = await apiFetch(url, { method: "GET" });
  const data = await parseJson<unknown>(res);
  return Array.isArray(data) ? (data as MenteeInboxItem[]) : [];
}

export async function listStudentMentorInbox(status?: string): Promise<StudentMentorInboxItem[]> {
  const url = status
    ? `/api/matches/inbox/?status=${encodeURIComponent(status)}`
    : "/api/matches/inbox/";
  const res = await apiFetch(url, { method: "GET" });
  const data = await parseJson<unknown>(res);
  return Array.isArray(data) ? (data as StudentMentorInboxItem[]) : [];
}

export async function updateConnectionStatus(
  matchId: number,
  status: "connected" | "declined",
): Promise<void> {
  const res = await apiFetch(`/api/matches/${matchId}/`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new ApiError(res.status, data);
  }
}

export async function updateMentorNote(matchId: number, mentor_note: string): Promise<void> {
  const res = await apiFetch(`/api/matches/${matchId}/note/`, {
    method: "PATCH",
    body: JSON.stringify({ mentor_note }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new ApiError(res.status, data);
  }
}

export async function getPublicMentor(userId: number): Promise<PublicMentorProfile> {
  const res = await apiFetch(`/api/profiles/mentors/${userId}/`, { method: "GET" });
  return parseJson<PublicMentorProfile>(res);
}

export async function listMentors(pageSize = 50): Promise<
  { id: number; user: number; headline: string; expertise: string; badges?: MentorBadge[] }[]
> {
  const res = await apiFetch(`/api/profiles/mentors/?page_size=${pageSize}`, { method: "GET" });
  const data = await parseJson<{ results?: unknown[] }>(res);
  return Array.isArray(data.results) ? (data.results as { id: number; user: number; headline: string; expertise: string; badges?: MentorBadge[] }[]) : [];
}
