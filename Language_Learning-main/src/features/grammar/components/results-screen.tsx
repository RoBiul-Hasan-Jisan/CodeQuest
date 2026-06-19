"use client";

import { motion } from "framer-motion";
import { CheckCircle2, XCircle, RotateCcw, LayoutGrid, Clock, Zap } from "lucide-react";

import { cn } from "@/lib/utils";

import { GRADE_CONFIG, DIFFICULTY_CONFIG } from "../constants";
import { computeGrade } from "../types";
import type { QuizResult } from "../types";


interface ResultsScreenProps {
  result: QuizResult;
  topicLabel: string;
  topicIcon: string;
  onRetry: () => void;
  onBack: () => void;
}

export function ResultsScreen({ result, topicLabel, topicIcon, onRetry, onBack }: ResultsScreenProps) {
  const grade = computeGrade(result.score);
  const gradeConf = GRADE_CONFIG[grade];
  const diffConf = DIFFICULTY_CONFIG[result.difficulty];

  const mins = Math.floor(result.timeSeconds / 60);
  const secs = result.timeSeconds % 60;
  const timeStr = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;

  const xpEarned = Math.round((result.score / 100) * result.questionsTotal * 5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-6"
    >
      {/* Score card */}
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-6 text-center shadow-soft">
        {/* Topic + difficulty */}
        <div className="flex items-center gap-2">
          <span className="text-2xl">{topicIcon}</span>
          <div className="text-left">
            <p className="font-semibold text-foreground">{topicLabel}</p>
            <p className={cn("text-xs font-medium", diffConf.color)}>{diffConf.label}</p>
          </div>
        </div>

        {/* Grade ring */}
        <div
          className={cn(
            "flex h-24 w-24 items-center justify-center rounded-full text-4xl font-black",
            gradeConf.bg,
            gradeConf.color
          )}
        >
          {gradeConf.label}
        </div>

        <div>
          <p className="text-3xl font-bold tabular-nums text-foreground">{result.score}%</p>
          <p className="text-sm text-muted-foreground">
            {result.questionsCorrect} / {result.questionsTotal} correct
          </p>
        </div>

        {/* Stats row */}
        <div className="flex w-full justify-center gap-6 border-t border-border pt-4">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            {timeStr}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-ds-amber">
            <Zap className="h-3.5 w-3.5 fill-current" />
            +{xpEarned} XP
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          <LayoutGrid className="h-4 w-4" />
          All Topics
        </button>
        <button
          onClick={onRetry}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-ds-violet py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          <RotateCcw className="h-4 w-4" />
          Try Again
        </button>
      </div>

      {/* Question breakdown */}
      <div className="flex flex-col gap-1">
        <p className="mb-2 text-sm font-semibold text-foreground">Question Review</p>
        {result.questionResults.map((qr, i) => (
          <motion.div
            key={qr.questionId}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04, duration: 0.2 }}
            className={cn(
              "rounded-xl border p-3",
              qr.isCorrect ? "border-ds-green/20 bg-ds-green/5" : "border-destructive/20 bg-destructive/5"
            )}
          >
            <div className="flex items-start gap-2">
              {qr.isCorrect ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-ds-green" />
              ) : (
                <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium leading-snug text-foreground">{qr.question}</p>
                {!qr.isCorrect && (
                  <div className="mt-1.5 flex flex-col gap-0.5">
                    {qr.selectedIndex !== null && (
                      <p className="text-[11px] text-destructive">
                        Your answer: {qr.options[qr.selectedIndex]}
                      </p>
                    )}
                    <p className="text-[11px] text-ds-green">
                      Correct: {qr.options[qr.correctIndex]}
                    </p>
                  </div>
                )}
                <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                  {qr.explanation}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
