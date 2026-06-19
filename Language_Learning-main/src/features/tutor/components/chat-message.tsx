"use client";

import { motion } from "framer-motion";
import { Check, Copy } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";


import { cn } from "@/lib/utils";

import type { ChatMessage, TutorMode } from "../types";


// ─── Markdown renderer ────────────────────────────────────────────────────────

function MarkdownContent({ content }: { content: string }) {
  return (
    <ReactMarkdown
      components={{
        // Paragraphs
        p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
        // Bold
        strong: ({ children }) => (
          <strong className="font-semibold text-foreground">{children}</strong>
        ),
        // Italic
        em: ({ children }) => <em className="italic">{children}</em>,
        // Inline code (individual words)
        code: ({ children, className }) => {
          const isBlock = className?.includes("language-");
          if (isBlock) {
            return (
              <pre className="my-2 overflow-x-auto rounded-lg bg-background/60 p-3 text-xs">
                <code className="font-mono">{children}</code>
              </pre>
            );
          }
          return (
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.85em] text-foreground">
              {children}
            </code>
          );
        },
        // Block quotes (used for warnings/tips)
        blockquote: ({ children }) => (
          <blockquote className="my-2 border-l-2 border-ds-amber pl-3 text-muted-foreground">
            {children}
          </blockquote>
        ),
        // Unordered list
        ul: ({ children }) => (
          <ul className="my-2 ml-4 list-disc space-y-1 marker:text-muted-foreground">
            {children}
          </ul>
        ),
        // Ordered list
        ol: ({ children }) => (
          <ol className="my-2 ml-4 list-decimal space-y-1 marker:text-muted-foreground">
            {children}
          </ol>
        ),
        li: ({ children }) => <li className="leading-relaxed">{children}</li>,
        // Headings (h1–h3)
        h1: ({ children }) => (
          <h1 className="mb-2 mt-3 text-base font-bold text-foreground">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="mb-1.5 mt-3 text-sm font-semibold text-foreground">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="mb-1 mt-2 text-sm font-medium text-foreground">{children}</h3>
        ),
        // Horizontal rule
        hr: () => <hr className="my-3 border-border" />,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

// ─── Copy button ──────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className={cn(
        "flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium transition-all",
        "opacity-0 group-hover:opacity-100",
        copied
          ? "bg-ds-green/10 text-ds-green"
          : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
      )}
      title="Copy message"
    >
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

// ─── Mode badge ───────────────────────────────────────────────────────────────

const MODE_COLORS: Record<TutorMode, string> = {
  general:       "bg-ds-violet/10 text-ds-violet",
  grammar:       "bg-ds-green/10 text-ds-green",
  vocabulary:    "bg-ds-teal/10 text-ds-teal",
  translation:   "bg-blue-500/10 text-blue-500",
  rewrite:       "bg-ds-amber/10 text-ds-amber",
  pronunciation: "bg-orange-500/10 text-orange-500",
};

// ─── Main component ───────────────────────────────────────────────────────────

interface ChatMessageProps {
  message: ChatMessage;
  isLatest?: boolean;
  index: number;
}

export function ChatMessageBubble({ message, isLatest: _isLatest = false, index }: ChatMessageProps) {
  const isUser = message.role === "user";
  const isEmpty = !message.content && !isUser;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.02, 0.15) }}
      className={cn(
        "group flex items-end gap-2.5",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-violet-700 text-sm shadow-sm">
          🤖
        </div>
      )}

      <div className={cn("flex max-w-[85%] flex-col gap-1", isUser && "items-end")}>
        {/* Bubble */}
        <div
          className={cn(
            "relative rounded-2xl px-4 py-3 text-sm shadow-sm",
            isUser
              ? "rounded-br-sm bg-gradient-to-br from-violet-600 to-violet-700 text-white"
              : "rounded-bl-sm bg-muted text-foreground",
            isEmpty && "min-w-[60px]"
          )}
        >
          {isUser ? (
            <p className="leading-relaxed whitespace-pre-wrap">{message.content}</p>
          ) : isEmpty ? (
            // Streaming placeholder cursor
            <span className="inline-block h-4 w-0.5 animate-pulse bg-muted-foreground" />
          ) : (
            <MarkdownContent content={message.content} />
          )}
        </div>

        {/* Footer — timestamp + mode + copy */}
        <div className={cn("flex items-center gap-1.5", isUser ? "flex-row-reverse" : "flex-row")}>
          <span className="text-[10px] text-muted-foreground/60">
            {new Date(message.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          {!isUser && message.content && (
            <>
              <span className={cn("rounded-full px-1.5 py-0.5 text-[9px] font-semibold capitalize", MODE_COLORS[message.mode])}>
                {message.mode}
              </span>
              <CopyButton text={message.content} />
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
