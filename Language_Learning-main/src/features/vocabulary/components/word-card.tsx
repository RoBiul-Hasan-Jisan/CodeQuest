"use client";

import { motion } from "framer-motion";
import { Star, Trash2, Volume2, BookOpen, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

import { useVocabularyStore } from "../store/vocabulary-store";
import type { VocabularyWord } from "../types";


// ─── Status + difficulty helpers ──────────────────────────────────────────────

const STATUS_STYLES = {
  new:       { bg: "bg-slate-400/15", text: "text-slate-400",  dot: "bg-slate-400"  },
  learning:  { bg: "bg-ds-amber/15",  text: "text-ds-amber",   dot: "bg-ds-amber"   },
  reviewing: { bg: "bg-ds-violet/15", text: "text-ds-violet",  dot: "bg-ds-violet"  },
  mastered:  { bg: "bg-ds-green/15",  text: "text-ds-green",   dot: "bg-ds-green"   },
};

function DifficultyDots({ level = 2 }: { level?: number }) {
  const color = level <= 2 ? "bg-ds-green" : level === 3 ? "bg-ds-amber" : "bg-destructive";
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={cn("h-1.5 w-1.5 rounded-full", i < level ? color : "bg-muted")} />
      ))}
    </div>
  );
}

// ─── AI examples loading ──────────────────────────────────────────────────────

function AIExamplesButton({ word }: { word: VocabularyWord }) {
  const setAIExamples = useVocabularyStore((s) => s.setAIExamples);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasExamples = (word.aiExamples?.length ?? 0) > 0;

  const generate = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/vocabulary/examples", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          word: word.word,
          definition: word.definition,
          partOfSpeech: word.tags[0],
        }),
      });
      const data = await res.json() as { examples?: string[]; error?: string };
      if (data.examples) {
        setAIExamples(word.wordId, data.examples);
      } else {
        setError(data.error ?? "Failed");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={generate}
      disabled={loading}
      className={cn(
        "flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-medium transition-all",
        hasExamples
          ? "bg-ds-violet/10 text-ds-violet hover:bg-ds-violet/20"
          : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground",
        loading && "animate-pulse"
      )}
      title={error ?? (hasExamples ? "Regenerate AI examples" : "Generate AI examples")}
    >
      <Sparkles className="h-3 w-3" />
      {loading ? "Generating…" : hasExamples ? "Regenerate" : "AI Examples"}
    </button>
  );
}

// ─── Main word card ───────────────────────────────────────────────────────────

interface WordCardProps {
  word: VocabularyWord;
  index?: number;
  onStartFlashcard?: (word: VocabularyWord) => void;
}

export function WordCard({ word, index = 0, onStartFlashcard }: WordCardProps) {
  const [expanded, setExpanded] = useState(false);
  const toggleFavorite = useVocabularyStore((s) => s.toggleFavorite);
  const removeWord = useVocabularyStore((s) => s.removeWord);

  const status = STATUS_STYLES[word.status];
  const examples = [...(word.aiExamples ?? []), word.exampleSentence].filter(Boolean) as string[];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.03, 0.3) }}
      className={cn(
        "group flex flex-col rounded-2xl border border-border bg-card shadow-soft",
        "transition-shadow duration-200 hover:shadow-elevated",
        word.isFavorite && "ring-1 ring-ds-amber/30"
      )}
    >
      {/* Card header */}
      <div className="flex items-start gap-3 p-4">
        {/* Status dot */}
        <div className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", status.dot)} />

        {/* Word info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-baseline gap-2 flex-wrap">
                <h3 className="font-semibold text-foreground">{word.word}</h3>
                {word.pronunciation && (
                  <span className="flex items-center gap-0.5 font-mono text-[11px] text-muted-foreground">
                    <Volume2 className="h-3 w-3" />
                    {word.pronunciation}
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground">{word.translation}</p>
            </div>

            {/* Actions */}
            <div className="flex shrink-0 items-center gap-1">
              <button
                onClick={() => toggleFavorite(word.wordId)}
                className="rounded-lg p-1.5 text-muted-foreground/40 transition-colors hover:text-ds-amber"
                title={word.isFavorite ? "Remove from favorites" : "Add to favorites"}
              >
                <Star
                  className={cn(
                    "h-4 w-4 transition-all",
                    word.isFavorite && "fill-ds-amber text-ds-amber scale-110"
                  )}
                />
              </button>
              <button
                onClick={() => onStartFlashcard?.(word)}
                className="rounded-lg p-1.5 text-muted-foreground/40 transition-colors hover:text-ds-violet"
                title="Practice this word"
              >
                <BookOpen className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Metadata row */}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize", status.bg, status.text)}>
              {word.status}
            </span>
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] capitalize text-muted-foreground">
              {word.category}
            </span>
            <DifficultyDots level={word.difficulty ?? 2} />
            {word.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="rounded-full bg-muted/50 px-1.5 py-0.5 text-[10px] capitalize text-muted-foreground/70">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Definition (always visible) */}
      {word.definition && (
        <p className="px-4 pb-2 text-xs leading-relaxed text-muted-foreground">{word.definition}</p>
      )}

      {/* Expand toggle */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="mx-4 mb-2 flex items-center gap-1 self-start text-[10px] text-muted-foreground/50 hover:text-muted-foreground transition-colors"
      >
        {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        {expanded ? "Less" : "More"}
      </button>

      {/* Expanded details */}
      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="border-t border-border px-4 pb-4 pt-3"
        >
          {/* Examples */}
          {examples.length > 0 && (
            <div className="mb-3">
              <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Examples</p>
              <div className="flex flex-col gap-1.5">
                {examples.slice(0, 3).map((ex, i) => (
                  <p key={i} className="text-xs italic leading-relaxed text-muted-foreground">
                    &ldquo;{ex}&rdquo;
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Review stats */}
          <div className="mb-3 grid grid-cols-3 gap-2">
            {[
              { label: "Reviews", value: word.totalReviews },
              { label: "Accuracy", value: `${Math.round(word.accuracy * 100)}%` },
              { label: "Interval", value: `${word.interval}d` },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-lg bg-muted/50 p-2 text-center">
                <p className="text-xs font-semibold text-foreground">{value}</p>
                <p className="text-[10px] text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-between">
            <AIExamplesButton word={word} />
            <button
              onClick={() => removeWord(word.wordId)}
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] text-muted-foreground/50 transition-colors hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="h-3 w-3" /> Remove
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
