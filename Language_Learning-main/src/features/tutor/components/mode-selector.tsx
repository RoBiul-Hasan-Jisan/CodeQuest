"use client";

import { motion } from "framer-motion";


import { cn } from "@/lib/utils";

import { useTutorStore, selectActiveMode } from "../store/tutor-store";
import { TUTOR_MODES } from "../types";


export function ModeSelector({ disabled }: { disabled?: boolean }) {
  const activeMode = useTutorStore(selectActiveMode);
  const setActiveMode = useTutorStore((s) => s.setActiveMode);

  return (
    <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
      {TUTOR_MODES.map((mode) => {
        const isActive = activeMode === mode.id;
        return (
          <button
            key={mode.id}
            onClick={() => !disabled && setActiveMode(mode.id)}
            disabled={disabled}
            title={mode.description}
            className={cn(
              "relative flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium",
              "border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              "disabled:cursor-not-allowed disabled:opacity-50",
              isActive
                ? cn(mode.color, "shadow-sm")
                : "border-transparent bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {isActive && (
              <motion.span
                layoutId="mode-pill"
                className={cn("absolute inset-0 rounded-xl border", mode.color)}
                style={{ zIndex: -1 }}
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
              />
            )}
            <span className="text-sm leading-none">{mode.icon}</span>
            <span>{mode.label}</span>
          </button>
        );
      })}
    </div>
  );
}
