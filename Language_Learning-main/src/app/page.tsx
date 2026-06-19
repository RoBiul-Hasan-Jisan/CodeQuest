import {
  ArrowRight,
  Award,
  BookMarked,
  BotMessageSquare,
  ChartBar,
  CheckCircle2,
  Flame,
  FlaskConical,
  Mic2,
  PenLine,
  Star,
  Zap,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { LandingHeroCta } from "./landing-hero-cta";
import { LandingNav } from "./landing-nav";

export const metadata: Metadata = {
  title: "Language Learning — Practice English with AI",
  description:
    "Master English with AI-powered vocabulary, grammar quizzes, speaking practice, writing assistance, and a personal AI tutor.",
};

const FEATURES = [
  {
    icon: BookMarked,
    color: "text-ds-teal",
    bg: "bg-ds-teal/10",
    border: "border-ds-teal/20",
    title: "Vocabulary Builder",
    description: "Spaced repetition + AI examples. Build a 1,000-word vocabulary that actually sticks.",
  },
  {
    icon: FlaskConical,
    color: "text-ds-violet",
    bg: "bg-ds-violet/10",
    border: "border-ds-violet/20",
    title: "Grammar Lab",
    description: "18 grammar categories. AI generates unique questions calibrated to your exact level.",
  },
  {
    icon: Mic2,
    color: "text-ds-amber",
    bg: "bg-ds-amber/10",
    border: "border-ds-amber/20",
    title: "Speaking Practice",
    description: "Speak and receive instant AI feedback on clarity, fluency, and vocabulary range.",
  },
  {
    icon: PenLine,
    color: "text-ds-teal",
    bg: "bg-ds-teal/10",
    border: "border-ds-teal/20",
    title: "Writing Assistant",
    description: "Fix grammar, rewrite for tone, elevate vocabulary — in real time as you type.",
  },
  {
    icon: BotMessageSquare,
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20",
    title: "AI Tutor",
    description: "Chat with Aria, your personal English tutor — available 24/7, endlessly patient.",
  },
  {
    icon: Award,
    color: "text-ds-amber",
    bg: "bg-ds-amber/10",
    border: "border-ds-amber/20",
    title: "Certificates",
    description: "Earn CEFR-level certificates (A1–C1) by hitting real milestones. Download as PDF.",
  },
];

const STATS = [
  { value: "18+",  label: "Grammar topics" },
  { value: "6",    label: "Practice modes" },
  { value: "A1–C1", label: "CEFR certificates" },
  { value: "AI",   label: "Powered feedback" },
];

const PERKS = [
  "Free to get started",
  "AI feedback on every answer",
  "Works on mobile & desktop",
  "Dark mode native",
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <LandingNav />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Subtle grid background */}
        <div className="bg-dot absolute inset-0 opacity-40" />
        {/* Glow orbs */}
        <div className="pointer-events-none absolute -top-32 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
        <div className="pointer-events-none absolute top-10 right-0 h-64 w-64 rounded-full bg-ds-teal/8 blur-[80px]" />

        <div className="relative mx-auto flex w-full max-w-5xl flex-col items-center gap-8 px-4 py-20 text-center sm:py-28 sm:px-6">
          {/* Badge */}
          <div className="flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
            <Zap className="h-3.5 w-3.5" />
            Powered by Google Gemini AI
          </div>

          {/* Headline */}
          <div className="flex flex-col gap-4">
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Learn English{" "}
              <span className="text-gradient-brand">faster with AI</span>
            </h1>
            <p className="mx-auto max-w-lg text-base text-muted-foreground sm:text-lg">
              Vocabulary, grammar, speaking, and writing — all in one place.
              Instant AI feedback. Real certificates. Every day.
            </p>
          </div>

          <LandingHeroCta />

          {/* Perks */}
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            {PERKS.map((p) => (
              <div key={p} className="flex items-center gap-1.5 text-xs text-muted-foreground sm:text-sm">
                <CheckCircle2 className="h-3.5 w-3.5 text-ds-teal" />
                {p}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats strip ──────────────────────────────────────────────────── */}
      <section className="border-y border-border bg-card/50">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-px px-4 sm:grid-cols-4 sm:px-6">
          {STATS.map((s) => (
            <div key={s.label} className="flex flex-col items-center gap-1 py-8 text-center">
              <span className="text-3xl font-extrabold text-foreground sm:text-4xl">{s.value}</span>
              <span className="text-xs text-muted-foreground sm:text-sm">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-4 py-20 sm:px-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
            Everything you need
          </span>
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl lg:text-4xl">
            Six AI-powered modules
          </h2>
          <p className="max-w-md text-sm text-muted-foreground sm:text-base">
            Built to work together and accelerate your learning at every stage.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className={`group flex flex-col gap-4 rounded-xl border bg-card p-5 transition-all hover:shadow-elevated hover:-translate-y-0.5 ${f.border}`}
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${f.bg}`}>
                <f.icon className={`h-5 w-5 ${f.color}`} />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{f.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{f.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Quote / social strip ─────────────────────────────────────────── */}
      <section className="border-y border-border bg-card/30">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-4 py-16 text-center sm:px-6">
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-ds-amber text-ds-amber" />
            ))}
          </div>
          <blockquote className="text-lg font-semibold text-foreground sm:text-xl">
            &ldquo;The limits of my language mean the limits of my world.&rdquo;
          </blockquote>
          <footer className="text-sm text-muted-foreground">— Ludwig Wittgenstein</footer>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {[
              { icon: Flame,  label: "Daily streaks",  color: "text-ds-amber",  bg: "bg-ds-amber/10"  },
              { icon: Zap,    label: "Earn XP",        color: "text-primary",   bg: "bg-primary/10"   },
              { icon: ChartBar, label: "Track progress", color: "text-ds-teal", bg: "bg-ds-teal/10"   },
            ].map((item) => (
              <div key={item.label} className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium ${item.bg} ${item.color}`}>
                <item.icon className="h-3.5 w-3.5" />
                {item.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
        <div className="relative mx-auto flex w-full max-w-5xl flex-col items-center gap-6 px-4 py-20 text-center sm:px-6">
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl lg:text-4xl">
            Ready to start learning?
          </h2>
          <p className="max-w-md text-sm text-muted-foreground sm:text-base">
            Join now and practice English with AI feedback every single day.
          </p>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-xl bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground shadow-glow-violet transition-all hover:bg-primary/90 hover:shadow-glow-violet active:scale-[0.98] sm:text-base"
          >
            Get started free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-4 py-8 text-center sm:px-6">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-[10px] font-bold text-primary-foreground">
              L
            </div>
            Language Learning
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Language Learning · Built with Next.js 15 &amp; Gemini AI
          </p>
          <div className="flex gap-5 text-xs text-muted-foreground">
            <Link href="/dashboard" className="transition-colors hover:text-foreground">Dashboard</Link>
            <Link href="/lessons"   className="transition-colors hover:text-foreground">Lessons</Link>
            <Link href="/login"     className="transition-colors hover:text-foreground">Sign in</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
