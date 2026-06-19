"use client";

import { motion } from "framer-motion";
import { CheckCircle2, AlertCircle, Lightbulb, FileText } from "lucide-react";

import { cn } from "@/lib/utils";

import type { PronunciationFeedback } from "../types";


// ─── Score ring (SVG) ─────────────────────────────────────────────────────────

function ScoreRing({
  score,
  size = 96,
  strokeWidth = 8,
  color,
  label,
}: {
  score: number;
  size?: number;
  strokeWidth?: number;
  color: string;
  label: string;
}) {
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score / 100);

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90"
          style={{ width: size, height: size }}
        >
          {/* Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-muted/20"
          />
          {/* Progress */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            className={color}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        </svg>
        {/* Score text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("text-xl font-bold tabular-nums", color)}>
            {score}
          </span>
          <span className="text-[9px] font-medium text-muted-foreground">/ 100</span>
        </div>
      </div>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
    </div>
  );
}

// ─── Sub-score bar ────────────────────────────────────────────────────────────

function ScoreBar({
  label,
  score,
  color,
}: {
  label: string;
  score: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-20 shrink-0 text-xs text-muted-foreground">{label}</span>
      <div className="flex-1 overflow-hidden rounded-full bg-muted/50" style={{ height: 6 }}>
        <motion.div
          className={cn("h-full rounded-full", color)}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
      <span className={cn("w-8 shrink-0 text-right text-xs font-semibold tabular-nums", color)}>
        {score}
      </span>
    </div>
  );
}

// ─── Score color helper ───────────────────────────────────────────────────────

function scoreColor(score: number) {
  if (score >= 80) return "text-ds-green";
  if (score >= 65) return "text-ds-amber";
  return "text-destructive";
}

function scoreBarColor(score: number) {
  if (score >= 80) return "bg-ds-green";
  if (score >= 65) return "bg-ds-amber";
  return "bg-destructive";
}

function scoreLabel(score: number) {
  if (score >= 90) return "Excellent";
  if (score >= 80) return "Great";
  if (score >= 65) return "Good";
  if (score >= 50) return "Fair";
  return "Needs Work";
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface FeedbackPanelProps {
  feedback: PronunciationFeedback;
  scenarioColor: string;
  scenarioBg: string;
  scenarioBorder: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function FeedbackPanel({
  feedback,
  scenarioColor,
  scenarioBg,
  scenarioBorder,
}: FeedbackPanelProps) {
  const overall = feedback.overallScore;
  const color = scoreColor(overall);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col gap-4"
    >
      {/* Overall score + sub-scores */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Speaking Score
        </p>

        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          {/* Big ring */}
          <div className="flex flex-col items-center gap-2">
            <ScoreRing
              score={overall}
              size={112}
              strokeWidth={9}
              color={color}
              label="Overall"
            />
            <span
              className={cn(
                "rounded-full px-2.5 py-0.5 text-xs font-bold",
                scenarioBg,
                scenarioBorder,
                "border",
                scenarioColor
              )}
            >
              {scoreLabel(overall)}
            </span>
          </div>

          {/* Sub-score bars */}
          <div className="flex flex-1 flex-col justify-center gap-2.5">
            {[
              { label: "Clarity", score: feedback.clarity },
              { label: "Fluency", score: feedback.fluency },
              { label: "Vocabulary", score: feedback.vocabulary },
              { label: "Grammar", score: feedback.grammar },
            ].map(({ label, score }) => (
              <ScoreBar
                key={label}
                label={label}
                score={score}
                color={scoreBarColor(score)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Strengths + improvements */}
      <div className="grid gap-3 sm:grid-cols-2">
        {/* Strengths */}
        <div className="flex flex-col gap-2 rounded-2xl border border-ds-green/20 bg-ds-green/5 p-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-ds-green" />
            <p className="text-xs font-semibold text-ds-green">Strengths</p>
          </div>
          <ul className="flex flex-col gap-1.5">
            {feedback.strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-foreground">
                <span className="mt-0.5 shrink-0 text-ds-green">✓</span>
                {s}
              </li>
            ))}
          </ul>
        </div>

        {/* Improvements */}
        <div className="flex flex-col gap-2 rounded-2xl border border-ds-amber/20 bg-ds-amber/5 p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-ds-amber" />
            <p className="text-xs font-semibold text-ds-amber">To Improve</p>
          </div>
          <ul className="flex flex-col gap-1.5">
            {feedback.improvements.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-foreground">
                <span className="mt-0.5 shrink-0 text-ds-amber">→</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Corrected text */}
      {feedback.correctedText &&
        feedback.correctedText !== "" && (
          <div className="flex flex-col gap-2 rounded-2xl border border-border bg-muted/30 p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs font-semibold text-muted-foreground">
                Suggested Version
              </p>
            </div>
            <p className="text-sm leading-relaxed text-foreground">
              {feedback.correctedText}
            </p>
          </div>
        )}

      {/* Tips */}
      {feedback.tips.length > 0 && (
        <div className="flex flex-col gap-2 rounded-2xl border border-ds-violet/20 bg-ds-violet/5 p-4">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-ds-violet" />
            <p className="text-xs font-semibold text-ds-violet">Pro Tips</p>
          </div>
          <ol className="flex flex-col gap-1.5">
            {feedback.tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-foreground">
                <span className="shrink-0 font-bold text-ds-violet">{i + 1}.</span>
                {tip}
              </li>
            ))}
          </ol>
        </div>
      )}
    </motion.div>
  );
}
