"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

/* ============================================================================
   Gradient backgrounds — design system
   Inspired by: Vercel (mesh/grid), Linear (radial spotlight), Duolingo (soft blobs)
   ============================================================================ */

// ── MeshGradient — animated blob background ────────────────────────────────────

interface MeshGradientProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "violet" | "green" | "brand" | "warm" | "aurora";
  animated?: boolean;
  intensity?: "subtle" | "medium" | "vivid";
}

const meshBlobs: Record<NonNullable<MeshGradientProps["variant"]>, { blob1: string; blob2: string; blob3: string }> = {
  violet: {
    blob1: "hsl(262 83% 65% / 0.35)",
    blob2: "hsl(290 80% 65% / 0.25)",
    blob3: "hsl(240 80% 70% / 0.2)",
  },
  green: {
    blob1: "hsl(107 100% 43% / 0.3)",
    blob2: "hsl(168 80% 45% / 0.25)",
    blob3: "hsl(150 70% 50% / 0.2)",
  },
  brand: {
    blob1: "hsl(262 83% 65% / 0.3)",
    blob2: "hsl(168 80% 45% / 0.25)",
    blob3: "hsl(220 80% 65% / 0.2)",
  },
  warm: {
    blob1: "hsl(33 100% 55% / 0.35)",
    blob2: "hsl(0 84% 65% / 0.25)",
    blob3: "hsl(45 100% 60% / 0.2)",
  },
  aurora: {
    blob1: "hsl(168 80% 45% / 0.3)",
    blob2: "hsl(262 83% 65% / 0.25)",
    blob3: "hsl(33 100% 55% / 0.2)",
  },
};

const intensityMultiplier = { subtle: 0.5, medium: 1, vivid: 1.5 };

function MeshGradient({
  variant = "violet",
  animated = true,
  intensity = "medium",
  className,
  children,
  ...props
}: MeshGradientProps) {
  const blobs = meshBlobs[variant];
  const opacity = intensityMultiplier[intensity];

  return (
    <div className={cn("relative overflow-hidden", className)} {...props}>
      {/* Blob 1 — top left */}
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute -left-[20%] -top-[20%]",
          "h-[60%] w-[60%] rounded-full blur-[80px]",
          animated && "animate-[pulse_8s_ease-in-out_infinite]"
        )}
        style={{ background: blobs.blob1, opacity }}
      />
      {/* Blob 2 — bottom right */}
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute -bottom-[20%] -right-[10%]",
          "h-[50%] w-[50%] rounded-full blur-[100px]",
          animated && "animate-[pulse_10s_ease-in-out_infinite_2s]"
        )}
        style={{ background: blobs.blob2, opacity }}
      />
      {/* Blob 3 — center */}
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute left-[30%] top-[40%]",
          "h-[40%] w-[40%] rounded-full blur-[120px]",
          animated && "animate-[pulse_12s_ease-in-out_infinite_4s]"
        )}
        style={{ background: blobs.blob3, opacity }}
      />
      {/* Content */}
      <div className="relative">{children}</div>
    </div>
  );
}

// ── GridBackground — Vercel/Linear dot or line grid ────────────────────────────

interface GridBackgroundProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: "dots" | "lines" | "cross";
  fade?: boolean;
}

function GridBackground({
  type = "lines",
  fade = true,
  className,
  children,
  ...props
}: GridBackgroundProps) {
  return (
    <div className={cn("relative", className)} {...props}>
      {/* Grid pattern */}
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0",
          type === "lines" && "bg-grid",
          type === "dots" && "bg-dot",
          fade && [
            "[-webkit-mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,black_40%,transparent_100%)]",
            "[mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,black_40%,transparent_100%)]",
          ]
        )}
      />
      <div className="relative">{children}</div>
    </div>
  );
}

// ── SpotlightBackground — Linear-style radial glow on hover ───────────────────

interface SpotlightBackgroundProps extends React.HTMLAttributes<HTMLDivElement> {
  color?: "violet" | "green" | "amber" | "teal";
}

const spotlightColorMap = {
  violet: "hsl(262 83% 65% / 0.15)",
  green:  "hsl(107 100% 43% / 0.12)",
  amber:  "hsl(33 100% 55% / 0.12)",
  teal:   "hsl(168 80% 45% / 0.12)",
};

function SpotlightBackground({
  color = "violet",
  className,
  children,
  ...props
}: SpotlightBackgroundProps) {
  const [pos, setPos] = React.useState({ x: "50%", y: "30%" });
  const ref = React.useRef<HTMLDivElement>(null);

  const handleMouseMove = React.useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setPos({
      x: `${((e.clientX - rect.left) / rect.width) * 100}%`,
      y: `${((e.clientY - rect.top) / rect.height) * 100}%`,
    });
  }, []);

  return (
    <div
      ref={ref}
      className={cn("relative overflow-hidden", className)}
      onMouseMove={handleMouseMove}
      {...props}
    >
      {/* Spotlight */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-[background] duration-300"
        style={{
          background: `radial-gradient(600px circle at ${pos.x} ${pos.y}, ${spotlightColorMap[color]}, transparent 40%)`,
        }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}

// ── GradientCard — gradient surface card ──────────────────────────────────────

interface GradientCardProps extends React.HTMLAttributes<HTMLDivElement> {
  gradient?: "violet" | "green" | "brand" | "warm";
  noise?: boolean;
}

const gradientCardMap = {
  violet: "bg-gradient-violet",
  green:  "bg-gradient-green",
  brand:  "bg-gradient-brand",
  warm:   "bg-gradient-warm",
};

function GradientCard({
  gradient = "violet",
  noise = true,
  className,
  children,
  ...props
}: GradientCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl p-6 text-white",
        gradientCardMap[gradient],
        "shadow-elevated",
        className
      )}
      {...props}
    >
      {/* Noise texture overlay */}
      {noise && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-noise opacity-30 mix-blend-overlay"
        />
      )}
      {/* Inner highlight */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"
      />
      <div className="relative">{children}</div>
    </div>
  );
}

// ── HeroBackground — full-page hero gradient ──────────────────────────────────

interface HeroBackgroundProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "violet" | "brand" | "dark";
}

function HeroBackground({
  variant = "dark",
  className,
  children,
  ...props
}: HeroBackgroundProps) {
  return (
    <div
      className={cn(
        "relative min-h-screen overflow-hidden",
        variant === "dark" && "bg-neutral-950 text-white",
        variant === "violet" && "bg-background",
        variant === "brand" && "bg-background",
        className
      )}
      {...props}
    >
      {/* Grid */}
      <GridBackground type="lines" fade className="absolute inset-0" />

      {/* Gradient blobs */}
      {variant === "dark" && (
        <>
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full blur-[120px]"
            style={{ background: "hsl(262 83% 65% / 0.12)" }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/4 top-1/4 h-[300px] w-[400px] rounded-full blur-[100px]"
            style={{ background: "hsl(168 80% 45% / 0.08)" }}
          />
        </>
      )}
      {(variant === "violet" || variant === "brand") && (
        <MeshGradient
          variant={variant === "brand" ? "brand" : "violet"}
          intensity="subtle"
          className="absolute inset-0"
        />
      )}

      <div className="relative">{children}</div>
    </div>
  );
}

// ── GradientText — inline gradient text ───────────────────────────────────────

interface GradientTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  gradient?: "violet" | "green" | "brand" | "warm";
}

const gradientTextMap = {
  violet: "text-gradient-violet",
  green:  "text-gradient-green",
  brand:  "text-gradient-brand",
  warm:   "text-gradient-warm",
};

function GradientText({ gradient = "violet", className, ...props }: GradientTextProps) {
  return (
    <span className={cn("font-inherit", gradientTextMap[gradient], className)} {...props} />
  );
}

// ── GradientBorder — card with animated gradient border ───────────────────────

interface GradientBorderProps extends React.HTMLAttributes<HTMLDivElement> {
  gradient?: "violet" | "green" | "brand" | "warm";
  animated?: boolean;
}

function GradientBorder({
  gradient = "violet",
  animated = false,
  className,
  children,
  ...props
}: GradientBorderProps) {
  const gradBgMap = {
    violet: "from-[hsl(262,83%,58%)] to-[hsl(290,80%,60%)]",
    green:  "from-[hsl(107,100%,40%)] to-[hsl(168,80%,43%)]",
    brand:  "from-[hsl(262,83%,58%)] to-[hsl(168,80%,43%)]",
    warm:   "from-[hsl(33,100%,50%)] to-[hsl(0,84%,60%)]",
  };

  return (
    <div
      className={cn(
        "relative rounded-2xl p-px",
        `bg-gradient-to-br ${gradBgMap[gradient]}`,
        animated && "animate-[spin_4s_linear_infinite] bg-[length:200%_200%]",
        className
      )}
      {...props}
    >
      <div className="relative rounded-[calc(1rem-1px)] bg-card p-6">{children}</div>
    </div>
  );
}

export {
  MeshGradient,
  GridBackground,
  SpotlightBackground,
  GradientCard,
  HeroBackground,
  GradientText,
  GradientBorder,
};
