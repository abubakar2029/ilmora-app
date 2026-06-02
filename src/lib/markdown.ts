/** Strip common Markdown syntax for plain-text previews (cards, digests). */
export function stripMarkdown(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]+`/g, (m) => m.slice(1, -1))
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^>\s?/gm, "")
    .replace(/(\*\*|__)(.*?)\1/g, "$2")
    .replace(/(\*|_)(.*?)\1/g, "$2")
    .replace(/^[-*+]\s+/gm, "")
    .replace(/^\d+\.\s+/gm, "")
    .replace(/\s+/g, " ")
    .trim();
}

export type MarkdownFormat =
  | "bold"
  | "italic"
  | "h2"
  | "h3"
  | "ul"
  | "ol"
  | "quote"
  | "link"
  | "code"
  | "divider";

export type FormatInsert = {
  before: string;
  after: string;
  placeholder: string;
  /** If true, wrap selection; if false, insert at line start or cursor */
  block?: boolean;
  linePrefix?: string;
};

export const FORMAT_INSERTS: Record<MarkdownFormat, FormatInsert> = {
  bold: { before: "**", after: "**", placeholder: "bold text" },
  italic: { before: "*", after: "*", placeholder: "italic text" },
  h2: { before: "## ", after: "", placeholder: "Heading", block: true, linePrefix: "## " },
  h3: { before: "### ", after: "", placeholder: "Subheading", block: true, linePrefix: "### " },
  ul: { before: "- ", after: "", placeholder: "List item", block: true, linePrefix: "- " },
  ol: { before: "1. ", after: "", placeholder: "List item", block: true, linePrefix: "1. " },
  quote: { before: "> ", after: "", placeholder: "Quote", block: true, linePrefix: "> " },
  link: { before: "[", after: "](https://)", placeholder: "link text" },
  code: { before: "`", after: "`", placeholder: "code" },
  divider: { before: "\n\n---\n\n", after: "", placeholder: "" },
};

/**
 * Apply a Markdown formatting action to a textarea value and return the new string + selection.
 */
export function applyMarkdownFormat(
  value: string,
  selectionStart: number,
  selectionEnd: number,
  format: MarkdownFormat,
): { value: string; selectionStart: number; selectionEnd: number } {
  const spec = FORMAT_INSERTS[format];
  const selected = value.slice(selectionStart, selectionEnd);

  if (spec.block && spec.linePrefix) {
    const lineStart = value.lastIndexOf("\n", selectionStart - 1) + 1;
    const lineEndIdx = value.indexOf("\n", selectionEnd);
    const lineEnd = lineEndIdx === -1 ? value.length : lineEndIdx;
    const line = value.slice(lineStart, lineEnd);
    const prefix = spec.linePrefix;
    const newLine = line.startsWith(prefix) ? line.slice(prefix.length) : prefix + (line || spec.placeholder);
    const newValue = value.slice(0, lineStart) + newLine + value.slice(lineEnd);
    const cursor = lineStart + newLine.length;
    return { value: newValue, selectionStart: cursor, selectionEnd: cursor };
  }

  if (format === "divider") {
    const insert = spec.before;
    const newValue = value.slice(0, selectionEnd) + insert + value.slice(selectionEnd);
    const pos = selectionEnd + insert.length;
    return { value: newValue, selectionStart: pos, selectionEnd: pos };
  }

  const inner = selected || spec.placeholder;
  const newValue = value.slice(0, selectionStart) + spec.before + inner + spec.after + value.slice(selectionEnd);
  const start = selectionStart + spec.before.length;
  const end = start + inner.length;
  return { value: newValue, selectionStart: start, selectionEnd: end };
}
