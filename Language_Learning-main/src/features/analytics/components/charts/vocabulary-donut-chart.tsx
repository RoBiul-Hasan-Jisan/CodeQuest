"use client";

import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useShallow } from "zustand/react/shallow";


import { useVocabularyStore } from "@/features/vocabulary/store/vocabulary-store";
import type { VocabularyState } from "@/features/vocabulary/types";

import { CHART_COLORS, TICK_COLOR, ChartTooltip, ChartEmpty } from "../chart-utils";


// ─── Selector ─────────────────────────────────────────────────────────────────

const selectCounts = (s: VocabularyState) => {
  const words = Object.values(s.words);
  return {
    total:     words.length,
    new:       words.filter((w) => w.status === "new").length,
    learning:  words.filter((w) => w.status === "learning").length,
    reviewing: words.filter((w) => w.status === "reviewing").length,
    mastered:  words.filter((w) => w.status === "mastered").length,
  };
};

// ─── Status config ────────────────────────────────────────────────────────────

const SEGMENTS = [
  { key: "mastered",  label: "Mastered",  color: CHART_COLORS.green  },
  { key: "reviewing", label: "Reviewing", color: CHART_COLORS.violet  },
  { key: "learning",  label: "Learning",  color: CHART_COLORS.amber   },
  { key: "new",       label: "New",       color: CHART_COLORS.muted   },
] as const;

// ─── Centre label (custom label inside hole) ──────────────────────────────────

function CentreLabel({ total }: { total: number }) {
  return (
    <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central">
      <tspan x="50%" dy="-0.4em" fontSize={22} fontWeight={700} fill="currentColor">
        {total}
      </tspan>
      <tspan x="50%" dy="1.4em" fontSize={11} fill={TICK_COLOR}>
        words
      </tspan>
    </text>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function VocabularyDonutChart() {
  const counts = useVocabularyStore(useShallow(selectCounts));

  const data = useMemo(
    () =>
      SEGMENTS.map((seg) => ({
        name:  seg.label,
        value: counts[seg.key],
        color: seg.color,
      })).filter((d) => d.value > 0),
    [counts]
  );

  if (counts.total === 0) {
    return (
      <ChartEmpty message="Add words to your library to see your vocabulary breakdown." />
    );
  }

  return (
    <div className="flex h-full flex-col gap-2">
      <ResponsiveContainer width="100%" height="80%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius="52%"
            outerRadius="78%"
            paddingAngle={3}
            dataKey="value"
            strokeWidth={0}
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
            {/* SVG label in centre */}
            <CentreLabel total={counts.total} />
          </Pie>
          <Tooltip
            content={(props) => (
              <ChartTooltip
                active={props.active}
                payload={props.payload}
                formatter={(name, value) => ({
                  label: name,
                  value: `${value} words`,
                  color:
                    data.find((d) => d.name === name)?.color ?? CHART_COLORS.muted,
                })}
              />
            )}
          />
          <Legend
            iconSize={8}
            iconType="circle"
            wrapperStyle={{ fontSize: 11, color: TICK_COLOR }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Mini stats row */}
      <div className="flex items-center justify-around">
        {SEGMENTS.map((seg) => (
          <div key={seg.key} className="flex flex-col items-center gap-0.5">
            <span className="text-base font-bold" style={{ color: seg.color }}>
              {counts[seg.key]}
            </span>
            <span className="text-[10px] text-muted-foreground">{seg.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
