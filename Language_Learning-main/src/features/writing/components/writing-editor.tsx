"use client";

import { X, ClipboardPaste } from "lucide-react";
import { useRef, useEffect } from "react";

import { cn } from "@/lib/utils";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function countWords(text: string): number {
  return text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface WritingEditorProps {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function WritingEditor({
  value,
  onChange,
  disabled = false,
  placeholder = "Paste or type your text here…",
}: WritingEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize the textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.max(240, Math.min(el.scrollHeight, 520))}px`;
  }, [value]);

  const words = countWords(value);
  const chars = value.length;
  const charLimit = 8_000;
  const overLimit = chars > charLimit;

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      onChange(text);
    } catch {
      textareaRef.current?.focus();
    }
  };

  return (
    <div className="flex flex-col gap-0">
      {/* Textarea */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          className={cn(
            "w-full resize-none rounded-t-2xl border border-border bg-background px-4 py-4",
            "text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/50",
            "focus:outline-none focus:ring-2 focus:ring-ds-violet/30",
            "transition-all duration-150 scrollbar-thin",
            disabled && "opacity-60 cursor-not-allowed",
            overLimit && "ring-2 ring-destructive/40"
          )}
          style={{ minHeight: 240, maxHeight: 520 }}
          spellCheck
        />

        {/* Clear button */}
        {value && !disabled && (
          <button
            onClick={() => onChange("")}
            className="absolute right-3 top-3 rounded-lg p-1 text-muted-foreground/50 transition-colors hover:bg-muted hover:text-foreground"
            title="Clear text"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Footer bar */}
      <div className="flex items-center justify-between rounded-b-2xl border border-t-0 border-border bg-muted/40 px-4 py-2">
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="tabular-nums">
            <span className={cn("font-semibold", words > 0 ? "text-foreground" : "")}>{words}</span>
            {" "}word{words !== 1 ? "s" : ""}
          </span>
          <span className="text-muted-foreground/40">·</span>
          <span className={cn("tabular-nums", overLimit && "text-destructive font-semibold")}>
            {chars.toLocaleString()} / {charLimit.toLocaleString()} chars
          </span>
        </div>

        <button
          onClick={() => void handlePaste()}
          disabled={disabled}
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-medium",
            "text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
            disabled && "opacity-40 cursor-not-allowed"
          )}
          title="Paste from clipboard"
        >
          <ClipboardPaste className="h-3.5 w-3.5" />
          Paste
        </button>
      </div>
    </div>
  );
}
