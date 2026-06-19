"use client";

import { TrendingUp, Target, Trophy, Zap } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { cn } from "@/lib/utils";

import { useGrammarStore } from "../store/grammar-store";



export function StatsHeader() {
  const { overallScore, overallAccuracy, masteredTopicIds, topics } =
    useGrammarStore(useShallow((s) => ({
      overallScore: s.overallScore,
      overallAccuracy: s.overallAccuracy,
      masteredTopicIds: s.masteredTopicIds,
      topics: s.topics,
    })));

  const totalTopics = Object.keys(topics).length;
  const accuracyPct = Math.round(overallAccuracy * 100);

  const stats = [
    {
      label: "Overall Score",
      value: `${overallScore}%`,
      icon: TrendingUp,
      color: "text-ds-violet",
      bg: "bg-ds-violet/10",
    },
    {
      label: "Accuracy",
      value: `${totalTopics === 0 ? "—" : `${accuracyPct}%`}`,
      icon: Target,
      color: "text-ds-teal",
      bg: "bg-ds-teal/10",
    },
    {
      label: "Mastered",
      value: `${masteredTopicIds.length}`,
      icon: Trophy,
      color: "text-ds-green",
      bg: "bg-ds-green/10",
    },
    {
      label: "Topics Practiced",
      value: `${totalTopics}`,
      icon: Zap,
      color: "text-ds-amber",
      bg: "bg-ds-amber/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((s) => (
        <div
          key={s.label}
          className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-soft"
        >
          <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", s.bg)}>
            <s.icon className={cn("h-4 w-4", s.color)} />
          </div>
          <div className="min-w-0">
            <p className={cn("text-lg font-bold tabular-nums leading-none", s.color)}>{s.value}</p>
            <p className="mt-0.5 truncate text-[10px] text-muted-foreground">{s.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
