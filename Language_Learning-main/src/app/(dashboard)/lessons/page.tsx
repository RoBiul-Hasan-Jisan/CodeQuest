import { ArrowRight, BotMessageSquare, BookMarked, Clock, FlaskConical, Mic2, PenLine, Star, Zap } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Lessons",
  description: "Browse and start English lessons across all skill areas.",
};

const LESSON_TRACKS = [
  {
    id: "vocabulary",
    title: "Vocabulary Builder",
    description: "Expand your word bank with spaced repetition and AI-generated examples.",
    icon: BookMarked,
    href: "/vocabulary",
    color: "text-ds-teal",
    bg: "bg-ds-teal/10",
    border: "border-ds-teal/20",
    lessons: 120,
    avgMinutes: 10,
    level: "A1 – C1",
    badge: "Most Popular",
    badgeColor: "bg-ds-green/15 text-ds-green",
  },
  {
    id: "grammar",
    title: "Grammar Lab",
    description: "Master English grammar through AI-generated quizzes on 18+ categories.",
    icon: FlaskConical,
    href: "/grammar",
    color: "text-ds-violet",
    bg: "bg-ds-violet/10",
    border: "border-ds-violet/20",
    lessons: 18,
    avgMinutes: 15,
    level: "A1 – C2",
    badge: null,
    badgeColor: "",
  },
  {
    id: "speaking",
    title: "Speaking Practice",
    description: "Practice real conversations with AI feedback on clarity, fluency, and grammar.",
    icon: Mic2,
    href: "/speaking",
    color: "text-ds-amber",
    bg: "bg-ds-amber/10",
    border: "border-ds-amber/20",
    lessons: 6,
    avgMinutes: 20,
    level: "A2 – C1",
    badge: "Voice AI",
    badgeColor: "bg-ds-amber/15 text-ds-amber",
  },
  {
    id: "writing",
    title: "Writing Assistant",
    description: "Fix grammar, rewrite sentences, and adapt your tone with AI in real-time.",
    icon: PenLine,
    href: "/writing",
    color: "text-ds-teal",
    bg: "bg-ds-teal/10",
    border: "border-ds-teal/20",
    lessons: 5,
    avgMinutes: 12,
    level: "B1 – C2",
    badge: null,
    badgeColor: "",
  },
  {
    id: "tutor",
    title: "AI Tutor Chat",
    description: "Get instant answers, explanations, and personalised feedback from Aria.",
    icon: BotMessageSquare,
    href: "/tutor",
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20",
    lessons: 7,
    avgMinutes: 15,
    level: "All levels",
    badge: "24/7 AI",
    badgeColor: "bg-primary/15 text-primary",
  },
];

const TIPS = [
  { icon: Zap,   text: "Practice 15 minutes daily to build a strong streak." },
  { icon: Star,  text: "Complete quizzes to earn XP and level up faster." },
  { icon: Clock, text: "Spaced repetition makes vocabulary stick long-term." },
];

export default function LessonsPage() {
  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Lessons</h1>
        <p className="text-sm text-muted-foreground">
          Choose a skill area to practice. Each track is powered by AI and adapts to your level.
        </p>
      </div>

      {/* Learning tracks */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {LESSON_TRACKS.map((track) => (
          <Link
            key={track.id}
            href={track.href}
            className={`group relative flex flex-col gap-4 rounded-2xl border ${track.border} bg-card p-5 transition-all hover:shadow-elevated hover:-translate-y-0.5 active:scale-[0.99]`}
          >
            {/* Badge */}
            {track.badge && (
              <span className={`absolute right-4 top-4 rounded-full px-2 py-0.5 text-xs font-semibold ${track.badgeColor}`}>
                {track.badge}
              </span>
            )}

            {/* Icon */}
            <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${track.bg}`}>
              <track.icon className={`h-5 w-5 ${track.color}`} />
            </div>

            {/* Content */}
            <div className="flex flex-col gap-1.5">
              <h2 className="font-semibold text-foreground">{track.title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{track.description}</p>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>{track.lessons} modules</span>
              <span>·</span>
              <span>~{track.avgMinutes} min each</span>
              <span>·</span>
              <span>{track.level}</span>
            </div>

            {/* CTA */}
            <div className={`flex items-center gap-1 text-sm font-semibold ${track.color} transition-transform group-hover:translate-x-0.5`}>
              Start practicing
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </Link>
        ))}
      </div>

      {/* Tips */}
      <div className="rounded-2xl border border-border bg-muted/40 p-5">
        <h3 className="mb-3 text-sm font-semibold text-foreground">Learning tips</h3>
        <div className="flex flex-col gap-2.5 sm:flex-row sm:gap-6">
          {TIPS.map((tip, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
              <tip.icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>{tip.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
