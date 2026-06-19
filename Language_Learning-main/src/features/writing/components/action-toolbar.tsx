"use client";

import { motion } from "framer-motion";
import { Loader2, CheckCheck, RotateCcw, Briefcase, MessageCircle, BookOpen } from "lucide-react";

import { cn } from "@/lib/utils";

import { WRITING_ACTIONS } from "../types";
import type { WritingAction } from "../types";


// ─── Icon map ─────────────────────────────────────────────────────────────────

const ACTION_ICONS: Record<WritingAction, React.ReactNode> = {
  grammar:    <CheckCheck className="h-4 w-4" />,
  rewrite:    <RotateCcw className="h-4 w-4" />,
  formal:     <Briefcase className="h-4 w-4" />,
  informal:   <MessageCircle className="h-4 w-4" />,
  vocabulary: <BookOpen className="h-4 w-4" />,
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface ActionToolbarProps {
  activeAction: WritingAction | null;
  isStreaming: boolean;
  hasText: boolean;
  onAction: (action: WritingAction) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ActionToolbar({
  activeAction,
  isStreaming,
  hasText,
  onAction,
}: ActionToolbarProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
      {WRITING_ACTIONS.map((action) => {
        const isActive = activeAction === action.id;
        const isLoading = isActive && isStreaming;
        const disabled = !hasText || isStreaming;

        return (
          <motion.button
            key={action.id}
            onClick={() => !disabled && onAction(action.id)}
            disabled={disabled}
            whileHover={!disabled ? { scale: 1.02 } : undefined}
            whileTap={!disabled ? { scale: 0.97 } : undefined}
            className={cn(
              "relative flex shrink-0 items-center gap-2.5 rounded-xl border px-4 py-2.5 text-sm font-medium",
              "transition-all duration-150",
              isActive
                ? cn(action.activeBg, action.color, action.border, "shadow-sm")
                : cn(
                    "border-border bg-card text-muted-foreground",
                    !disabled && "hover:bg-muted hover:text-foreground hover:border-border/80"
                  ),
              disabled && !isActive && "cursor-not-allowed opacity-50"
            )}
            title={action.description}
          >
            {/* Loading spinner or icon */}
            <span className={cn("transition-colors", isActive ? action.color : "text-muted-foreground")}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                ACTION_ICONS[action.id]
              )}
            </span>

            <span className="whitespace-nowrap">{action.label}</span>

            {/* Active indicator dot */}
            {isActive && !isLoading && (
              <motion.span
                layoutId="active-dot"
                className={cn("h-1.5 w-1.5 rounded-full", action.color.replace("text-", "bg-"))}
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}

// ─── Compact description bar ──────────────────────────────────────────────────

interface DescriptionBarProps {
  activeAction: WritingAction | null;
  isStreaming: boolean;
}

export function DescriptionBar({ activeAction, isStreaming }: DescriptionBarProps) {
  const config = activeAction ? WRITING_ACTIONS.find((a) => a.id === activeAction) : null;
  if (!config) return null;

  return (
    <motion.div
      key={activeAction}
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "flex items-center gap-2 rounded-xl border px-3 py-2 text-xs",
        config.bg, config.border, config.color
      )}
    >
      <span className="font-semibold">{config.label}</span>
      <span className="text-muted-foreground">·</span>
      <span className="text-muted-foreground">{config.description}</span>
      {isStreaming && (
        <span className="ml-auto flex items-center gap-1 text-[10px] font-medium opacity-70">
          <Loader2 className="h-3 w-3 animate-spin" />
          Processing…
        </span>
      )}
    </motion.div>
  );
}
