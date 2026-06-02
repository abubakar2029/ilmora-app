type Props = {
  percent: number;
  className?: string;
};

/** Prominent match score — separate from avatar/status, same pattern as inbox & feed. */
export default function MatchPercentBadge({ percent, className = "" }: Props) {
  const value = Math.min(100, Math.max(0, Math.round(percent)));

  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full bg-primary/12 px-3 py-1 text-xs font-semibold tabular-nums text-primary ${className}`}
    >
      {value}% match
    </span>
  );
}
