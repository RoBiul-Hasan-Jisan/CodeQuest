"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, CornerDownLeft, Sparkles, WandSparkles } from "lucide-react";
import { useRef, useEffect, useState } from "react";

import { cn } from "@/lib/utils";

import { WRITING_ACTIONS } from "../types";
import type { WritingAction } from "../types";


// ─── Word count helper ────────────────────────────────────────────────────────

function wordCount(text: string) {
  return text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface ResultPanelProps {
  result: string;
  isStreaming: boolean;
  activeAction: WritingAction | null;
  originalText: string;
  onApply: (text: string) => void;
  error: string | null;
}

// ─── Streaming cursor ─────────────────────────────────────────────────────────

function StreamingCursor() {
  return (
    <motion.span
      animate={{ opacity: [1, 0] }}
      transition={{ duration: 0.7, repeat: Infinity, repeatType: "reverse" }}
      className="ml-0.5 inline-block h-4 w-0.5 translate-y-0.5 bg-current align-middle"
    />
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ResultPanel({
  result,
  isStreaming,
  activeAction,
  originalText,
  onApply,
  error,
}: ResultPanelProps) {
  const [copied, setCopied] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom while streaming
  useEffect(() => {
    if (isStreaming && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [result, isStreaming]);

  const actionConfig = activeAction
    ? WRITING_ACTIONS.find((a) => a.id === activeAction)
    : null;

  const handleCopy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const origWords = wordCount(originalText);
  const resultWords = wordCount(result);
  const wordDiff = resultWords - origWords;

  const isEmpty = !result && !isStreaming && !error;

  return (
    <div className="flex flex-col gap-0">
      {/* Header bar */}
      <div
        className={cn(
          "flex items-center justify-between rounded-t-2xl border border-border px-4 py-3",
          actionConfig ? cn(actionConfig.bg, actionConfig.border) : "bg-muted/40"
        )}
      >
        <div className="flex items-center gap-2">
          <WandSparkles
            className={cn("h-4 w-4", actionConfig ? actionConfig.color : "text-muted-foreground")}
          />
          <span className={cn("text-sm font-semibold", actionConfig ? actionConfig.color : "text-muted-foreground")}>
            {actionConfig ? actionConfig.label : "Enhanced Result"}
          </span>
          {isStreaming && (
            <span className="rounded-full bg-current/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider opacity-70">
              Generating…
            </span>
          )}
        </div>

        {/* Word count diff */}
        {result && !isStreaming && (
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <span className="tabular-nums">{resultWords} words</span>
            {wordDiff !== 0 && (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 font-semibold tabular-nums",
                  wordDiff > 0
                    ? "bg-ds-green/10 text-ds-green"
                    : "bg-destructive/10 text-destructive"
                )}
              >
                {wordDiff > 0 ? "+" : ""}{wordDiff}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Content area */}
      <div
        ref={scrollRef}
        className={cn(
          "min-h-[240px] overflow-y-auto border border-t-0 border-border bg-background px-4 py-4",
          "scrollbar-thin transition-all",
          isEmpty && "flex items-center justify-center"
        )}
        style={{ maxHeight: 520 }}
      >
        <AnimatePresence mode="wait">
          {error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-2 py-8 text-center"
            >
              <p className="text-sm font-medium text-destructive">{error}</p>
              <p className="text-xs text-muted-foreground">Please try again</p>
            </motion.div>
          ) : isEmpty ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3 py-8 text-center"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
                <Sparkles className="h-6 w-6 text-muted-foreground/50" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Your enhanced text will appear here
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground/60">
                  Type your text, then click an action above
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.15 }}
              className="text-sm leading-relaxed text-foreground whitespace-pre-wrap"
            >
              {result}
              {isStreaming && <StreamingCursor />}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action footer */}
      <div className="flex items-center justify-between rounded-b-2xl border border-t-0 border-border bg-muted/40 px-4 py-2">
        {/* Stats */}
        <p className="text-[11px] text-muted-foreground">
          {result
            ? isStreaming
              ? "Generating…"
              : `${resultWords} word${resultWords !== 1 ? "s" : ""} · Ready`
            : "Awaiting input"}
        </p>

        {/* Buttons */}
        {result && !isStreaming && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => void handleCopy()}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all",
                copied
                  ? "bg-ds-green/10 text-ds-green"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              )}
            >
              {copied ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              {copied ? "Copied!" : "Copy"}
            </button>

            <button
              onClick={() => onApply(result)}
              className="flex items-center gap-1.5 rounded-lg bg-ds-violet px-2.5 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
            >
              <CornerDownLeft className="h-3.5 w-3.5" />
              Apply to Editor
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
