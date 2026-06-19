import * as React from "react";

import { cn } from "@/lib/utils";

/* ============================================================================
   Skeleton loaders — design system
   ============================================================================ */

// ── Base shimmer skeleton ─────────────────────────────────────────────────────

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-md bg-muted",
        "relative overflow-hidden",
        "before:absolute before:inset-0",
        "before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent dark:before:via-white/5",
        "before:animate-shimmer before:bg-[length:200%_100%]",
        className
      )}
      aria-hidden="true"
      {...props}
    />
  );
}

// ── Text skeleton — multi-line paragraph ──────────────────────────────────────

interface SkeletonTextProps extends React.HTMLAttributes<HTMLDivElement> {
  lines?: number;
  lastLineWidth?: "full" | "3/4" | "2/3" | "1/2" | "1/3";
}

const lastLineWidthMap = {
  full: "w-full",
  "3/4": "w-3/4",
  "2/3": "w-2/3",
  "1/2": "w-1/2",
  "1/3": "w-1/3",
};

function SkeletonText({
  lines = 3,
  lastLineWidth = "2/3",
  className,
  ...props
}: SkeletonTextProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)} {...props}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            "h-4",
            i === lines - 1 ? lastLineWidthMap[lastLineWidth] : "w-full"
          )}
        />
      ))}
    </div>
  );
}

// ── Avatar skeleton ───────────────────────────────────────────────────────────

interface SkeletonAvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl";
}

const avatarSizeMap = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
  xl: "h-16 w-16",
};

function SkeletonAvatar({ size = "md", className, ...props }: SkeletonAvatarProps) {
  return (
    <Skeleton className={cn("shrink-0 rounded-full", avatarSizeMap[size], className)} {...props} />
  );
}

// ── Card skeleton ─────────────────────────────────────────────────────────────

function SkeletonCard({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-xl border border-border bg-card p-6", className)}
      aria-hidden="true"
      {...props}
    >
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <SkeletonAvatar size="md" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
        {/* Body */}
        <SkeletonText lines={3} />
        {/* Footer */}
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-8 w-20 rounded-lg" />
          <Skeleton className="h-8 w-20 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

// ── List skeleton — repeating rows ────────────────────────────────────────────

interface SkeletonListProps extends React.HTMLAttributes<HTMLDivElement> {
  rows?: number;
  showAvatar?: boolean;
}

function SkeletonList({ rows = 5, showAvatar = true, className, ...props }: SkeletonListProps) {
  return (
    <div
      className={cn("flex flex-col divide-y divide-border", className)}
      aria-hidden="true"
      {...props}
    >
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 py-3">
          {showAvatar && <SkeletonAvatar size="sm" />}
          <div className="flex flex-1 flex-col gap-1.5">
            <Skeleton className="h-4 w-1/2" style={{ width: `${40 + (i % 3) * 20}%` }} />
            <Skeleton className="h-3 w-1/3" style={{ width: `${20 + (i % 4) * 10}%` }} />
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}

// ── Table skeleton ────────────────────────────────────────────────────────────

interface SkeletonTableProps extends React.HTMLAttributes<HTMLDivElement> {
  rows?: number;
  columns?: number;
}

function SkeletonTable({ rows = 5, columns = 4, className, ...props }: SkeletonTableProps) {
  return (
    <div className={cn("w-full overflow-hidden rounded-xl border border-border", className)} aria-hidden="true" {...props}>
      {/* Header row */}
      <div className="flex gap-4 border-b border-border bg-muted/50 px-4 py-3">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-3.5" style={{ flex: i === 0 ? 2 : 1 }} />
        ))}
      </div>
      {/* Data rows */}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div
          key={rowIdx}
          className="flex gap-4 border-b border-border px-4 py-3.5 last:border-0"
        >
          {Array.from({ length: columns }).map((_, colIdx) => (
            <Skeleton
              key={colIdx}
              className="h-4"
              style={{
                flex: colIdx === 0 ? 2 : 1,
                width: `${50 + ((rowIdx + colIdx) % 3) * 15}%`,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// ── Stat skeleton — metric card ───────────────────────────────────────────────

function SkeletonStat({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl border border-border bg-surface-1 p-5",
        className
      )}
      aria-hidden="true"
      {...props}
    >
      <div className="flex items-start justify-between">
        <Skeleton className="h-3.5 w-24" />
        <Skeleton className="h-9 w-9 rounded-lg" />
      </div>
      <div className="flex items-end justify-between">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-12" />
      </div>
    </div>
  );
}

// ── Lesson card skeleton — Duolingo-style ─────────────────────────────────────

function SkeletonLessonCard({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-2xl border border-border bg-card p-5",
        className
      )}
      aria-hidden="true"
      {...props}
    >
      {/* Thumbnail */}
      <Skeleton className="h-36 w-full rounded-xl" />
      {/* Content */}
      <div className="flex flex-col gap-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-2/3" />
      </div>
      {/* Progress bar */}
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-8" />
        </div>
        <Skeleton className="h-2 w-full rounded-full" />
      </div>
      {/* CTA */}
      <Skeleton className="h-11 w-full rounded-2xl" />
    </div>
  );
}

export {
  Skeleton,
  SkeletonText,
  SkeletonAvatar,
  SkeletonCard,
  SkeletonList,
  SkeletonTable,
  SkeletonStat,
  SkeletonLessonCard,
};
