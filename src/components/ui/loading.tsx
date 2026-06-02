import type { ReactNode } from "react";

type SkeletonProps = {
  className?: string;
};

/** Soft shimmer block for placeholders. */
export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`rounded-xl bg-muted/50 animate-pulse motion-reduce:animate-none ${className}`}
      aria-hidden
    />
  );
}

type LoadingDotsProps = {
  className?: string;
  size?: "sm" | "md";
};

export function LoadingDots({ className = "", size = "md" }: LoadingDotsProps) {
  const dot = size === "sm" ? "h-1 w-1" : "h-1.5 w-1.5";
  return (
    <span className={`inline-flex items-center gap-1 ${className}`} aria-hidden>
      <span className={`${dot} animate-pulse rounded-full bg-primary/70`} />
      <span className={`${dot} animate-pulse rounded-full bg-primary/50 [animation-delay:120ms]`} />
      <span className={`${dot} animate-pulse rounded-full bg-primary/35 [animation-delay:240ms]`} />
    </span>
  );
}

type PageLoaderProps = {
  label?: string;
  className?: string;
  children?: ReactNode;
};

/** Centered status with soft dots — use while auth or primary data loads. */
export function PageLoader({ label = "Loading…", className = "", children }: PageLoaderProps) {
  return (
    <div
      className={`flex flex-col items-center gap-5 py-12 ${className}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <LoadingDots size="md" />
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      {children}
    </div>
  );
}

type PageSkeletonProps = {
  className?: string;
  /** Optional message above skeleton blocks */
  label?: string;
};

/** Page-shaped soft placeholders (matches, inbox, feed, etc.). */
export function PageSkeleton({ className = "mx-auto max-w-4xl", label }: PageSkeletonProps) {
  return (
    <div className={`space-y-6 ${className}`} role="status" aria-live="polite" aria-busy="true">
      {label ? (
        <div className="flex items-center justify-center gap-2 py-2">
          <LoadingDots size="sm" />
          <span className="text-sm text-muted-foreground">{label}</span>
        </div>
      ) : null}
      <Skeleton className="h-24 w-full" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
      <Skeleton className="h-28 w-full" />
    </div>
  );
}

type InlineLoaderProps = {
  label?: string;
  className?: string;
};

export function InlineLoader({ label, className = "" }: InlineLoaderProps) {
  return (
    <div className={`flex items-center gap-2 text-sm text-muted-foreground ${className}`} role="status">
      <LoadingDots size="sm" />
      {label ? <span>{label}</span> : null}
    </div>
  );
}

type ListSkeletonProps = {
  count?: number;
  itemClassName?: string;
};

export function ListSkeleton({ count = 3, itemClassName = "h-28 w-full" }: ListSkeletonProps) {
  return (
    <ul className="space-y-3" aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <li key={i}>
          <Skeleton className={itemClassName} />
        </li>
      ))}
    </ul>
  );
}

type NavSkeletonProps = {
  collapsed?: boolean;
  count?: number;
};

export function NavSkeleton({ collapsed = false, count = 6 }: NavSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <li key={i}>
          <div
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 ${collapsed ? "lg:justify-center lg:px-0" : ""}`}
            aria-hidden
          >
            <Skeleton className="hidden h-5 w-5 shrink-0 rounded-md lg:block" />
            <Skeleton className={`h-4 flex-1 max-w-[120px] ${collapsed ? "lg:hidden" : ""}`} />
          </div>
        </li>
      ))}
    </>
  );
}
