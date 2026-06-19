"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";


import {
  useStreakStore,
  selectStreakHistory,
} from "@/features/streak/store/streak-store";
import type { DayStatus } from "@/features/streak/types";
import { cn } from "@/lib/utils";

import { ChartEmpty } from "../chart-utils";


// ─── Status → colour mapping ──────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  DayStatus,
  { bg: string; border: string; label: string }
> = {
  completed: {
    bg:     "bg-ds-green",
    border: "border-ds-green/60",
    label:  "Goal met",
  },
  partial: {
    bg:     "bg-ds-amber",
    border: "border-ds-amber/60",
    label:  "Partial",
  },
  missed: {
    bg:     "bg-destructive/60",
    border: "border-destructive/40",
    label:  "Missed",
  },
  frozen: {
    bg:     "bg-blue-400",
    border: "border-blue-400/60",
    label:  "Frozen",
  },
  pending: {
    bg:     "bg-muted/50",
    border: "border-border",
    label:  "Today",
  },
};

// ─── Tooltip ──────────────────────────────────────────────────────────────────

function DayCell({
  date,
  status,
  xp,
  minutes,
}: {
  date: string;
  status: DayStatus;
  xp: number;
  minutes: number;
}) {
  const cfg = STATUS_CONFIG[status];
  const d = new Date(date + "T00:00:00");
  const label = d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="group relative flex-1">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2 }}
        className={cn(
          "h-5 w-full rounded-sm border",
          cfg.bg,
          cfg.border
        )}
      />
      {/* Hover tooltip */}
      <div className="pointer-events-none absolute bottom-7 left-1/2 z-10 -translate-x-1/2 opacity-0 transition-opacity group-hover:opacity-100">
        <div className="whitespace-nowrap rounded-lg border border-border bg-card px-2.5 py-1.5 text-[10px] shadow-lg">
          <p className="font-semibold text-foreground">{label}</p>
          <p className="text-muted-foreground">
            {cfg.label} · {xp} XP{minutes > 0 ? ` · ${minutes}m` : ""}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function StreakHeatmapChart() {
  const history = useStreakStore(useShallow(selectStreakHistory));

  // History is newest-first; take last 30 days and reverse for left→right display
  const days = useMemo(() => [...history].slice(0, 30).reverse(), [history]);

  const hasData = days.length > 0;

  if (!hasData) {
    return (
      <ChartEmpty message="Practice daily to build your streak calendar!" />
    );
  }

  // Legend
  const legend: Array<{ status: DayStatus; label: string }> = [
    { status: "completed", label: "Goal met" },
    { status: "partial",   label: "Partial" },
    { status: "missed",    label: "Missed" },
    { status: "frozen",    label: "Frozen" },
    { status: "pending",   label: "Today" },
  ];

  return (
    <div className="flex flex-col gap-3">
      {/* Heatmap grid */}
      <div className="flex items-end gap-0.5">
        {days.map((day) => (
          <DayCell
            key={day.date}
            date={day.date}
            status={day.status}
            xp={day.xpEarned}
            minutes={day.minutesPracticed}
          />
        ))}
      </div>

      {/* Month labels under every ~5th cell */}
      <div className="flex items-center gap-0.5">
        {days.map((day, i) => {
          const d = new Date(day.date + "T00:00:00");
          const isFirst = i === 0 || d.getDate() === 1;
          return (
            <div key={day.date} className="flex-1 text-center">
              {isFirst && (
                <span className="text-[9px] text-muted-foreground">
                  {d.toLocaleDateString("en-US", { month: "short" })}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3">
        {legend.map(({ status, label }) => (
          <div key={status} className="flex items-center gap-1.5">
            <div
              className={cn(
                "h-2.5 w-2.5 rounded-sm border",
                STATUS_CONFIG[status].bg,
                STATUS_CONFIG[status].border
              )}
            />
            <span className="text-[10px] text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
