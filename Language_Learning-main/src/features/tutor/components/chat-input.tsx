"use client";

import { ArrowUp, Square } from "lucide-react";
import { useRef, useState, useCallback } from "react";


import { cn } from "@/lib/utils";

import { useTutorStore, selectActiveMode } from "../store/tutor-store";
import { TUTOR_MODES } from "../types";


interface ChatInputProps {
  onSend: (text: string) => void;
  onStop: () => void;
  isStreaming: boolean;
}

export function ChatInput({ onSend, onStop, isStreaming }: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const activeMode = useTutorStore(selectActiveMode);

  const activeModeConfig = TUTOR_MODES.find((m) => m.id === activeMode);
  const placeholder = activeModeConfig?.placeholder ?? "Type a message…";

  // Auto-resize textarea
  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    autoResize();
  };

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed || isStreaming) return;
    onSend(trimmed);
    setValue("");
    // Reset height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const canSend = value.trim().length > 0 && !isStreaming;

  return (
    <div className="rounded-2xl border border-border bg-background/80 shadow-elevated backdrop-blur-sm transition-all focus-within:border-ds-violet/50 focus-within:shadow-glow-violet/20">
      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={1}
        disabled={false}
        className={cn(
          "block w-full resize-none bg-transparent px-4 py-3.5 text-sm text-foreground",
          "placeholder:text-muted-foreground/60",
          "focus:outline-none",
          "min-h-[52px] max-h-[200px]"
        )}
      />

      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 pb-3">
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground/50">
          <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[9px]">
            ↵
          </kbd>
          <span>send</span>
          <span className="mx-1.5">·</span>
          <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[9px]">
            ⇧↵
          </kbd>
          <span>new line</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Character count (show when approaching limit) */}
          {value.length > 800 && (
            <span
              className={cn(
                "text-[10px] tabular-nums",
                value.length > 950 ? "text-destructive" : "text-muted-foreground"
              )}
            >
              {value.length}/1000
            </span>
          )}

          {/* Stop button (visible when streaming) */}
          {isStreaming ? (
            <button
              onClick={onStop}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-xl",
                "bg-foreground/10 text-foreground transition-colors hover:bg-foreground/20"
              )}
              title="Stop generating"
            >
              <Square className="h-3.5 w-3.5 fill-current" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canSend}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-xl",
                "transition-all duration-200",
                canSend
                  ? "bg-ds-violet text-white shadow-sm hover:bg-ds-violet/90 hover:shadow-glow-violet/30"
                  : "bg-muted text-muted-foreground"
              )}
              title="Send message (Enter)"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
