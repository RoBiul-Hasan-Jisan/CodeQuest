import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

import {
  computeGrade,
  exponentialWeightedAverage,
  isMastered,
  type GrammarAttempt,
  type GrammarAttemptInput,
  type GrammarState,
  type GrammarTopic,
  type GrammarTopicInput,
} from "../types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const now = () => new Date().toISOString();
const ATTEMPT_HISTORY_MAX = 500;

let _attemptCounter = 0;
const generateAttemptId = () => `attempt_${Date.now()}_${++_attemptCounter}`;

/** Recompute aggregated store-level derived fields from topics. */
function computeAggregates(topics: Record<string, GrammarTopic>) {
  const list = Object.values(topics);
  if (list.length === 0) {
    return {
      overallScore: 0,
      overallAccuracy: 0,
      weakTopicIds: [] as string[],
      strongTopicIds: [] as string[],
      masteredTopicIds: [] as string[],
    };
  }

  const overallScore = Math.round(
    list.reduce((acc, t) => acc + t.currentScore, 0) / list.length
  );
  const overallAccuracy =
    list.reduce((acc, t) => acc + t.accuracy, 0) / list.length;
  const weakTopicIds = list.filter((t) => t.currentScore < 60).map((t) => t.topicId);
  const strongTopicIds = list.filter((t) => t.currentScore >= 85).map((t) => t.topicId);
  const masteredTopicIds = list.filter((t) => t.mastered).map((t) => t.topicId);

  return { overallScore, overallAccuracy, weakTopicIds, strongTopicIds, masteredTopicIds };
}

// ─── Initial state ─────────────────────────────────────────────────────────────

const initialGrammarState: Omit<
  GrammarState,
  "registerTopic" | "recordAttempt" | "resetTopic" | "resetAll"
> = {
  topics: {},
  attemptHistory: [],
  overallScore: 0,
  overallAccuracy: 0,
  weakTopicIds: [],
  strongTopicIds: [],
  masteredTopicIds: [],
};

// ─── Store ─────────────────────────────────────────────────────────────────────

export const useGrammarStore = create<GrammarState>()(
  devtools(
    persist(
      (set, _get) => ({
        ...initialGrammarState,

        // ── registerTopic ────────────────────────────────────────────────
        registerTopic: (input: GrammarTopicInput) => {
          set((state) => {
            if (state.topics[input.topicId]) return state; // already exists

            const topic: GrammarTopic = {
              ...input,
              currentScore: 0,
              bestScore: 0,
              totalAttempts: 0,
              totalQuestions: 0,
              correctAnswers: 0,
              accuracy: 0,
              firstAttemptAt: null,
              lastAttemptAt: null,
              grade: "F",
              mastered: false,
            };

            const topics = { ...state.topics, [topic.topicId]: topic };
            return { topics, ...computeAggregates(topics) };
          });
        },

        // ── recordAttempt ────────────────────────────────────────────────
        recordAttempt: (input: GrammarAttemptInput) => {
          set((state) => {
            const existing = state.topics[input.topicId];

            // Auto-register topic if not yet known
            const baseScore = existing?.currentScore ?? 0;
            const totalAttempts = (existing?.totalAttempts ?? 0) + 1;
            const totalQuestions = (existing?.totalQuestions ?? 0) + input.questionsTotal;
            const correctAnswers = (existing?.correctAnswers ?? 0) + input.questionsCorrect;
            const accuracy = correctAnswers / totalQuestions;

            // Rolling score — EWA, but first attempt sets score directly
            const currentScore =
              totalAttempts === 1
                ? input.score
                : exponentialWeightedAverage(baseScore, input.score);

            const bestScore = Math.max(existing?.bestScore ?? 0, input.score);
            const grade = computeGrade(currentScore);
            const mastered = isMastered(currentScore, totalAttempts);
            const timestamp = now();

            const updatedTopic: GrammarTopic = {
              ...(existing ?? {
                topicId: input.topicId,
                name: input.topicId, // fallback name
                category: "other",
                language: "unknown",
                difficulty: "medium",
              }),
              currentScore,
              bestScore,
              totalAttempts,
              totalQuestions,
              correctAnswers,
              accuracy,
              firstAttemptAt: existing?.firstAttemptAt ?? timestamp,
              lastAttemptAt: timestamp,
              grade,
              mastered,
            };

            const topics = { ...state.topics, [input.topicId]: updatedTopic };

            const attempt: GrammarAttempt = {
              ...input,
              attemptId: generateAttemptId(),
              completedAt: timestamp,
            };

            const attemptHistory = [attempt, ...state.attemptHistory].slice(
              0,
              ATTEMPT_HISTORY_MAX
            );

            return { topics, attemptHistory, ...computeAggregates(topics) };
          });
        },

        // ── resetTopic ───────────────────────────────────────────────────
        resetTopic: (topicId: string) => {
          set((state) => {
            const topic = state.topics[topicId];
            if (!topic) return state;

            const reset: GrammarTopic = {
              ...topic,
              currentScore: 0,
              bestScore: 0,
              totalAttempts: 0,
              totalQuestions: 0,
              correctAnswers: 0,
              accuracy: 0,
              firstAttemptAt: null,
              lastAttemptAt: null,
              grade: "F",
              mastered: false,
            };

            const topics = { ...state.topics, [topicId]: reset };
            return { topics, ...computeAggregates(topics) };
          });
        },

        // ── resetAll ─────────────────────────────────────────────────────
        resetAll: () => set({ ...initialGrammarState }),
      }),
      {
        name: "ll:grammar",
        version: 1,
        onRehydrateStorage: () => (state) => {
          if (state) {
            const agg = computeAggregates(state.topics);
            Object.assign(state, agg);
          }
        },
        partialize: ({ topics, attemptHistory }) => ({ topics, attemptHistory }),
      }
    ),
    { name: "GrammarStore" }
  )
);

// ─── Selectors ─────────────────────────────────────────────────────────────────

export const selectTopic = (topicId: string) => (s: GrammarState) =>
  s.topics[topicId] ?? null;
export const selectAllTopics = (s: GrammarState) => Object.values(s.topics);
export const selectTopicsByCategory =
  (category: GrammarTopic["category"]) => (s: GrammarState) =>
    Object.values(s.topics).filter((t) => t.category === category);
export const selectGrammarOverview = (s: GrammarState) => ({
  overallScore: s.overallScore,
  overallAccuracy: s.overallAccuracy,
  weakTopicIds: s.weakTopicIds,
  strongTopicIds: s.strongTopicIds,
  masteredTopicIds: s.masteredTopicIds,
  totalTopics: Object.keys(s.topics).length,
});
export const selectRecentAttempts = (limit = 10) => (s: GrammarState) =>
  s.attemptHistory.slice(0, limit);
export const selectTopicHistory = (topicId: string) => (s: GrammarState) =>
  s.attemptHistory.filter((a) => a.topicId === topicId);
