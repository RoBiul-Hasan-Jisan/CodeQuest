"use client";

import { useTheme } from "next-themes";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
  type TooltipContentProps,
} from "recharts";
import type { ValueType, NameType } from "recharts/types/component/DefaultTooltipContent";
import { useShallow } from "zustand/react/shallow";

import { EmptyData } from "@/components/ui/empty-state";
import { SkeletonCard } from "@/components/ui/skeleton";
import {
  useGrammarStore,
  selectAllTopics,
  selectGrammarOverview,
} from "@/features/grammar/store/grammar-store";
import { computeGrade } from "@/features/grammar/types";
import { cn } from "@/lib/utils";

// ─── Grade chip ───────────────────────────────────────────────────────────────

const GRADE_STYLES: Record<string, string> = {
  S: "bg-ds-amber text-ds-amber-foreground",
  A: "bg-ds-green text-ds-green-foreground",
  B: "bg-ds-teal text-ds-teal-foreground",
  C: "bg-ds-violet text-violet-100",
  D: "bg-orange-500 text-white",
  F: "bg-destructive text-destructive-foreground",
};

function GradeChip({ score }: { score: number }) {
  const grade = computeGrade(score);
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-md px-1.5 py-0.5 text-[10px] font-bold",
        GRADE_STYLES[grade]
      )}
    >
      {grade}
    </span>
  );
}

// ─── Radar tooltip ────────────────────────────────────────────────────────────

function CustomTooltip({ active, payload }: TooltipContentProps<ValueType, NameType>) {
  if (!active || !payload?.[0]) return null;
  const { name, value } = payload[0];
  return (
    <div className="rounded-xl border border-border bg-popover px-3 py-2 text-xs shadow-elevated">
      <p className="font-semibold text-foreground">{String(name)}</p>
      <p className="text-muted-foreground">Score: <span className="font-medium text-foreground">{String(value)}%</span></p>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function GrammarCard() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const allTopics = useGrammarStore(useShallow(selectAllTopics));
  const overview = useGrammarStore(useShallow(selectGrammarOverview));

  const hasTopics = allTopics.length > 0;

  // Take top-8 topics for radar (sort by most attempts)
  const radarTopics = [...allTopics]
    .sort((a, b) => b.totalAttempts - a.totalAttempts)
    .slice(0, 8)
    .map((t) => ({
      subject: t.name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      score: Math.round(t.currentScore),
      fullMark: 100,
    }));

  // Weak topics sorted worst first
  const weakTopics = allTopics
    .filter((t) => t.currentScore < 70)
    .sort((a, b) => a.currentScore - b.currentScore)
    .slice(0, 3);

  const gridColor  = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const axisColor  = isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)";
  const radarFill  = "hsl(262, 83%, 58%)";
  const radarStroke = "hsl(262, 83%, 58%)";

  return (
    <div className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-soft">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-foreground">Grammar Score</h2>
          <p className="text-xs text-muted-foreground">
            {hasTopics
              ? `${allTopics.length} topic${allTopics.length > 1 ? "s" : ""} tracked`
              : "Start a lesson to see your scores"}
          </p>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-2xl font-bold tabular-nums text-foreground">
            {overview.overallScore}%
          </span>
          <GradeChip score={overview.overallScore} />
        </div>
      </div>

      {hasTopics ? (
        <div className="flex flex-col gap-4">
          {/* Radar chart */}
          {radarTopics.length >= 3 && (
            <ResponsiveContainer width="100%" height={180}>
              <RadarChart data={radarTopics} margin={{ top: 0, right: 24, bottom: 0, left: 24 }}>
                <PolarGrid stroke={gridColor} />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fontSize: 9, fill: axisColor }}
                />
                <Radar
                  dataKey="score"
                  stroke={radarStroke}
                  fill={radarFill}
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
                <Tooltip content={(p) => <CustomTooltip {...p} />} />
              </RadarChart>
            </ResponsiveContainer>
          )}

          {/* Weak topics list */}
          {weakTopics.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <p className="text-xs font-medium text-muted-foreground">Needs attention</p>
              {weakTopics.map((t) => (
                <div
                  key={t.topicId}
                  className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-1.5"
                >
                  <span className="text-sm capitalize text-foreground">
                    {t.name.replace(/_/g, " ")}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs tabular-nums text-muted-foreground">
                      {Math.round(t.currentScore)}%
                    </span>
                    <GradeChip score={t.currentScore} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <EmptyData
          title="No grammar data yet"
          description="Complete grammar exercises to start tracking your performance by topic."
          size="sm"
          iconColor="violet"
          className="py-6"
        />
      )}
    </div>
  );
}

export function GrammarCardSkeleton() {
  return <SkeletonCard className="h-[300px]" />;
}
