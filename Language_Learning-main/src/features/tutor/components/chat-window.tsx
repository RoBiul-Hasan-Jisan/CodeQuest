"use client";

import { AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useEffect, useRef } from "react";

import { useTutorStore, selectMessages, selectActiveMode, selectIsStreaming } from "../store/tutor-store";
import { TUTOR_MODES } from "../types";

import { ChatMessageBubble } from "./chat-message";
import { TypingIndicator } from "./typing-indicator";

// ─── Quick prompt suggestions ─────────────────────────────────────────────────

const SUGGESTIONS: Record<string, string[]> = {
  general:       ["What's the difference between 'affect' and 'effect'?", "How do I use phrasal verbs naturally?", "Explain the past perfect tense with examples."],
  grammar:       ["I goed to the store yesterday.", "She don't like spicy foods.", "He is more taller than his brother."],
  vocabulary:    ["serendipity", "ubiquitous", "What's the difference between 'big', 'large', and 'huge'?"],
  translation:   ["Hola, ¿cómo estás?", "Je suis très content de vous rencontrer.", "Ich lerne seit zwei Jahren Englisch."],
  rewrite:       ["The meeting it was very long and boring for everyone who was there.", "I want to apply for the job because I am a good worker.", "The project has many problems that need to be fixed soon."],
  pronunciation: ["entrepreneur", "colonel", "worcestershire", "squirrel"],
};

function EmptyState({ mode }: { mode: string }) {
  const modeConfig = TUTOR_MODES.find((m) => m.id === mode);
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-12 text-center">
      {/* AI avatar */}
      <div className="relative">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-violet-700 text-3xl shadow-glow-violet/30">
          🤖
        </div>
        <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-ds-green text-[10px] font-bold text-white shadow">
          AI
        </div>
      </div>

      <div className="max-w-sm">
        <h2 className="mb-1.5 text-xl font-bold text-foreground">
          {modeConfig ? modeConfig.icon : "💬"} {modeConfig?.label ?? "Chat"} Mode
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {modeConfig?.description ?? "Start a conversation with your AI English tutor."}
        </p>
      </div>

      {/* Quick suggestions */}
      <div className="w-full max-w-lg">
        <p className="mb-2 flex items-center justify-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Sparkles className="h-3 w-3" />
          Try one of these
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {(SUGGESTIONS[mode] ?? SUGGESTIONS.general)!.map((s) => (
            <QuickSuggestion key={s} text={s} />
          ))}
        </div>
      </div>
    </div>
  );
}

function QuickSuggestion({ text }: { text: string }) {
  // Dispatch a custom event that ChatInput listens for — avoids prop drilling
  const handleClick = () => {
    const event = new CustomEvent("tutor:quicksend", { detail: text });
    window.dispatchEvent(event);
  };

  return (
    <button
      onClick={handleClick}
      className="max-w-[240px] truncate rounded-xl border border-border bg-muted/50 px-3 py-2 text-xs text-muted-foreground transition-colors hover:border-ds-violet/30 hover:bg-muted hover:text-foreground"
    >
      &ldquo;{text}&rdquo;
    </button>
  );
}

// ─── Main window ──────────────────────────────────────────────────────────────

export function ChatWindow() {
  const messages    = useTutorStore(selectMessages);
  const isStreaming = useTutorStore(selectIsStreaming);
  const activeMode  = useTutorStore(selectActiveMode);

  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new content arrives
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  const isEmpty = messages.length === 0;

  // Show typing indicator only when the last message is an empty assistant placeholder
  const lastMsg = messages[messages.length - 1];
  const showTyping = isStreaming && lastMsg?.role === "assistant" && lastMsg.content === "";

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-4 scrollbar-thin">
      {isEmpty ? (
        <EmptyState mode={activeMode} />
      ) : (
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <ChatMessageBubble
                key={msg.id}
                message={msg}
                isLatest={i === messages.length - 1}
                index={i}
              />
            ))}
          </AnimatePresence>

          {/* Typing indicator shown while waiting for first chunk */}
          <TypingIndicator visible={showTyping} />

          {/* Scroll anchor */}
          <div ref={bottomRef} />
        </div>
      )}
    </div>
  );
}
