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


import { useGrammarStore } from "@/features/grammar/store/grammar-store";
import type { GrammarState } from "@/features/grammar/types";
import { useStreakStore, selectStreakHistory } from "@/features/streak/store/streak-store";

import {
  CHART_COLORS,
  GRID_COLOR,
  TICK_COLOR,
  ChartTooltip,
  ChartEmpty,
} from "../chart-utils";



// ─── Grammar selector (returns primitive — no useShallow needed) ──────────────

const selectOverallAccuracy = (s: GrammarState) =>
  Math.round(s.overallAccuracy * 100);

// ─── Component ────────────────────────────────────────────────────────────────

export function MonthlyImprovementsChart() {
  const history         = useStreakStore(useShallow(selectStreakHistory));
  const grammarAccuracy = useGrammarStore(selectOverallAccuracy);

  // Build 30-day data: XP earned per day + rolling 7-day avg
  const data = useMemo(() => {
    // history is newest-first; take last 30, reverse to oldest-first
    const days = [...history].slice(0, 30).reverse();
    if (days.length === 0) return [];

    // Compute rolling 7-day average XP
    return days.map((day, i) => {
      const window = days.slice(Math.max(0, i - 6), i + 1);
      const avg = Math.round(
        window.reduce((acc, d) => acc + d.xpEarned, 0) / window.length
      );
      const d = new Date(day.date + "T00:00:00");
      const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

      return {
        label,
        date:    day.date,
        xp:      day.xpEarned,
        avgXP:   avg,
        minutes: day.minutesPracticed,
      };
    });
  }, [history]);

  const hasData = data.length > 0 && data.some((d) => d.xp > 0);

  if (!hasData) {
    return (
      <ChartEmpty message="Practice every day to see your monthly improvement trends!" />
    );
  }

  return (
    <div className="flex h-full flex-col gap-2">
      {/* Accuracy badge */}
      {grammarAccuracy > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Grammar Accuracy
          </span>
          <span
            className="rounded-full px-2 py-0.5 text-xs font-bold"
            style={{
              background:
                grammarAccuracy >= 80
                  ? `${CHART_COLORS.green}20`
                  : grammarAccuracy >= 60
                  ? `${CHART_COLORS.amber}20`
                  : `${CHART_COLORS.red}20`,
              color:
                grammarAccuracy >= 80
                  ? CHART_COLORS.green
                  : grammarAccuracy >= 60
                  ? CHART_COLORS.amber
                  : CHART_COLORS.red,
            }}
          >
            {grammarAccuracy}%
          </span>
        </div>
      )}

      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke={GRID_COLOR} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: TICK_COLOR }}
              axisLine={false}
              tickLine={false}
              interval={Math.floor(data.length / 5)}
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
                    const map: Record<string, { label: string; color: string; unit: string }> = {
                      xp:      { label: "Daily XP",  color: CHART_COLORS.violet, unit: " XP"  },
                      avgXP:   { label: "7-day Avg", color: CHART_COLORS.orange, unit: " XP"  },
                      minutes: { label: "Minutes",   color: CHART_COLORS.teal,   unit: " min" },
                    };
                    const cfg = map[name] ?? { label: name, color: TICK_COLOR, unit: "" };
                    return { label: cfg.label, value: `${value}${cfg.unit}`, color: cfg.color };
                  }}
                />
              )}
            />
            <Legend
              iconSize={8}
              iconType="circle"
              wrapperStyle={{ fontSize: 11, color: TICK_COLOR, paddingTop: 4 }}
            />
            <Bar
              dataKey="xp"
              name="Daily XP"
              fill={CHART_COLORS.violet}
              fillOpacity={0.7}
              radius={[2, 2, 0, 0]}
              maxBarSize={20}
            />
            <Bar
              dataKey="minutes"
              name="Minutes"
              fill={CHART_COLORS.teal}
              fillOpacity={0.7}
              radius={[2, 2, 0, 0]}
              maxBarSize={20}
            />
            <Line
              type="monotone"
              dataKey="avgXP"
              name="7-day Avg XP"
              stroke={CHART_COLORS.orange}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: CHART_COLORS.orange, strokeWidth: 0 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
