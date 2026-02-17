"use client";

import Image from "next/image";

export interface JourneyStep {
  id: number;
  title: string;
  description: string;
  status: "completed" | "active" | "upcoming";
  color: string;
}

const STEP_COLORS: Record<string, string> = {
  pink: "bg-step-pink",
  blue: "bg-step-blue",
  green: "bg-step-green",
  yellow: "bg-step-yellow",
  peach: "bg-step-peach",
};

const STEP_BORDER_COLORS: Record<string, string> = {
  pink: "border-step-pink",
  blue: "border-step-blue",
  green: "border-step-green",
  yellow: "border-step-yellow",
  peach: "border-step-peach",
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

  return (
    <div className="relative mx-auto max-w-5xl py-8">
      {/* Avatar on active step */}
      {activeIndex >= 0 && (
        <div
          className="absolute z-10 flex flex-col items-center"
          style={{
            top: activeIndex % 2 === 0 ? "-16px" : "auto",
            bottom: activeIndex % 2 !== 0 ? "-16px" : "auto",
            left: `calc(${Math.floor(activeIndex / 2) * (100 / Math.ceil(steps.length / 2))}% + ${100 / Math.ceil(steps.length / 2) / 2}% - 28px)`,
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
      )}

      {/* Starting line */}
      <div className="flex items-center">
        <div className="flex flex-col items-center gap-1 pr-4">
          <div className="h-0.5 w-8 bg-primary" />
          <span className="text-xs font-medium text-primary">Start</span>
        </div>

        <div className="flex-1">
          {/* Top row */}
          <div className="mb-4 flex items-stretch gap-4">
            {topRow.map((step) => (
              <StepCard key={step.id} step={step} />
            ))}
          </div>

          {/* Connector line */}
          <div className="relative mx-8 h-0.5 bg-border">
            {/* Progress fill */}
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

          {/* Bottom row */}
          <div className="mt-4 flex items-stretch gap-4 px-12">
            {bottomRow.map((step) => (
              <StepCard key={step.id} step={step} />
            ))}
          </div>
        </div>

        {/* Ending line */}
        <div className="flex flex-col items-center gap-1 pl-4">
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
  const bgColor = STEP_COLORS[step.color] || "bg-muted";
  const borderColor = STEP_BORDER_COLORS[step.color] || "border-border";

  return (
    <div
      className={`flex flex-1 flex-col rounded-lg border-2 ${borderColor} ${bgColor} p-4 transition-all ${
        step.status === "active"
          ? "shadow-lg ring-2 ring-primary/30 scale-[1.02]"
          : step.status === "upcoming"
            ? "opacity-60"
            : ""
      }`}
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold text-foreground/50">
          Step {step.id}
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
          <LockIcon className="h-4 w-4 text-muted-foreground" />
        )}
      </div>
      <h3 className="text-sm font-semibold text-foreground">{step.title}</h3>
      <p className="mt-1 text-xs leading-relaxed text-foreground/70">
        {step.description}
      </p>
    </div>
  );
}
