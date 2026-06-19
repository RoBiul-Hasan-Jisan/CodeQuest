"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Lightbulb } from "lucide-react";

import { cn } from "@/lib/utils";

import type { GrammarQuestion } from "../types";


interface QuestionCardProps {
  question: GrammarQuestion;
  questionNumber: number;
  total: number;
  selectedIndex: number | null;
  onSelect: (index: number) => void;
}

export function QuestionCard({
  question,
  questionNumber,
  total,
  selectedIndex,
  onSelect,
}: QuestionCardProps) {
  const answered = selectedIndex !== null;
  const isCorrect = selectedIndex === question.correctIndex;

  return (
    <motion.div
      key={question.questionId}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.22 }}
      className="flex flex-col gap-4"
    >
      {/* Question text */}
      <div className="rounded-2xl border border-border bg-muted/30 p-5">
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Question {questionNumber} of {total}
        </p>
        <p className="mt-2 text-base font-medium leading-relaxed text-foreground sm:text-lg">
          {question.question}
        </p>

        {/* Hint */}
        {question.hint && !answered && (
          <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Lightbulb className="h-3.5 w-3.5 text-ds-amber" />
            <span>{question.hint}</span>
          </div>
        )}
      </div>

      {/* Options */}
      <div className="grid gap-2 sm:grid-cols-2">
        {question.options.map((option, i) => {
          const isSelected = selectedIndex === i;
          const isRight = i === question.correctIndex;

          let variant: "default" | "correct" | "wrong" | "faded" = "default";
          if (answered) {
            if (isRight) variant = "correct";
            else if (isSelected) variant = "wrong";
            else variant = "faded";
          }

          return (
            <button
              key={i}
              onClick={() => !answered && onSelect(i)}
              disabled={answered}
              className={cn(
                "relative flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-medium transition-all",
                !answered && "hover:border-ds-violet/40 hover:bg-ds-violet/5 hover:text-ds-violet",
                variant === "default" && "border-border bg-card text-foreground",
                variant === "correct" && "border-ds-green/50 bg-ds-green/10 text-ds-green",
                variant === "wrong" && "border-destructive/50 bg-destructive/10 text-destructive",
                variant === "faded" && "border-border/50 bg-muted/30 text-muted-foreground opacity-60",
                answered && "cursor-default"
              )}
            >
              {/* Option letter */}
              <span
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold",
                  variant === "correct" && "bg-ds-green/20 text-ds-green",
                  variant === "wrong" && "bg-destructive/20 text-destructive",
                  (variant === "default" || variant === "faded") && "bg-muted text-muted-foreground"
                )}
              >
                {String.fromCharCode(65 + i)}
              </span>

              <span className="flex-1 leading-snug">{option}</span>

              {/* Icon feedback */}
              {answered && variant === "correct" && (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-ds-green" />
              )}
              {answered && variant === "wrong" && (
                <XCircle className="h-4 w-4 shrink-0 text-destructive" />
              )}
            </button>
          );
        })}
      </div>

      {/* Explanation */}
      <AnimatePresence>
        {answered && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className={cn(
              "overflow-hidden rounded-xl border px-4 py-3",
              isCorrect
                ? "border-ds-green/30 bg-ds-green/5"
                : "border-destructive/30 bg-destructive/5"
            )}
          >
            <div className="flex items-start gap-2">
              {isCorrect ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-ds-green" />
              ) : (
                <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
              )}
              <div>
                <p className={cn("text-xs font-semibold", isCorrect ? "text-ds-green" : "text-destructive")}>
                  {isCorrect ? "Correct!" : `Incorrect — correct answer: ${question.options[question.correctIndex]}`}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {question.explanation}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
