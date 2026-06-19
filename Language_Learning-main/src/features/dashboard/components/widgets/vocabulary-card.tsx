"use client";

import { Sparkles } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  type TooltipContentProps,
} from "recharts";
import type { ValueType, NameType } from "recharts/types/component/DefaultTooltipContent";
import { useShallow } from "zustand/react/shallow";

import { EmptyData } from "@/components/ui/empty-state";
import { SkeletonCard } from "@/components/ui/skeleton";
import { useVocabularyStore, selectVocabStats, selectWordsByStatus } from "@/features/vocabulary/store/vocabulary-store";
import { cn } from "@/lib/utils";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  new:       { label: "New",        color: "hsl(220,14%,60%)",  bg: "bg-slate-400/20",       text: "text-slate-400" },
  learning:  { label: "Learning",   color: "hsl(33,100%,50%)",  bg: "bg-ds-amber/20",        text: "text-ds-amber" },
  reviewing: { label: "Reviewing",  color: "hsl(262,83%,58%)",  bg: "bg-ds-violet/20",       text: "text-ds-violet" },
  mastered:  { label: "Mastered",   color: "hsl(107,100%,40%)", bg: "bg-ds-green/20",        text: "text-ds-green" },
} as const;

type StatusKey = keyof typeof STATUS_CONFIG;

// ─── Donut tooltip ────────────────────────────────────────────────────────────

function DonutTooltip({ active, payload }: TooltipContentProps<ValueType, NameType>) {
  if (!active || !payload?.[0]) return null;
  const { name, value } = payload[0];
  return (
    <div className="rounded-xl border border-border bg-popover px-3 py-2 text-xs shadow-elevated">
      <span className="font-semibold text-foreground">{name}: </span>
      <span className="text-muted-foreground">{value} words</span>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function VocabularyCard() {
  const stats = useVocabularyStore(useShallow(selectVocabStats));
  const masteredWords = useVocabularyStore(useShallow(selectWordsByStatus("mastered")));
  const reviewingWords = useVocabularyStore(useShallow(selectWordsByStatus("reviewing")));
  const learningWords = useVocabularyStore(useShallow(selectWordsByStatus("learning")));
  const newWords = useVocabularyStore(useShallow(selectWordsByStatus("new")));

  const hasWords = stats.totalWords > 0;

  const pieData: { name: string; value: number; status: StatusKey }[] = (
    [
      { name: "Mastered",  value: masteredWords.length,  status: "mastered"  as StatusKey },
      { name: "Reviewing", value: reviewingWords.length, status: "reviewing" as StatusKey },
      { name: "Learning",  value: learningWords.length,  status: "learning"  as StatusKey },
      { name: "New",       value: newWords.length,        status: "new"       as StatusKey },
    ] as const
  ).filter((d) => d.value > 0) as { name: string; value: number; status: StatusKey }[];

  const accuracy =
    stats.totalLearned > 0
      ? Math.round(
          (masteredWords.reduce((a, w) => a + w.accuracy, 0) / Math.max(1, masteredWords.length)) * 100
        )
      : 0;

  return (
    <div className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-soft">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-foreground">Vocabulary</h2>
          <p className="text-xs text-muted-foreground">
            {hasWords
              ? `${stats.totalWords.toLocaleString()} words in library`
              : "Start adding words to your library"}
          </p>
        </div>
        {stats.totalDueToday > 0 && (
          <div className="flex items-center gap-1.5 rounded-full bg-ds-amber/10 px-2.5 py-1 text-xs font-semibold text-ds-amber">
            <Sparkles className="h-3 w-3" />
            {stats.totalDueToday} due
          </div>
        )}
      </div>

      {hasWords ? (
        <div className="flex items-center gap-4">
          {/* Donut chart */}
          <div className="shrink-0">
            <ResponsiveContainer width={100} height={100}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={28}
                  outerRadius={44}
                  paddingAngle={2}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                >
                  {pieData.map((entry) => (
                    <Cell
                      key={entry.status}
                      fill={STATUS_CONFIG[entry.status].color}
                      stroke="transparent"
                    />
                  ))}
                </Pie>
                <Tooltip content={(p) => <DonutTooltip {...p} />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend + stats */}
          <div className="flex flex-1 flex-col gap-2">
            {(Object.keys(STATUS_CONFIG) as StatusKey[]).map((status) => {
              const count =
                status === "mastered" ? masteredWords.length
                : status === "reviewing" ? reviewingWords.length
                : status === "learning" ? learningWords.length
                : newWords.length;
              const cfg = STATUS_CONFIG[status];
              return (
                <div key={status} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ background: cfg.color }}
                    />
                    <span className="text-muted-foreground">{cfg.label}</span>
                  </div>
                  <span className={cn("font-semibold tabular-nums", cfg.text)}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <EmptyData
          title="No vocabulary yet"
          description="Add words from a lesson to start building your vocabulary library."
          size="sm"
          iconColor="teal"
          className="py-6"
        />
      )}

      {/* Footer stats */}
      {hasWords && (
        <div className="mt-4 grid grid-cols-2 gap-2 border-t border-border pt-4">
          <div className="flex flex-col">
            <span className="text-[11px] text-muted-foreground">Accuracy</span>
            <span className="text-lg font-bold tabular-nums text-foreground">{accuracy}%</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] text-muted-foreground">Mastered</span>
            <span className="text-lg font-bold tabular-nums text-ds-green">
              {stats.totalMastered}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export function VocabularyCardSkeleton() {
  return <SkeletonCard className="h-[240px]" />;
}
