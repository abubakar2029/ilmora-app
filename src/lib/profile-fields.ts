/** PM-defined profile fields — aligned with backend models and AI embedding input. */

export type ProfileFieldDef = {
  id: string;
  label: string;
  hint: string;
  aiPurpose: string;
  placeholder: string;
  rows?: number;
};

export const STUDENT_PROFILE_FIELDS: ProfileFieldDef[] = [
  {
    id: "headline",
    label: "Headline",
    hint: "One line that sums up who you are right now.",
    aiPurpose: "Context for journey steps and match summaries.",
    placeholder: "e.g. Final-year CS student interested in machine learning",
    rows: 2,
  },
  {
    id: "skills",
    label: "Skills & strengths",
    hint: "Tools, subjects, or strengths you already have.",
    aiPurpose: "Embedding input for mentor and story matching.",
    placeholder: "e.g. Python, statistics, public speaking, React",
    rows: 3,
  },
  {
    id: "goals",
    label: "Goals",
    hint: "What you want to achieve in the next 6–12 months.",
    aiPurpose: "Primary signal for journey roadmap and mentor similarity.",
    placeholder: "e.g. Land a data internship, publish a portfolio project",
    rows: 3,
  },
  {
    id: "background",
    label: "Background",
    hint: "Education, experience, or context that shapes your path.",
    aiPurpose: "Grounds recommendations so they fit your situation.",
    placeholder: "e.g. BSc at XYZ, completed two internships, switching from finance",
    rows: 4,
  },
];

export const MENTOR_PROFILE_FIELDS: ProfileFieldDef[] = [
  {
    id: "headline",
    label: "Headline",
    hint: "How you introduce yourself to students.",
    aiPurpose: "Shown on match cards and embedding context.",
    placeholder: "e.g. Senior product manager · ex-startup founder",
    rows: 2,
  },
  {
    id: "expertise",
    label: "Expertise",
    hint: "Topics, industries, and skills you can mentor on.",
    aiPurpose: "Embedding input for student–mentor matching.",
    placeholder: "e.g. Career transitions, ML interviews, UX portfolios",
    rows: 4,
  },
];

/** Headline + expertise only; weekly hours come from the calendar below. */
export const MENTOR_PROFILE_FORM_FIELDS = MENTOR_PROFILE_FIELDS;

export const MENTOR_SOCIAL_FIELDS: ProfileFieldDef[] = [
  {
    id: "contact_email",
    label: "Contact email",
    hint: "Optional public email for students (can differ from login email).",
    aiPurpose: "Not used for matching.",
    placeholder: "you@example.com",
  },
  {
    id: "linkedin_url",
    label: "LinkedIn",
    hint: "Full profile URL.",
    aiPurpose: "Shown on your public page.",
    placeholder: "https://linkedin.com/in/yourname",
  },
  {
    id: "instagram_url",
    label: "Instagram",
    hint: "Full profile URL.",
    aiPurpose: "Shown on your public page.",
    placeholder: "https://instagram.com/yourname",
  },
  {
    id: "facebook_url",
    label: "Facebook",
    hint: "Full profile or page URL.",
    aiPurpose: "Shown on your public page.",
    placeholder: "https://facebook.com/yourname",
  },
];

export function roleLabel(role: string | undefined): string {
  if (role === "mentor") return "Mentor";
  if (role === "student") return "Student";
  if (role === "admin") return "Admin";
  return "Account";
}
