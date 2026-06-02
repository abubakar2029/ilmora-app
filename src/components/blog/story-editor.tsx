"use client";

import { useCallback, useRef, useState } from "react";

import FormatToolbar from "@/components/blog/format-toolbar";
import BlogContent from "@/components/blog/blog-content";
import { applyMarkdownFormat, type MarkdownFormat } from "@/lib/markdown";

export type StoryEditorProps = {
  title: string;
  content: string;
  onTitleChange: (value: string) => void;
  onContentChange: (value: string) => void;
  disabled?: boolean;
  titleId?: string;
  contentId?: string;
};

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-ring";

type EditorTab = "write" | "preview";

export default function StoryEditor({
  title,
  content,
  onTitleChange,
  onContentChange,
  disabled = false,
  titleId = "story-title",
  contentId = "story-content",
}: StoryEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [tab, setTab] = useState<EditorTab>("write");

  const handleFormat = useCallback(
    (format: MarkdownFormat) => {
      const el = textareaRef.current;
      if (!el || disabled) return;
      const { value, selectionStart, selectionEnd } = applyMarkdownFormat(
        content,
        el.selectionStart,
        el.selectionEnd,
        format,
      );
      onContentChange(value);
      requestAnimationFrame(() => {
        el.focus();
        el.setSelectionRange(selectionStart, selectionEnd);
      });
    },
    [content, disabled, onContentChange],
  );

  return (
    <div className="space-y-5">
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label htmlFor={titleId} className="text-sm font-medium text-foreground">
            Title
          </label>
          <span className="text-xs text-muted-foreground">{title.length}/300</span>
        </div>
        <input
          id={titleId}
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          maxLength={300}
          disabled={disabled}
          placeholder="e.g. How I transitioned into data science"
          className={inputClass}
        />
      </div>

      <div>
        <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
          <label htmlFor={contentId} className="text-sm font-medium text-foreground">
            Your story
          </label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{content.length} characters</span>
            <div className="flex rounded-lg border border-border p-0.5 text-xs">
              <button
                type="button"
                disabled={disabled}
                onClick={() => setTab("write")}
                className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
                  tab === "write" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Write
              </button>
              <button
                type="button"
                disabled={disabled}
                onClick={() => setTab("preview")}
                className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
                  tab === "preview" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Preview
              </button>
            </div>
          </div>
        </div>

        {tab === "write" ? (
          <div className="overflow-hidden rounded-lg border border-border">
            <FormatToolbar onFormat={handleFormat} disabled={disabled} />
            <textarea
              ref={textareaRef}
              id={contentId}
              value={content}
              onChange={(e) => onContentChange(e.target.value)}
              disabled={disabled}
              rows={16}
              placeholder={`Share your experience using formatting tools above.

## Example heading
**Bold** and *italic* text, bullet lists, and [links](https://example.com).`}
              className="block w-full resize-y border-0 bg-background px-3.5 py-3 text-sm leading-relaxed text-foreground outline-none focus:ring-0 min-h-[280px]"
            />
          </div>
        ) : (
          <div className="min-h-[280px] rounded-lg border border-border bg-muted/20 px-4 py-4">
            {content.trim() ? (
              <BlogContent content={content} />
            ) : (
              <p className="text-sm text-muted-foreground">Nothing to preview yet.</p>
            )}
          </div>
        )}

        <p className="mt-2 text-xs text-muted-foreground">
          Use the toolbar for <strong className="font-medium text-foreground">bold</strong>, headings, lists,
          quotes, and links. Markdown is supported. Stories are reviewed before publishing.
        </p>
      </div>
    </div>
  );
}
