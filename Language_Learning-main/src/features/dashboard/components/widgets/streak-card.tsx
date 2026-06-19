"use client";

import { motion } from "framer-motion";
import { Flame, Snowflake, Trophy } from "lucide-react";
import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import { SkeletonCard } from "@/components/ui/skeleton";
import {
  useStreakStore,
  selectCurrentStreak,
  selectLongestStreak,
} from "@/features/streak/store/streak-store";
import { lastNDays, todayDate, type StreakDay, type DayStatus } from "@/features/streak/types";
import { cn } from "@/lib/utils";

// ─── Day pill ─────────────────────────────────────────────────────────────────

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getDayLabel(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return DAY_LABELS[d.getDay()] ?? "";
}

const STATUS_STYLES: Record<DayStatus, string> = {
  completed: "bg-ds-green text-ds-green-foreground ring-2 ring-ds-green/30",
  partial:   "bg-ds-amber text-ds-amber-foreground ring-2 ring-ds-amber/30",
  missed:    "bg-muted text-muted-foreground",
  frozen:    "bg-ds-teal/20 text-ds-teal ring-2 ring-ds-teal/30",
  pending:   "bg-muted/50 text-muted-foreground border border-dashed border-border",
};

const STATUS_ICONS: Partial<Record<DayStatus, React.ReactNode>> = {
  completed: <Flame className="h-3.5 w-3.5" />,
  frozen:    <Snowflake className="h-3.5 w-3.5" />,
};

interface DayPillProps {
  day: StreakDay;
  delay: number;
}

function DayPill({ day, delay }: DayPillProps) {
  const isToday = day.date === new Date().toISOString().split("T")[0];
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25, delay }}
      className="flex flex-col items-center gap-1"
    >
      <span className="text-[10px] font-medium text-muted-foreground">
        {isToday ? "Today" : getDayLabel(day.date)}
      </span>
      <div
        className={cn(
          "flex h-9 w-9 flex-col items-center justify-center rounded-xl text-xs font-bold transition-all",
          STATUS_STYLES[day.status],
          isToday && "ring-offset-2"
        )}
        title={`${day.date}: ${day.status} · ${day.xpEarned} XP`}
      >
        {STATUS_ICONS[day.status] ?? (
          <span className="text-[10px]">
            {day.status === "missed" ? "✕" : "–"}
          </span>
        )}
      </div>
      {day.xpEarned > 0 && (
        <span className="text-[10px] tabular-nums text-muted-foreground">
          {day.xpEarned}
        </span>
      )}
    </motion.div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function StreakCard() {
  const currentStreak = useStreakStore(selectCurrentStreak);
  const longestStreak = useStreakStore(selectLongestStreak);
  // Read raw history array directly (stable store reference — no new objects on each call)
  const history = useStreakStore(useShallow((s) => s.history));

  // Compute week display client-side so getServerSnapshot stays stable
  const displayWeek = useMemo(() => {
    const today = todayDate();
    const days  = lastNDays(7);
    const map   = Object.fromEntries(history.map((d) => [d.date, d]));
    return days
      .map(
        (date): StreakDay =>
          map[date] ?? {
            date,
            status:           date < today ? "missed" : "pending",
            xpEarned:         0,
            minutesPracticed: 0,
            lessonsCompleted: 0,
            wordsReviewed:    0,
          }
      )
      .reverse(); // oldest → today (left → right)
  }, [history]);

  return (
    <div className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-soft">
      {/* Header */}
      <div className="mb-5 flex items-start justify-between">
        <div>
          <h2 className="font-semibold text-foreground">Learning Streak</h2>
          <p className="text-xs text-muted-foreground">Last 7 days</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="text-xs text-muted-foreground">Best</span>
            <div className="flex items-center gap-1 font-bold text-ds-amber">
              <Trophy className="h-3.5 w-3.5" />
              <span>{longestStreak}d</span>
            </div>
          </div>
          {/* Streak flame */}
          <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10">
            <Flame className="h-7 w-7 animate-streak-flame text-orange-500" />
            <span className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white">
              {currentStreak}
            </span>
          </div>
        </div>
      </div>

      {/* Week pills */}
      <div className="grid grid-cols-7 gap-1">
        {displayWeek.map((day, i) => (
          <DayPill key={day.date} day={day} delay={i * 0.04} />
        ))}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[10px] text-muted-foreground">
        {(["completed", "partial", "frozen", "missed"] as DayStatus[]).map((s) => (
          <div key={s} className="flex items-center gap-1.5">
            <span className={cn("h-2.5 w-2.5 rounded-sm", STATUS_STYLES[s].split(" ")[0])} />
            <span className="capitalize">{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function StreakCardSkeleton() {
  return <SkeletonCard className="h-[200px]" />;
}
