"use client";

import { useEffect, useRef } from "react";

const EMOJI_GROUPS: { label: string; emojis: string[] }[] = [
  {
    label: "Smileys",
    emojis: ["😀", "😃", "😄", "😁", "😅", "😂", "🤣", "😊", "😇", "🙂", "😉", "😍", "🥰", "😘", "😎", "🤔", "😮", "😢", "😭", "🙏"],
  },
  {
    label: "Gestures",
    emojis: ["👍", "👎", "👋", "🤝", "💪", "✌️", "🤞", "👏", "🙌", "💯", "🔥", "⭐", "✨", "❤️", "💙", "💚", "🎉", "🎊"],
  },
  {
    label: "Work",
    emojis: ["💼", "📚", "✏️", "📝", "💡", "🎯", "📅", "⏰", "✅", "❌", "📧", "💬", "📎", "🔗"],
  },
];

type Props = {
  open: boolean;
  onClose: () => void;
  onPick: (emoji: string) => void;
};

export default function EmojiPicker({ open, onClose, onPick }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={ref}
      className="absolute bottom-full right-0 z-50 mb-2 max-h-56 w-72 shrink-0 overflow-y-auto rounded-xl border border-border bg-card p-2 shadow-lg"
      role="dialog"
      aria-label="Emoji picker"
    >
      {EMOJI_GROUPS.map((g) => (
        <div key={g.label} className="mb-2 last:mb-0">
          <p className="px-1 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            {g.label}
          </p>
          <div className="grid grid-cols-8 gap-0.5">
            {g.emojis.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => {
                  onPick(e);
                  onClose();
                }}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-lg hover:bg-muted"
              >
                {e}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
