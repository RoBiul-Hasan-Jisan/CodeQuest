import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

/* ============================================================================
   Badge — design system
   Variants: solid · subtle · outline · gradient · Duolingo XP/streak styles
   ============================================================================ */

const badgeVariants = cva(
  [
    "inline-flex items-center gap-1.5",
    "whitespace-nowrap font-semibold",
    "transition-colors",
  ],
  {
    variants: {
      variant: {
        // ── Solid ─────────────────────────────────────────────────────────
        default:     "bg-primary text-primary-foreground",
        secondary:   "bg-secondary text-secondary-foreground",
        destructive: "bg-destructive text-destructive-foreground",
        green:       "bg-ds-green text-ds-green-foreground",
        amber:       "bg-ds-amber text-ds-amber-foreground",
        teal:        "bg-ds-teal text-ds-teal-foreground",

        // ── Subtle (muted background) ─────────────────────────────────────
        "subtle-violet":  "bg-ds-violet-muted text-ds-violet",
        "subtle-green":   "bg-ds-green-muted  text-ds-green",
        "subtle-amber":   "bg-ds-amber-muted  text-ds-amber",
        "subtle-teal":    "bg-ds-teal-muted   text-ds-teal",
        "subtle-red":     "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400",
        "subtle-default": "bg-muted text-muted-foreground",

        // ── Outline ───────────────────────────────────────────────────────
        "outline-violet": "border border-ds-violet/40 text-ds-violet bg-transparent",
        "outline-green":  "border border-ds-green/40  text-ds-green  bg-transparent",
        "outline-amber":  "border border-ds-amber/40  text-ds-amber  bg-transparent",
        "outline-teal":   "border border-ds-teal/40   text-ds-teal   bg-transparent",
        outline:          "border border-border text-foreground bg-transparent",

        // ── Gradient ──────────────────────────────────────────────────────
        gradient:       "bg-gradient-violet text-white border-0",
        "gradient-green": "bg-gradient-green text-white border-0",
        "gradient-warm":  "bg-gradient-warm  text-white border-0",

        // ── Duolingo XP badge ─────────────────────────────────────────────
        xp: [
          "bg-ds-amber text-ds-amber-foreground",
          "border-b-2 border-[hsl(33_100%_38%)]",
          "shadow-[0_2px_0_hsl(33_100%_38%)]",
        ],

        // ── Duolingo streak badge ─────────────────────────────────────────
        streak: [
          "bg-[linear-gradient(135deg,hsl(33_100%_50%),hsl(0_84%_60%))]",
          "text-white",
          "shadow-glow-amber",
        ],

        // ── PRO / premium ─────────────────────────────────────────────────
        pro: [
          "bg-gradient-violet text-white",
          "shadow-glow-violet",
        ],
      },

      size: {
        sm: "h-5  px-2   text-2xs rounded-md",
        default: "h-6  px-2.5 text-xs rounded-md",
        lg: "h-7  px-3   text-xs rounded-lg",
      },

      dot: {
        true: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

// ── Dot indicator colors ─────────────────────────────────────────────────────
const dotColorMap: Record<string, string> = {
  default:         "bg-white/70",
  secondary:       "bg-secondary-foreground/50",
  destructive:     "bg-white/70",
  green:           "bg-white/70",
  amber:           "bg-white/70",
  teal:            "bg-white/70",
  "subtle-violet": "bg-ds-violet",
  "subtle-green":  "bg-ds-green",
  "subtle-amber":  "bg-ds-amber",
  "subtle-teal":   "bg-ds-teal",
  "subtle-red":    "bg-red-500",
  "subtle-default":"bg-muted-foreground",
};

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode;
}

function Badge({ className, variant = "default", size, dot, icon, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size, dot, className }))} {...props}>
      {dot && (
        <span
          className={cn(
            "h-1.5 w-1.5 shrink-0 rounded-full",
            dotColorMap[variant ?? "default"] ?? "bg-current"
          )}
        />
      )}
      {icon && <span className="shrink-0 [&>svg]:h-3 [&>svg]:w-3">{icon}</span>}
      {children}
    </div>
  );
}

// ── Streak badge ─ Duolingo-style ─────────────────────────────────────────────

interface StreakBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  count: number;
  animated?: boolean;
}

function StreakBadge({ count, animated = true, className, ...props }: StreakBadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold text-white",
        "bg-[linear-gradient(135deg,hsl(33,100%,50%),hsl(0,84%,58%))]",
        "shadow-glow-amber",
        className
      )}
      {...props}
    >
      <span
        className={cn(
          "text-base leading-none",
          animated && "animate-streak-flame inline-block"
        )}
        role="img"
        aria-label="streak"
      >
        🔥
      </span>
      <span>{count}</span>
    </div>
  );
}

// ── XP badge ─ Duolingo-style ────────────────────────────────────────────────

interface XPBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  xp: number;
}

function XPBadge({ xp, className, ...props }: XPBadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-ds-amber px-2.5 py-0.5",
        "text-xs font-bold text-ds-amber-foreground",
        "border-b-2 border-[hsl(33_100%_38%)] shadow-[0_2px_0_hsl(33_100%_38%)]",
        className
      )}
      {...props}
    >
      <svg
        className="h-3 w-3"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
      </svg>
      <span>{xp} XP</span>
    </div>
  );
}

// ── PRO badge ────────────────────────────────────────────────────────────────

function ProBadge({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full",
        "bg-gradient-violet px-2.5 py-0.5",
        "text-xs font-bold text-white",
        "shadow-glow-violet",
        className
      )}
      {...props}
    >
      ✦ PRO
    </div>
  );
}

export { Badge, StreakBadge, XPBadge, ProBadge, badgeVariants };
