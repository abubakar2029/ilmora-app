import type { ReactNode } from "react";

type Props = {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  /** Hide default card chrome — content only inside rounded panel */
  variant?: "default" | "soft";
};

export default function DashboardCard({
  title,
  description,
  action,
  children,
  className = "",
  bodyClassName = "",
  variant = "default",
}: Props) {
  const shell =
    variant === "soft"
      ? "rounded-2xl bg-muted/30 ring-1 ring-border/60"
      : "rounded-2xl border border-border/80 bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04)]";

  return (
    <section className={`flex h-full min-h-0 flex-col overflow-hidden ${shell} ${className}`}>
      <div className="flex shrink-0 items-start justify-between gap-3 px-5 pb-0 pt-5">
        <div className="min-w-0">
          <h2 className="text-[15px] font-semibold tracking-tight text-foreground">{title}</h2>
          {description ? (
            <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className={`min-h-0 flex-1 ${bodyClassName}`}>{children}</div>
    </section>
  );
}
