"use client";

import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import { useShallow } from "zustand/react/shallow";


import {
  useGrammarStore,
  selectRecentAttempts,
} from "@/features/grammar/store/grammar-store";
import { useVocabularyStore } from "@/features/vocabulary/store/vocabulary-store";
import type { VocabularyState } from "@/features/vocabulary/types";

import {
  CHART_COLORS,
  GRID_COLOR,
  TICK_COLOR,
  ChartTooltip,
  ChartEmpty,
} from "../chart-utils";


// ─── Vocab selector ───────────────────────────────────────────────────────────

const selectVocabAccuracyOverTime = (s: VocabularyState) => {
  // Get words that have at least 1 review, sorted by lastReviewedAt
  const reviewed = Object.values(s.words)
    .filter((w) => w.totalReviews > 0 && w.lastReviewedAt)
    .sort((a, b) =>
      (a.lastReviewedAt ?? "").localeCompare(b.lastReviewedAt ?? "")
    )
    .slice(-20); // last 20 reviewed words

  return reviewed.map((w) => ({
    date:         w.lastReviewedAt ?? "",
    vocabAcc:     Math.round(w.accuracy * 100),
    word:         w.word,
  }));
};

// ─── Component ────────────────────────────────────────────────────────────────

export function AccuracyChart() {
  const grammarAttempts = useGrammarStore(useShallow(selectRecentAttempts(20)));
  const vocabHistory    = useVocabularyStore(useShallow(selectVocabAccuracyOverTime));

  // Build unified timeline: grammar accuracy per attempt (oldest→newest)
  const data = useMemo(() => {
    const attempts = [...grammarAttempts].reverse(); // oldest first

    return attempts.map((attempt, i) => {
      const date = attempt.completedAt.split("T")[0] ?? "";
      const grammarAcc = attempt.questionsTotal > 0
        ? Math.round((attempt.questionsCorrect / attempt.questionsTotal) * 100)
        : 0;

      // Interpolate vocab accuracy at this time index
      const vocabIdx = Math.min(
        i,
        vocabHistory.length - 1
      );
      const vocabAcc = vocabHistory[vocabIdx]?.vocabAcc ?? null;

      return {
        label:      `#${i + 1}`,
        date,
        grammarAcc,
        vocabAcc,
      };
    });
  }, [grammarAttempts, vocabHistory]);

  // Fallback: if no grammar attempts, show vocab accuracy only
  const vocabOnly = useMemo(() => {
    if (grammarAttempts.length > 0) return [];
    return vocabHistory.map((v, i) => ({
      label:      `#${i + 1}`,
      date:       v.date.split("T")[0] ?? "",
      grammarAcc: null as number | null,
      vocabAcc:   v.vocabAcc,
    }));
  }, [grammarAttempts, vocabHistory]);

  const chartData  = data.length > 0 ? data : vocabOnly;
  const hasData    = chartData.length > 0;

  if (!hasData) {
    return (
      <ChartEmpty message="Practice grammar quizzes and vocabulary reviews to track your accuracy!" />
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke={GRID_COLOR} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: TICK_COLOR }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fontSize: 11, fill: TICK_COLOR }}
          axisLine={false}
          tickLine={false}
          unit="%"
        />
        <ReferenceLine
          y={70}
          stroke={CHART_COLORS.green}
          strokeDasharray="4 4"
          strokeOpacity={0.4}
          label={{ value: "70%", position: "right", fontSize: 10, fill: CHART_COLORS.green }}
        />
        <Tooltip
          content={(props) => (
            <ChartTooltip
              active={props.active}
              payload={props.payload}
              label={props.label as string}
              formatter={(name, value) => {
                const map: Record<string, { label: string; color: string }> = {
                  grammarAcc: { label: "Grammar",    color: CHART_COLORS.violet },
                  vocabAcc:   { label: "Vocabulary", color: CHART_COLORS.teal   },
                };
                const cfg = map[name] ?? { label: name, color: TICK_COLOR };
                return { label: cfg.label, value: `${value}%`, color: cfg.color };
              }}
            />
          )}
        />
        <Legend
          iconSize={8}
          iconType="circle"
          wrapperStyle={{ fontSize: 11, color: TICK_COLOR, paddingTop: 8 }}
        />
        {data.length > 0 && (
          <Line
            type="monotone"
            dataKey="grammarAcc"
            name="Grammar Accuracy"
            stroke={CHART_COLORS.violet}
            strokeWidth={2}
            dot={{ r: 3, fill: CHART_COLORS.violet, strokeWidth: 0 }}
            activeDot={{ r: 5 }}
            connectNulls
          />
        )}
        <Line
          type="monotone"
          dataKey="vocabAcc"
          name="Vocabulary Accuracy"
          stroke={CHART_COLORS.teal}
          strokeWidth={2}
          dot={{ r: 3, fill: CHART_COLORS.teal, strokeWidth: 0 }}
          activeDot={{ r: 5 }}
          connectNulls
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
