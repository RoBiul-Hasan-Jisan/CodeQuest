"use client";

import { Award, BookMarked, Flame, FlaskConical, Lock, Mic2, PenLine, Star, Target, Trophy, Zap } from "lucide-react";
import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import { useGrammarStore, selectGrammarOverview } from "@/features/grammar/store/grammar-store";
import { useProgressStore, selectLevelInfo, selectTotalXP } from "@/features/progress/store/progress-store";
import { useStreakStore, selectCurrentStreak, selectLongestStreak } from "@/features/streak/store/streak-store";
import { useVocabularyStore, selectVocabStats } from "@/features/vocabulary/store/vocabulary-store";
import { cn } from "@/lib/utils";

// ─── Achievement definition ───────────────────────────────────────────────────

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  iconBg: string;
  earned: boolean;
  progress?: { value: number; max: number };
  xpReward: number;
  category: "streak" | "vocabulary" | "grammar" | "speaking" | "writing" | "xp" | "level";
}

// ─── Badge ────────────────────────────────────────────────────────────────────

function AchievementBadge({ achievement }: { achievement: Achievement }) {
  const pct = achievement.progress
    ? Math.min(100, (achievement.progress.value / achievement.progress.max) * 100)
    : achievement.earned ? 100 : 0;

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-2xl border p-4 transition-all",
        achievement.earned
          ? "border-primary/20 bg-card shadow-soft"
          : "border-border bg-muted/30 opacity-70"
      )}
    >
      {/* Icon */}
      <div className="flex items-start justify-between">
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-xl",
            achievement.earned ? achievement.iconBg : "bg-muted"
          )}
        >
          <span className={cn(!achievement.earned && "grayscale opacity-50")}>
            {achievement.earned ? achievement.icon : <Lock className="h-5 w-5 text-muted-foreground" />}
          </span>
        </div>
        <span className="flex items-center gap-1 rounded-full bg-ds-amber/15 px-2 py-0.5 text-xs font-semibold text-ds-amber">
          <Zap className="h-3 w-3" />
          {achievement.xpReward} XP
        </span>
      </div>

      {/* Text */}
      <div className="flex flex-col gap-0.5">
        <p className="text-sm font-semibold text-foreground">{achievement.title}</p>
        <p className="text-xs text-muted-foreground leading-relaxed">{achievement.description}</p>
      </div>

      {/* Progress bar */}
      {achievement.progress && !achievement.earned && (
        <div className="flex flex-col gap-1">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground">
            {achievement.progress.value} / {achievement.progress.max}
          </span>
        </div>
      )}

      {achievement.earned && (
        <div className="flex items-center gap-1.5 text-xs font-medium text-ds-green">
          <Award className="h-3.5 w-3.5" />
          Earned
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AchievementsPage() {
  const totalXP      = useProgressStore(selectTotalXP);
  const levelInfo    = useProgressStore(useShallow(selectLevelInfo));
  const streak       = useStreakStore(selectCurrentStreak);
  const longest      = useStreakStore(selectLongestStreak);
  const vocabStats   = useVocabularyStore(useShallow(selectVocabStats));
  const grammar      = useGrammarStore(useShallow(selectGrammarOverview));

  const achievements: Achievement[] = useMemo(() => [
    // ── Streak ──────────────────────────────────────────────────────────────
    {
      id: "streak_3",
      title: "On a Roll",
      description: "Maintain a 3-day learning streak.",
      icon: <Flame className="h-6 w-6 text-ds-amber" />,
      iconBg: "bg-ds-amber/15",
      earned: longest >= 3,
      progress: { value: Math.min(longest, 3), max: 3 },
      xpReward: 50,
      category: "streak",
    },
    {
      id: "streak_7",
      title: "Week Warrior",
      description: "Keep a 7-day streak — one full week!",
      icon: <Flame className="h-6 w-6 text-ds-amber" />,
      iconBg: "bg-ds-amber/15",
      earned: longest >= 7,
      progress: { value: Math.min(longest, 7), max: 7 },
      xpReward: 150,
      category: "streak",
    },
    {
      id: "streak_30",
      title: "Month Master",
      description: "30 consecutive days of practice.",
      icon: <Flame className="h-6 w-6 text-orange-500" />,
      iconBg: "bg-orange-500/15",
      earned: longest >= 30,
      progress: { value: Math.min(longest, 30), max: 30 },
      xpReward: 500,
      category: "streak",
    },
    // ── XP ──────────────────────────────────────────────────────────────────
    {
      id: "xp_100",
      title: "First Century",
      description: "Earn your first 100 XP.",
      icon: <Zap className="h-6 w-6 text-ds-amber" />,
      iconBg: "bg-ds-amber/15",
      earned: totalXP >= 100,
      progress: { value: Math.min(totalXP, 100), max: 100 },
      xpReward: 25,
      category: "xp",
    },
    {
      id: "xp_1000",
      title: "XP Champion",
      description: "Accumulate 1,000 XP.",
      icon: <Star className="h-6 w-6 text-ds-amber" />,
      iconBg: "bg-ds-amber/15",
      earned: totalXP >= 1000,
      progress: { value: Math.min(totalXP, 1000), max: 1000 },
      xpReward: 100,
      category: "xp",
    },
    {
      id: "xp_5000",
      title: "XP Legend",
      description: "Reach 5,000 total XP.",
      icon: <Trophy className="h-6 w-6 text-ds-amber" />,
      iconBg: "bg-ds-amber/15",
      earned: totalXP >= 5000,
      progress: { value: Math.min(totalXP, 5000), max: 5000 },
      xpReward: 500,
      category: "xp",
    },
    // ── Level ────────────────────────────────────────────────────────────────
    {
      id: "level_5",
      title: "Rising Star",
      description: "Reach Level 5.",
      icon: <Trophy className="h-6 w-6 text-primary" />,
      iconBg: "bg-primary/15",
      earned: levelInfo.level >= 5,
      progress: { value: Math.min(levelInfo.level, 5), max: 5 },
      xpReward: 200,
      category: "level",
    },
    {
      id: "level_10",
      title: "Expert Learner",
      description: "Reach Level 10.",
      icon: <Trophy className="h-6 w-6 text-ds-violet" />,
      iconBg: "bg-ds-violet/15",
      earned: levelInfo.level >= 10,
      progress: { value: Math.min(levelInfo.level, 10), max: 10 },
      xpReward: 500,
      category: "level",
    },
    // ── Vocabulary ───────────────────────────────────────────────────────────
    {
      id: "vocab_10",
      title: "Word Collector",
      description: "Learn 10 new words.",
      icon: <BookMarked className="h-6 w-6 text-ds-teal" />,
      iconBg: "bg-ds-teal/15",
      earned: vocabStats.totalLearned >= 10,
      progress: { value: Math.min(vocabStats.totalLearned, 10), max: 10 },
      xpReward: 50,
      category: "vocabulary",
    },
    {
      id: "vocab_50",
      title: "Vocabulary Builder",
      description: "Master 50 words.",
      icon: <BookMarked className="h-6 w-6 text-ds-teal" />,
      iconBg: "bg-ds-teal/15",
      earned: vocabStats.totalMastered >= 50,
      progress: { value: Math.min(vocabStats.totalMastered, 50), max: 50 },
      xpReward: 200,
      category: "vocabulary",
    },
    {
      id: "vocab_200",
      title: "Word Wizard",
      description: "Have 200 words in your library.",
      icon: <BookMarked className="h-6 w-6 text-ds-teal" />,
      iconBg: "bg-ds-teal/15",
      earned: vocabStats.totalLearned >= 200,
      progress: { value: Math.min(vocabStats.totalLearned, 200), max: 200 },
      xpReward: 500,
      category: "vocabulary",
    },
    // ── Grammar ──────────────────────────────────────────────────────────────
    {
      id: "grammar_first",
      title: "Grammar Rookie",
      description: "Complete your first grammar quiz.",
      icon: <FlaskConical className="h-6 w-6 text-ds-violet" />,
      iconBg: "bg-ds-violet/15",
      earned: grammar.masteredTopicIds.length > 0 || grammar.weakTopicIds.length > 0,
      xpReward: 30,
      category: "grammar",
    },
    {
      id: "grammar_5",
      title: "Grammar Whiz",
      description: "Master 5 grammar topics.",
      icon: <FlaskConical className="h-6 w-6 text-ds-violet" />,
      iconBg: "bg-ds-violet/15",
      earned: grammar.masteredTopicIds.length >= 5,
      progress: { value: Math.min(grammar.masteredTopicIds.length, 5), max: 5 },
      xpReward: 200,
      category: "grammar",
    },
    // ── Speaking ─────────────────────────────────────────────────────────────
    {
      id: "speaking_first",
      title: "First Words",
      description: "Complete your first speaking session.",
      icon: <Mic2 className="h-6 w-6 text-ds-amber" />,
      iconBg: "bg-ds-amber/15",
      earned: streak > 0,
      xpReward: 50,
      category: "speaking",
    },
    // ── Writing ──────────────────────────────────────────────────────────────
    {
      id: "writing_first",
      title: "Pen to Paper",
      description: "Use the AI writing assistant for the first time.",
      icon: <PenLine className="h-6 w-6 text-ds-teal" />,
      iconBg: "bg-ds-teal/15",
      earned: totalXP > 0,
      xpReward: 30,
      category: "writing",
    },
    // ── Daily goal ───────────────────────────────────────────────────────────
    {
      id: "daily_goal_7",
      title: "Consistent",
      description: "Hit your daily goal 7 days in a row.",
      icon: <Target className="h-6 w-6 text-ds-green" />,
      iconBg: "bg-ds-green/15",
      earned: streak >= 7,
      progress: { value: Math.min(streak, 7), max: 7 },
      xpReward: 200,
      category: "streak",
    },
  ], [totalXP, levelInfo, streak, longest, vocabStats, grammar]);

  const earned = achievements.filter((a) => a.earned);
  const locked = achievements.filter((a) => !a.earned);

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Achievements</h1>
        <p className="text-sm text-muted-foreground">
          {earned.length} of {achievements.length} badges earned
        </p>
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Badges earned", value: earned.length, icon: <Trophy className="h-4 w-4 text-ds-amber" />, bg: "bg-ds-amber/10" },
          { label: "Total XP", value: totalXP.toLocaleString(), icon: <Zap className="h-4 w-4 text-ds-amber" />, bg: "bg-ds-amber/10" },
          { label: "Level", value: levelInfo.level, icon: <Star className="h-4 w-4 text-primary" />, bg: "bg-primary/10" },
          { label: "Best streak", value: `${longest}d`, icon: <Flame className="h-4 w-4 text-ds-amber" />, bg: "bg-ds-amber/10" },
        ].map((stat) => (
          <div key={stat.label} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3.5">
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${stat.bg}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Earned */}
      {earned.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Earned · {earned.length}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {earned.map((a) => <AchievementBadge key={a.id} achievement={a} />)}
          </div>
        </section>
      )}

      {/* Locked */}
      {locked.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            In progress · {locked.length}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {locked.map((a) => <AchievementBadge key={a.id} achievement={a} />)}
          </div>
        </section>
      )}

      {earned.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <Trophy className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="font-semibold text-foreground">No badges yet</p>
          <p className="text-sm text-muted-foreground max-w-xs">
            Start practicing to earn your first achievement. Every session counts!
          </p>
        </div>
      )}
    </div>
  );
}
