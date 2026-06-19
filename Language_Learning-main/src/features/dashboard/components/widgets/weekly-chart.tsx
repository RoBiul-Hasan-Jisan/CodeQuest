"use client";

import { useTheme } from "next-themes";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from "recharts";
import type { ValueType, NameType } from "recharts/types/component/DefaultTooltipContent";
import { useShallow } from "zustand/react/shallow";

import { EmptyData } from "@/components/ui/empty-state";
import { SkeletonCard } from "@/components/ui/skeleton";
import { useDashboardStore } from "@/features/dashboard/store/dashboard-store";
import { useStreakStore } from "@/features/streak/store/streak-store";
import { lastNDays } from "@/features/streak/types";

// ─── Tooltip ──────────────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: TooltipContentProps<ValueType, NameType>) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-popover p-3 shadow-elevated text-sm">
      <p className="mb-2 font-semibold text-foreground">{label as string}</p>
      {payload.map((entry) => (
        <div key={String(entry.name)} className="flex items-center gap-2 text-xs">
          <span
            className="h-2 w-2 rounded-full"
            style={{ background: entry.color }}
          />
          <span className="text-muted-foreground capitalize">{String(entry.name)}:</span>
          <span className="font-medium text-foreground tabular-nums">
            {String(entry.value)}
            {entry.name === "xp" ? " XP" : entry.name === "minutes" ? " min" : ""}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return DAY_LABELS[d.getDay()] ?? dateStr;
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function WeeklyChart() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // Subscribe to raw stable arrays — selectors that create new objects break getServerSnapshot
  const weeklyActivity = useDashboardStore(useShallow((s) => s.weeklyActivity));
  const streakHistory  = useStreakStore(useShallow((s) => s.history));

  // Compute chart data client-side so getServerSnapshot stays stable
  const chartData = useMemo(() => {
    if (weeklyActivity.length > 0) {
      return [...weeklyActivity]
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 7)
        .reverse()
        .map((d) => ({
          day: formatDate(d.date),
          xp: d.xp,
          minutes: d.minutesPracticed,
          lessons: d.lessonsCompleted,
        }));
    }
    // Fall back to streak history (newest-first in store → reverse to oldest-first)
    const days = lastNDays(7);
    const map  = Object.fromEntries(streakHistory.map((d) => [d.date, d]));
    return days
      .map((date) => ({
        day:     formatDate(date),
        xp:      map[date]?.xpEarned        ?? 0,
        minutes: map[date]?.minutesPracticed ?? 0,
        lessons: map[date]?.lessonsCompleted ?? 0,
      }))
      .reverse();
  }, [weeklyActivity, streakHistory]);

  const hasData = chartData.some((d) => d.xp > 0 || d.minutes > 0);

  const gridColor   = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
  const axisColor   = isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)";
  const barXP       = "hsl(33, 100%, 50%)";    // ds-amber
  const barMinutes  = "hsl(168, 80%, 43%)";    // ds-teal
  const barLessons  = "hsl(262, 83%, 58%)";    // ds-violet

  return (
    <div className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-soft">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-foreground">Weekly Progress</h2>
          <p className="text-xs text-muted-foreground">Last 7 days activity</p>
        </div>
        <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
          {[
            { color: barXP,      label: "XP" },
            { color: barMinutes, label: "Minutes" },
            { color: barLessons, label: "Lessons" },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-sm" style={{ background: color }} />
              {label}
            </div>
          ))}
        </div>
      </div>

      {hasData ? (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} barCategoryGap="30%" barGap={3}>
            <CartesianGrid vertical={false} stroke={gridColor} />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 11, fill: axisColor }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: axisColor }}
              axisLine={false}
              tickLine={false}
              width={32}
            />
            <Tooltip content={(p) => <CustomTooltip {...p} />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
            <Bar dataKey="xp"      name="xp"      fill={barXP}      radius={[4, 4, 0, 0]} />
            <Bar dataKey="minutes" name="minutes" fill={barMinutes} radius={[4, 4, 0, 0]} />
            <Bar dataKey="lessons" name="lessons" fill={barLessons} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <EmptyData
          title="No activity yet"
          description="Complete a lesson or review vocabulary to start tracking your weekly progress."
          size="sm"
          iconColor="teal"
          className="py-8"
        />
      )}
    </div>
  );
}

export function WeeklyChartSkeleton() {
  return <SkeletonCard className="h-[290px]" />;
}
