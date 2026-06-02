/** WhatsApp-style inline formatting for chat messages. */

export type ChatFormat = "bold" | "italic" | "strike" | "code";

export const CHAT_FORMAT_INSERTS: Record<
  ChatFormat,
  { before: string; after: string; placeholder: string }
> = {
  bold: { before: "*", after: "*", placeholder: "bold" },
  italic: { before: "_", after: "_", placeholder: "italic" },
  strike: { before: "~", after: "~", placeholder: "strikethrough" },
  code: { before: "`", after: "`", placeholder: "code" },
};

export function applyChatFormat(
  value: string,
  selectionStart: number,
  selectionEnd: number,
  format: ChatFormat,
): { value: string; selectionStart: number; selectionEnd: number } {
  const spec = CHAT_FORMAT_INSERTS[format];
  const selected = value.slice(selectionStart, selectionEnd);
  const inner = selected || spec.placeholder;
  const newValue =
    value.slice(0, selectionStart) + spec.before + inner + spec.after + value.slice(selectionEnd);
  const start = selectionStart + spec.before.length;
  const end = start + inner.length;
  return { value: newValue, selectionStart: start, selectionEnd: end };
}

type Segment = { type: "text" | "bold" | "italic" | "strike" | "code"; value: string };

const TOKEN_RE = /(\*[^*\n]+\*|_[^_\n]+_|~[^~\n]+~|`[^`\n]+`)/g;

export function parseChatSegments(text: string): Segment[] {
  const segments: Segment[] = [];
  let last = 0;
  for (const match of text.matchAll(TOKEN_RE)) {
    const idx = match.index ?? 0;
    if (idx > last) {
      segments.push({ type: "text", value: text.slice(last, idx) });
    }
    const raw = match[0];
    if (raw.startsWith("*")) {
      segments.push({ type: "bold", value: raw.slice(1, -1) });
    } else if (raw.startsWith("_")) {
      segments.push({ type: "italic", value: raw.slice(1, -1) });
    } else if (raw.startsWith("~")) {
      segments.push({ type: "strike", value: raw.slice(1, -1) });
    } else if (raw.startsWith("`")) {
      segments.push({ type: "code", value: raw.slice(1, -1) });
    }
    last = idx + raw.length;
  }
  if (last < text.length) {
    segments.push({ type: "text", value: text.slice(last) });
  }
  return segments.length ? segments : [{ type: "text", value: text }];
}
