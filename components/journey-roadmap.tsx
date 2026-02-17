"use client";

import Image from "next/image";

export interface JourneyStep {
  id: number;
  title: string;
  description: string;
  status: "completed" | "active" | "upcoming";
  color: string;
}

const STEP_STYLES: Record<string, { bg: string; accent: string; text: string }> = {
  pink: { bg: "bg-step-pink/25", accent: "bg-step-pink", text: "text-step-pink" },
  blue: { bg: "bg-step-blue/25", accent: "bg-step-blue", text: "text-step-blue" },
  green: { bg: "bg-step-green/25", accent: "bg-step-green", text: "text-step-green" },
  yellow: { bg: "bg-step-yellow/25", accent: "bg-step-yellow", text: "text-step-yellow" },
  peach: { bg: "bg-step-peach/25", accent: "bg-step-peach", text: "text-step-peach" },
};

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

export default function JourneyRoadmap({
  steps,
}: {
  steps: JourneyStep[];
}) {
  const activeIndex = steps.findIndex((s) => s.status === "active");

  return (
    <div className="w-full">
      {/* Desktop / Tablet view */}
      <div className="hidden md:block">
        <DesktopRoadmap steps={steps} activeIndex={activeIndex} />
      </div>
      {/* Mobile view */}
      <div className="block md:hidden">
        <MobileRoadmap steps={steps} activeIndex={activeIndex} />
      </div>
    </div>
  );
}

function DesktopRoadmap({
  steps,
  activeIndex,
}: {
  steps: JourneyStep[];
  activeIndex: number;
}) {
  // Split steps into two rows for the zigzag pattern
  const topRow = steps.filter((_, i) => i % 2 === 0);
  const bottomRow = steps.filter((_, i) => i % 2 !== 0);

  const CARD_MIN = 230; // minimum card width in px
  const GAP = 24; // gap-6 = 24px
  const topCount = topRow.length;
  const innerWidth = topCount * CARD_MIN + (topCount - 1) * GAP;

  return (
    <div className="roadmap-scroll relative overflow-x-auto py-8 pb-4">
      <div className="inline-flex items-center px-2" style={{ minWidth: `${innerWidth + 140}px` }}>
        {/* Starting line */}
        <div className="flex shrink-0 flex-col items-center gap-1 pr-4">
          <div className="h-0.5 w-8 bg-primary" />
          <span className="text-xs font-medium text-primary">Start</span>
        </div>

        <div className="relative flex-1" style={{ minWidth: `${innerWidth}px` }}>
          {/* Avatar on active step */}
          {activeIndex >= 0 && (() => {
            const col = Math.floor(activeIndex / 2);
            const isTop = activeIndex % 2 === 0;
            const leftPx = isTop
              ? `calc(${(col / topCount) * 100}% + ${CARD_MIN / 2}px)`
              : `calc(${(col / topCount) * 100}% + ${CARD_MIN / 2 + CARD_MIN / 2 + GAP / 2}px)`;
            return (
              <div
                className="absolute z-10 flex flex-col items-center -translate-x-1/2"
                style={{
                  top: isTop ? "-20px" : "auto",
                  bottom: !isTop ? "-20px" : "auto",
                  left: leftPx,
                }}
              >
                <div className="relative h-14 w-14 overflow-hidden rounded-full border-2 border-primary bg-card shadow-md">
                  <Image
                    src="/images/avatar.jpg"
                    alt="Your avatar"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            );
          })()}

          {/* Top row */}
          <div className="mb-4 flex items-stretch gap-6">
            {topRow.map((step) => (
              <div key={step.id} className="min-w-[230px] flex-1">
                <StepCard step={step} />
              </div>
            ))}
          </div>

          {/* Connector line */}
          <div className="relative mx-8 h-0.5 bg-border">
            <div
              className="absolute top-0 left-0 h-full bg-primary transition-all duration-500"
              style={{
                width:
                  activeIndex >= 0
                    ? `${((activeIndex + 1) / steps.length) * 100}%`
                    : "0%",
              }}
            />
          </div>

          {/* Bottom row - offset to create zigzag */}
          <div className="mt-4 flex items-stretch gap-6" style={{ paddingLeft: `${CARD_MIN / 2 + GAP / 2}px` }}>
            {bottomRow.map((step) => (
              <div key={step.id} className="min-w-[230px] flex-1">
                <StepCard step={step} />
              </div>
            ))}
          </div>
        </div>

        {/* Ending line */}
        <div className="flex shrink-0 flex-col items-center gap-1 pl-4">
          <div className="h-0.5 w-8 bg-border" />
          <span className="text-xs font-medium text-muted-foreground">
            Finish
          </span>
        </div>
      </div>
    </div>
  );
}

function MobileRoadmap({
  steps,
  activeIndex,
}: {
  steps: JourneyStep[];
  activeIndex: number;
}) {
  return (
    <div className="relative flex flex-col items-center py-4">
      {/* Start label */}
      <div className="flex items-center gap-2 pb-4">
        <div className="h-0.5 w-6 bg-primary" />
        <span className="text-xs font-semibold text-primary">Start</span>
        <div className="h-0.5 w-6 bg-primary" />
      </div>

      <div className="relative flex flex-col items-center gap-6">
        {/* Vertical connector line */}
        <div className="absolute top-0 left-1/2 h-full w-0.5 -translate-x-1/2 bg-border" />
        <div
          className="absolute top-0 left-1/2 w-0.5 -translate-x-1/2 bg-primary transition-all duration-500"
          style={{
            height:
              activeIndex >= 0
                ? `${((activeIndex + 1) / steps.length) * 100}%`
                : "0%",
          }}
        />

        {steps.map((step, i) => (
          <div key={step.id} className="relative z-10 w-full max-w-xs">
            {/* Avatar on active step */}
            {i === activeIndex && (
              <div className="absolute -top-6 left-1/2 z-20 -translate-x-1/2">
                <div className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-primary bg-card shadow-md">
                  <Image
                    src="/images/avatar.jpg"
                    alt="Your avatar"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            )}
            <StepCard step={step} />
          </div>
        ))}
      </div>

      {/* Finish label */}
      <div className="flex items-center gap-2 pt-4">
        <div className="h-0.5 w-6 bg-border" />
        <span className="text-xs font-semibold text-muted-foreground">
          Finish
        </span>
        <div className="h-0.5 w-6 bg-border" />
      </div>
    </div>
  );
}

function StepCard({ step }: { step: JourneyStep }) {
  const style = STEP_STYLES[step.color] || { bg: "bg-muted/40", accent: "bg-muted", text: "text-muted-foreground" };

  return (
    <div
      className={`group flex h-full flex-col rounded-xl bg-card p-5 transition-all duration-200 ${
        step.status === "active"
          ? "shadow-lg ring-2 ring-primary/25"
          : step.status === "upcoming"
            ? "opacity-50"
            : "shadow-sm hover:shadow-md"
      }`}
    >
      {/* Color accent bar */}
      <div className={`mb-4 h-1 w-10 rounded-full ${style.accent}`} />

      {/* Step number + status */}
      <div className="mb-3 flex items-center justify-between">
        <span className={`flex h-6 w-6 items-center justify-center rounded-md text-[10px] font-bold ${style.bg} ${style.text}`}>
          {step.id}
        </span>
        {step.status === "completed" && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary">
            <CheckIcon className="h-3 w-3 text-primary-foreground" />
          </span>
        )}
        {step.status === "active" && (
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-primary" />
          </span>
        )}
        {step.status === "upcoming" && (
          <LockIcon className="h-4 w-4 text-muted-foreground/50" />
        )}
      </div>

      {/* Title */}
      <h3 className="text-sm font-semibold text-foreground leading-snug">{step.title}</h3>

      {/* Description */}
      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
        {step.description}
      </p>
    </div>
  );
}
