"use client";

import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

/* ============================================================================
   Glassmorphism components — design system
   Inspired by: Vercel (dark glass), Linear (frosted panels), macOS (vibrancy)
   ============================================================================ */

const glassCardVariants = cva(
  [
    "relative rounded-2xl",
    "transition-all duration-300",
  ],
  {
    variants: {
      variant: {
        // ── Default — light frosted glass ───────────────────────────────────
        default: [
          "glass",
          "shadow-soft",
        ],

        // ── Subtle — very light tint ────────────────────────────────────────
        subtle: [
          "glass-subtle",
        ],

        // ── Strong — heavy blur (modal/overlay style) ───────────────────────
        strong: [
          "glass-strong shadow-elevated",
        ],

        // ── Dark — Vercel/Linear dark glass ────────────────────────────────
        dark: [
          "border border-white/8 bg-black/60",
          "backdrop-blur-[40px] backdrop-saturate-150",
          "shadow-float text-white",
        ],

        // ── Colored — tinted glass ──────────────────────────────────────────
        violet: [
          "border border-ds-violet/20 bg-ds-violet/8",
          "backdrop-blur-xl backdrop-saturate-180",
          "dark:border-ds-violet/15 dark:bg-ds-violet/5",
          "shadow-glow-violet/30",
        ],
        green: [
          "border border-ds-green/20 bg-ds-green/8",
          "backdrop-blur-xl backdrop-saturate-180",
          "dark:border-ds-green/15 dark:bg-ds-green/5",
          "shadow-glow-green/30",
        ],
        amber: [
          "border border-ds-amber/20 bg-ds-amber/8",
          "backdrop-blur-xl backdrop-saturate-180",
          "dark:border-ds-amber/15 dark:bg-ds-amber/5",
        ],
        teal: [
          "border border-ds-teal/20 bg-ds-teal/8",
          "backdrop-blur-xl backdrop-saturate-180",
          "dark:border-ds-teal/15 dark:bg-ds-teal/5",
          "shadow-glow-teal/30",
        ],

        // ── Gradient glass — gradient border + glass bg ─────────────────────
        "gradient-border": [
          "glass shadow-soft",
          "before:absolute before:inset-0 before:rounded-[inherit] before:p-px",
          "before:bg-gradient-violet before:opacity-60",
          "before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)]",
          "before:[-webkit-mask-composite:xor] before:[mask-composite:exclude]",
          "before:pointer-events-none",
        ],
      },

      padding: {
        none:    "",
        sm:      "p-4",
        default: "p-6",
        lg:      "p-8",
      },

      hoverable: {
        true: [
          "cursor-pointer",
          "hover:-translate-y-0.5 hover:shadow-elevated",
          "active:translate-y-0 active:scale-[0.99]",
        ],
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "default",
    },
  }
);

export interface GlassCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof glassCardVariants> {}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant, padding, hoverable, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(glassCardVariants({ variant, padding, hoverable, className }))}
      {...props}
    />
  )
);
GlassCard.displayName = "GlassCard";

// ── GlassPanel — larger section-level glass surface ───────────────────────────

interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  blur?: "sm" | "md" | "lg" | "xl";
  tinted?: boolean;
}

const blurMap = {
  sm: "backdrop-blur-sm",
  md: "backdrop-blur-md",
  lg: "backdrop-blur-lg",
  xl: "backdrop-blur-xl",
};

const GlassPanel = React.forwardRef<HTMLDivElement, GlassPanelProps>(
  ({ className, blur = "lg", tinted = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative rounded-3xl",
        "border border-white/20 dark:border-white/8",
        "bg-white/60 dark:bg-black/40",
        blurMap[blur],
        "backdrop-saturate-150",
        "shadow-elevated",
        tinted && "bg-primary/5 border-primary/20",
        className
      )}
      {...props}
    />
  )
);
GlassPanel.displayName = "GlassPanel";

// ── GlassNavbar — sticky glass navigation bar ─────────────────────────────────

const GlassNavbar = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  ({ className, ...props }, ref) => (
    <nav
      ref={ref}
      className={cn(
        "sticky top-0 z-50 w-full",
        "border-b border-white/20 dark:border-white/8",
        "bg-background/72 backdrop-blur-xl backdrop-saturate-180",
        "supports-[backdrop-filter]:bg-background/60",
        className
      )}
      {...props}
    />
  )
);
GlassNavbar.displayName = "GlassNavbar";

// ── GlassModal — glass-style dialog wrapper ────────────────────────────────────

const GlassModal = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative w-full max-w-lg rounded-3xl",
        "border border-white/30 dark:border-white/10",
        "bg-background/80 dark:bg-background/70",
        "backdrop-blur-[40px] backdrop-saturate-200",
        "shadow-float",
        "p-6",
        className
      )}
      {...props}
    />
  )
);
GlassModal.displayName = "GlassModal";

// ── GlassTooltip — glass tooltip wrapper ──────────────────────────────────────

const GlassTooltip = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-lg px-3 py-1.5",
        "border border-white/20 dark:border-white/10",
        "bg-background/80 backdrop-blur-lg",
        "shadow-elevated text-xs font-medium text-foreground",
        className
      )}
      {...props}
    />
  )
);
GlassTooltip.displayName = "GlassTooltip";

// ── GlassChip — small pill with glass effect ──────────────────────────────────

const GlassChip = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1",
        "border border-white/25 dark:border-white/10",
        "bg-white/50 dark:bg-white/5 backdrop-blur-md",
        "text-xs font-medium text-foreground",
        "shadow-xs",
        className
      )}
      {...props}
    />
  )
);
GlassChip.displayName = "GlassChip";

export {
  GlassCard,
  GlassPanel,
  GlassNavbar,
  GlassModal,
  GlassTooltip,
  GlassChip,
  glassCardVariants,
};
