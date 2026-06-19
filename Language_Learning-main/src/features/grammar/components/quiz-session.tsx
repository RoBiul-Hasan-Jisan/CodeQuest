"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronLeft, Loader2, WifiOff } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";

import { cn } from "@/lib/utils";

import { grammarRepository } from "../repositories/grammar-repository";
import { useGrammarStore } from "../store/grammar-store";
import type {
  GrammarCategory,
  GrammarDifficulty,
  GrammarQuestion,
  QuestionResult,
  QuizResult,
} from "../types";

import { QuestionCard } from "./question-card";
import { ResultsScreen } from "./results-screen";



// ─── Types ────────────────────────────────────────────────────────────────────

type Phase = "loading" | "playing" | "results";

interface QuizSessionProps {
  category: GrammarCategory;
  difficulty: GrammarDifficulty;
  topicLabel: string;
  topicIcon: string;
  onBack: () => void;
}

// ─── Question fetching ────────────────────────────────────────────────────────

async function fetchOrGenerateQuestions(
  category: GrammarCategory,
  difficulty: GrammarDifficulty,
  usedQuizIds: Set<string>
): Promise<{ questions: GrammarQuestion[]; quizId: string | null }> {
  // 1. Try Firestore cache first
  try {
    const cached = await grammarRepository.findByFilter(category, difficulty, 5);
    const unused = cached.filter((q) => !usedQuizIds.has(q.id));
    if (unused.length > 0) {
      const pick = unused[Math.floor(Math.random() * unused.length)]!;
      return { questions: pick.questions, quizId: pick.id };
    }
  } catch {
    // Firestore unavailable — fall through to generation
  }

  // 2. Generate via Gemini API
  const res = await fetch("/api/grammar/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ category, difficulty, count: 10 }),
  });

  if (!res.ok) {
    const data = (await res.json()) as { error?: string };
    throw new Error(data.error ?? "Failed to generate questions");
  }

  const { questions } = (await res.json()) as { questions: GrammarQuestion[] };

  // 3. Save to Firestore (fire-and-forget)
  let savedId: string | null = null;
  try {
    savedId = await grammarRepository.create({
      category,
      difficulty,
      questions,
      generatedAt: new Date().toISOString(),
    });
  } catch {
    // Saving failed — use questions without caching
  }

  return { questions, quizId: savedId };
}

// ─── Component ────────────────────────────────────────────────────────────────

export function QuizSession({
  category,
  difficulty,
  topicLabel,
  topicIcon,
  onBack,
}: QuizSessionProps) {
  const recordAttempt = useGrammarStore((s) => s.recordAttempt);
  const registerTopic = useGrammarStore((s) => s.registerTopic);

  const [phase, setPhase] = useState<Phase>("loading");
  const [questions, setQuestions] = useState<GrammarQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<QuizResult | null>(null);

  const startTimeRef = useRef<number>(Date.now());
  const usedQuizIds = useRef<Set<string>>(new Set());

  // ── Load questions ─────────────────────────────────────────────────────────
  const loadQuestions = useCallback(async () => {
    setPhase("loading");
    setError(null);
    setCurrentIndex(0);
    setAnswers([]);
    setResult(null);

    try {
      const { questions: qs, quizId } = await fetchOrGenerateQuestions(
        category,
        difficulty,
        usedQuizIds.current
      );
      if (quizId) usedQuizIds.current.add(quizId);
      setQuestions(qs);
      setAnswers(new Array(qs.length).fill(null));
      startTimeRef.current = Date.now();
      setPhase("playing");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setPhase("loading"); // stay on loading to show error
    }
  }, [category, difficulty]);

  useEffect(() => {
    void loadQuestions();
  }, [loadQuestions]);

  // ── Answer selection ───────────────────────────────────────────────────────
  const handleSelect = (index: number) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[currentIndex] = index;
      return next;
    });
  };

  // ── Advance ────────────────────────────────────────────────────────────────
  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      finishQuiz();
    }
  };

  // ── Finish ─────────────────────────────────────────────────────────────────
  const finishQuiz = () => {
    const timeSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);

    const questionResults: QuestionResult[] = questions.map((q, i) => {
      const sel = answers[i] ?? null;
      return {
        questionId: q.questionId,
        question: q.question,
        options: q.options,
        selectedIndex: sel,
        correctIndex: q.correctIndex,
        isCorrect: sel === q.correctIndex,
        explanation: q.explanation,
      };
    });

    const correct = questionResults.filter((r) => r.isCorrect).length;
    const score = Math.round((correct / questions.length) * 100);

    const quizResult: QuizResult = {
      category,
      difficulty,
      score,
      questionsTotal: questions.length,
      questionsCorrect: correct,
      timeSeconds,
      completedAt: new Date().toISOString(),
      questionResults,
    };

    // Persist to grammar store
    registerTopic({
      topicId: category,
      name: topicLabel,
      category,
      language: "English",
      difficulty,
    });

    recordAttempt({
      topicId: category,
      score,
      questionsTotal: questions.length,
      questionsCorrect: correct,
      timeTakenSeconds: timeSeconds,
    });

    setResult(quizResult);
    setPhase("results");
  };

  const currentQuestion = questions[currentIndex];
  const currentAnswer = answers[currentIndex] ?? null;
  const answered = currentAnswer !== null;
  const isLast = currentIndex === questions.length - 1;

  // ── Progress ───────────────────────────────────────────────────────────────
  const progressPct = questions.length > 0 ? (currentIndex / questions.length) * 100 : 0;

  // ─── Render ────────────────────────────────────────────────────────────────

  // Loading / error
  if (phase === "loading") {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        {error ? (
          <>
            <WifiOff className="h-10 w-10 text-muted-foreground/50" />
            <p className="text-sm text-destructive">{error}</p>
            <button
              onClick={() => void loadQuestions()}
              className="rounded-xl bg-ds-violet px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Try Again
            </button>
            <button onClick={onBack} className="text-xs text-muted-foreground hover:underline">
              Back to topics
            </button>
          </>
        ) : (
          <>
            <Loader2 className="h-8 w-8 animate-spin text-ds-violet" />
            <p className="text-sm text-muted-foreground">Generating questions with AI…</p>
            <p className="text-xs text-muted-foreground/60">{topicIcon} {topicLabel} · {difficulty}</p>
          </>
        )}
      </div>
    );
  }

  // Results
  if (phase === "results" && result) {
    return (
      <ResultsScreen
        result={result}
        topicLabel={topicLabel}
        topicIcon={topicIcon}
        onRetry={() => void loadQuestions()}
        onBack={onBack}
      />
    );
  }

  // Playing
  if (!currentQuestion) return null;

  return (
    <div className="flex flex-col gap-4">
      {/* Quiz header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="flex-1">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>{topicIcon} {topicLabel}</span>
            <span className="tabular-nums">{currentIndex + 1} / {questions.length}</span>
          </div>
          {/* Progress bar */}
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full rounded-full bg-ds-violet"
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Difficulty badge */}
        <span
          className={cn(
            "rounded-lg px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
            difficulty === "easy" && "bg-ds-green/10 text-ds-green",
            difficulty === "medium" && "bg-ds-amber/10 text-ds-amber",
            difficulty === "hard" && "bg-destructive/10 text-destructive"
          )}
        >
          {difficulty}
        </span>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <QuestionCard
          key={currentQuestion.questionId}
          question={currentQuestion}
          questionNumber={currentIndex + 1}
          total={questions.length}
          selectedIndex={currentAnswer}
          onSelect={handleSelect}
        />
      </AnimatePresence>

      {/* Next / Finish button */}
      {answered && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="flex justify-end"
        >
          <button
            onClick={handleNext}
            className="flex items-center gap-2 rounded-xl bg-ds-violet px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            {isLast ? "See Results" : "Next"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </motion.div>
      )}
    </div>
  );
}
