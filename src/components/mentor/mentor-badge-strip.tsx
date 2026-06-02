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

const ALL_IDS = Object.keys(BADGE_ICONS);

type Props = {
  badges: MentorBadge[];
  showLocked?: boolean;
};

export default function MentorBadgeStrip({ badges, showLocked = true }: Props) {
  const earned = new Map(badges.map((b) => [b.id, b]));

  const items = showLocked
    ? ALL_IDS.map((id) => ({ id, earned: earned.get(id), locked: !earned.has(id) }))
    : badges.map((b) => ({ id: b.id, earned: b, locked: false }));

  if (!items.length) {
    return (
      <p className="text-sm text-muted-foreground">
        Complete your profile and connect with students to earn badges.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map(({ id, earned: b, locked }) => (
        <span
          key={id}
          title={b ? `${b.label} — ${b.description}` : "Not earned yet"}
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors
            ${
              locked
                ? "border border-dashed border-border/80 bg-transparent text-muted-foreground/70"
                : "border border-primary/20 bg-primary/8 text-foreground shadow-sm"
            }
          `}
        >
          <span
            className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] ${
              locked ? "bg-muted/80" : "bg-primary/15"
            }`}
            aria-hidden
          >
            {BADGE_ICONS[id] ?? "🏅"}
          </span>
          <span className={locked ? "line-through decoration-border" : ""}>
            {b?.label ?? id.replace(/_/g, " ")}
          </span>
        </span>
      ))}
    </div>
  );
}
