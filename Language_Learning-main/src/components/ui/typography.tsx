import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

/* ============================================================================
   Typography scale — design system
   Inspired by: Linear (sharp, precise), Vercel (high contrast), Duolingo (friendly)
   ============================================================================ */

// ── Display ───────────────────────────────────────────────────────────────────
// Hero-level text, largest size, tightest tracking

interface DisplayProps extends React.HTMLAttributes<HTMLHeadingElement> {
  gradient?: "violet" | "green" | "brand" | "warm" | false;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span";
}

function Display({ className, gradient = false, as: Tag = "h1", children, ...props }: DisplayProps) {
  return (
    <Tag
      className={cn(
        "scroll-m-20 text-5xl font-extrabold tracking-[-0.04em] text-foreground sm:text-6xl lg:text-display",
        "text-balance leading-[1.05]",
        gradient === "violet" && "text-gradient-violet",
        gradient === "green" && "text-gradient-green",
        gradient === "brand" && "text-gradient-brand",
        gradient === "warm" && "text-gradient-warm",
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}

// ── Heading ───────────────────────────────────────────────────────────────────

const headingVariants = cva(
  "scroll-m-20 font-bold tracking-tight text-foreground text-balance",
  {
    variants: {
      level: {
        1: "text-4xl leading-tight",
        2: "text-3xl leading-snug",
        3: "text-2xl leading-snug",
        4: "text-xl leading-normal",
      },
    },
    defaultVariants: { level: 2 },
  }
);

interface HeadingProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof headingVariants> {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  gradient?: "violet" | "green" | "brand" | "warm" | false;
}

function Heading({
  className,
  level = 2,
  as,
  gradient = false,
  children,
  ...props
}: HeadingProps) {
  const Tag = as ?? (`h${level}` as "h1" | "h2" | "h3" | "h4");
  return (
    <Tag
      className={cn(
        headingVariants({ level }),
        gradient === "violet" && "text-gradient-violet",
        gradient === "green" && "text-gradient-green",
        gradient === "brand" && "text-gradient-brand",
        gradient === "warm" && "text-gradient-warm",
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}

// ── Lead ─────────────────────────────────────────────────────────────────────
// Introductory paragraph, larger than body

function Lead({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-xl leading-relaxed text-muted-foreground text-pretty", className)}
      {...props}
    />
  );
}

// ── Body ──────────────────────────────────────────────────────────────────────

const bodyVariants = cva("leading-relaxed text-foreground text-pretty", {
  variants: {
    size: {
      sm: "text-sm",
      default: "text-base",
      lg: "text-lg",
    },
    muted: {
      true: "text-muted-foreground",
    },
  },
  defaultVariants: { size: "default" },
});

interface BodyProps
  extends React.HTMLAttributes<HTMLParagraphElement>,
    VariantProps<typeof bodyVariants> {
  as?: "p" | "span" | "div";
}

function Body({ className, size, muted, as: Tag = "p", ...props }: BodyProps) {
  return <Tag className={cn(bodyVariants({ size, muted, className }))} {...props} />;
}

// ── Caption ───────────────────────────────────────────────────────────────────

function Caption({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-xs leading-normal text-muted-foreground", className)} {...props} />
  );
}

// ── Label ─────────────────────────────────────────────────────────────────────
// Form labels, section titles, UI chrome text

function Label({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        "text-xs font-semibold uppercase tracking-wider text-muted-foreground",
        className
      )}
      {...props}
    />
  );
}

// ── Code ──────────────────────────────────────────────────────────────────────

function Code({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <code
      className={cn(
        "relative rounded bg-muted px-[0.3em] py-[0.15em]",
        "font-mono text-sm text-foreground",
        "border border-border/60",
        className
      )}
      {...props}
    />
  );
}

// ── Kbd ── keyboard shortcut ──────────────────────────────────────────────────

function Kbd({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <kbd
      className={cn(
        "inline-flex h-5 min-w-[1.25rem] items-center justify-center",
        "rounded border border-border bg-muted px-1.5",
        "font-mono text-[10px] font-semibold text-muted-foreground",
        "shadow-[0_1px_0_hsl(var(--border))]",
        className
      )}
      {...props}
    />
  );
}

// ── GradientText — gradient-fill text wrapper ─────────────────────────────────

interface GradientTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  gradient?: "violet" | "green" | "brand" | "warm";
}

function GradientText({ gradient = "violet", className, ...props }: GradientTextProps) {
  const gradientMap = {
    violet: "text-gradient-violet",
    green: "text-gradient-green",
    brand: "text-gradient-brand",
    warm: "text-gradient-warm",
  };
  return (
    <span className={cn("font-inherit", gradientMap[gradient], className)} {...props} />
  );
}

// ── Quote ─────────────────────────────────────────────────────────────────────

function Quote({ className, ...props }: React.HTMLAttributes<HTMLQuoteElement>) {
  return (
    <blockquote
      className={cn(
        "border-l-[3px] border-primary pl-4",
        "italic text-muted-foreground",
        className
      )}
      {...props}
    />
  );
}

// ── Mono ──────────────────────────────────────────────────────────────────────

function Mono({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn("font-mono text-sm tabular-nums text-foreground", className)}
      {...props}
    />
  );
}

export {
  Display,
  Heading,
  Lead,
  Body,
  Caption,
  Label,
  Code,
  Kbd,
  GradientText,
  Quote,
  Mono,
};
