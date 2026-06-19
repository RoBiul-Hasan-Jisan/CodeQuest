import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

/* ============================================================================
   Button — premium design system
   Inspired by: Duolingo (chunky brand), Linear (glow/glass), Vercel (gradient)
   ============================================================================ */

const buttonVariants = cva(
  // ── Base ────────────────────────────────────────────────────────────────
  [
    "relative inline-flex items-center justify-center gap-2",
    "whitespace-nowrap font-semibold text-sm",
    "select-none cursor-pointer",
    "transition-all duration-150 ease-out",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "disabled:pointer-events-none disabled:opacity-40",
    // Active press feedback — Duolingo-inspired
    "active:scale-[0.97]",
  ],
  {
    variants: {
      variant: {
        // ── Primary (violet) ──────────────────────────────────────────────
        default: [
          "bg-primary text-primary-foreground",
          "shadow-sm",
          "hover:bg-primary/90 hover:shadow-glow-violet",
        ],

        // ── Duolingo brand green — main CTA style ─────────────────────────
        brand: [
          "bg-ds-green text-ds-green-foreground",
          "shadow-sm",
          "hover:brightness-110 hover:shadow-glow-green",
          // Duolingo characteristic bottom border
          "border-b-[3px] border-[hsl(107_100%_32%)]",
          "active:border-b-0 active:translate-y-[3px]",
        ],

        // ── Gradient (Vercel / Linear) ────────────────────────────────────
        gradient: [
          "bg-gradient-violet text-white",
          "shadow-sm",
          "hover:shadow-glow-violet hover:brightness-110",
          "before:absolute before:inset-0 before:rounded-[inherit]",
          "before:bg-white/10 before:opacity-0 hover:before:opacity-100",
          "before:transition-opacity before:duration-150",
        ],

        // ── Gradient brand (violet → teal) ────────────────────────────────
        "gradient-brand": [
          "bg-gradient-brand text-white",
          "shadow-sm",
          "hover:shadow-[0_0_0_1px_hsl(168_80%_43%/0.3),0_4px_24px_hsl(168_80%_43%/0.35)]",
          "hover:brightness-110",
        ],

        // ── Glow — Linear neon effect ─────────────────────────────────────
        glow: [
          "bg-primary text-primary-foreground",
          "shadow-glow-violet",
          "hover:shadow-[0_0_0_2px_hsl(var(--primary)/0.2),0_8px_40px_hsl(var(--primary)/0.5)]",
          "hover:brightness-110",
        ],

        // ── Glass — frosted (Vercel dark / Linear) ────────────────────────
        glass: [
          "glass text-foreground",
          "hover:bg-white/[0.12] dark:hover:bg-white/[0.08]",
          "hover:shadow-soft",
        ],

        // ── Outline ───────────────────────────────────────────────────────
        outline: [
          "border border-input bg-background text-foreground",
          "hover:bg-accent hover:text-accent-foreground hover:border-primary/40",
          "shadow-xs",
        ],

        // ── Secondary ─────────────────────────────────────────────────────
        secondary: [
          "bg-secondary text-secondary-foreground",
          "hover:bg-secondary/80",
          "shadow-xs",
        ],

        // ── Ghost ─────────────────────────────────────────────────────────
        ghost: [
          "text-foreground",
          "hover:bg-accent hover:text-accent-foreground",
        ],

        // ── Link ──────────────────────────────────────────────────────────
        link: [
          "text-primary underline-offset-4",
          "hover:underline hover:text-primary/80",
          "active:scale-100",
        ],

        // ── Destructive ───────────────────────────────────────────────────
        destructive: [
          "bg-destructive text-destructive-foreground",
          "shadow-sm",
          "hover:bg-destructive/90 hover:shadow-[0_0_0_1px_hsl(var(--destructive)/0.3),0_4px_16px_hsl(var(--destructive)/0.3)]",
        ],

        // ── Amber / XP ────────────────────────────────────────────────────
        amber: [
          "bg-ds-amber text-ds-amber-foreground",
          "shadow-sm",
          "hover:brightness-110 hover:shadow-glow-amber",
          "border-b-[3px] border-[hsl(33_100%_40%)]",
          "active:border-b-0 active:translate-y-[3px]",
        ],

        // ── Teal (Grammarly) ─────────────────────────────────────────────
        teal: [
          "bg-ds-teal text-ds-teal-foreground",
          "shadow-sm",
          "hover:brightness-110 hover:shadow-glow-teal",
        ],
      },

      size: {
        xs:   "h-7  px-2.5 text-xs  rounded-md",
        sm:   "h-8  px-3   text-xs  rounded-md",
        default: "h-10 px-4 text-sm  rounded-lg",
        lg:   "h-11 px-6   text-sm  rounded-xl",
        // Duolingo-style chunky CTA
        xl:   "h-14 px-8   text-base rounded-2xl tracking-wide",
        // Icon buttons
        icon:    "h-10 w-10 rounded-lg",
        "icon-sm": "h-8  w-8  rounded-md",
        "icon-lg": "h-12 w-12 rounded-xl",
      },

      // Pill shape override (Duolingo uses rounded-full on many buttons)
      pill: {
        true: "rounded-full",
      },

      // Full width
      fullWidth: {
        true: "w-full",
      },
    },

    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      pill,
      fullWidth,
      asChild = false,
      loading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, pill, fullWidth, className }))}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            {children}
          </>
        ) : (
          <>
            {leftIcon && <span className="shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="shrink-0">{rightIcon}</span>}
          </>
        )}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
