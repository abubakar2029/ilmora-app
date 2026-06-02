"use client";

import type { ReactNode } from "react";

import type { MarkdownFormat } from "@/lib/markdown";

type ToolbarButton = {
  format: MarkdownFormat;
  label: string;
  title: string;
  icon: ReactNode;
};

const buttons: ToolbarButton[] = [
  {
    format: "bold",
    label: "B",
    title: "Bold",
    icon: <span className="text-sm font-bold">B</span>,
  },
  {
    format: "italic",
    label: "I",
    title: "Italic",
    icon: <span className="text-sm italic">I</span>,
  },
  {
    format: "h2",
    label: "H2",
    title: "Heading",
    icon: <span className="text-xs font-bold">H2</span>,
  },
  {
    format: "h3",
    label: "H3",
    title: "Subheading",
    icon: <span className="text-xs font-semibold">H3</span>,
  },
  {
    format: "ul",
    label: "•",
    title: "Bullet list",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M9 6h12M9 12h12M9 18h12" strokeLinecap="round" />
        <circle cx="4" cy="6" r="1" fill="currentColor" />
        <circle cx="4" cy="12" r="1" fill="currentColor" />
        <circle cx="4" cy="18" r="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    format: "ol",
    label: "1.",
    title: "Numbered list",
    icon: <span className="text-xs font-medium">1.</span>,
  },
  {
    format: "quote",
    label: "❝",
    title: "Quote",
    icon: <span className="text-sm">❝</span>,
  },
  {
    format: "link",
    label: "Link",
    title: "Link",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" strokeLinecap="round" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    format: "code",
    label: "</>",
    title: "Inline code",
    icon: <span className="font-mono text-xs">{`</>`}</span>,
  },
  {
    format: "divider",
    label: "—",
    title: "Horizontal rule",
    icon: <span className="text-sm">—</span>,
  },
];

export type FormatToolbarProps = {
  onFormat: (format: MarkdownFormat) => void;
  disabled?: boolean;
};

export default function FormatToolbar({ onFormat, disabled }: FormatToolbarProps) {
  return (
    <div
      className="flex flex-wrap items-center gap-0.5 rounded-t-lg border border-b-0 border-border bg-muted/40 p-1"
      role="toolbar"
      aria-label="Formatting"
    >
      {buttons.map((btn) => (
        <button
          key={btn.format}
          type="button"
          disabled={disabled}
          title={btn.title}
          onClick={() => onFormat(btn.format)}
          className="flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-muted-foreground transition-colors hover:bg-background hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
        >
          {btn.icon}
        </button>
      ))}
    </div>
  );
}
