"use client";

import { parseChatSegments } from "@/lib/chat-format";

export default function ChatMessageBody({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  const segments = parseChatSegments(text);

  return (
    <p className={`whitespace-pre-wrap break-words ${className}`}>
      {segments.map((seg, i) => {
        const key = `${i}-${seg.type}-${seg.value.slice(0, 8)}`;
        switch (seg.type) {
          case "bold":
            return (
              <strong key={key} className="font-semibold">
                {seg.value}
              </strong>
            );
          case "italic":
            return (
              <em key={key} className="italic">
                {seg.value}
              </em>
            );
          case "strike":
            return (
              <span key={key} className="line-through opacity-90">
                {seg.value}
              </span>
            );
          case "code":
            return (
              <code
                key={key}
                className="rounded bg-black/10 px-1 py-0.5 font-mono text-[13px] dark:bg-white/15"
              >
                {seg.value}
              </code>
            );
          default:
            return <span key={key}>{seg.value}</span>;
        }
      })}
    </p>
  );
}
