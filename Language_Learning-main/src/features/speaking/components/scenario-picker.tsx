"use client";

import { motion } from "framer-motion";
import { useShallow } from "zustand/react/shallow";


import { cn } from "@/lib/utils";

import {
  useSpeakingStore,
  selectAllScenarioStats,
} from "../store/speaking-store";
import { SCENARIOS } from "../types";
import type { SpeakingScenario } from "../types";


// ─── Props ────────────────────────────────────────────────────────────────────

interface ScenarioPickerProps {
  onSelect: (scenario: SpeakingScenario) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ScenarioPicker({ onSelect }: ScenarioPickerProps) {
  const allStats = useSpeakingStore(useShallow(selectAllScenarioStats));

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Choose a scenario to begin your speaking practice
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {SCENARIOS.map((scenario, i) => {
          const stats = allStats[scenario.id];
          const hasPracticed = stats.attempts > 0;

          return (
            <motion.button
              key={scenario.id}
              onClick={() => onSelect(scenario.id)}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.06 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "group relative flex flex-col items-start gap-3 rounded-2xl border p-4 text-left",
                "transition-all duration-200 hover:shadow-soft",
                scenario.bg,
                scenario.border
              )}
            >
              {/* Icon */}
              <span className="text-3xl leading-none">{scenario.icon}</span>

              {/* Label + description */}
              <div className="flex-1">
                <p className={cn("text-sm font-semibold", scenario.color)}>
                  {scenario.label}
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                  {scenario.description}
                </p>
              </div>

              {/* Stats badge */}
              {hasPracticed ? (
                <div
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-2 py-1 text-[10px] font-semibold",
                    scenario.bg,
                    scenario.color
                  )}
                >
                  <span>{stats.attempts} session{stats.attempts !== 1 ? "s" : ""}</span>
                  <span className="opacity-50">·</span>
                  <span>Best {stats.bestScore}%</span>
                </div>
              ) : (
                <div className="text-[10px] font-medium text-muted-foreground/60">
                  Not practiced yet
                </div>
              )}

              {/* Hover arrow */}
              <div
                className={cn(
                  "absolute right-3 top-3 opacity-0 transition-opacity group-hover:opacity-100",
                  scenario.color
                )}
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
