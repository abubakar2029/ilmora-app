"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export type BlogContentProps = {
  content: string;
  className?: string;
};

/** Renders blog body as Markdown (headings, lists, links, bold, etc.). */
export default function BlogContent({ content, className = "" }: BlogContentProps) {
  return (
    <div className={`blog-prose ${className}`.trim()}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary underline underline-offset-2 hover:text-primary/80"
            >
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
