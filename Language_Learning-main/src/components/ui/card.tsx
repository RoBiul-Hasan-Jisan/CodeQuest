import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

/* ============================================================================
   Card system — premium design system
   Variants: default · elevated · bordered · glass · gradient · interactive · stat
   ============================================================================ */

const cardVariants = cva(
  "relative flex flex-col rounded-xl bg-card text-card-foreground",
  {
    variants: {
      variant: {
        // ── Default — clean surface ────────────────────────────────────────
        default: "border border-border shadow-soft",

        // ── Elevated — stronger shadow, no border ─────────────────────────
        elevated: "shadow-elevated",

        // ── Bordered — border emphasis, minimal shadow ─────────────────────
        bordered: "border-2 border-border",

        // ── Outlined primary — Linear feature card ────────────────────────
        "outlined-primary": [
          "border border-primary/30 shadow-glow-violet/20",
          "dark:border-primary/20",
        ],

        // ── Glass — frosted morphism (Vercel/Linear dark) ─────────────────
        glass: "glass",

        // ── Glass dark — heavier tint for overlays ────────────────────────
        "glass-dark": [
          "border border-white/8 bg-black/60",
          "backdrop-blur-[40px] backdrop-saturate-150",
        ],

        // ── Gradient — violet→purple with noise (Vercel) ──────────────────
        gradient: [
          "bg-gradient-violet text-white border-0",
          "shadow-glow-violet",
          "noise overflow-hidden",
        ],

        // ── Gradient brand (violet → teal — Premium) ──────────────────────
        "gradient-brand": [
          "bg-gradient-brand text-white border-0",
          "shadow-elevated overflow-hidden",
        ],

        // ── Gradient border — subtle gradient outline ──────────────────────
        "gradient-border": "card-gradient-border border-0 shadow-soft",

        // ── Interactive — hover lift (Duolingo lesson card style) ─────────
        interactive: [
          "border border-border shadow-soft",
          "cursor-pointer transition-all duration-200",
          "hover:-translate-y-0.5 hover:shadow-elevated hover:border-primary/30",
          "active:translate-y-0 active:shadow-soft",
        ],

        // ── Stat — metric display (compact, bordered) ──────────────────────
        stat: [
          "border border-border bg-surface-1 shadow-xs",
          "transition-colors hover:border-primary/30 hover:bg-surface-2",
        ],

        // ── Ghost — no visual container ────────────────────────────────────
        ghost: "bg-transparent",
      },

      padding: {
        none: "",
        sm: "p-4",
        default: "p-6",
        lg: "p-8",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "default",
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, ...props }, ref) => (
    <div ref={ref} className={cn(cardVariants({ variant, padding, className }))} {...props} />
  )
);
Card.displayName = "Card";

// ── Sub-components ────────────────────────────────────────────────────────────

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col gap-1.5 pb-4", className)} {...props} />
  )
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, children, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("text-lg font-bold leading-none tracking-tight text-card-foreground", className)}
      {...props}
    >
      {children}
    </h3>
  )
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex-1", className)} {...props} />
  )
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center pt-4", className)} {...props} />
  )
);
CardFooter.displayName = "CardFooter";

// ── Stat card — dedicated metric display component ────────────────────────────

interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: React.ReactNode;
  delta?: {
    value: string;
    direction: "up" | "down" | "neutral";
  };
  icon?: React.ReactNode;
  iconColor?: "violet" | "green" | "amber" | "teal" | "red";
}

const iconColorMap: Record<NonNullable<StatCardProps["iconColor"]>, string> = {
  violet: "bg-ds-violet-muted text-ds-violet",
  green:  "bg-ds-green-muted  text-ds-green",
  amber:  "bg-ds-amber-muted  text-ds-amber",
  teal:   "bg-ds-teal-muted   text-ds-teal",
  red:    "bg-red-50 text-red-500 dark:bg-red-950/30 dark:text-red-400",
};

const deltaColorMap = {
  up:      "text-ds-green",
  down:    "text-destructive",
  neutral: "text-muted-foreground",
};

const deltaArrowMap = { up: "↑", down: "↓", neutral: "→" };

const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  ({ className, label, value, delta, icon, iconColor = "violet", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative flex flex-col gap-3 rounded-xl border border-border bg-surface-1 p-5 shadow-xs",
        "transition-colors hover:border-primary/30 hover:bg-surface-2",
        className
      )}
      {...props}
    >
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {icon && (
          <span
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-lg text-sm",
              iconColorMap[iconColor]
            )}
          >
            {icon}
          </span>
        )}
      </div>
      <div className="flex items-end justify-between gap-2">
        <p className="text-2xl font-bold tracking-tight text-foreground">{value}</p>
        {delta && (
          <span
            className={cn(
              "mb-0.5 flex items-center gap-0.5 text-xs font-semibold",
              deltaColorMap[delta.direction]
            )}
          >
            <span>{deltaArrowMap[delta.direction]}</span>
            <span>{delta.value}</span>
          </span>
        )}
      </div>
    </div>
  )
);
StatCard.displayName = "StatCard";

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  StatCard,
  cardVariants,
};
