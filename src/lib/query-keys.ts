/** Central cache keys — keep invalidation predictable across the app. */

export const queryKeys = {
  auth: {
    me: ["auth", "me"] as const,
  },
  profile: {
    me: ["profile", "me"] as const,
  },
  notifications: {
    preview: ["notifications", "preview"] as const,
    list: (page: number) => ["notifications", "list", page] as const,
  },
  inbox: {
    mentor: (status?: string) => ["inbox", "mentor", status ?? "all"] as const,
    student: (status?: string) => ["inbox", "student", status ?? "all"] as const,
  },
  matches: {
    mentors: ["matches", "mentors"] as const,
    students: ["matches", "students"] as const,
    connections: ["matches", "connections"] as const,
    saved: ["matches", "saved"] as const,
    studentSummary: ["matches", "student-summary"] as const,
    mentorSummary: ["matches", "mentor-summary"] as const,
  },
  sessions: {
    list: (when: string) => ["sessions", "list", when] as const,
    slots: (connectionId: number) => ["sessions", "slots", connectionId] as const,
  },
  availability: {
    me: ["availability", "me"] as const,
  },
  messages: {
    threads: ["messages", "threads"] as const,
    conversation: (connectionId: number) => ["messages", "conversation", connectionId] as const,
  },
  admin: {
    overview: ["admin", "overview"] as const,
    blogs: (p: { status?: string; search: string; page: number }) =>
      ["admin", "blogs", p.status ?? "all", p.search, p.page] as const,
    blog: (id: number) => ["admin", "blog", id] as const,
    users: (p: { role: string; search: string; page: number }) =>
      ["admin", "users", p.role, p.search, p.page] as const,
  },
} as const;
