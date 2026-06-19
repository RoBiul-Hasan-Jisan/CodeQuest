"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Trophy } from "lucide-react";

import { EmptyData } from "@/components/ui/empty-state";
import { SkeletonCard } from "@/components/ui/skeleton";
import {
  useDashboardStore,
  selectRecentAchievements,
  selectAchievements,
} from "@/features/dashboard/store/dashboard-store";
import type { Achievement, AchievementTier } from "@/features/dashboard/types";
import { cn } from "@/lib/utils";

// ─── Tier config ──────────────────────────────────────────────────────────────

const TIER_STYLES: Record<AchievementTier, { ring: string; bg: string; text: string; label: string }> = {
  bronze:   { ring: "ring-orange-400/50",  bg: "bg-orange-400/10",  text: "text-orange-400",  label: "Bronze" },
  silver:   { ring: "ring-slate-400/50",   bg: "bg-slate-400/10",   text: "text-slate-400",   label: "Silver" },
  gold:     { ring: "ring-ds-amber/50",    bg: "bg-ds-amber/10",    text: "text-ds-amber",    label: "Gold" },
  platinum: { ring: "ring-ds-violet/50",   bg: "bg-ds-violet/10",   text: "text-ds-violet",   label: "Platinum" },
};

// ─── Single achievement item ──────────────────────────────────────────────────

function AchievementItem({ achievement, delay = 0 }: { achievement: Achievement; delay?: number }) {
  const tier = TIER_STYLES[achievement.tier];
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.25, delay }}
      className="flex items-center gap-3 rounded-xl bg-muted/40 p-3"
    >
      {/* Icon */}
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl ring-2",
          tier.bg,
          tier.ring
        )}
      >
        {achievement.icon}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold text-foreground">{achievement.title}</p>
          <span
            className={cn(
              "shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide",
              tier.bg,
              tier.text
            )}
          >
            {tier.label}
          </span>
        </div>
        <p className="truncate text-xs text-muted-foreground">{achievement.description}</p>
      </div>

      {/* XP reward */}
      <div className="shrink-0 text-right">
        <p className="text-xs font-bold text-ds-amber">+{achievement.xpReward}</p>
        <p className="text-[10px] text-muted-foreground">XP</p>
      </div>
    </motion.div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function AchievementsCard() {
  const recent = useDashboardStore(selectRecentAchievements);
  const all = useDashboardStore(selectAchievements);

  const displayList = recent.length > 0 ? recent : all.slice(0, 4);
  const hasAny = all.length > 0;

  return (
    <div className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-soft">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-foreground">Achievements</h2>
          <p className="text-xs text-muted-foreground">
            {hasAny
              ? `${all.length} unlocked · ${recent.length > 0 ? `${recent.length} new` : "all caught up"}`
              : "Start learning to earn achievements"}
          </p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-ds-amber/10">
          <Trophy className="h-5 w-5 text-ds-amber" />
        </div>
      </div>

      {hasAny ? (
        <div className="flex flex-col gap-2">
          <AnimatePresence>
            {displayList.map((achievement, i) => (
              <AchievementItem key={achievement.id} achievement={achievement} delay={i * 0.05} />
            ))}
          </AnimatePresence>
          {all.length > 4 && (
            <p className="pt-1 text-center text-xs text-muted-foreground">
              +{all.length - 4} more achievements unlocked
            </p>
          )}
        </div>
      ) : (
        <EmptyData
          title="No achievements yet"
          description="Complete lessons, build a streak, and master vocabulary to earn achievements."
          size="sm"
          iconColor="amber"
          className="py-6"
        />
      )}
    </div>
  );
}

export function AchievementsCardSkeleton() {
  return <SkeletonCard className="h-[240px]" />;
}
