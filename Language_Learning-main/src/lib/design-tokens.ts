/**
 * Design token constants for use in JS/TS contexts (Framer Motion,
 * canvas, dynamic styles). The canonical source of truth is globals.css;
 * these mirror it for non-CSS consumers.
 *
 * Inspired by: Duolingo · Grammarly · Linear · Vercel
 */

// ─── Color primitives ────────────────────────────────────────────────────────

export const colors = {
  // Brand violet — Linear / Vercel
  violet: {
    50: "#F5F3FF",
    100: "#EDE9FE",
    200: "#DDD6FE",
    300: "#C4B5FD",
    400: "#A78BFA",
    500: "#8B5CF6",
    600: "#7C3AED",
    700: "#6D28D9",
    DEFAULT: "#6366F1", // primary brand
    900: "#4338CA",
    950: "#312E81",
  },

  // Brand green — Duolingo / Grammarly
  green: {
    DEFAULT: "#58CC02", // Duolingo exact
    hover: "#4CAD01",
    light: "#D7F5B1",
    dark: "#3D9900",
    grammarly: "#15C39A",
  },

  // Amber — XP / streak / Duolingo gamification
  amber: {
    DEFAULT: "#FF9600",
    light: "#FFE6B0",
    dark: "#CC7A00",
    fire: "#FF4B00",
  },

  // Teal — Grammarly accent
  teal: {
    DEFAULT: "#15C39A",
    light: "#CCFBF1",
    dark: "#0E9C7B",
  },

  // Neutrals — Vercel-inspired
  neutral: {
    0: "#FFFFFF",
    50: "#FAFAFA",
    100: "#F4F4F5",
    200: "#E4E4E7",
    300: "#D4D4D8",
    400: "#A1A1AA",
    500: "#71717A",
    600: "#52525B",
    700: "#3F3F46",
    800: "#27272A",
    900: "#18181B",
    950: "#09090B",
  },
} as const;

// ─── Semantic tokens ─────────────────────────────────────────────────────────

export const semantic = {
  background: { light: colors.neutral[0], dark: colors.neutral[950] },
  surface: { light: colors.neutral[50], dark: colors.neutral[900] },
  card: { light: colors.neutral[0], dark: colors.neutral[900] },
  border: { light: colors.neutral[200], dark: colors.neutral[800] },
  text: {
    primary: { light: colors.neutral[900], dark: colors.neutral[50] },
    secondary: { light: colors.neutral[500], dark: colors.neutral[400] },
    muted: { light: colors.neutral[400], dark: colors.neutral[600] },
  },
} as const;

// ─── Typography scale ─────────────────────────────────────────────────────────

export const typography = {
  fontFamily: {
    sans: "var(--font-sans)",
    mono: "var(--font-mono)",
  },
  fontSize: {
    xs: ["0.75rem", { lineHeight: "1rem" }],
    sm: ["0.875rem", { lineHeight: "1.25rem" }],
    base: ["1rem", { lineHeight: "1.5rem" }],
    lg: ["1.125rem", { lineHeight: "1.75rem" }],
    xl: ["1.25rem", { lineHeight: "1.75rem" }],
    "2xl": ["1.5rem", { lineHeight: "2rem" }],
    "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
    "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
    "5xl": ["3rem", { lineHeight: "1" }],
    "6xl": ["3.75rem", { lineHeight: "1" }],
    display: ["4.5rem", { lineHeight: "1", letterSpacing: "-0.025em" }],
  },
  fontWeight: {
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
    extrabold: "800",
  },
  letterSpacing: {
    tighter: "-0.05em",
    tight: "-0.025em",
    normal: "0em",
    wide: "0.025em",
    wider: "0.05em",
    widest: "0.1em",
  },
} as const;

// ─── Spacing scale ────────────────────────────────────────────────────────────

export const spacing = {
  px: "1px",
  0: "0",
  0.5: "0.125rem",  // 2px
  1: "0.25rem",     // 4px
  1.5: "0.375rem",  // 6px
  2: "0.5rem",      // 8px
  2.5: "0.625rem",  // 10px
  3: "0.75rem",     // 12px
  3.5: "0.875rem",  // 14px
  4: "1rem",        // 16px — base unit
  5: "1.25rem",     // 20px
  6: "1.5rem",      // 24px
  7: "1.75rem",     // 28px
  8: "2rem",        // 32px
  10: "2.5rem",     // 40px
  12: "3rem",       // 48px
  14: "3.5rem",     // 56px
  16: "4rem",       // 64px
  20: "5rem",       // 80px
  24: "6rem",       // 96px
  32: "8rem",       // 128px
  40: "10rem",      // 160px
  48: "12rem",      // 192px
  64: "16rem",      // 256px
} as const;

// ─── Shadows ──────────────────────────────────────────────────────────────────

export const shadows = {
  none: "none",
  xs: "0 1px 2px rgba(0,0,0,0.05)",
  sm: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
  md: "0 4px 6px rgba(0,0,0,0.05), 0 2px 4px rgba(0,0,0,0.04)",
  soft: "0 2px 8px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.04)",
  elevated: "0 4px 16px rgba(0,0,0,0.08), 0 16px 48px rgba(0,0,0,0.06)",
  float: "0 8px 32px rgba(0,0,0,0.12), 0 32px 64px rgba(0,0,0,0.08)",
  glow: {
    violet: "0 0 0 1px rgba(99,102,241,0.15), 0 4px 24px rgba(99,102,241,0.35)",
    green: "0 0 0 1px rgba(88,204,2,0.15), 0 4px 24px rgba(88,204,2,0.35)",
    amber: "0 0 0 1px rgba(255,150,0,0.15), 0 4px 24px rgba(255,150,0,0.35)",
    teal: "0 0 0 1px rgba(21,195,154,0.15), 0 4px 24px rgba(21,195,154,0.35)",
  },
} as const;

// ─── Motion ───────────────────────────────────────────────────────────────────

export const motion = {
  duration: {
    instant: 0.05,
    fast: 0.15,
    normal: 0.25,
    slow: 0.4,
    slower: 0.6,
  },
  ease: {
    default: [0.4, 0, 0.2, 1] as const,
    in: [0.4, 0, 1, 1] as const,
    out: [0, 0, 0.2, 1] as const,
    spring: { type: "spring", stiffness: 400, damping: 30 } as const,
    bounce: { type: "spring", stiffness: 600, damping: 20 } as const,
  },
} as const;

// ─── Border radius ────────────────────────────────────────────────────────────

export const radius = {
  none: "0",
  sm: "0.25rem",    // 4px
  md: "0.5rem",     // 8px  — default
  lg: "0.75rem",    // 12px
  xl: "1rem",       // 16px
  "2xl": "1.25rem", // 20px
  "3xl": "1.5rem",  // 24px
  full: "9999px",
} as const;

// ─── Z-index ─────────────────────────────────────────────────────────────────

export const zIndex = {
  base: 0,
  raised: 10,
  dropdown: 20,
  sticky: 30,
  overlay: 40,
  modal: 50,
  popover: 60,
  toast: 70,
  tooltip: 80,
} as const;
