import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

/* ============================================================================
   Progress bars — design system
   Includes: XP bar (Duolingo), streak ring, skill progress, linear progress
   ============================================================================ */

// ── Linear progress bar ───────────────────────────────────────────────────────

const progressTrackVariants = cva(
  "relative w-full overflow-hidden rounded-full bg-muted",
  {
    variants: {
      size: {
        xs:      "h-1",
        sm:      "h-1.5",
        default: "h-2.5",
        lg:      "h-4",
        xl:      "h-6",
      },
    },
    defaultVariants: { size: "default" },
  }
);

const progressFillVariants = cva(
  [
    "h-full w-full flex-1 rounded-full",
    "transition-all duration-700 ease-out",
    "origin-left",
  ],
  {
    variants: {
      color: {
        default:  "bg-primary",
        gradient: "bg-gradient-violet",
        green:    "bg-ds-green",
        amber:    "bg-ds-amber",
        teal:     "bg-ds-teal",
        "gradient-green": "bg-gradient-green",
        "gradient-brand": "bg-gradient-brand",
        "gradient-warm":  "bg-gradient-warm",
      },
      animated: {
        true: [
          "relative overflow-hidden",
          "after:absolute after:inset-0",
          "after:bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.25)_50%,transparent_100%)]",
          "after:bg-[length:200%_100%] after:animate-shimmer",
        ],
      },
    },
    defaultVariants: { color: "gradient" },
  }
);

export interface ProgressProps
  extends Omit<React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>, "color">,
    VariantProps<typeof progressTrackVariants>,
    VariantProps<typeof progressFillVariants> {
  value?: number;
  max?: number;
  showLabel?: boolean;
  label?: string;
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(
  (
    {
      className,
      value = 0,
      max = 100,
      size,
      color,
      animated,
      showLabel = false,
      label,
      ...props
    },
    ref
  ) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));

    return (
      <div className="flex flex-col gap-1.5">
        {(showLabel || label) && (
          <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
            {label && <span>{label}</span>}
            {showLabel && <span>{Math.round(percentage)}%</span>}
          </div>
        )}
        <ProgressPrimitive.Root
          ref={ref}
          className={cn(progressTrackVariants({ size, className }))}
          value={value}
          max={max}
          {...props}
        >
          <ProgressPrimitive.Indicator
            className={cn(progressFillVariants({ color, animated }))}
            style={{ transform: `translateX(-${100 - percentage}%)` }}
          />
        </ProgressPrimitive.Root>
      </div>
    );
  }
);
Progress.displayName = "Progress";

// ── XP Progress bar — Duolingo-style ─────────────────────────────────────────

interface XPProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  current: number;
  goal: number;
  level?: number;
  showNumbers?: boolean;
  animated?: boolean;
}

function XPProgress({
  current,
  goal,
  level,
  showNumbers = true,
  animated = true,
  className,
  ...props
}: XPProgressProps) {
  const percentage = Math.min(100, (current / goal) * 100);

  return (
    <div className={cn("flex flex-col gap-2", className)} {...props}>
      {/* Header */}
      <div className="flex items-center justify-between">
        {level !== undefined && (
          <div className="flex items-center gap-1.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ds-amber text-[10px] font-bold text-ds-amber-foreground">
              {level}
            </span>
            <span className="text-xs font-semibold text-muted-foreground">Level</span>
          </div>
        )}
        {showNumbers && (
          <span className="ml-auto text-xs font-bold text-ds-amber">
            {current.toLocaleString()} / {goal.toLocaleString()} XP
          </span>
        )}
      </div>

      {/* Track */}
      <div className="relative h-4 overflow-hidden rounded-full bg-ds-amber-muted">
        <div
          className={cn(
            "h-full rounded-full",
            "bg-[linear-gradient(90deg,hsl(33,100%,50%),hsl(45,100%,55%))]",
            "transition-all duration-700 ease-out",
            animated && [
              "relative overflow-hidden",
              "after:absolute after:inset-0",
              "after:bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.3)_50%,transparent_100%)]",
              "after:bg-[length:200%_100%] after:animate-shimmer",
            ]
          )}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={current}
          aria-valuemin={0}
          aria-valuemax={goal}
        />
        {/* Highlight strip */}
        <div className="pointer-events-none absolute inset-x-0 top-0.5 mx-1 h-1 rounded-full bg-white/30" />
      </div>
    </div>
  );
}

// ── Skill progress ring — circular (Duolingo skill proficiency) ────────────────

interface SkillRingProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;        // 0–100
  size?: number;        // px
  strokeWidth?: number; // px
  color?: "violet" | "green" | "amber" | "teal";
  label?: React.ReactNode;
  showValue?: boolean;
}

const ringColorStroke = {
  violet: "hsl(262, 83%, 58%)",
  green:  "hsl(107, 100%, 40%)",
  amber:  "hsl(33, 100%, 50%)",
  teal:   "hsl(168, 80%, 43%)",
};

function SkillRing({
  value,
  size = 80,
  strokeWidth = 7,
  color = "green",
  label,
  showValue = true,
  className,
  ...props
}: SkillRingProps) {
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const progress = Math.min(100, Math.max(0, value));
  const strokeDashoffset = circumference * (1 - progress / 100);

  return (
    <div
      className={cn("relative inline-flex flex-col items-center gap-1.5", className)}
      {...props}
    >
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="-rotate-90"
          viewBox={`0 0 ${size} ${size}`}
          aria-hidden="true"
        >
          {/* Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-muted"
          />
          {/* Progress */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={ringColorStroke[color]}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-[stroke-dashoffset] duration-700 ease-out"
          />
        </svg>
        {/* Center value */}
        {showValue && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-bold tabular-nums">{progress}%</span>
          </div>
        )}
      </div>
      {label && <span className="text-xs font-medium text-muted-foreground">{label}</span>}
    </div>
  );
}

// ── MultiProgress — stacked / segmented bar ────────────────────────────────────

interface MultiProgressSegment {
  value: number;
  color: "violet" | "green" | "amber" | "teal";
  label?: string;
}

interface MultiProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  segments: MultiProgressSegment[];
  total?: number;
  size?: "sm" | "default" | "lg";
}

const segmentColorMap = {
  violet: "bg-ds-violet",
  green:  "bg-ds-green",
  amber:  "bg-ds-amber",
  teal:   "bg-ds-teal",
};

const multiSizeMap = { sm: "h-1.5", default: "h-2.5", lg: "h-4" };

function MultiProgress({ segments, total = 100, size = "default", className, ...props }: MultiProgressProps) {
  const totalValue = segments.reduce((acc, s) => acc + s.value, 0);
  const cap = total > 0 ? total : totalValue;

  return (
    <div className={cn("flex flex-col gap-2", className)} {...props}>
      <div className={cn("flex w-full overflow-hidden rounded-full bg-muted", multiSizeMap[size])}>
        {segments.map((seg, i) => (
          <div
            key={i}
            className={cn(
              "h-full transition-all duration-700 ease-out first:rounded-l-full last:rounded-r-full",
              segmentColorMap[seg.color]
            )}
            style={{ width: `${(seg.value / cap) * 100}%` }}
            role="presentation"
          />
        ))}
      </div>
      {/* Legend */}
      {segments.some((s) => s.label) && (
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {segments.map((seg, i) =>
            seg.label ? (
              <div key={i} className="flex items-center gap-1.5">
                <span className={cn("h-2 w-2 rounded-full", segmentColorMap[seg.color])} />
                <span className="text-xs text-muted-foreground">{seg.label}</span>
                <span className="text-xs font-semibold text-foreground">
                  {Math.round((seg.value / cap) * 100)}%
                </span>
              </div>
            ) : null
          )}
        </div>
      )}
    </div>
  );
}

export { Progress, XPProgress, SkillRing, MultiProgress };
