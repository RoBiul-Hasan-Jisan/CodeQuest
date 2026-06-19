"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Zap, Clock, BookOpen } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { Progress } from "@/components/ui/progress";
import { SkeletonCard } from "@/components/ui/skeleton";
import { useStreakStore, selectTodayProgress, selectGoalFraction } from "@/features/streak/store/streak-store";
import { cn } from "@/lib/utils";

// ─── Single goal row ──────────────────────────────────────────────────────────

interface GoalRowProps {
  icon: React.ReactNode;
  label: string;
  current: number;
  target: number;
  unit: string;
  fraction: number;
  color: "amber" | "teal" | "violet" | "green";
  delay: number;
}

function GoalRow({ icon, label, current, target, unit, fraction, color, delay }: GoalRowProps) {
  const done = fraction >= 1;
  const colorMap = {
    amber: "text-ds-amber",
    teal: "text-ds-teal",
    violet: "text-ds-violet",
    green: "text-ds-green",
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay }}
      className="flex flex-col gap-1.5"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={cn("flex h-6 w-6 items-center justify-center", colorMap[color])}>
            {done ? <CheckCircle2 className="h-5 w-5" /> : icon}
          </span>
          <span className="text-sm font-medium text-foreground">{label}</span>
        </div>
        <span className="text-sm tabular-nums text-muted-foreground">
          <span className={cn("font-semibold", done && colorMap[color])}>
            {current}
          </span>
          {" / "}{target} {unit}
        </span>
      </div>
      <Progress
        value={Math.min(100, fraction * 100)}
        color={color === "amber" ? "amber" : color === "teal" ? "teal" : color === "violet" ? "default" : "green"}
        size="sm"
        animated={!done}
      />
    </motion.div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function DailyGoalsCard() {
  const today = useStreakStore(useShallow(selectTodayProgress));
  const fractions = useStreakStore(useShallow(selectGoalFraction));
  const allDone = today.goalCompleted;
  const completedCount = [fractions.xp >= 1, fractions.minutes >= 1, fractions.lessons >= 1].filter(Boolean).length;

  return (
    <div className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-soft">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-foreground">Daily Goals</h2>
          <p className="text-xs text-muted-foreground">{completedCount} of 3 goals reached</p>
        </div>
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold transition-colors",
            allDone
              ? "bg-ds-green text-ds-green-foreground"
              : "bg-muted text-muted-foreground"
          )}
        >
          {completedCount}/3
        </div>
      </div>

      {/* Completion banner */}
      {allDone && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-4 flex items-center gap-2 rounded-xl bg-ds-green/10 px-3 py-2 text-sm font-medium text-ds-green"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          All daily goals complete! Come back tomorrow to keep your streak.
        </motion.div>
      )}

      {/* Goal rows */}
      <div className="flex flex-col gap-4">
        <GoalRow
          icon={<Zap className="h-4 w-4" />}
          label="Earn XP"
          current={today.xp}
          target={today.goal.xpTarget}
          unit="XP"
          fraction={fractions.xp}
          color="amber"
          delay={0.05}
        />
        <GoalRow
          icon={<Clock className="h-4 w-4" />}
          label="Practice time"
          current={today.minutes}
          target={today.goal.minutesTarget}
          unit="min"
          fraction={fractions.minutes}
          color="teal"
          delay={0.1}
        />
        <GoalRow
          icon={<BookOpen className="h-4 w-4" />}
          label="Complete lessons"
          current={today.lessons}
          target={today.goal.lessonsTarget}
          unit={today.goal.lessonsTarget === 1 ? "lesson" : "lessons"}
          fraction={fractions.lessons}
          color="violet"
          delay={0.15}
        />
      </div>
    </div>
  );
}

export function DailyGoalsCardSkeleton() {
  return <SkeletonCard className="h-[220px]" />;
}
