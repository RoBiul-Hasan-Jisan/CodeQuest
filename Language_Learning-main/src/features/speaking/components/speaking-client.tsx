"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Mic2, MessageSquare, ChevronLeft, BarChart3, Trophy } from "lucide-react";
import { useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { cn } from "@/lib/utils";

import {
  useSpeakingStore,
  selectAllScenarioStats,
  selectOverallScore,
  selectTotalSessions,
} from "../store/speaking-store";
import { SCENARIOS } from "../types";
import type { SpeakingMode, SpeakingScenario } from "../types";

import { ConversationSession } from "./conversation-session";
import { PracticeSession } from "./practice-session";
import { ScenarioPicker } from "./scenario-picker";


// ─── Mode tab ─────────────────────────────────────────────────────────────────

function ModeTab({
  mode,
  active,
  onClick,
}: {
  mode: SpeakingMode;
  active: boolean;
  onClick: () => void;
}) {
  const config = {
    practice: {
      label: "Practice Mode",
      icon: <Mic2 className="h-4 w-4" />,
      desc: "Record & get pronunciation feedback",
    },
    conversation: {
      label: "Conversation",
      icon: <MessageSquare className="h-4 w-4" />,
      desc: "Simulate a real conversation with AI",
    },
  }[mode];

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-1 flex-col items-center gap-1 rounded-xl border px-4 py-3 text-center transition-all",
        active
          ? "border-ds-violet/30 bg-ds-violet/10 text-ds-violet"
          : "border-border bg-card text-muted-foreground hover:bg-muted"
      )}
    >
      <div className="flex items-center gap-1.5">
        {config.icon}
        <span className="text-sm font-semibold">{config.label}</span>
      </div>
      <span className="text-[11px] leading-tight opacity-70">{config.desc}</span>
    </button>
  );
}

// ─── Stats bar ────────────────────────────────────────────────────────────────

function StatsBar() {
  const overallScore = useSpeakingStore(selectOverallScore);
  const totalSessions = useSpeakingStore(selectTotalSessions);
  const allStats = useSpeakingStore(useShallow(selectAllScenarioStats));

  const practiced = Object.values(allStats).filter((s) => s.attempts > 0).length;

  if (totalSessions === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center gap-4 rounded-2xl border border-border bg-card px-5 py-3 shadow-soft"
    >
      <div className="flex items-center gap-2">
        <Trophy className="h-4 w-4 text-ds-amber" />
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Overall Score
          </p>
          <p className="text-base font-bold text-foreground">{overallScore}%</p>
        </div>
      </div>

      <div className="h-8 w-px bg-border" />

      <div className="flex items-center gap-2">
        <BarChart3 className="h-4 w-4 text-ds-teal" />
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Sessions
          </p>
          <p className="text-base font-bold text-foreground">{totalSessions}</p>
        </div>
      </div>

      <div className="h-8 w-px bg-border" />

      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Scenarios
        </p>
        <p className="text-base font-bold text-foreground">{practiced} / 6</p>
      </div>
    </motion.div>
  );
}

// ─── Main client ──────────────────────────────────────────────────────────────

export function SpeakingClient() {
  const [selectedScenario, setSelectedScenario] =
    useState<SpeakingScenario | null>(null);
  const [mode, setMode] = useState<SpeakingMode>("practice");

  const scenario = SCENARIOS.find((s) => s.id === selectedScenario) ?? null;

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            Speaking Practice
          </h1>
          <p className="text-sm text-muted-foreground">
            Improve pronunciation, fluency &amp; conversation skills with AI feedback
          </p>
        </div>

        <StatsBar />
      </motion.div>

      <AnimatePresence mode="wait">
        {/* ── Scenario picker ── */}
        {!selectedScenario && (
          <motion.div
            key="picker"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <ScenarioPicker onSelect={setSelectedScenario} />
          </motion.div>
        )}

        {/* ── Session view ── */}
        {selectedScenario && scenario && (
          <motion.div
            key="session"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col gap-5"
          >
            {/* Top bar: back + scenario info */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedScenario(null)}
                className="flex items-center gap-1.5 rounded-xl border border-border bg-muted px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground"
              >
                <ChevronLeft className="h-4 w-4" />
                Scenarios
              </button>

              <div
                className={cn(
                  "flex items-center gap-2.5 rounded-xl border px-3 py-2",
                  scenario.bg,
                  scenario.border
                )}
              >
                <span className="text-lg leading-none">{scenario.icon}</span>
                <div>
                  <p className={cn("text-sm font-semibold leading-tight", scenario.color)}>
                    {scenario.label}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {scenario.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Mode selector */}
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="flex gap-2"
            >
              <ModeTab
                mode="practice"
                active={mode === "practice"}
                onClick={() => setMode("practice")}
              />
              <ModeTab
                mode="conversation"
                active={mode === "conversation"}
                onClick={() => setMode("conversation")}
              />
            </motion.div>

            {/* Session content */}
            <AnimatePresence mode="wait">
              {mode === "practice" ? (
                <motion.div
                  key={`practice-${selectedScenario}`}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  transition={{ duration: 0.2 }}
                >
                  <PracticeSession scenario={scenario} />
                </motion.div>
              ) : (
                <motion.div
                  key={`conversation-${selectedScenario}`}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <ConversationSession scenario={scenario} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tips row (only on picker screen) */}
      <AnimatePresence>
        {!selectedScenario && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="grid gap-3 text-center sm:grid-cols-3"
          >
            {[
              {
                icon: "🎯",
                title: "Pick a scenario",
                desc: "Choose from 6 real-world speaking contexts",
              },
              {
                icon: "🎙️",
                title: "Speak naturally",
                desc: "Use your microphone — no typing required",
              },
              {
                icon: "📊",
                title: "Get AI feedback",
                desc: "Receive detailed scores on fluency, clarity & grammar",
              },
            ].map((tip) => (
              <div
                key={tip.title}
                className="flex flex-col items-center gap-1.5 rounded-2xl border border-border bg-card p-4 shadow-soft"
              >
                <span className="text-2xl">{tip.icon}</span>
                <p className="text-xs font-semibold text-foreground">{tip.title}</p>
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  {tip.desc}
                </p>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
