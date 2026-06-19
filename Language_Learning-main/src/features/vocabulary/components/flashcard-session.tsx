"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, X, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { useState, useCallback } from "react";

import { cn } from "@/lib/utils";

import { useVocabularyStore } from "../store/vocabulary-store";
import type { VocabularyWord, RecallQuality } from "../types";

import { Flashcard } from "./flashcard";


// ─── Quality buttons ──────────────────────────────────────────────────────────

interface QualityButtonsProps {
  onRate: (quality: RecallQuality) => void;
}

const QUALITY_LABELS: { q: RecallQuality; label: string; sublabel: string; color: string }[] = [
  { q: 0, label: "Blackout",  sublabel: "No idea",       color: "bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/20" },
  { q: 1, label: "Wrong",     sublabel: "Incorrect",     color: "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 border-orange-500/20" },
  { q: 2, label: "Hard",      sublabel: "Got it, barely",color: "bg-ds-amber/10 text-ds-amber hover:bg-ds-amber/20 border-ds-amber/20" },
  { q: 3, label: "Good",      sublabel: "Took effort",   color: "bg-ds-teal/10 text-ds-teal hover:bg-ds-teal/20 border-ds-teal/20" },
  { q: 4, label: "Easy",      sublabel: "Small hesitation",color:"bg-ds-green/10 text-ds-green hover:bg-ds-green/20 border-ds-green/20" },
  { q: 5, label: "Perfect",   sublabel: "Instant recall", color: "bg-ds-green text-white hover:bg-ds-green/90 border-ds-green" },
];

function QualityButtons({ onRate }: QualityButtonsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-2"
    >
      <p className="text-center text-xs font-medium text-muted-foreground">
        How well did you know this word?
      </p>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {QUALITY_LABELS.map(({ q, label, sublabel, color }) => (
          <button
            key={q}
            onClick={() => onRate(q)}
            className={cn(
              "flex flex-col items-center rounded-xl border px-2 py-2.5 text-xs font-medium transition-all",
              color
            )}
          >
            <span className="font-semibold">{label}</span>
            <span className="mt-0.5 text-[9px] opacity-70">{sublabel}</span>
          </button>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Session complete ──────────────────────────────────────────────────────────

interface SessionCompleteProps {
  correct: number;
  total: number;
  xpEarned: number;
  onRestart: () => void;
  onClose: () => void;
}

function SessionComplete({ correct, total, xpEarned, onRestart, onClose }: SessionCompleteProps) {
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-6 rounded-2xl border border-border bg-card p-8 text-center shadow-elevated"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-ds-green/10 text-4xl">
        {accuracy >= 80 ? "🎉" : accuracy >= 50 ? "👍" : "📚"}
      </div>
      <div>
        <h3 className="text-xl font-bold text-foreground">Session Complete!</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {correct} of {total} correct · {accuracy}% accuracy
        </p>
      </div>
      <div className="flex items-center gap-2 rounded-xl bg-ds-amber/10 px-4 py-2">
        <span className="text-lg">⭐</span>
        <span className="font-bold text-ds-amber">+{xpEarned} XP earned</span>
      </div>
      <div className="flex gap-3">
        <button
          onClick={onRestart}
          className="flex items-center gap-2 rounded-xl border border-border bg-muted px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/80"
        >
          <RotateCcw className="h-4 w-4" /> Practice Again
        </button>
        <button
          onClick={onClose}
          className="rounded-xl bg-ds-green px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          Finish
        </button>
      </div>
    </motion.div>
  );
}

// ─── Main session ──────────────────────────────────────────────────────────────

interface FlashcardSessionProps {
  words: VocabularyWord[];
  title?: string;
  onComplete?: (xpEarned: number) => void;
  onClose?: () => void;
}

export function FlashcardSession({ words, title = "Flashcard Practice", onComplete, onClose }: FlashcardSessionProps) {
  const reviewWord = useVocabularyStore((s) => s.reviewWord);

  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [sessionWords, setSessionWords] = useState(words);
  const [sessionKey, setSessionKey] = useState(0);
  const [done, setDone] = useState(false);
  const [stats, setStats] = useState({ correct: 0, total: 0, xpEarned: 0 });

  const currentWord = sessionWords[index];
  const progress = sessionWords.length > 0 ? ((index) / sessionWords.length) * 100 : 0;

  const handleReveal = useCallback(() => setRevealed(true), []);

  const handleRate = useCallback(
    (quality: RecallQuality) => {
      if (!currentWord) return;
      const xp = reviewWord(currentWord.wordId, quality);
      const correct = quality >= 3;

      setStats((prev) => ({
        correct: prev.correct + (correct ? 1 : 0),
        total: prev.total + 1,
        xpEarned: prev.xpEarned + xp,
      }));

      if (index + 1 >= sessionWords.length) {
        setDone(true);
        onComplete?.(stats.xpEarned + xp);
      } else {
        setIndex((i) => i + 1);
        setRevealed(false);
      }
    },
    [currentWord, reviewWord, index, sessionWords.length, stats.xpEarned, onComplete]
  );

  const handleRestart = () => {
    setSessionWords(words);
    setIndex(0);
    setRevealed(false);
    setDone(false);
    setStats({ correct: 0, total: 0, xpEarned: 0 });
    setSessionKey((k) => k + 1);
  };

  if (done) {
    return (
      <SessionComplete
        correct={stats.correct}
        total={stats.total}
        xpEarned={stats.xpEarned}
        onRestart={handleRestart}
        onClose={() => onClose?.()}
      />
    );
  }

  if (!currentWord) return null;

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-foreground">{title}</h3>
          <p className="text-xs text-muted-foreground">
            {index + 1} / {sessionWords.length} cards
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-full bg-ds-green/10 px-2.5 py-1 text-xs font-medium text-ds-green">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {stats.correct}
          </div>
          <div className="flex items-center gap-1 rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive">
            <X className="h-3.5 w-3.5" />
            {stats.total - stats.correct}
          </div>
          {onClose && (
            <button onClick={onClose} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <motion.div
          className="h-full rounded-full bg-ds-violet"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${sessionKey}-${index}`}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.25 }}
        >
          <Flashcard word={currentWord} onReveal={handleReveal} />
        </motion.div>
      </AnimatePresence>

      {/* Navigation (before reveal) or quality buttons (after) */}
      {revealed ? (
        <QualityButtons onRate={handleRate} />
      ) : (
        <div className="flex items-center justify-between">
          <button
            onClick={() => { setIndex((i) => Math.max(0, i - 1)); setRevealed(false); }}
            disabled={index === 0}
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" /> Previous
          </button>
          <p className="text-xs text-muted-foreground">Click card to reveal</p>
          <button
            onClick={() => { if (index < sessionWords.length - 1) { setIndex((i) => i + 1); setRevealed(false); } }}
            disabled={index >= sessionWords.length - 1}
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted disabled:opacity-30"
          >
            Skip <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
