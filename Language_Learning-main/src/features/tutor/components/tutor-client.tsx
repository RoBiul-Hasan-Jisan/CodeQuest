"use client";

import { motion } from "framer-motion";
import { Trash2, Info } from "lucide-react";
import { useEffect } from "react";

import { useTutorChat } from "../hooks/use-tutor-chat";
import { useTutorStore, selectMessages, selectIsStreaming } from "../store/tutor-store";

import { ChatInput } from "./chat-input";
import { ChatWindow } from "./chat-window";
import { ModeSelector } from "./mode-selector";

// ─── Header ───────────────────────────────────────────────────────────────────

function TutorHeader({ onClear, messageCount }: { onClear: () => void; messageCount: number }) {
  return (
    <div className="flex shrink-0 items-center justify-between border-b border-border bg-background/80 px-4 py-3 backdrop-blur-sm">
      {/* Brand */}
      <div className="flex items-center gap-2.5">
        <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-violet-700 text-xl shadow-sm">
          🤖
          <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-background bg-ds-green" />
        </div>
        <div>
          <h1 className="text-sm font-semibold text-foreground leading-tight">Aria</h1>
          <p className="text-[10px] text-muted-foreground">AI English Tutor · Gemini 2.0</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        {messageCount > 0 && (
          <button
            onClick={onClear}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
            title="Clear conversation"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Usage note ───────────────────────────────────────────────────────────────

function UsageNote() {
  return (
    <div className="flex shrink-0 items-start gap-2 rounded-xl border border-ds-amber/20 bg-ds-amber/5 px-3 py-2 text-xs text-muted-foreground">
      <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ds-amber" />
      <span>
        Add your <code className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">GEMINI_API_KEY</code> to{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">.env.local</code> to enable AI responses. Rate limited to 30 requests / minute.
      </span>
    </div>
  );
}

// ─── Main client ──────────────────────────────────────────────────────────────

export function TutorClient() {
  const messages     = useTutorStore(selectMessages);
  const isStreaming  = useTutorStore(selectIsStreaming);
  const clearHistory = useTutorStore((s) => s.clearHistory);

  const { sendMessage, stopStreaming } = useTutorChat();

  // Listen for quick-suggestion clicks from ChatWindow
  useEffect(() => {
    const handler = (e: Event) => {
      const text = (e as CustomEvent<string>).detail;
      if (text) sendMessage(text);
    };
    window.addEventListener("tutor:quicksend", handler);
    return () => window.removeEventListener("tutor:quicksend", handler);
  }, [sendMessage]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-elevated"
    >
      {/* Header */}
      <TutorHeader onClear={clearHistory} messageCount={messages.length} />

      {/* Mode tabs */}
      <div className="shrink-0 border-b border-border bg-background/50 px-4 py-2.5">
        <ModeSelector disabled={isStreaming} />
      </div>

      {/* Messages */}
      <ChatWindow />

      {/* Input area */}
      <div className="shrink-0 border-t border-border bg-background/80 px-4 pb-4 pt-3">
        <div className="mx-auto flex max-w-2xl flex-col gap-2">
          <UsageNote />
          <ChatInput
            onSend={sendMessage}
            onStop={stopStreaming}
            isStreaming={isStreaming}
          />
        </div>
      </div>
    </motion.div>
  );
}
