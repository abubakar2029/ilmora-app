import type { MentorBadge } from "@/lib/mentor-api";

const BADGE_ICONS: Record<string, string> = {
  profile_complete: "✦",
  match_ready: "⚡",
  calendar_set: "📅",
  published_author: "📝",
  storyteller: "📚",
  first_connection: "🤝",
  trusted_mentor: "⭐",
};

/** Soft tints aligned with dashboard achievement cards. */
const STACK_META: Record<string, { accent: string; ring: string }> = {
  profile_complete: {
    accent: "from-emerald-500/20 to-emerald-600/5",
    ring: "ring-emerald-500/30",
  },
  match_ready: {
    accent: "from-amber-500/20 to-amber-600/5",
    ring: "ring-amber-500/30",
  },
  calendar_set: {
    accent: "from-sky-500/20 to-sky-600/5",
    ring: "ring-sky-500/30",
  },
  published_author: {
    accent: "from-violet-500/20 to-violet-600/5",
    ring: "ring-violet-500/30",
  },
  storyteller: {
    accent: "from-indigo-500/20 to-indigo-600/5",
    ring: "ring-indigo-500/30",
  },
  first_connection: {
    accent: "from-primary/20 to-primary/5",
    ring: "ring-primary/35",
  },
  trusted_mentor: {
    accent: "from-yellow-500/22 to-orange-500/5",
    ring: "ring-yellow-500/30",
  },
};

const DEFAULT_STACK_META = {
  accent: "from-muted/60 to-muted/20",
  ring: "ring-border",
};

type Props = {
  badges?: MentorBadge[];
  max?: number;
  className?: string;
  /**
   * `stack` — overlapping circular medals (match/inbox cards).
   * `pills` — text chips.
   * `icons` — spaced icon row.
   */
  variant?: "stack" | "pills" | "icons";
};

export default function MentorBadgeIcons({
  badges = [],
  max = 6,
  className = "",
  variant = "icons",
}: Props) {
  if (!badges.length) return null;

  const shown = badges.slice(0, max);
  const extra = badges.length - shown.length;
  const extraTitle = badges
    .slice(max)
    .map((b) => b.label)
    .join(", ");

  if (variant === "stack") {
    return (
      <div
        className={`flex items-center ${className}`}
        role="img"
        aria-label={`Achievements: ${badges.map((b) => b.label).join(", ")}`}
      >
        {shown.map((b, index) => {
          const meta = STACK_META[b.id] ?? DEFAULT_STACK_META;
          return (
            <span
              key={b.id}
              title={`${b.label} — ${b.description}`}
              style={{ zIndex: shown.length - index }}
              className={`group/badge relative inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br shadow-sm ring-2 ring-card transition-transform duration-200 hover:z-20 hover:scale-105 motion-reduce:transition-none motion-reduce:hover:scale-100
                ${index > 0 ? "-ml-2" : ""}
                ${meta.accent} ${meta.ring}
              `}
            >
              <span
                className="flex h-5 w-5 items-center justify-center rounded-full bg-card text-[10px] text-foreground shadow-inner ring-1 ring-background/90"
                aria-hidden
              >
                {BADGE_ICONS[b.id] ?? "🏅"}
              </span>
            </span>
          );
        })}
        {extra > 0 ? (
          <span
            title={extraTitle}
            style={{ zIndex: 0 }}
            className="relative -ml-2 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-dashed border-border/80 bg-muted/50 text-[9px] font-semibold tabular-nums text-muted-foreground ring-2 ring-card"
          >
            +{extra}
          </span>
        ) : null}
      </div>
    );
  }

  if (variant === "pills") {
    return (
      <ul className={`flex flex-wrap gap-1.5 ${className}`} aria-label="Mentor achievements">
        {shown.map((b) => (
          <li key={b.id}>
            <span
              title={b.description}
              className="inline-block max-w-40 truncate rounded-md border border-border/70 bg-muted/40 px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
            >
              {b.label}
            </span>
          </li>
        ))}
        {extra > 0 ? (
          <li>
            <span
              className="inline-block rounded-md px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground"
              title={extraTitle}
            >
              +{extra} more
            </span>
          </li>
        ) : null}
      </ul>
    );
  }

  return (
    <span className={`inline-flex flex-wrap items-center gap-1 ${className}`} aria-label="Mentor achievements">
      {shown.map((b) => (
        <span
          key={b.id}
          title={`${b.label} — ${b.description}`}
          className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs ring-1 ring-primary/20"
          aria-label={b.label}
        >
          {BADGE_ICONS[b.id] ?? "🏅"}
        </span>
      ))}
      {extra > 0 ? (
        <span
          className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-muted px-1 text-[10px] font-semibold text-muted-foreground"
          title={extraTitle}
        >
          +{extra}
        </span>
      ) : null}
    </span>
  );
}
