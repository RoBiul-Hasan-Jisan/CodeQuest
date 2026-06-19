"use client";

import { motion } from "framer-motion";
import { Sparkles, BookOpen, PenLine, Clock, ChevronRight, BrainCircuit } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { useGrammarStore, selectAllTopics, selectGrammarOverview } from "@/features/grammar/store/grammar-store";
import { useProgressStore, selectLevelInfo } from "@/features/progress/store/progress-store";
import { useStreakStore, selectTodayProgress } from "@/features/streak/store/streak-store";
import { useVocabularyStore, selectVocabStats } from "@/features/vocabulary/store/vocabulary-store";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type Priority = "high" | "medium" | "low";

interface Recommendation {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  cta: string;
  priority: Priority;
  tag: string;
  tagColor: string;
}

// ─── Priority styles ──────────────────────────────────────────────────────────

const PRIORITY_BAR: Record<Priority, string> = {
  high:   "bg-destructive",
  medium: "bg-ds-amber",
  low:    "bg-ds-green",
};

// ─── Single recommendation card ───────────────────────────────────────────────

function RecommendationItem({ rec, delay }: { rec: Recommendation; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className={cn(
        "group relative flex cursor-pointer items-start gap-3 overflow-hidden rounded-xl",
        "border border-border bg-muted/30 p-4 transition-all duration-200",
        "hover:border-border/80 hover:bg-muted/60 hover:shadow-soft"
      )}
    >
      {/* Priority indicator */}
      <div className={cn("absolute left-0 top-0 h-full w-0.5", PRIORITY_BAR[rec.priority])} />

      {/* Icon */}
      <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", rec.tagColor)}>
        {rec.icon}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="mb-0.5 flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">{rec.title}</span>
          <span className={cn("rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide", rec.tagColor)}>
            {rec.tag}
          </span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">{rec.description}</p>
        <p className="mt-1.5 text-xs font-medium text-foreground/80 group-hover:text-foreground transition-colors">
          {rec.cta} →
        </p>
      </div>

      <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:text-muted-foreground" />
    </motion.div>
  );
}

// ─── AI recommendation engine ─────────────────────────────────────────────────

function generateRecommendations(opts: {
  overallGrammarScore: number;
  weakTopicNames: string[];
  vocabDueToday: number;
  totalVocabLearned: number;
  todayGoalCompleted: boolean;
  todayXP: number;
  xpToNextLevel: number;
  level: number;
}): Recommendation[] {
  const recs: Recommendation[] = [];

  // Vocab review (highest urgency if words are due)
  if (opts.vocabDueToday >= 5) {
    recs.push({
      id: "vocab-review-urgent",
      icon: <Clock className="h-4 w-4 text-orange-100" />,
      title: "Review Due Words",
      description: `You have ${opts.vocabDueToday} vocabulary words due for review. Reviewing on schedule maximises retention.`,
      cta: "Start flashcard review",
      priority: "high",
      tag: "Due today",
      tagColor: "bg-orange-500/20 text-orange-400",
    });
  } else if (opts.vocabDueToday > 0) {
    recs.push({
      id: "vocab-review",
      icon: <BookOpen className="h-4 w-4 text-teal-200" />,
      title: `${opts.vocabDueToday} Words to Review`,
      description: "Stay consistent with spaced repetition to build long-term retention.",
      cta: "Review now",
      priority: "medium",
      tag: "Vocabulary",
      tagColor: "bg-ds-teal/20 text-ds-teal",
    });
  }

  // Weak grammar topics
  if (opts.weakTopicNames.length > 0) {
    const topic = opts.weakTopicNames[0]!.replace(/_/g, " ");
    recs.push({
      id: "grammar-weak",
      icon: <PenLine className="h-4 w-4 text-violet-200" />,
      title: `Improve ${topic.replace(/\b\w/g, (c) => c.toUpperCase())}`,
      description:
        opts.weakTopicNames.length === 1
          ? `Your score is below 70%. Focus on targeted practice to improve your grade.`
          : `${opts.weakTopicNames.length} grammar topics need attention. Start with ${topic} for the biggest impact.`,
      cta: "Practice grammar",
      priority: opts.overallGrammarScore < 50 ? "high" : "medium",
      tag: "Grammar",
      tagColor: "bg-ds-violet/20 text-ds-violet",
    });
  }

  // XP / level nudge
  if (!opts.todayGoalCompleted) {
    const xpNeededToday = Math.max(0, 50 - opts.todayXP);
    recs.push({
      id: "daily-goal",
      icon: <Sparkles className="h-4 w-4 text-amber-200" />,
      title: xpNeededToday > 0 ? `Earn ${xpNeededToday} More XP Today` : "Complete Your Daily Goal",
      description: `You're ${opts.xpToNextLevel.toLocaleString()} XP away from Level ${opts.level + 1}. Keep the momentum going!`,
      cta: "Start a lesson",
      priority: "medium",
      tag: "Daily goal",
      tagColor: "bg-ds-amber/20 text-ds-amber",
    });
  }

  // New learner onboarding
  if (opts.totalVocabLearned === 0 && opts.weakTopicNames.length === 0) {
    recs.push({
      id: "onboarding",
      icon: <BrainCircuit className="h-4 w-4 text-green-200" />,
      title: "Start Your First Lesson",
      description: "Pick a course and complete your first lesson to start earning XP and building vocabulary.",
      cta: "Browse lessons",
      priority: "high",
      tag: "Get started",
      tagColor: "bg-ds-green/20 text-ds-green",
    });
  }

  // Low grammar score general advice
  if (opts.overallGrammarScore > 0 && opts.overallGrammarScore < 60 && opts.weakTopicNames.length === 0) {
    recs.push({
      id: "grammar-general",
      icon: <PenLine className="h-4 w-4 text-violet-200" />,
      title: "Boost Your Grammar Score",
      description: "Regular grammar practice improves fluency. Aim for at least one exercise per day.",
      cta: "Go to grammar",
      priority: "low",
      tag: "Grammar",
      tagColor: "bg-ds-violet/20 text-ds-violet",
    });
  }

  return recs.slice(0, 4);
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function AIRecommendations() {
  const allTopics = useGrammarStore(useShallow(selectAllTopics));
  const grammarOverview = useGrammarStore(useShallow(selectGrammarOverview));
  const vocabStats = useVocabularyStore(useShallow(selectVocabStats));
  const levelInfo = useProgressStore(useShallow(selectLevelInfo));
  const todayProgress = useStreakStore(useShallow(selectTodayProgress));

  const weakTopicNames = allTopics
    .filter((t) => t.currentScore < 70)
    .sort((a, b) => a.currentScore - b.currentScore)
    .map((t) => t.name);

  const recs = generateRecommendations({
    overallGrammarScore: grammarOverview.overallScore,
    weakTopicNames,
    vocabDueToday: vocabStats.totalDueToday,
    totalVocabLearned: vocabStats.totalLearned,
    todayGoalCompleted: todayProgress.goalCompleted,
    todayXP: todayProgress.xp,
    xpToNextLevel: levelInfo.xpToNextLevel,
    level: levelInfo.level,
  });

  return (
    <div className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-soft">
      {/* Header */}
      <div className="mb-4 flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-violet-700">
          <BrainCircuit className="h-4 w-4 text-white" />
        </div>
        <div>
          <h2 className="font-semibold text-foreground">AI Recommendations</h2>
          <p className="text-xs text-muted-foreground">Personalised for your learning pace</p>
        </div>
        <span className="ml-auto rounded-full bg-ds-violet/10 px-2 py-0.5 text-[10px] font-bold text-ds-violet">
          AI
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {recs.map((rec, i) => (
          <RecommendationItem key={rec.id} rec={rec} delay={i * 0.06} />
        ))}
      </div>

      <p className="mt-3 text-center text-[10px] text-muted-foreground/60">
        Recommendations update as you learn
      </p>
    </div>
  );
}
