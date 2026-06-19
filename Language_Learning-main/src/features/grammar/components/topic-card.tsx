"use client";

import { motion } from "framer-motion";
import { Play } from "lucide-react";


import { cn } from "@/lib/utils";

import { GRADE_CONFIG } from "../constants";
import { useGrammarStore } from "../store/grammar-store";
import type { GrammarCategory, GrammarDifficulty } from "../types";


interface TopicCardProps {
  category: GrammarCategory;
  label: string;
  icon: string;
  description: string;
  index: number;
  onStart: (category: GrammarCategory) => void;
}

export function TopicCard({ category, label, icon, description, index, onStart }: TopicCardProps) {
  const topic = useGrammarStore((s) => s.topics[category] ?? null);

  const score = topic?.currentScore ?? 0;
  const grade = topic?.grade ?? "F";
  const attempts = topic?.totalAttempts ?? 0;
  const mastered = topic?.mastered ?? false;

  const gradeConf = GRADE_CONFIG[grade];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.03 }}
      className={cn(
        "group relative flex flex-col gap-3 rounded-2xl border bg-card p-4 shadow-soft",
        "transition-all duration-200 hover:shadow-md",
        mastered ? "border-ds-green/30 bg-ds-green/5" : "border-border"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl leading-none">{icon}</span>
          <div>
            <p className="font-semibold leading-tight text-foreground">{label}</p>
            <p className="text-[11px] text-muted-foreground">{description}</p>
          </div>
        </div>

        {/* Grade badge */}
        <div
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold",
            gradeConf.bg,
            gradeConf.color
          )}
        >
          {attempts === 0 ? "—" : gradeConf.label}
        </div>
      </div>

      {/* Score bar */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-muted-foreground">Score</span>
          <span className={cn("font-semibold tabular-nums", attempts > 0 ? gradeConf.color : "text-muted-foreground")}>
            {attempts > 0 ? `${score}%` : "Not started"}
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              score >= 85 ? "bg-ds-green" : score >= 65 ? "bg-ds-amber" : "bg-destructive/70"
            )}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <p className="text-[11px] text-muted-foreground">
          {attempts === 0 ? "No attempts yet" : `${attempts} attempt${attempts !== 1 ? "s" : ""}`}
          {mastered && " · ✓ Mastered"}
        </p>
        <button
          onClick={() => onStart(category)}
          className={cn(
            "flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all",
            "bg-ds-violet text-white hover:bg-ds-violet/90 hover:shadow-sm"
          )}
        >
          <Play className="h-3 w-3 fill-current" />
          Practice
        </button>
      </div>
    </motion.div>
  );
}

// ─── Difficulty picker modal ──────────────────────────────────────────────────

interface DifficultyModalProps {
  category: GrammarCategory;
  label: string;
  icon: string;
  onStart: (difficulty: GrammarDifficulty) => void;
  onClose: () => void;
}

const DIFFICULTIES: { value: GrammarDifficulty; label: string; desc: string; color: string; bg: string; border: string }[] = [
  { value: "easy",   label: "Easy",   desc: "A1–A2 · Basic rules",   color: "text-ds-green",   bg: "bg-ds-green/10",   border: "border-ds-green/30" },
  { value: "medium", label: "Medium", desc: "B1–B2 · Intermediate",   color: "text-ds-amber",   bg: "bg-ds-amber/10",   border: "border-ds-amber/30" },
  { value: "hard",   label: "Hard",   desc: "C1–C2 · Advanced",       color: "text-destructive", bg: "bg-destructive/10",border: "border-destructive/30" },
];

export function DifficultyModal({ category: _category, label, icon, onStart, onClose }: DifficultyModalProps) {
  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="fixed inset-x-4 top-1/2 z-50 mx-auto max-w-sm -translate-y-1/2 rounded-2xl border border-border bg-card p-6 shadow-float"
      >
        {/* Topic info */}
        <div className="mb-5 flex items-center gap-3">
          <span className="text-3xl">{icon}</span>
          <div>
            <h3 className="font-bold text-foreground">{label}</h3>
            <p className="text-xs text-muted-foreground">Choose a difficulty level</p>
          </div>
        </div>

        {/* Difficulty buttons */}
        <div className="flex flex-col gap-2">
          {DIFFICULTIES.map((d) => (
            <button
              key={d.value}
              onClick={() => onStart(d.value)}
              className={cn(
                "flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-all hover:shadow-sm",
                d.border, d.bg
              )}
            >
              <div>
                <p className={cn("font-semibold", d.color)}>{d.label}</p>
                <p className="text-[11px] text-muted-foreground">{d.desc}</p>
              </div>
              <Play className={cn("h-4 w-4 fill-current", d.color)} />
            </button>
          ))}
        </div>

        <button
          onClick={onClose}
          className="mt-3 w-full rounded-xl border border-border py-2 text-sm text-muted-foreground transition-colors hover:bg-muted"
        >
          Cancel
        </button>
      </motion.div>
    </>
  );
}
