"use client";

import { motion } from "framer-motion";
import { Volume2, Star, BookOpen } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

import type { VocabularyWord } from "../types";


// ─── Difficulty stars ──────────────────────────────────────────────────────────

function DifficultyStars({ level = 2 }: { level?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "h-3 w-3",
            i < level
              ? level <= 2
                ? "fill-ds-green text-ds-green"
                : level === 3
                ? "fill-ds-amber text-ds-amber"
                : "fill-destructive text-destructive"
              : "fill-transparent text-muted-foreground/30"
          )}
        />
      ))}
    </div>
  );
}

// ─── Status badge ──────────────────────────────────────────────────────────────

const STATUS_STYLES = {
  new:       "bg-slate-400/20 text-slate-400",
  learning:  "bg-ds-amber/20 text-ds-amber",
  reviewing: "bg-ds-violet/20 text-ds-violet",
  mastered:  "bg-ds-green/20 text-ds-green",
};

// ─── Main flashcard ───────────────────────────────────────────────────────────

interface FlashcardProps {
  word: VocabularyWord;
  /** Called when user reveals the back — starts showing quality buttons */
  onReveal?: () => void;
  className?: string;
}

export function Flashcard({ word, onReveal, className }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    if (!isFlipped) {
      setIsFlipped(true);
      onReveal?.();
    } else {
      setIsFlipped(false);
    }
  };

  const examples = [
    ...(word.aiExamples ?? []),
    word.exampleSentence,
  ].filter(Boolean).slice(0, 2) as string[];

  return (
    <div
      className={cn("relative cursor-pointer select-none", className)}
      style={{ perspective: "1200px" }}
      onClick={handleFlip}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" || e.key === " " ? handleFlip() : null}
      aria-label={isFlipped ? "Flip to word" : "Flip to definition"}
    >
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
        style={{ transformStyle: "preserve-3d", position: "relative", minHeight: 300 }}
      >
        {/* ── Front (word) ─────────────────────────────────────────── */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-8 shadow-elevated"
          style={{ backfaceVisibility: "hidden" }}
        >
          {/* Category + status */}
          <div className="absolute left-4 top-4 flex items-center gap-2">
            <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-semibold capitalize text-muted-foreground">
              {word.category}
            </span>
            <span className={cn("rounded-full px-2.5 py-1 text-[10px] font-semibold capitalize", STATUS_STYLES[word.status])}>
              {word.status}
            </span>
          </div>

          {/* Favorite */}
          {word.isFavorite && (
            <Star className="absolute right-4 top-4 h-4 w-4 fill-ds-amber text-ds-amber" />
          )}

          {/* Word */}
          <div className="flex flex-col items-center gap-3 text-center">
            <h2 className="text-4xl font-bold tracking-tight text-foreground">{word.word}</h2>
            {word.pronunciation && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Volume2 className="h-3.5 w-3.5" />
                <span className="font-mono text-sm">{word.pronunciation}</span>
              </div>
            )}
            <DifficultyStars level={word.difficulty ?? 2} />
            <p className="mt-1 text-xs text-muted-foreground/60">
              {word.language} · Tap to reveal
            </p>
          </div>

          {/* Flip hint */}
          <div className="absolute bottom-4 flex items-center gap-1.5 text-[10px] text-muted-foreground/50">
            <BookOpen className="h-3 w-3" />
            Tap to see definition
          </div>
        </div>

        {/* ── Back (definition) ─────────────────────────────────────── */}
        <div
          className="absolute inset-0 flex flex-col justify-between rounded-2xl border border-ds-violet/30 bg-gradient-to-br from-card to-ds-violet/5 p-6 shadow-elevated"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          {/* Translation */}
          <div className="flex flex-col gap-2">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Translation</p>
            <p className="text-2xl font-semibold text-foreground">{word.translation}</p>
          </div>

          {/* Definition */}
          {word.definition && (
            <div className="flex flex-col gap-1">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Definition</p>
              <p className="text-sm leading-relaxed text-foreground/80">{word.definition}</p>
            </div>
          )}

          {/* Example sentences */}
          {examples.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Examples</p>
              {examples.map((ex, i) => (
                <p key={i} className="text-xs italic leading-relaxed text-muted-foreground">
                  &ldquo;{ex}&rdquo;
                </p>
              ))}
            </div>
          )}

          {/* Tags */}
          {word.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {word.tags.slice(0, 4).map((tag) => (
                <span key={tag} className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground capitalize">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <p className="text-center text-[10px] text-muted-foreground/50">Tap to flip back</p>
        </div>
      </motion.div>
    </div>
  );
}
