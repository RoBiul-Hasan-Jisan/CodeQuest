"use client";

import { motion } from "framer-motion";
import { PenLine, History, X } from "lucide-react";
import { useState, useRef, useCallback } from "react";

import { cn } from "@/lib/utils";

import { WRITING_ACTIONS } from "../types";
import type { WritingAction, WritingResult } from "../types";

import { ActionToolbar, DescriptionBar } from "./action-toolbar";
import { ResultPanel } from "./result-panel";
import { WritingEditor } from "./writing-editor";


// ─── History item ─────────────────────────────────────────────────────────────

function HistoryItem({
  item,
  onRestore,
}: {
  item: WritingResult;
  onRestore: (item: WritingResult) => void;
}) {
  const config = WRITING_ACTIONS.find((a) => a.id === item.action);
  const time = new Date(item.completedAt).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <button
      onClick={() => onRestore(item)}
      className="flex w-full items-start gap-3 rounded-xl border border-border bg-card p-3 text-left transition-all hover:shadow-soft hover:border-border/80"
    >
      <div className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold", config?.bg, config?.color)}>
        {config?.tag ?? "?"}
      </div>
      <div className="min-w-0 flex-1">
        <p className={cn("text-xs font-semibold", config?.color)}>{config?.label}</p>
        <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{item.resultText.slice(0, 60)}…</p>
      </div>
      <span className="shrink-0 text-[10px] text-muted-foreground">{time}</span>
    </button>
  );
}

// ─── Main client ──────────────────────────────────────────────────────────────

const SAMPLE_TEXT =
  "Their was a time when people didnt had access to the internet and they need to go to library to get informations. This was very inconvinient because librarys are not always open and sometime the books wasnt available what you need.";

export function WritingClient() {
  const [text, setText] = useState("");
  const [result, setResult] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeAction, setActiveAction] = useState<WritingAction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<WritingResult[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const abortRef = useRef<AbortController | null>(null);

  // ── Stream handler ─────────────────────────────────────────────────────────
  const runAction = useCallback(async (action: WritingAction) => {
    if (!text.trim() || isStreaming) return;

    // Cancel any in-flight request
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setActiveAction(action);
    setIsStreaming(true);
    setResult("");
    setError(null);

    const originalText = text;

    try {
      const res = await fetch("/api/writing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim(), action }),
        signal: abortRef.current.signal,
      });

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response stream");

      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });

        if (accumulated === "" && chunk.startsWith("__ERROR__:")) {
          setError(chunk.slice(10));
          setIsStreaming(false);
          return;
        }

        accumulated += chunk;
        setResult(accumulated);
      }

      // Check for error in full response
      if (accumulated.startsWith("__ERROR__:")) {
        setError(accumulated.slice(10));
        setResult("");
      } else {
        // Save to history
        const entry: WritingResult = {
          action,
          originalText,
          resultText: accumulated,
          completedAt: new Date().toISOString(),
        };
        setHistory((prev) => [entry, ...prev].slice(0, 10));
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setError("Request failed. Please check your connection.");
      }
    } finally {
      setIsStreaming(false);
    }
  }, [text, isStreaming]);

  const handleApply = (newText: string) => {
    setText(newText);
    setResult("");
    setActiveAction(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRestoreHistory = (item: WritingResult) => {
    setText(item.originalText);
    setResult(item.resultText);
    setActiveAction(item.action);
    setError(null);
    setShowHistory(false);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">AI Writing Assistant</h1>
          <p className="text-sm text-muted-foreground">
            Grammar correction, tone conversion, vocabulary enhancement — powered by Gemini
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Try sample */}
          {!text && (
            <button
              onClick={() => setText(SAMPLE_TEXT)}
              className="rounded-xl border border-border bg-muted px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/80"
            >
              Try sample text
            </button>
          )}

          {/* History toggle */}
          {history.length > 0 && (
            <button
              onClick={() => setShowHistory((v) => !v)}
              className={cn(
                "flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-medium transition-all",
                showHistory
                  ? "border-ds-violet/30 bg-ds-violet/10 text-ds-violet"
                  : "border-border bg-muted text-foreground hover:bg-muted/80"
              )}
            >
              <History className="h-4 w-4" />
              History
              <span className="rounded-full bg-current/10 px-1.5 py-0.5 text-[10px] font-bold">
                {history.length}
              </span>
            </button>
          )}
        </div>
      </motion.div>

      {/* History panel */}
      {showHistory && history.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-4 shadow-soft"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">Recent Enhancements</p>
            <button onClick={() => setShowHistory(false)} className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {history.map((item, i) => (
              <HistoryItem key={i} item={item} onRestore={handleRestoreHistory} />
            ))}
          </div>
        </motion.div>
      )}

      {/* Action toolbar */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="flex flex-col gap-2"
      >
        <ActionToolbar
          activeAction={activeAction}
          isStreaming={isStreaming}
          hasText={text.trim().length > 0}
          onAction={runAction}
        />
        <DescriptionBar activeAction={activeAction} isStreaming={isStreaming} />
      </motion.div>

      {/* Editor + Result split */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="grid gap-4 lg:grid-cols-2"
      >
        {/* Left: Editor */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 pb-1">
            <PenLine className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Your Text
            </span>
          </div>
          <WritingEditor
            value={text}
            onChange={setText}
            disabled={isStreaming}
          />
        </div>

        {/* Right: Result */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 pb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Enhanced Result
            </span>
            {activeAction && (
              <span className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-bold",
                WRITING_ACTIONS.find((a) => a.id === activeAction)?.bg,
                WRITING_ACTIONS.find((a) => a.id === activeAction)?.color,
              )}>
                {WRITING_ACTIONS.find((a) => a.id === activeAction)?.tag}
              </span>
            )}
          </div>
          <ResultPanel
            result={result}
            isStreaming={isStreaming}
            activeAction={activeAction}
            originalText={text}
            onApply={handleApply}
            error={error}
          />
        </div>
      </motion.div>

      {/* Tips row */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="grid gap-3 sm:grid-cols-3 text-center"
      >
        {[
          { icon: "✍️", title: "Write or paste",   desc: "Enter any text in the editor — emails, essays, messages" },
          { icon: "⚡", title: "Choose an action",  desc: "Pick Grammar Fix, Rewrite, Formal, Casual, or Vocab Boost" },
          { icon: "✅", title: "Apply & iterate",   desc: "Copy the result or apply it back to keep refining" },
        ].map((tip) => (
          <div
            key={tip.title}
            className="flex flex-col items-center gap-1.5 rounded-2xl border border-border bg-card p-4 shadow-soft"
          >
            <span className="text-2xl">{tip.icon}</span>
            <p className="text-xs font-semibold text-foreground">{tip.title}</p>
            <p className="text-[11px] leading-relaxed text-muted-foreground">{tip.desc}</p>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
