"use client";

import { useCallback, useRef, useState } from "react";

import EmojiPicker from "@/components/chat/emoji-picker";
import { applyChatFormat, type ChatFormat } from "@/lib/chat-format";

type Props = {
  disabled?: boolean;
  onSend: (text: string) => void;
  onTyping: () => void;
};

function FormatBtn({
  label,
  title,
  onClick,
  disabled,
}: {
  label: string;
  title: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40"
    >
      {label}
    </button>
  );
}

export default function ChatInput({ disabled, onSend, onTyping }: Props) {
  const [text, setText] = useState("");
  const [emojiOpen, setEmojiOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lastTyping = useRef(0);

  const handleTyping = useCallback(() => {
    const now = Date.now();
    if (now - lastTyping.current < 2000) return;
    lastTyping.current = now;
    onTyping();
  }, [onTyping]);

  const applyFormat = useCallback((format: ChatFormat) => {
    const el = textareaRef.current;
    if (!el) return;
    const { value, selectionStart, selectionEnd } = applyChatFormat(
      text,
      el.selectionStart,
      el.selectionEnd,
      format,
    );
    setText(value);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(selectionStart, selectionEnd);
    });
  }, [text]);

  const insertEmoji = useCallback((emoji: string) => {
    const el = textareaRef.current;
    if (!el) {
      setText((t) => t + emoji);
      return;
    }
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const next = text.slice(0, start) + emoji + text.slice(end);
    setText(next);
    const pos = start + emoji.length;
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(pos, pos);
    });
  }, [text]);

  function submit() {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText("");
    setEmojiOpen(false);
  }

  return (
    <div className="relative z-10 shrink-0 overflow-visible border-t border-border bg-card">
      <div className="flex items-center gap-0.5 overflow-visible border-b border-border/60 px-2 py-1">
        <FormatBtn label="B" title="Bold (*text*)" disabled={disabled} onClick={() => applyFormat("bold")} />
        <FormatBtn label="I" title="Italic (_text_)" disabled={disabled} onClick={() => applyFormat("italic")} />
        <FormatBtn label="S" title="Strikethrough (~text~)" disabled={disabled} onClick={() => applyFormat("strike")} />
        <FormatBtn label="</>" title="Monospace (`code`)" disabled={disabled} onClick={() => applyFormat("code")} />
        <span className="mx-1 h-5 w-px bg-border" aria-hidden />
        <div className="relative shrink-0">
          <button
            type="button"
            title="Emoji"
            disabled={disabled}
            onClick={() => setEmojiOpen((o) => !o)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-lg hover:bg-muted disabled:opacity-40"
            aria-expanded={emojiOpen}
          >
            😊
          </button>
          <EmojiPicker open={emojiOpen} onClose={() => setEmojiOpen(false)} onPick={insertEmoji} />
        </div>
      </div>

      <div className="flex items-end gap-2 px-3 py-3">
        <textarea
          ref={textareaRef}
          rows={1}
          value={text}
          disabled={disabled}
          placeholder="Type a message"
          onChange={(e) => {
            setText(e.target.value);
            handleTyping();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          className="max-h-28 min-h-[2.5rem] flex-1 resize-none rounded-2xl border border-border bg-muted/30 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/15 disabled:opacity-60"
        />
        <button
          type="button"
          disabled={disabled || !text.trim()}
          onClick={submit}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-opacity hover:bg-primary/90 disabled:opacity-40"
          aria-label="Send message"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
            <path d="M3.4 20.4 21 12 3.4 3.6l1.6 7.2 8.2 1.2-8.2 1.2-1.6 7.2z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
