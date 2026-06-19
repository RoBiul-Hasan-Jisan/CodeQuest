"use client";

import { motion } from "framer-motion";
import { Flame, Star, BookOpen, PenLine, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { XPProgress } from "@/components/ui/progress";
import { SkeletonStat } from "@/components/ui/skeleton";
import { useGrammarStore, selectGrammarOverview } from "@/features/grammar/store/grammar-store";
import { useProgressStore, selectLevelInfo, selectTotalXP } from "@/features/progress/store/progress-store";
import { useStreakStore, selectCurrentStreak, selectTodayProgress } from "@/features/streak/store/streak-store";
import { useVocabularyStore, selectVocabStats } from "@/features/vocabulary/store/vocabulary-store";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  iconBg: string;
  trend?: { value: number; label: string };
  children?: React.ReactNode;
  className?: string;
  delay?: number;
}

// ─── Single stat card ─────────────────────────────────────────────────────────

function StatCard({ title, value, subtitle, icon, iconBg, trend, children, className, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-soft",
        "transition-shadow duration-200 hover:shadow-elevated",
        className
      )}
    >
      {/* Subtle glow top-right */}
      <div className={cn("pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-10 blur-2xl", iconBg)} />

      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{title}</p>
          <p className="mt-1 text-3xl font-bold tabular-nums text-foreground">{value}</p>
          {subtitle && (
            <p className="mt-0.5 truncate text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", iconBg)}>
          {icon}
        </div>
      </div>

      {trend && (
        <div className="mt-3 flex items-center gap-1 text-xs font-medium">
          {trend.value > 0 ? (
            <TrendingUp className="h-3.5 w-3.5 text-ds-green" />
          ) : trend.value < 0 ? (
            <TrendingDown className="h-3.5 w-3.5 text-destructive" />
          ) : (
            <Minus className="h-3.5 w-3.5 text-muted-foreground" />
          )}
          <span className={trend.value > 0 ? "text-ds-green" : trend.value < 0 ? "text-destructive" : "text-muted-foreground"}>
            {trend.value > 0 ? "+" : ""}{trend.value}
          </span>
          <span className="text-muted-foreground">{trend.label}</span>
        </div>
      )}

      {children && <div className="mt-3">{children}</div>}
    </motion.div>
  );
}

// ─── Skeleton version ─────────────────────────────────────────────────────────

export function StatCardsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonStat key={i} />
      ))}
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function StatCards() {
  const levelInfo = useProgressStore(useShallow(selectLevelInfo));
  const totalXP = useProgressStore(selectTotalXP);
  const currentStreak = useStreakStore(selectCurrentStreak);
  const todayProgress = useStreakStore(useShallow(selectTodayProgress));
  const vocabStats = useVocabularyStore(useShallow(selectVocabStats));
  const grammar = useGrammarStore(useShallow(selectGrammarOverview));

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {/* XP / Level */}
      <StatCard
        title="Total XP"
        value={totalXP.toLocaleString()}
        subtitle={`Level ${levelInfo.level} · ${levelInfo.xpToNextLevel.toLocaleString()} XP to next`}
        icon={<Star className="h-5 w-5 text-ds-amber-foreground" fill="currentColor" />}
        iconBg="bg-ds-amber"
        delay={0}
      >
        <XPProgress
          current={levelInfo.totalXP - levelInfo.xpForCurrentLevel}
          goal={levelInfo.xpForNextLevel - levelInfo.xpForCurrentLevel}
          showNumbers={false}
          animated
        />
      </StatCard>

      {/* Streak */}
      <StatCard
        title="Learning Streak"
        value={currentStreak}
        subtitle={currentStreak === 1 ? "day in a row" : "days in a row"}
        icon={<Flame className="h-5 w-5 text-orange-100" />}
        iconBg="bg-orange-500"
        delay={0.05}
        trend={{ value: todayProgress.goalCompleted ? 1 : 0, label: "today" }}
      />

      {/* Vocabulary */}
      <StatCard
        title="Vocabulary"
        value={vocabStats.totalLearned.toLocaleString()}
        subtitle={`${vocabStats.totalMastered} mastered · ${vocabStats.totalDueToday} due today`}
        icon={<BookOpen className="h-5 w-5 text-teal-100" />}
        iconBg="bg-ds-teal"
        delay={0.1}
        trend={
          vocabStats.totalDueToday > 0
            ? { value: -vocabStats.totalDueToday, label: "reviews pending" }
            : { value: 0, label: "all caught up" }
        }
      />

      {/* Grammar */}
      <StatCard
        title="Grammar Score"
        value={`${grammar.overallScore}%`}
        subtitle={`${grammar.masteredTopicIds.length} mastered · ${grammar.weakTopicIds.length} need work`}
        icon={<PenLine className="h-5 w-5 text-violet-100" />}
        iconBg="bg-ds-violet"
        delay={0.15}
        trend={
          grammar.overallScore >= 80
            ? { value: 1, label: "great progress" }
            : grammar.weakTopicIds.length > 0
            ? { value: -grammar.weakTopicIds.length, label: "weak topics" }
            : { value: 0, label: "keep going" }
        }
      />
    </div>
  );
}
