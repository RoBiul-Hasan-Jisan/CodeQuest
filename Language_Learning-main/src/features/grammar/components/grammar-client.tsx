"use client";

import { motion, AnimatePresence } from "framer-motion";
import { LayoutGrid, History, Clock, Target } from "lucide-react";
import { useState } from "react";


import { cn } from "@/lib/utils";

import { GRAMMAR_TOPICS } from "../constants";
import { useGrammarStore } from "../store/grammar-store";
import type { GrammarCategory, GrammarDifficulty } from "../types";

import { QuizSession } from "./quiz-session";
import { StatsHeader } from "./stats-header";
import { TopicCard, DifficultyModal } from "./topic-card";


// ─── Tab types ────────────────────────────────────────────────────────────────

type Tab = "topics" | "history";
type View = "grid" | "quiz";

// ─── History view ─────────────────────────────────────────────────────────────

function HistoryView() {
  const history = useGrammarStore((s) => s.attemptHistory.slice(0, 50));

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <History className="h-10 w-10 text-muted-foreground/30" />
        <p className="font-medium text-muted-foreground">No attempts yet</p>
        <p className="text-sm text-muted-foreground/70">
          Complete your first quiz to see your history here.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {history.map((attempt, i) => {
        const topic = GRAMMAR_TOPICS.find((t) => t.category === attempt.topicId);
        const pct = Math.round((attempt.questionsCorrect / attempt.questionsTotal) * 100);
        const date = new Date(attempt.completedAt);
        const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        const timeStr = date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

        return (
          <motion.div
            key={attempt.attemptId}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03, duration: 0.2 }}
            className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-soft"
          >
            <span className="text-2xl">{topic?.icon ?? "📚"}</span>

            <div className="flex-1 min-w-0">
              <p className="truncate font-medium text-foreground text-sm">{topic?.label ?? attempt.topicId}</p>
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Target className="h-3 w-3" />
                  {attempt.questionsCorrect}/{attempt.questionsTotal}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {attempt.timeTakenSeconds}s
                </span>
                <span>{dateStr} · {timeStr}</span>
              </div>
            </div>

            {/* Score badge */}
            <div
              className={cn(
                "flex h-10 w-14 items-center justify-center rounded-lg text-sm font-bold tabular-nums",
                pct >= 85 ? "bg-ds-green/10 text-ds-green" :
                pct >= 65 ? "bg-ds-amber/10 text-ds-amber" :
                "bg-destructive/10 text-destructive"
              )}
            >
              {pct}%
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── Topics view ──────────────────────────────────────────────────────────────

interface TopicsViewProps {
  onStartQuiz: (category: GrammarCategory) => void;
}

function TopicsView({ onStartQuiz }: TopicsViewProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {GRAMMAR_TOPICS.map((topic, i) => (
        <TopicCard
          key={topic.category}
          category={topic.category}
          label={topic.label}
          icon={topic.icon}
          description={topic.description}
          index={i}
          onStart={onStartQuiz}
        />
      ))}
    </div>
  );
}

// ─── Main grammar client ──────────────────────────────────────────────────────

export function GrammarClient() {
  const [tab, setTab] = useState<Tab>("topics");
  const [view, setView] = useState<View>("grid");

  // Category being configured (difficulty picker modal)
  const [configuring, setConfiguring] = useState<GrammarCategory | null>(null);

  // Active quiz
  const [activeCategory, setActiveCategory] = useState<GrammarCategory | null>(null);
  const [activeDifficulty, setActiveDifficulty] = useState<GrammarDifficulty>("medium");

  const configuringTopic = configuring
    ? GRAMMAR_TOPICS.find((t) => t.category === configuring) ?? null
    : null;

  const handleStartTopic = (category: GrammarCategory) => {
    setConfiguring(category);
  };

  const handleStartQuiz = (difficulty: GrammarDifficulty) => {
    if (!configuring) return;
    setActiveCategory(configuring);
    setActiveDifficulty(difficulty);
    setConfiguring(null);
    setView("quiz");
  };

  const handleBackToGrid = () => {
    setView("grid");
    setActiveCategory(null);
  };

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "topics",  label: "Topics",  icon: <LayoutGrid className="h-4 w-4" /> },
    { id: "history", label: "History", icon: <History className="h-4 w-4" /> },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Grammar Lab</h1>
          <p className="text-sm text-muted-foreground">
            AI-powered quizzes across {GRAMMAR_TOPICS.length} grammar topics
          </p>
        </div>

        {view === "quiz" && (
          <button
            onClick={handleBackToGrid}
            className="flex items-center gap-2 rounded-xl border border-border bg-muted px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/80"
          >
            <LayoutGrid className="h-4 w-4" />
            All Topics
          </button>
        )}
      </motion.div>

      {/* Stats */}
      <StatsHeader />

      {/* Active quiz session */}
      <AnimatePresence mode="wait">
        {view === "quiz" && activeCategory ? (
          <motion.div
            key="quiz"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <QuizSession
              category={activeCategory}
              difficulty={activeDifficulty}
              topicLabel={GRAMMAR_TOPICS.find((t) => t.category === activeCategory)?.label ?? activeCategory}
              topicIcon={GRAMMAR_TOPICS.find((t) => t.category === activeCategory)?.icon ?? "📚"}
              onBack={handleBackToGrid}
            />
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex flex-col gap-4"
          >
            {/* Tabs */}
            <div className="flex gap-1.5 rounded-2xl border border-border bg-muted/40 p-1">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={cn(
                    "relative flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                    tab === t.id
                      ? "bg-card text-foreground shadow-soft"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t.icon}
                  <span>{t.label}</span>
                </button>
              ))}
            </div>

            {/* Tab content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
              >
                {tab === "topics" ? (
                  <TopicsView onStartQuiz={handleStartTopic} />
                ) : (
                  <HistoryView />
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Difficulty picker modal */}
      <AnimatePresence>
        {configuring && configuringTopic && (
          <DifficultyModal
            category={configuring}
            label={configuringTopic.label}
            icon={configuringTopic.icon}
            onStart={handleStartQuiz}
            onClose={() => setConfiguring(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
