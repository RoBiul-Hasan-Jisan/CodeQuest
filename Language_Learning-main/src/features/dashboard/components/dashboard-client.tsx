"use client";

import { motion } from "framer-motion";
import { Suspense, useEffect } from "react";
import { useShallow } from "zustand/react/shallow";


import { useDashboardStore } from "@/features/dashboard/store/dashboard-store";
import { useGrammarStore, selectGrammarOverview } from "@/features/grammar/store/grammar-store";
import { useProgressStore, selectLevelInfo, selectTotalXP } from "@/features/progress/store/progress-store";
import { useStreakStore, selectCurrentStreak, selectLongestStreak, selectTodayProgress } from "@/features/streak/store/streak-store";
import { useVocabularyStore, selectVocabStats } from "@/features/vocabulary/store/vocabulary-store";

import { AchievementsCard, AchievementsCardSkeleton } from "./widgets/achievements-card";
import { AIRecommendations } from "./widgets/ai-recommendations";
import { DailyGoalsCard, DailyGoalsCardSkeleton } from "./widgets/daily-goals-card";
import { GrammarCard, GrammarCardSkeleton } from "./widgets/grammar-card";
import { StatCards, StatCardsSkeleton } from "./widgets/stat-cards";
import { StreakCard, StreakCardSkeleton } from "./widgets/streak-card";
import { VocabularyCard, VocabularyCardSkeleton } from "./widgets/vocabulary-card";
import { WeeklyChart, WeeklyChartSkeleton } from "./widgets/weekly-chart";


// ─── Sync hook — keeps snapshot fresh ────────────────────────────────────────

function useDashboardSync() {
  const totalXP = useProgressStore(selectTotalXP);
  const levelInfo = useProgressStore(useShallow(selectLevelInfo));
  const currentStreak = useStreakStore(selectCurrentStreak);
  const longestStreak = useStreakStore(selectLongestStreak);
  const todayProgress = useStreakStore(useShallow(selectTodayProgress));
  const vocabStats = useVocabularyStore(useShallow(selectVocabStats));
  const grammar = useGrammarStore(useShallow(selectGrammarOverview));
  const updateSnapshot = useDashboardStore((s) => s.updateSnapshot);

  useEffect(() => {
    updateSnapshot({
      totalXP,
      level: levelInfo.level,
      levelProgress: levelInfo.levelProgress,
      xpToNextLevel: levelInfo.xpToNextLevel,
      currentStreak,
      longestStreak,
      todayGoalCompleted: todayProgress.goalCompleted,
      totalWordsLearned: vocabStats.totalLearned,
      totalWordsMastered: vocabStats.totalMastered,
      wordsDueToday: vocabStats.totalDueToday,
      overallGrammarScore: grammar.overallScore,
      masteredGrammarTopics: grammar.masteredTopicIds.length,
      weakGrammarTopics: grammar.weakTopicIds.length,
    });
  }, [
    totalXP, levelInfo, currentStreak, longestStreak,
    todayProgress, vocabStats, grammar, updateSnapshot,
  ]);
}

// ─── Greeting ─────────────────────────────────────────────────────────────────

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, delay }}
    >
      {children}
    </motion.div>
  );
}

// ─── Main dashboard client ────────────────────────────────────────────────────

export function DashboardClient() {
  useDashboardSync();

  const currentStreak = useStreakStore(selectCurrentStreak);
  const todayDone = useStreakStore((s) => s.todayGoalCompleted);

  const greeting = getGreeting();
  const motivator =
    currentStreak >= 7
      ? `🔥 ${currentStreak}-day streak — incredible!`
      : currentStreak >= 3
      ? `🔥 ${currentStreak} days in a row, keep it up!`
      : todayDone
      ? "✅ Daily goals complete!"
      : "Let's make progress today.";

  return (
    <div className="flex flex-col gap-6">
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col gap-0.5"
      >
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{greeting} 👋</h1>
        <p className="text-sm text-muted-foreground">{motivator}</p>
      </motion.div>

      {/* Row 1 — Stat cards */}
      <Section delay={0.05}>
        <Suspense fallback={<StatCardsSkeleton />}>
          <StatCards />
        </Suspense>
      </Section>

      {/* Row 2 — Daily goals + streak */}
      <Section delay={0.1}>
        <div className="grid gap-4 lg:grid-cols-2">
          <Suspense fallback={<DailyGoalsCardSkeleton />}>
            <DailyGoalsCard />
          </Suspense>
          <Suspense fallback={<StreakCardSkeleton />}>
            <StreakCard />
          </Suspense>
        </div>
      </Section>

      {/* Row 3 — Weekly chart (full width) */}
      <Section delay={0.15}>
        <Suspense fallback={<WeeklyChartSkeleton />}>
          <WeeklyChart />
        </Suspense>
      </Section>

      {/* Row 4 — Vocabulary + Grammar + Achievements */}
      <Section delay={0.2}>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Suspense fallback={<VocabularyCardSkeleton />}>
            <VocabularyCard />
          </Suspense>
          <Suspense fallback={<GrammarCardSkeleton />}>
            <GrammarCard />
          </Suspense>
          <Suspense fallback={<AchievementsCardSkeleton />}>
            <AchievementsCard />
          </Suspense>
        </div>
      </Section>

      {/* Row 5 — AI Recommendations */}
      <Section delay={0.25}>
        <AIRecommendations />
      </Section>
    </div>
  );
}
