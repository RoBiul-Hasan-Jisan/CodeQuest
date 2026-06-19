"use client";

import { useMemo } from "react";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useShallow } from "zustand/react/shallow";


import {
  useGrammarStore,
  selectAllTopics,
} from "@/features/grammar/store/grammar-store";
import type { GrammarCategory } from "@/features/grammar/types";

import { CHART_COLORS, TICK_COLOR, GRID_COLOR, ChartTooltip, ChartEmpty } from "../chart-utils";


// ─── Category groups ──────────────────────────────────────────────────────────

const RADAR_GROUPS: { key: string; label: string; categories: GrammarCategory[] }[] = [
  {
    key:        "tenses",
    label:      "Tenses",
    categories: ["present_tense", "past_tense", "future_tense"],
  },
  {
    key:        "verbs",
    label:      "Verbs",
    categories: ["verb_conjugation", "imperative", "subjunctive", "conditional"],
  },
  {
    key:        "grammar",
    label:      "Grammar",
    categories: ["articles", "prepositions", "conjunctions", "pronouns"],
  },
  {
    key:        "modifiers",
    label:      "Modifiers",
    categories: ["adjectives", "adverbs", "comparative"],
  },
  {
    key:        "sentence",
    label:      "Sentence",
    categories: ["word_order", "negation", "questions"],
  },
  {
    key:        "other",
    label:      "Other",
    categories: ["other"],
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function GrammarRadarChart() {
  const allTopics = useGrammarStore(useShallow(selectAllTopics));

  const data = useMemo(() => {
    return RADAR_GROUPS.map((group) => {
      const groupTopics = allTopics.filter((t) =>
        (group.categories as string[]).includes(t.category)
      );
      const score =
        groupTopics.length > 0
          ? Math.round(
              groupTopics.reduce((acc, t) => acc + t.currentScore, 0) /
                groupTopics.length
            )
          : 0;
      return { subject: group.label, score, fullMark: 100 };
    });
  }, [allTopics]);

  const hasPracticed = allTopics.length > 0;

  if (!hasPracticed) {
    return (
      <ChartEmpty message="Complete some grammar quizzes to see your mastery radar!" />
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart data={data} margin={{ top: 8, right: 24, bottom: 8, left: 24 }}>
        <PolarGrid stroke={GRID_COLOR} />
        <PolarAngleAxis
          dataKey="subject"
          tick={{ fontSize: 11, fill: TICK_COLOR }}
        />
        <PolarRadiusAxis
          angle={30}
          domain={[0, 100]}
          tick={{ fontSize: 9, fill: TICK_COLOR }}
          tickCount={4}
        />
        <Radar
          name="Score"
          dataKey="score"
          stroke={CHART_COLORS.violet}
          fill={CHART_COLORS.violet}
          fillOpacity={0.25}
          strokeWidth={2}
          dot={{ r: 3, fill: CHART_COLORS.violet, strokeWidth: 0 }}
        />
        <Tooltip
          content={(props) => (
            <ChartTooltip
              active={props.active}
              payload={props.payload}
              label={props.label as string}
              formatter={(_name, value) => ({
                label: "Score",
                value: `${value}%`,
                color: CHART_COLORS.violet,
              })}
            />
          )}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
