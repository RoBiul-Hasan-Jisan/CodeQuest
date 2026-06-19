import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      // ── Colors ─────────────────────────────────────────────────────────────
      colors: {
        // Shadcn semantic tokens
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },

        // ── Design system brand palette ────────────────────────────────────
        "ds-green": {
          DEFAULT: "hsl(var(--ds-green))",
          foreground: "hsl(var(--ds-green-foreground))",
          muted: "hsl(var(--ds-green-muted))",
        },
        "ds-amber": {
          DEFAULT: "hsl(var(--ds-amber))",
          foreground: "hsl(var(--ds-amber-foreground))",
          muted: "hsl(var(--ds-amber-muted))",
        },
        "ds-teal": {
          DEFAULT: "hsl(var(--ds-teal))",
          foreground: "hsl(var(--ds-teal-foreground))",
          muted: "hsl(var(--ds-teal-muted))",
        },
        "ds-violet": {
          DEFAULT: "hsl(var(--ds-violet))",
          foreground: "hsl(var(--ds-violet-foreground))",
          muted: "hsl(var(--ds-violet-muted))",
        },
        surface: {
          1: "hsl(var(--surface-1))",
          2: "hsl(var(--surface-2))",
          3: "hsl(var(--surface-3))",
        },
      },

      // ── Border radius ───────────────────────────────────────────────────
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "calc(var(--radius) + 4px)",
        "2xl": "calc(var(--radius) + 8px)",
        "3xl": "calc(var(--radius) + 14px)",
      },

      // ── Fonts ───────────────────────────────────────────────────────────
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
        mono: ["var(--font-mono)", ...fontFamily.mono],
      },

      // ── Font size — full display scale ───────────────────────────────────
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.875rem" }],
        display: ["4.5rem", { lineHeight: "1", letterSpacing: "-0.04em" }],
      },

      // ── Box shadows ─────────────────────────────────────────────────────
      boxShadow: {
        soft: "var(--shadow-soft)",
        elevated: "var(--shadow-elevated)",
        float: "var(--shadow-float)",
        "glow-violet": "var(--shadow-glow-violet)",
        "glow-green": "var(--shadow-glow-green)",
        "glow-amber": "var(--shadow-glow-amber)",
        "glow-teal": "var(--shadow-glow-teal)",
        "inner-border": "inset 0 0 0 1px hsl(var(--border))",
        "inner-border-primary": "inset 0 0 0 1px hsl(var(--primary) / 0.4)",
      },

      // ── Background images ────────────────────────────────────────────────
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "gradient-violet":
          "linear-gradient(135deg, hsl(var(--gradient-violet-from)), hsl(var(--gradient-violet-to)))",
        "gradient-green":
          "linear-gradient(135deg, hsl(var(--gradient-green-from)), hsl(var(--gradient-green-to)))",
        "gradient-brand":
          "linear-gradient(135deg, hsl(var(--gradient-brand-from)), hsl(var(--gradient-brand-to)))",
        "gradient-warm":
          "linear-gradient(135deg, hsl(var(--gradient-warm-from)), hsl(var(--gradient-warm-to)))",
        // Noise / grain for Vercel-style texture
        "noise":
          "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E\")",
      },

      // ── Keyframe animations ──────────────────────────────────────────────
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "slide-in-right": {
          from: { opacity: "0", transform: "translateX(16px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "bounce-in": {
          "0%": { opacity: "0", transform: "scale(0.3)" },
          "50%": { transform: "scale(1.05)" },
          "70%": { transform: "scale(0.9)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(1)", opacity: "1" },
          "100%": { transform: "scale(1.6)", opacity: "0" },
        },
        "streak-flame": {
          "0%, 100%": { transform: "scale(1) rotate(-2deg)" },
          "50%": { transform: "scale(1.1) rotate(2deg)" },
        },
        "xp-fill": {
          from: { width: "0%" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "fade-in-up": "fade-in-up 0.35s ease-out both",
        "scale-in": "scale-in 0.2s ease-out",
        "slide-in-right": "slide-in-right 0.3s ease-out",
        "bounce-in": "bounce-in 0.5s ease-out",
        shimmer: "shimmer 2s ease-in-out infinite",
        "pulse-ring": "pulse-ring 1s cubic-bezier(0.24, 0, 0.38, 1) infinite",
        "streak-flame": "streak-flame 0.8s ease-in-out infinite",
        "xp-fill": "xp-fill 0.6s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
