"use client";

import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useShallow } from "zustand/react/shallow";

import {
  useProgressStore,
  selectRecentXPEvents,
} from "@/features/progress/store/progress-store";

import {
  CHART_COLORS,
  AREA_FILL_OPACITY,
  GRID_COLOR,
  TICK_COLOR,
  ChartTooltip,
  ChartEmpty,
  formatDate,
} from "../chart-utils";



// ─── Component ────────────────────────────────────────────────────────────────

export function XPTimelineChart() {
  const xpLog = useProgressStore(useShallow(selectRecentXPEvents(100)));

  const data = useMemo(() => {
    if (xpLog.length === 0) return [];

    // Group by day
    const dailyMap: Record<string, number> = {};
    for (const event of xpLog) {
      const date = event.earnedAt.split("T")[0] ?? "";
      dailyMap[date] = (dailyMap[date] ?? 0) + event.amount;
    }

    // Sort oldest→newest and accumulate
    const sorted = Object.entries(dailyMap).sort(([a], [b]) =>
      a.localeCompare(b)
    );

    let cumulative = 0;
    return sorted.map(([date, daily]) => {
      cumulative += daily;
      return { date, label: formatDate(date), daily, cumulative };
    });
  }, [xpLog]);

  if (data.length === 0) {
    return (
      <ChartEmpty message="Earn XP by completing lessons, reviewing vocabulary, and taking grammar quizzes!" />
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        {/* SVG gradient defs — plain JSX, no recharts import needed */}
        <defs>
          <linearGradient id="xpGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={CHART_COLORS.violet} stopOpacity={AREA_FILL_OPACITY} />
            <stop offset="95%" stopColor={CHART_COLORS.violet} stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="dailyGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={CHART_COLORS.teal} stopOpacity={AREA_FILL_OPACITY} />
            <stop offset="95%" stopColor={CHART_COLORS.teal} stopOpacity={0.02} />
          </linearGradient>
        </defs>

        <CartesianGrid vertical={false} stroke={GRID_COLOR} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 10, fill: TICK_COLOR }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 11, fill: TICK_COLOR }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          content={(props) => (
            <ChartTooltip
              active={props.active}
              payload={props.payload}
              label={props.label as string}
              formatter={(name, value) => {
                const map: Record<string, { label: string; color: string }> = {
                  cumulative: { label: "Total XP",  color: CHART_COLORS.violet },
                  daily:      { label: "Daily XP",  color: CHART_COLORS.teal   },
                };
                const cfg = map[name] ?? { label: name, color: TICK_COLOR };
                return { label: cfg.label, value: `${value} XP`, color: cfg.color };
              }}
            />
          )}
        />
        <Area
          type="monotone"
          dataKey="cumulative"
          name="cumulative"
          stroke={CHART_COLORS.violet}
          strokeWidth={2}
          fill="url(#xpGradient)"
          dot={false}
          activeDot={{ r: 5, fill: CHART_COLORS.violet, strokeWidth: 0 }}
        />
        <Area
          type="monotone"
          dataKey="daily"
          name="daily"
          stroke={CHART_COLORS.teal}
          strokeWidth={1.5}
          strokeDasharray="4 2"
          fill="url(#dailyGradient)"
          dot={false}
          activeDot={{ r: 4, fill: CHART_COLORS.teal, strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
