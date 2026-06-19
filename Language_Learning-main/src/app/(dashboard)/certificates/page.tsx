"use client";

import { Award, BookMarked, CheckCircle2, Download, FlaskConical, Lock, Mic2, PenLine, Printer, Star, Trophy, Zap } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { useAuth } from "@/features/auth/hooks/use-auth";
import { selectGrammarOverview, useGrammarStore } from "@/features/grammar/store/grammar-store";
import { selectLevelInfo, selectTotalXP, useProgressStore } from "@/features/progress/store/progress-store";
import { selectCurrentStreak, selectLongestStreak, useStreakStore } from "@/features/streak/store/streak-store";
import { selectVocabStats, useVocabularyStore } from "@/features/vocabulary/store/vocabulary-store";
import { cn } from "@/lib/utils";

// ─── Certificate tiers ────────────────────────────────────────────────────────

interface CertTier {
  id: string;
  level: string;         // CEFR label
  title: string;
  subtitle: string;
  color: string;
  border: string;
  bg: string;
  iconBg: string;
  badge: string;
  requirements: {
    label: string;
    icon: React.ReactNode;
    needed: number;
    unit: string;
  }[];
  check: (s: Stats) => boolean;
  progress: (s: Stats) => number;  // 0–100
}

interface Stats {
  xp: number;
  level: number;
  wordsLearned: number;
  wordsMastered: number;
  grammarMastered: number;
  longestStreak: number;
  currentStreak: number;
  overallGrammarScore: number;
}

const TIERS: CertTier[] = [
  {
    id: "a1",
    level: "A1",
    title: "Foundation English",
    subtitle: "Certificate of Completion",
    color: "text-ds-green",
    border: "border-ds-green/40",
    bg: "bg-ds-green/5",
    iconBg: "bg-ds-green/15",
    badge: "Beginner",
    requirements: [
      { label: "Earn XP",               icon: <Zap className="h-3.5 w-3.5" />,        needed: 100,  unit: "XP" },
      { label: "Learn vocabulary words", icon: <BookMarked className="h-3.5 w-3.5" />, needed: 10,   unit: "words" },
      { label: "Complete grammar topic", icon: <FlaskConical className="h-3.5 w-3.5"/>, needed: 1,   unit: "topic" },
    ],
    check: (s) => s.xp >= 100 && s.wordsLearned >= 10 && s.grammarMastered >= 1,
    progress: (s) => Math.min(100, Math.round(
      ((Math.min(s.xp, 100) / 100) + (Math.min(s.wordsLearned, 10) / 10) + (Math.min(s.grammarMastered, 1) / 1)) / 3 * 100
    )),
  },
  {
    id: "a2",
    level: "A2",
    title: "Elementary English",
    subtitle: "Certificate of Completion",
    color: "text-ds-teal",
    border: "border-ds-teal/40",
    bg: "bg-ds-teal/5",
    iconBg: "bg-ds-teal/15",
    badge: "Elementary",
    requirements: [
      { label: "Reach Level 5",          icon: <Star className="h-3.5 w-3.5" />,        needed: 5,   unit: "level" },
      { label: "Earn XP",                icon: <Zap className="h-3.5 w-3.5" />,         needed: 500, unit: "XP" },
      { label: "Learn vocabulary words", icon: <BookMarked className="h-3.5 w-3.5" />,  needed: 50,  unit: "words" },
      { label: "Master grammar topics",  icon: <FlaskConical className="h-3.5 w-3.5" />, needed: 3,  unit: "topics" },
    ],
    check: (s) => s.level >= 5 && s.xp >= 500 && s.wordsLearned >= 50 && s.grammarMastered >= 3,
    progress: (s) => Math.min(100, Math.round(
      ((Math.min(s.level, 5) / 5) + (Math.min(s.xp, 500) / 500) + (Math.min(s.wordsLearned, 50) / 50) + (Math.min(s.grammarMastered, 3) / 3)) / 4 * 100
    )),
  },
  {
    id: "b1",
    level: "B1",
    title: "Intermediate English",
    subtitle: "Certificate of Achievement",
    color: "text-ds-amber",
    border: "border-ds-amber/40",
    bg: "bg-ds-amber/5",
    iconBg: "bg-ds-amber/15",
    badge: "Intermediate",
    requirements: [
      { label: "Reach Level 10",         icon: <Star className="h-3.5 w-3.5" />,        needed: 10,   unit: "level" },
      { label: "Earn XP",                icon: <Zap className="h-3.5 w-3.5" />,         needed: 1500, unit: "XP" },
      { label: "Master vocabulary words",icon: <BookMarked className="h-3.5 w-3.5" />,  needed: 50,   unit: "mastered" },
      { label: "Master grammar topics",  icon: <FlaskConical className="h-3.5 w-3.5" />, needed: 6,   unit: "topics" },
      { label: "Best streak",            icon: <Award className="h-3.5 w-3.5" />,        needed: 7,   unit: "days" },
    ],
    check: (s) => s.level >= 10 && s.xp >= 1500 && s.wordsMastered >= 50 && s.grammarMastered >= 6 && s.longestStreak >= 7,
    progress: (s) => Math.min(100, Math.round(
      ((Math.min(s.level, 10) / 10) + (Math.min(s.xp, 1500) / 1500) + (Math.min(s.wordsMastered, 50) / 50) + (Math.min(s.grammarMastered, 6) / 6) + (Math.min(s.longestStreak, 7) / 7)) / 5 * 100
    )),
  },
  {
    id: "b2",
    level: "B2",
    title: "Upper Intermediate English",
    subtitle: "Certificate of Achievement",
    color: "text-primary",
    border: "border-primary/40",
    bg: "bg-primary/5",
    iconBg: "bg-primary/15",
    badge: "Upper Intermediate",
    requirements: [
      { label: "Reach Level 20",         icon: <Star className="h-3.5 w-3.5" />,        needed: 20,   unit: "level" },
      { label: "Earn XP",                icon: <Zap className="h-3.5 w-3.5" />,         needed: 4000, unit: "XP" },
      { label: "Master vocabulary words",icon: <BookMarked className="h-3.5 w-3.5" />,  needed: 150,  unit: "mastered" },
      { label: "Master grammar topics",  icon: <FlaskConical className="h-3.5 w-3.5" />, needed: 10,  unit: "topics" },
      { label: "Best streak",            icon: <Award className="h-3.5 w-3.5" />,        needed: 30,  unit: "days" },
      { label: "Grammar score",          icon: <Trophy className="h-3.5 w-3.5" />,       needed: 80,  unit: "%" },
    ],
    check: (s) => s.level >= 20 && s.xp >= 4000 && s.wordsMastered >= 150 && s.grammarMastered >= 10 && s.longestStreak >= 30 && s.overallGrammarScore >= 80,
    progress: (s) => Math.min(100, Math.round(
      ((Math.min(s.level, 20) / 20) + (Math.min(s.xp, 4000) / 4000) + (Math.min(s.wordsMastered, 150) / 150) + (Math.min(s.grammarMastered, 10) / 10) + (Math.min(s.longestStreak, 30) / 30) + (Math.min(s.overallGrammarScore, 80) / 80)) / 6 * 100
    )),
  },
  {
    id: "c1",
    level: "C1",
    title: "Advanced English",
    subtitle: "Certificate of Mastery",
    color: "text-ds-violet",
    border: "border-ds-violet/40",
    bg: "bg-ds-violet/5",
    iconBg: "bg-ds-violet/15",
    badge: "Advanced",
    requirements: [
      { label: "Reach Level 30",         icon: <Star className="h-3.5 w-3.5" />,        needed: 30,   unit: "level" },
      { label: "Earn XP",                icon: <Zap className="h-3.5 w-3.5" />,         needed: 8000, unit: "XP" },
      { label: "Master vocabulary words",icon: <BookMarked className="h-3.5 w-3.5" />,  needed: 300,  unit: "mastered" },
      { label: "Master ALL grammar",     icon: <FlaskConical className="h-3.5 w-3.5" />, needed: 15,  unit: "topics" },
      { label: "Best streak",            icon: <Award className="h-3.5 w-3.5" />,        needed: 60,  unit: "days" },
      { label: "Grammar score",          icon: <Trophy className="h-3.5 w-3.5" />,       needed: 90,  unit: "%" },
      { label: "Speaking & Writing",     icon: <Mic2 className="h-3.5 w-3.5" />,         needed: 100, unit: "sessions" },
    ],
    check: (s) => s.level >= 30 && s.xp >= 8000 && s.wordsMastered >= 300 && s.grammarMastered >= 15 && s.longestStreak >= 60 && s.overallGrammarScore >= 90,
    progress: (s) => Math.min(100, Math.round(
      ((Math.min(s.level, 30) / 30) + (Math.min(s.xp, 8000) / 8000) + (Math.min(s.wordsMastered, 300) / 300) + (Math.min(s.grammarMastered, 15) / 15) + (Math.min(s.longestStreak, 60) / 60) + (Math.min(s.overallGrammarScore, 90) / 90)) / 6 * 100
    )),
  },
];

// ─── Certificate visual (printable) ──────────────────────────────────────────

interface CertificateProps {
  tier: CertTier;
  name: string;
  earnedDate: string;
  preview?: boolean;
}

function CertificateDocument({ tier, name, earnedDate, preview }: CertificateProps) {
  return (
    <div
      className={cn(
        "relative flex flex-col items-center gap-6 overflow-hidden rounded-2xl border-2 bg-background p-10 text-center shadow-float",
        tier.border,
      )}
      style={{ minHeight: 480 }}
    >
      {/* Corner decoration */}
      <div className={cn("absolute -left-12 -top-12 h-40 w-40 rounded-full opacity-10", tier.iconBg)} />
      <div className={cn("absolute -bottom-12 -right-12 h-40 w-40 rounded-full opacity-10", tier.iconBg)} />

      {/* Preview watermark */}
      {preview && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="rotate-[-30deg] text-6xl font-black tracking-[.3em] text-muted-foreground/10 select-none">
            PREVIEW
          </span>
        </div>
      )}

      {/* Badge row */}
      <div className="flex flex-col items-center gap-2">
        <div className={cn("flex h-16 w-16 items-center justify-center rounded-2xl", tier.iconBg)}>
          <Trophy className={cn("h-8 w-8", tier.color)} />
        </div>
        <span className={cn("rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest", tier.iconBg, tier.color)}>
          {tier.badge}
        </span>
      </div>

      {/* Title */}
      <div className="flex flex-col gap-1.5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          {tier.subtitle}
        </p>
        <h1 className={cn("text-3xl font-bold", tier.color)}>{tier.title}</h1>
        <span className="text-sm font-medium text-muted-foreground">CEFR Level {tier.level}</span>
      </div>

      {/* Divider */}
      <div className="flex w-full items-center gap-3">
        <div className="flex-1 border-t border-border" />
        <Star className="h-4 w-4 text-ds-amber fill-ds-amber" />
        <div className="flex-1 border-t border-border" />
      </div>

      {/* Recipient */}
      <div className="flex flex-col gap-1">
        <p className="text-xs text-muted-foreground">This certifies that</p>
        <p className="text-2xl font-bold text-foreground" style={{ fontFamily: "Georgia, serif" }}>
          {name || "Your Name"}
        </p>
        <p className="mt-1 text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
          has successfully demonstrated English language proficiency at the{" "}
          <strong className={tier.color}>{tier.level} {tier.badge}</strong> level through
          consistent practice, vocabulary mastery, and grammar excellence.
        </p>
      </div>

      {/* Skills row */}
      <div className="flex flex-wrap justify-center gap-2">
        {[
          { icon: <BookMarked className="h-3 w-3" />, label: "Vocabulary" },
          { icon: <FlaskConical className="h-3 w-3" />, label: "Grammar" },
          { icon: <Mic2 className="h-3 w-3" />, label: "Speaking" },
          { icon: <PenLine className="h-3 w-3" />, label: "Writing" },
        ].map((skill) => (
          <span
            key={skill.label}
            className={cn("flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium", tier.iconBg, tier.color)}
          >
            {skill.icon}
            {skill.label}
          </span>
        ))}
      </div>

      {/* Date + signature line */}
      <div className="flex w-full flex-col gap-2 border-t border-border pt-4">
        <div className="flex items-end justify-between">
          <div className="flex flex-col items-start gap-0.5">
            <div className="h-px w-24 bg-border" />
            <p className="text-[10px] text-muted-foreground">Date issued</p>
            <p className="text-xs font-medium text-foreground">{earnedDate}</p>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <p className="font-bold text-foreground" style={{ fontFamily: "Georgia, serif", fontSize: 18 }}>
              Language Learning
            </p>
            <div className="h-px w-32 bg-border" />
            <p className="text-[10px] text-muted-foreground">Authorised by</p>
          </div>
          <div className="flex flex-col items-end gap-0.5">
            <div className="h-px w-24 bg-border" />
            <p className="text-[10px] text-muted-foreground">Certificate ID</p>
            <p className="font-mono text-[10px] text-muted-foreground">
              {tier.level}-{earnedDate.replace(/\//g, "")}-LL
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Requirement row ──────────────────────────────────────────────────────────

function RequirementRow({
  label, icon, needed, unit, current, met,
}: {
  label: string; icon: React.ReactNode; needed: number; unit: string; current: number; met: boolean;
}) {
  const pct = Math.min(100, Math.round((current / needed) * 100));
  return (
    <div className="flex items-center gap-3">
      <div className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-full", met ? "bg-ds-green/15 text-ds-green" : "bg-muted text-muted-foreground")}>
        {met ? <CheckCircle2 className="h-3.5 w-3.5" /> : icon}
      </div>
      <div className="flex flex-1 flex-col gap-1">
        <div className="flex justify-between text-xs">
          <span className={cn("font-medium", met ? "text-foreground" : "text-muted-foreground")}>{label}</span>
          <span className={cn(met ? "text-ds-green font-semibold" : "text-muted-foreground")}>
            {current.toLocaleString()} / {needed.toLocaleString()} {unit}
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-border">
          <div
            className={cn("h-full rounded-full transition-all duration-700", met ? "bg-ds-green" : "bg-primary")}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Tier card ────────────────────────────────────────────────────────────────

const STAT_MAP = (stats: Stats): Record<string, number> => ({
  "Earn XP":                  stats.xp,
  "Reach Level 5":            stats.level,
  "Reach Level 10":           stats.level,
  "Reach Level 20":           stats.level,
  "Reach Level 30":           stats.level,
  "Learn vocabulary words":   stats.wordsLearned,
  "Master vocabulary words":  stats.wordsMastered,
  "Complete grammar topic":   stats.grammarMastered,
  "Master grammar topics":    stats.grammarMastered,
  "Master ALL grammar":       stats.grammarMastered,
  "Best streak":              stats.longestStreak,
  "Grammar score":            stats.overallGrammarScore,
  "Speaking & Writing":       0,
});

function TierCard({
  tier, stats, onView,
}: {
  tier: CertTier; stats: Stats; onView: (tier: CertTier) => void;
}) {
  const earned  = tier.check(stats);
  const pct     = tier.progress(stats);
  const statMap = STAT_MAP(stats);

  return (
    <div className={cn("flex flex-col gap-5 rounded-2xl border-2 p-5 transition-shadow hover:shadow-elevated", tier.border, tier.bg)}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl", tier.iconBg)}>
            {earned
              ? <Trophy className={cn("h-6 w-6", tier.color)} />
              : <Lock className="h-5 w-5 text-muted-foreground" />
            }
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={cn("text-xs font-bold uppercase tracking-widest", tier.color)}>
                {tier.level}
              </span>
              <span className="text-xs text-muted-foreground">·</span>
              <span className="text-xs text-muted-foreground">{tier.badge}</span>
            </div>
            <p className="font-semibold text-foreground">{tier.title}</p>
          </div>
        </div>
        {earned
          ? (
            <span className="flex items-center gap-1 rounded-full bg-ds-green/15 px-2.5 py-1 text-xs font-bold text-ds-green">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Earned
            </span>
          ) : (
            <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
              {pct}% done
            </span>
          )
        }
      </div>

      {/* Overall progress */}
      {!earned && (
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Overall progress</span>
            <span className="font-semibold text-foreground">{pct}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-border">
            <div
              className={cn("h-full rounded-full transition-all duration-700 bg-gradient-to-r", {
                "from-ds-green to-ds-teal":    tier.id === "a1",
                "from-ds-teal to-primary":     tier.id === "a2",
                "from-ds-amber to-orange-500": tier.id === "b1",
                "from-primary to-ds-violet":   tier.id === "b2",
                "from-ds-violet to-purple-600":tier.id === "c1",
              })}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}

      {/* Requirements */}
      <div className="flex flex-col gap-2.5">
        {tier.requirements.map((req) => {
          const current = statMap[req.label] ?? 0;
          return (
            <RequirementRow
              key={req.label}
              label={req.label}
              icon={req.icon}
              needed={req.needed}
              unit={req.unit}
              current={current}
              met={current >= req.needed}
            />
          );
        })}
      </div>

      {/* CTA — always show, earned gets primary style */}
      <button
        onClick={() => onView(tier)}
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all active:scale-[0.98]",
          earned
            ? cn("hover:brightness-110", tier.iconBg, tier.color)
            : "border border-border bg-background text-muted-foreground hover:bg-accent hover:text-foreground",
        )}
      >
        {earned ? <Trophy className="h-4 w-4" /> : <Award className="h-4 w-4" />}
        {earned ? "View & Download Certificate" : "Preview Certificate Design"}
      </button>
    </div>
  );
}

// ─── Certificate modal ────────────────────────────────────────────────────────

function CertificateModal({
  tier, defaultName, earned, onClose,
}: {
  tier: CertTier; defaultName: string; earned: boolean; onClose: () => void;
}) {
  const certRef    = useRef<HTMLDivElement>(null);
  const [name, setName] = useState(defaultName);
  const earnedDate = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  function handlePrint() {
    const el = certRef.current;
    if (!el) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`<!DOCTYPE html>
<html>
  <head>
    <title>${tier.title} Certificate — ${name}</title>
    <style>
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      @page { size: A4 landscape; margin: 1.5cm; }
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
        background: white; color: #0f172a;
        display: flex; align-items: center; justify-content: center; min-height: 100vh;
      }
      .cert {
        position: relative; width: 100%; max-width: 800px;
        border: 2px solid #6366f1; border-radius: 16px; padding: 48px;
        display: flex; flex-direction: column; align-items: center; gap: 24px; text-align: center;
        background: #fff;
      }
      .badge { display:flex; flex-direction:column; align-items:center; gap:8px; }
      .icon-wrap { width:64px; height:64px; border-radius:16px; background:#ede9fe; display:flex; align-items:center; justify-content:center; font-size:28px; }
      .level-badge { background:#ede9fe; color:#6366f1; font-size:11px; font-weight:700; letter-spacing:.15em; text-transform:uppercase; padding:4px 12px; border-radius:999px; }
      .subtitle { font-size:11px; font-weight:600; letter-spacing:.2em; text-transform:uppercase; color:#64748b; }
      .title { font-size:32px; font-weight:800; color:#6366f1; }
      .cefr { font-size:13px; color:#94a3b8; margin-top:2px; }
      hr { width:100%; border:none; border-top:1px solid #e2e8f0; }
      .to { font-size:11px; color:#94a3b8; }
      .recipient { font-family: Georgia, 'Times New Roman', serif; font-size:26px; font-weight:700; color:#0f172a; margin:4px 0; }
      .desc { font-size:13px; color:#64748b; max-width:480px; line-height:1.7; }
      .skills { display:flex; gap:8px; flex-wrap:wrap; justify-content:center; }
      .skill { background:#ede9fe; color:#6366f1; font-size:11px; font-weight:600; padding:4px 12px; border-radius:999px; }
      .footer { display:flex; justify-content:space-between; width:100%; padding-top:16px; border-top:1px solid #e2e8f0; }
      .footer-col { display:flex; flex-direction:column; align-items:flex-start; gap:2px; }
      .footer-col:last-child { align-items:flex-end; }
      .footer-col:nth-child(2) { align-items:center; }
      .footer-line { height:1px; width:96px; background:#e2e8f0; }
      .footer-label { font-size:9px; color:#94a3b8; }
      .footer-value { font-size:11px; font-weight:600; color:#0f172a; }
      .org { font-family: Georgia, serif; font-size:18px; font-weight:700; }
      .watermark { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; pointer-events:none; }
      .watermark span { font-size:80px; font-weight:900; color:rgba(99,102,241,0.06); letter-spacing:.3em; transform:rotate(-30deg); white-space:nowrap; }
    </style>
  </head>
  <body>
    <div class="cert">
      <div class="badge">
        <div class="icon-wrap">🏆</div>
        <span class="level-badge">${tier.badge}</span>
      </div>
      <div>
        <p class="subtitle">${tier.subtitle}</p>
        <h1 class="title">${tier.title}</h1>
        <p class="cefr">CEFR Level ${tier.level}</p>
      </div>
      <hr />
      <div>
        <p class="to">This certifies that</p>
        <p class="recipient">${name}</p>
        <p class="desc">has successfully demonstrated English language proficiency at the <strong style="color:#6366f1">${tier.level} ${tier.badge}</strong> level through consistent practice, vocabulary mastery, and grammar excellence.</p>
      </div>
      <div class="skills">
        <span class="skill">Vocabulary</span>
        <span class="skill">Grammar</span>
        <span class="skill">Speaking</span>
        <span class="skill">Writing</span>
      </div>
      <div class="footer">
        <div class="footer-col">
          <div class="footer-line"></div>
          <p class="footer-label">Date issued</p>
          <p class="footer-value">${earnedDate}</p>
        </div>
        <div class="footer-col">
          <p class="org">Language Learning</p>
          <div class="footer-line"></div>
          <p class="footer-label">Authorised by</p>
        </div>
        <div class="footer-col">
          <div class="footer-line"></div>
          <p class="footer-label">Certificate ID</p>
          <p class="footer-value" style="font-family:monospace;font-size:9px">${tier.level}-${earnedDate.replace(/\s/g, "").replace(/,/g, "")}-LL</p>
        </div>
      </div>
      ${!earned ? `<div class="watermark"><span>PREVIEW</span></div>` : ""}
    </div>
  </body>
</html>`);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); printWindow.close(); }, 600);
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="flex w-full max-w-2xl flex-col gap-4 rounded-2xl bg-background p-5 shadow-float">

          {/* Toolbar */}
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-semibold text-foreground">
              {earned ? "Your Certificate" : "Certificate Preview"}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
              >
                <Printer className="h-4 w-4" />
                Print
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90"
              >
                <Download className="h-4 w-4" />
                Save as PDF
              </button>
              <button onClick={onClose} className="ml-1 rounded-lg px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground">✕</button>
            </div>
          </div>

          {/* Editable name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">Name on certificate</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Preview banner */}
          {!earned && (
            <div className="flex items-center gap-2 rounded-lg border border-ds-amber/30 bg-ds-amber/10 px-3 py-2 text-xs font-medium text-ds-amber">
              <Award className="h-4 w-4 shrink-0" />
              Preview only — complete all requirements to earn the official certificate.
            </div>
          )}

          {/* Certificate live preview */}
          <div ref={certRef} className="pointer-events-none">
            <CertificateDocument tier={tier} name={name || "Your Name"} earnedDate={earnedDate} preview={!earned} />
          </div>

          <p className="text-center text-xs text-muted-foreground">
            Click <strong>Save as PDF</strong> → select &quot;Save as PDF&quot; as the destination in the print dialog.
          </p>
        </div>
      </div>
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CertificatesPage() {
  const { user } = useAuth();
  const totalXP     = useProgressStore(selectTotalXP);
  const levelInfo   = useProgressStore(useShallow(selectLevelInfo));
  const longestStreak  = useStreakStore(selectLongestStreak);
  const currentStreak  = useStreakStore(selectCurrentStreak);
  const vocabStats  = useVocabularyStore(useShallow(selectVocabStats));
  const grammar     = useGrammarStore(useShallow(selectGrammarOverview));

  const [viewTier, setViewTier] = useState<CertTier | null>(null);
  const [defaultName] = useState(
    () => (typeof window !== "undefined" ? (localStorage.getItem("cert_name") ?? "") : "") || (user?.displayName ?? user?.email ?? "")
  );

  const stats: Stats = useMemo(() => ({
    xp: totalXP,
    level: levelInfo.level,
    wordsLearned: vocabStats.totalLearned,
    wordsMastered: vocabStats.totalMastered,
    grammarMastered: grammar.masteredTopicIds.length,
    longestStreak,
    currentStreak,
    overallGrammarScore: grammar.overallScore,
  }), [totalXP, levelInfo, vocabStats, grammar, longestStreak, currentStreak]);

  const earned     = TIERS.filter((t) => t.check(stats));
  const inProgress = TIERS.filter((t) => !t.check(stats));

  return (
    <>
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Certificates</h1>
          <p className="text-sm text-muted-foreground">
            Earn official certificates by reaching milestones across vocabulary, grammar, speaking, and writing.
          </p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Certificates earned",   value: earned.length,            icon: <Trophy className="h-4 w-4 text-ds-amber" />,   bg: "bg-ds-amber/10" },
            { label: "Total XP",              value: totalXP.toLocaleString(), icon: <Zap className="h-4 w-4 text-ds-amber" />,      bg: "bg-ds-amber/10" },
            { label: "Current level",         value: `Lv ${levelInfo.level}`,  icon: <Star className="h-4 w-4 text-primary" />,      bg: "bg-primary/10" },
            { label: "Grammar mastered",      value: grammar.masteredTopicIds.length, icon: <FlaskConical className="h-4 w-4 text-ds-violet" />, bg: "bg-ds-violet/10" },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3.5">
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${s.bg}`}>{s.icon}</div>
              <div>
                <p className="text-lg font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Earned */}
        {earned.length > 0 && (
          <section className="flex flex-col gap-4">
            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              <Trophy className="h-4 w-4 text-ds-amber" />
              Earned · {earned.length}
            </h2>
            <div className="grid gap-4 lg:grid-cols-2">
              {earned.map((tier) => (
                <TierCard key={tier.id} tier={tier} stats={stats} onView={setViewTier} />
              ))}
            </div>
          </section>
        )}

        {/* In progress */}
        {inProgress.length > 0 && (
          <section className="flex flex-col gap-4">
            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              <Award className="h-4 w-4" />
              In progress · {inProgress.length}
            </h2>
            <div className="grid gap-4 lg:grid-cols-2">
              {inProgress.map((tier) => (
                <TierCard key={tier.id} tier={tier} stats={stats} onView={setViewTier} />
              ))}
            </div>
          </section>
        )}

        {/* Empty state */}
        {earned.length === 0 && (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border bg-muted/30 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
              <Trophy className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="flex flex-col gap-1">
              <p className="font-semibold text-foreground">No certificates yet</p>
              <p className="max-w-xs text-sm text-muted-foreground">
                Complete the A1 requirements to earn your first certificate. Start by earning 100 XP!
              </p>
            </div>
          </div>
        )}

        {/* How it works */}
        <section className="rounded-2xl border border-border bg-muted/30 p-5">
          <h3 className="mb-3 font-semibold text-foreground">How certificates work</h3>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { step: "1", title: "Meet all requirements", desc: "Complete XP, vocabulary, grammar, and streak goals for each level." },
              { step: "2", title: "Certificate unlocks",    desc: "Once all requirements are met, the certificate is instantly available." },
              { step: "3", title: "Download as PDF",        desc: "Open the certificate, click Save as PDF, and keep it forever." },
            ].map((item) => (
              <div key={item.step} className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                  {item.step}
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Certificate viewer modal */}
      {viewTier && (
        <CertificateModal
          tier={viewTier}
          defaultName={defaultName}
          earned={earned.some((t) => t.id === viewTier.id)}
          onClose={() => setViewTier(null)}
        />
      )}
    </>
  );
}
