"use client";

import { useMemo } from "react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useShallow } from "zustand/react/shallow";


import {
  useDashboardStore,
  selectWeeklyActivity,
} from "@/features/dashboard/store/dashboard-store";
import { useStreakStore, selectWeekHistory } from "@/features/streak/store/streak-store";

import {
  CHART_COLORS,
  GRID_COLOR,
  TICK_COLOR,
  ChartTooltip,
  ChartEmpty,
  formatDayLabel,
} from "../chart-utils";


// ─── Component ────────────────────────────────────────────────────────────────

export function WeeklyActivityChart() {
  const dashActivity = useDashboardStore(useShallow(selectWeeklyActivity(7)));
  const streakWeek   = useStreakStore(useShallow(selectWeekHistory));

  const data = useMemo(() => {
    // Merge dashboard activity + streak history, keyed by date
    const streakMap = Object.fromEntries(streakWeek.map((d) => [d.date, d]));
    const actMap    = Object.fromEntries(dashActivity.map((d) => [d.date, d]));

    // Union all dates in the last 7 days (streakWeek is always 7 entries)
    return streakWeek.map((day) => {
      const act = actMap[day.date];
      const sk  = streakMap[day.date];
      return {
        day:     formatDayLabel(day.date),
        date:    day.date,
        xp:      act?.xp              ?? sk?.xpEarned          ?? 0,
        minutes: act?.minutesPracticed ?? sk?.minutesPracticed  ?? 0,
        words:   act?.wordsReviewed    ?? sk?.wordsReviewed     ?? 0,
      };
    });
  }, [dashActivity, streakWeek]);

  const hasData = data.some((d) => d.xp > 0 || d.minutes > 0);

  if (!hasData) {
    return <ChartEmpty message="No activity logged yet — start practicing to see your weekly breakdown!" />;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke={GRID_COLOR} />
        <XAxis
          dataKey="day"
          tick={{ fontSize: 11, fill: TICK_COLOR }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          yAxisId="xp"
          tick={{ fontSize: 11, fill: TICK_COLOR }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          yAxisId="min"
          orientation="right"
          tick={{ fontSize: 11, fill: TICK_COLOR }}
          axisLine={false}
          tickLine={false}
          unit="m"
        />
        <Tooltip
          content={(props) => (
            <ChartTooltip
              active={props.active}
              payload={props.payload}
              label={props.label as string}
              formatter={(name, value) => {
                const labels: Record<string, { label: string; color: string; unit: string }> = {
                  xp:      { label: "XP Earned", color: CHART_COLORS.violet, unit: " XP"  },
                  minutes: { label: "Practice",  color: CHART_COLORS.teal,   unit: " min" },
                  words:   { label: "Words",     color: CHART_COLORS.green,  unit: ""     },
                };
                const cfg = labels[name] ?? { label: name, color: TICK_COLOR, unit: "" };
                return { label: cfg.label, value: `${value}${cfg.unit}`, color: cfg.color };
              }}
            />
          )}
        />
        <Legend
          iconSize={8}
          iconType="circle"
          wrapperStyle={{ fontSize: 11, color: TICK_COLOR, paddingTop: 8 }}
        />
        <Bar
          yAxisId="xp"
          dataKey="xp"
          name="XP Earned"
          fill={CHART_COLORS.violet}
          radius={[4, 4, 0, 0]}
          maxBarSize={40}
          fillOpacity={0.85}
        />
        <Bar
          yAxisId="min"
          dataKey="minutes"
          name="Minutes"
          fill={CHART_COLORS.teal}
          radius={[4, 4, 0, 0]}
          maxBarSize={40}
          fillOpacity={0.85}
        />
        <Line
          yAxisId="xp"
          type="monotone"
          dataKey="words"
          name="Words Reviewed"
          stroke={CHART_COLORS.green}
          strokeWidth={2}
          dot={{ r: 3, fill: CHART_COLORS.green, strokeWidth: 0 }}
          activeDot={{ r: 5 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
