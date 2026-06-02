import type { MentorBadge } from "@/lib/mentor-api";

const BADGE_META: Record<
  string,
  { icon: string; accent: string; ring: string }
> = {
  profile_complete: {
    icon: "✦",
    accent: "from-emerald-500/20 to-emerald-600/5",
    ring: "ring-emerald-500/40",
  },
  match_ready: {
    icon: "⚡",
    accent: "from-amber-500/20 to-amber-600/5",
    ring: "ring-amber-500/40",
  },
  calendar_set: {
    icon: "📅",
    accent: "from-sky-500/20 to-sky-600/5",
    ring: "ring-sky-500/40",
  },
  published_author: {
    icon: "📝",
    accent: "from-violet-500/20 to-violet-600/5",
    ring: "ring-violet-500/40",
  },
  storyteller: {
    icon: "📚",
    accent: "from-indigo-500/20 to-indigo-600/5",
    ring: "ring-indigo-500/40",
  },
  first_connection: {
    icon: "🤝",
    accent: "from-primary/25 to-primary/5",
    ring: "ring-primary/50",
  },
  trusted_mentor: {
    icon: "⭐",
    accent: "from-yellow-500/25 to-orange-500/5",
    ring: "ring-yellow-500/50",
  },
};

const DEFAULT_META = {
  icon: "🏅",
  accent: "from-muted/50 to-muted/20",
  ring: "ring-border",
};

type Props = {
  badges: MentorBadge[];
  /** Show locked placeholder slots for common badges (dashboard only). */
  showLockedHints?: boolean;
};

const ALL_BADGE_IDS = Object.keys(BADGE_META);

export default function MentorBadgeGrid({ badges, showLockedHints = false }: Props) {
  const earnedIds = new Set(badges.map((b) => b.id));

  if (!badges.length && !showLockedHints) {
    return (
      <p className="text-sm text-muted-foreground">
        Earn badges by completing your profile, setting availability, publishing stories, and connecting
        with students.
      </p>
    );
  }

  const items = showLockedHints
    ? ALL_BADGE_IDS.map((id) => {
        const earned = badges.find((b) => b.id === id);
        return earned ?? { id, label: id.replace(/_/g, " "), description: "Not earned yet", locked: true };
      })
    : badges.map((b) => ({ ...b, locked: false }));

  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((b) => {
        const locked = "locked" in b && b.locked;
        const meta = BADGE_META[b.id] ?? DEFAULT_META;
        return (
          <li
            key={b.id}
            title={b.description}
            className={`group relative flex flex-col items-center rounded-xl border bg-gradient-to-b p-4 text-center shadow-sm transition-transform
              ${locked ? "border-dashed border-border opacity-45 grayscale" : `border-border ${meta.ring} ring-1 hover:-translate-y-0.5`}
              ${meta.accent}
            `}
          >
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-full text-xl shadow-inner
                ${locked ? "bg-muted text-muted-foreground" : "bg-card text-foreground ring-2 ring-background"}
              `}
              aria-hidden
            >
              {meta.icon}
            </div>
            <span
              className={`mt-3 text-xs font-bold leading-tight ${locked ? "text-muted-foreground" : "text-foreground"}`}
            >
              {b.label}
            </span>
            {!locked ? (
              <span className="mt-1 line-clamp-2 text-[10px] leading-snug text-muted-foreground">
                {b.description}
              </span>
            ) : (
              <span className="mt-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                Locked
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
