import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

import type {
  ScenarioStats,
  SpeakingScenario,
  SpeakingSession,
  SpeakingState,
} from "../types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SESSION_HISTORY_MAX = 200;

let _counter = 0;
const genId = () => `speaking_${Date.now()}_${++_counter}`;

const ALL_SCENARIOS: SpeakingScenario[] = [
  "daily_conversation",
  "job_interview",
  "travel",
  "storytelling",
  "debate",
  "presentation",
];

function buildInitialScenarioStats(): Record<SpeakingScenario, ScenarioStats> {
  return Object.fromEntries(
    ALL_SCENARIOS.map((s) => [s, { attempts: 0, avgScore: 0, bestScore: 0 }])
  ) as Record<SpeakingScenario, ScenarioStats>;
}

// ─── Initial state ─────────────────────────────────────────────────────────────

const initialSpeakingState: Omit<SpeakingState, "recordSession" | "resetAll"> =
  {
    sessions: [],
    scenarioStats: buildInitialScenarioStats(),
    totalSessions: 0,
    overallScore: 0,
  };

// ─── Store ─────────────────────────────────────────────────────────────────────

export const useSpeakingStore = create<SpeakingState>()(
  devtools(
    persist(
      (set) => ({
        ...initialSpeakingState,

        recordSession: (input) => {
          set((state) => {
            const session: SpeakingSession = {
              ...input,
              sessionId: genId(),
              completedAt: new Date().toISOString(),
            };

            const sessions = [session, ...state.sessions].slice(
              0,
              SESSION_HISTORY_MAX
            );

            // Update per-scenario stats (only when feedback score exists)
            const score = input.feedback?.overallScore ?? 0;
            const scenarioStats = { ...state.scenarioStats };

            if (score > 0) {
              const prev = scenarioStats[input.scenario];
              const newAttempts = prev.attempts + 1;
              const newAvg = Math.round(
                (prev.avgScore * prev.attempts + score) / newAttempts
              );
              const newBest = Math.max(prev.bestScore, score);
              scenarioStats[input.scenario] = {
                attempts: newAttempts,
                avgScore: newAvg,
                bestScore: newBest,
              };
            }

            // Overall = mean of all scenarios that have been attempted
            const attempted = Object.values(scenarioStats).filter(
              (s) => s.attempts > 0
            );
            const overallScore = attempted.length
              ? Math.round(
                  attempted.reduce((acc, s) => acc + s.avgScore, 0) /
                    attempted.length
                )
              : 0;

            return {
              sessions,
              scenarioStats,
              totalSessions: sessions.length,
              overallScore,
            };
          });
        },

        resetAll: () => set({ ...initialSpeakingState }),
      }),
      {
        name: "ll:speaking",
        version: 1,
        partialize: ({ sessions, scenarioStats, totalSessions, overallScore }) => ({
          sessions,
          scenarioStats,
          totalSessions,
          overallScore,
        }),
      }
    ),
    { name: "SpeakingStore" }
  )
);

// ─── Selectors ─────────────────────────────────────────────────────────────────

export const selectRecentSessions =
  (limit = 10) =>
  (s: SpeakingState) =>
    s.sessions.slice(0, limit);

export const selectScenarioStats =
  (scenario: SpeakingScenario) => (s: SpeakingState) =>
    s.scenarioStats[scenario];

export const selectAllScenarioStats = (s: SpeakingState) => s.scenarioStats;

export const selectOverallScore = (s: SpeakingState) => s.overallScore;
export const selectTotalSessions = (s: SpeakingState) => s.totalSessions;
