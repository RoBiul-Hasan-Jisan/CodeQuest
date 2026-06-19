"use client";

import { motion } from "framer-motion";
import {
  Flame, Star, BookMarked, FlaskConical, Mic2, TrendingUp,
} from "lucide-react";
import { useShallow } from "zustand/react/shallow";


import { useGrammarStore, selectGrammarOverview } from "@/features/grammar/store/grammar-store";
import { useProgressStore, selectTotalXP, selectLevelInfo } from "@/features/progress/store/progress-store";
import { useSpeakingStore, selectOverallScore as selectSpeakingScore, selectTotalSessions } from "@/features/speaking/store/speaking-store";
import { useStreakStore, selectCurrentStreak, selectLongestStreak } from "@/features/streak/store/streak-store";
import { useVocabularyStore, selectVocabStats } from "@/features/vocabulary/store/vocabulary-store";
import { cn } from "@/lib/utils";

import { ChartCard } from "./chart-card";
import { AccuracyChart } from "./charts/accuracy-chart";
import { GrammarRadarChart } from "./charts/grammar-radar-chart";
import { MonthlyImprovementsChart } from "./charts/monthly-improvements-chart";
import { StreakHeatmapChart } from "./charts/streak-heatmap-chart";
import { VocabularyDonutChart } from "./charts/vocabulary-donut-chart";
import { WeeklyActivityChart } from "./charts/weekly-activity-chart";
import { XPTimelineChart } from "./charts/xp-timeline-chart";


// ─── KPI stat card ────────────────────────────────────────────────────────────

interface KpiCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
  bg: string;
  delay?: number;
}

function KpiCard({ icon, label, value, sub, color, bg, delay = 0 }: KpiCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft"
    >
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
          bg
        )}
      >
        <span className={color}>{icon}</span>
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="text-xl font-bold text-foreground leading-tight">{value}</p>
        {sub && (
          <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{sub}</p>
        )}
      </div>
    </motion.div>
  );
}

// ─── Badge helper ─────────────────────────────────────────────────────────────

function Badge({ value, color, bg }: { value: string; color: string; bg: string }) {
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-[10px] font-bold",
        bg,
        color
      )}
    >
      {value}
    </span>
  );
}

// ─── Main client ──────────────────────────────────────────────────────────────

export function AnalyticsClient() {
  // ── Selectors ───────────────────────────────────────────────────────────────
  const currentStreak  = useStreakStore(selectCurrentStreak);
  const longestStreak  = useStreakStore(selectLongestStreak);
  const totalXP        = useProgressStore(selectTotalXP);
  const levelInfo      = useProgressStore(useShallow(selectLevelInfo));
  const vocabStats     = useVocabularyStore(useShallow(selectVocabStats));
  const grammarOverview = useGrammarStore(useShallow(selectGrammarOverview));
  const speakingScore  = useSpeakingStore(selectSpeakingScore);
  const speakingSessions = useSpeakingStore(selectTotalSessions);

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          Analytics
        </h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Your full learning picture — streaks, accuracy, growth, and mastery
        </p>
      </motion.div>

      {/* ── KPI row ─────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <KpiCard
          icon={<Flame className="h-5 w-5" />}
          label="Streak"
          value={`${currentStreak}d`}
          sub={`Best: ${longestStreak}d`}
          color="text-ds-amber"
          bg="bg-ds-amber/15"
          delay={0}
        />
        <KpiCard
          icon={<Star className="h-5 w-5" />}
          label="Total XP"
          value={totalXP.toLocaleString()}
          sub={`Level ${levelInfo.level}`}
          color="text-ds-violet"
          bg="bg-ds-violet/15"
          delay={0.05}
        />
        <KpiCard
          icon={<BookMarked className="h-5 w-5" />}
          label="Words"
          value={vocabStats.totalWords}
          sub={`${vocabStats.totalMastered} mastered`}
          color="text-ds-green"
          bg="bg-ds-green/15"
          delay={0.1}
        />
        <KpiCard
          icon={<FlaskConical className="h-5 w-5" />}
          label="Grammar"
          value={`${grammarOverview.overallScore}%`}
          sub={`${grammarOverview.totalTopics} topics`}
          color="text-ds-teal"
          bg="bg-ds-teal/15"
          delay={0.15}
        />
        <KpiCard
          icon={<Mic2 className="h-5 w-5" />}
          label="Speaking"
          value={speakingSessions > 0 ? `${speakingScore}%` : "—"}
          sub={`${speakingSessions} session${speakingSessions !== 1 ? "s" : ""}`}
          color="text-orange-400"
          bg="bg-orange-400/15"
          delay={0.2}
        />
      </div>

      {/* ── Weekly Activity (full width) ─────────────────────────────────────── */}
      <ChartCard
        title="Weekly Activity"
        subtitle="XP earned, minutes practiced, and words reviewed this week"
        badge={
          <Badge
            value="Last 7 days"
            color="text-ds-violet"
            bg="bg-ds-violet/10"
          />
        }
        chartHeight="h-[220px]"
      >
        <WeeklyActivityChart />
      </ChartCard>

      {/* ── Streak Heatmap + Vocabulary Donut ───────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartCard
            title="30-Day Streak"
            subtitle="Daily activity over the past month"
            chartHeight="h-auto"
          >
            <StreakHeatmapChart />
          </ChartCard>
        </div>
        <ChartCard
          title="Vocabulary Breakdown"
          subtitle="Word status distribution"
          badge={
            <Badge
              value={`${vocabStats.totalWords} words`}
              color="text-ds-green"
              bg="bg-ds-green/10"
            />
          }
          chartHeight="h-[220px]"
        >
          <VocabularyDonutChart />
        </ChartCard>
      </div>

      {/* ── Grammar Radar + Accuracy Chart ──────────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard
          title="Grammar Mastery"
          subtitle="Score across 6 topic areas"
          badge={
            grammarOverview.totalTopics > 0 ? (
              <Badge
                value={`${grammarOverview.totalTopics} topics`}
                color="text-ds-teal"
                bg="bg-ds-teal/10"
              />
            ) : undefined
          }
          chartHeight="h-[280px]"
        >
          <GrammarRadarChart />
        </ChartCard>

        <ChartCard
          title="Accuracy Rate"
          subtitle="Grammar quiz & vocabulary recall accuracy over time"
          badge={
            <Badge
              value="Last 20 sessions"
              color="text-ds-violet"
              bg="bg-ds-violet/10"
            />
          }
          chartHeight="h-[280px]"
        >
          <AccuracyChart />
        </ChartCard>
      </div>

      {/* ── XP Timeline + Monthly Improvements ──────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard
          title="XP Timeline"
          subtitle="Cumulative XP earned since you started"
          badge={
            <Badge
              value={`${totalXP.toLocaleString()} XP total`}
              color="text-ds-violet"
              bg="bg-ds-violet/10"
            />
          }
          chartHeight="h-[240px]"
        >
          <XPTimelineChart />
        </ChartCard>

        <ChartCard
          title="Monthly Improvements"
          subtitle="Daily XP & practice minutes over 30 days with 7-day trend"
          badge={
            <Badge
              value="30 days"
              color="text-orange-400"
              bg="bg-orange-400/10"
            />
          }
          chartHeight="h-[240px]"
        >
          <MonthlyImprovementsChart />
        </ChartCard>
      </div>

      {/* ── Tips ─────────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex items-start gap-3 rounded-2xl border border-border bg-muted/30 px-4 py-3"
      >
        <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-ds-green" />
        <p className="text-xs leading-relaxed text-muted-foreground">
          <span className="font-semibold text-foreground">Data is live.</span>{" "}
          Charts update automatically as you practice lessons, review vocabulary, take grammar quizzes, and complete speaking sessions. Keep your streak going to fill all 30 days!
        </p>
      </motion.div>
    </div>
  );
}
