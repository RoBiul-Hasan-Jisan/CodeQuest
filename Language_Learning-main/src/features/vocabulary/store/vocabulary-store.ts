import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

import {
  applySpacedRepetition,
  initialSM2State,
  type RecallQuality,
  type VocabularySession,
  type VocabularyState,
  type VocabularyWord,
  type VocabularyWordInput,
} from "../types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

let _idCounter = 0;
const generateId = () => `word_${Date.now()}_${++_idCounter}`;
const generateSessionId = () => `session_${Date.now()}`;
const todayString = () => new Date().toISOString().split("T")[0]!;
const now = () => new Date().toISOString();

/** XP reward per review, scaled by recall quality (0–5). */
function xpForQuality(quality: RecallQuality): number {
  if (quality <= 1) return 0;
  if (quality === 2) return 2;
  if (quality === 3) return 5;
  if (quality === 4) return 8;
  return 10; // perfect recall
}

/** Recount all derived counters from the words record. */
function computeCounters(words: Record<string, VocabularyWord>) {
  const today = todayString();
  let totalLearned = 0;
  let totalMastered = 0;
  let totalDueToday = 0;

  for (const w of Object.values(words)) {
    if (w.status !== "new") totalLearned++;
    if (w.status === "mastered") totalMastered++;
    if (w.nextReviewDate <= today) totalDueToday++;
  }

  return {
    totalWords: Object.keys(words).length,
    totalLearned,
    totalMastered,
    totalDueToday,
  };
}

// ─── Initial state ─────────────────────────────────────────────────────────────

const initialVocabularyState: Omit<
  VocabularyState,
  | "addWord"
  | "addWords"
  | "reviewWord"
  | "removeWord"
  | "startSession"
  | "endSession"
  | "getDueWords"
  | "recomputeCounters"
  | "resetAll"
  | "toggleFavorite"
  | "setDifficulty"
  | "setAIExamples"
  | "updateWordMeta"
> = {
  words: {},
  currentSession: null,
  totalWords: 0,
  totalLearned: 0,
  totalMastered: 0,
  totalDueToday: 0,
};

// ─── Store ────────────────────────────────────────────────────────────────────

export const useVocabularyStore = create<VocabularyState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialVocabularyState,

        // ── addWord ───────────────────────────────────────────────────────
        addWord: (input: VocabularyWordInput): string => {
          const wordId = generateId();
          const word: VocabularyWord = {
            ...input,
            wordId,
            ...initialSM2State(),
          };

          set((state) => {
            const words = { ...state.words, [wordId]: word };
            return { words, ...computeCounters(words) };
          });

          return wordId;
        },

        // ── addWords ──────────────────────────────────────────────────────
        addWords: (inputs: VocabularyWordInput[]) => {
          set((state) => {
            const words = { ...state.words };
            for (const input of inputs) {
              const wordId = generateId();
              words[wordId] = { ...input, wordId, ...initialSM2State() };
            }
            return { words, ...computeCounters(words) };
          });
        },

        // ── reviewWord ────────────────────────────────────────────────────
        reviewWord: (wordId: string, quality: RecallQuality): number => {
          const word = get().words[wordId];
          if (!word) return 0;

          const sm2 = applySpacedRepetition(word, quality);
          const correct = quality >= 3;
          const xp = xpForQuality(quality);

          set((state) => {
            const updatedWord: VocabularyWord = {
              ...word,
              ...sm2,
              lastReviewedAt: now(),
              totalReviews: word.totalReviews + 1,
              correctReviews: word.correctReviews + (correct ? 1 : 0),
              incorrectReviews: word.incorrectReviews + (correct ? 0 : 1),
              accuracy:
                (word.correctReviews + (correct ? 1 : 0)) /
                (word.totalReviews + 1),
            };

            const words = { ...state.words, [wordId]: updatedWord };

            // Update session if active
            const currentSession = state.currentSession
              ? {
                  ...state.currentSession,
                  reviewedWordIds: [
                    ...new Set([...state.currentSession.reviewedWordIds, wordId]),
                  ],
                  correctWordIds: correct
                    ? [...new Set([...state.currentSession.correctWordIds, wordId])]
                    : state.currentSession.correctWordIds,
                  incorrectWordIds: !correct
                    ? [...new Set([...state.currentSession.incorrectWordIds, wordId])]
                    : state.currentSession.incorrectWordIds,
                  xpEarned: state.currentSession.xpEarned + xp,
                }
              : state.currentSession;

            return { words, currentSession, ...computeCounters(words) };
          });

          return xp;
        },

        // ── removeWord ────────────────────────────────────────────────────
        removeWord: (wordId: string) => {
          set((state) => {
            const { [wordId]: _, ...words } = state.words;
            return { words, ...computeCounters(words) };
          });
        },

        // ── startSession ──────────────────────────────────────────────────
        startSession: (wordIds: string[]) => {
          const session: VocabularySession = {
            sessionId: generateSessionId(),
            startedAt: now(),
            wordIds: [...new Set(wordIds)],
            reviewedWordIds: [],
            correctWordIds: [],
            incorrectWordIds: [],
            xpEarned: 0,
          };
          set({ currentSession: session });
        },

        // ── endSession ────────────────────────────────────────────────────
        endSession: (): VocabularySession | null => {
          const session = get().currentSession;
          set({ currentSession: null });
          return session;
        },

        // ── getDueWords ───────────────────────────────────────────────────
        getDueWords: (): VocabularyWord[] => {
          const today = todayString();
          return Object.values(get().words)
            .filter((w) => w.nextReviewDate <= today && w.status !== "mastered")
            .sort((a, b) => {
              // Priority: overdue first, then by status (learning > reviewing > new)
              const daysDiff =
                a.nextReviewDate.localeCompare(b.nextReviewDate);
              if (daysDiff !== 0) return daysDiff;
              const statusOrder: Record<string, number> = {
                learning: 0, reviewing: 1, new: 2, mastered: 3,
              };
              return (statusOrder[a.status] ?? 3) - (statusOrder[b.status] ?? 3);
            });
        },

        // ── recomputeCounters ─────────────────────────────────────────────
        recomputeCounters: () => {
          set((state) => computeCounters(state.words));
        },

        // ── toggleFavorite ────────────────────────────────────────────────
        toggleFavorite: (wordId: string) => {
          set((state) => {
            const word = state.words[wordId];
            if (!word) return state;
            return {
              words: {
                ...state.words,
                [wordId]: { ...word, isFavorite: !word.isFavorite },
              },
            };
          });
        },

        // ── setDifficulty ─────────────────────────────────────────────────
        setDifficulty: (wordId: string, difficulty: 1 | 2 | 3 | 4 | 5) => {
          set((state) => {
            const word = state.words[wordId];
            if (!word) return state;
            return {
              words: { ...state.words, [wordId]: { ...word, difficulty } },
            };
          });
        },

        // ── setAIExamples ─────────────────────────────────────────────────
        setAIExamples: (wordId: string, examples: string[]) => {
          set((state) => {
            const word = state.words[wordId];
            if (!word) return state;
            return {
              words: { ...state.words, [wordId]: { ...word, aiExamples: examples } },
            };
          });
        },

        // ── updateWordMeta ────────────────────────────────────────────────
        updateWordMeta: (wordId, updates) => {
          set((state) => {
            const word = state.words[wordId];
            if (!word) return state;
            return {
              words: { ...state.words, [wordId]: { ...word, ...updates } },
            };
          });
        },

        // ── resetAll ──────────────────────────────────────────────────────
        resetAll: () => set({ ...initialVocabularyState }),
      }),
      {
        name: "ll:vocabulary",
        version: 1,
        // Recompute counters on hydration (they're not persisted)
        onRehydrateStorage: () => (state) => {
          if (state) {
            const counters = computeCounters(state.words);
            Object.assign(state, counters);
          }
        },
        partialize: ({ words, currentSession }) => ({ words, currentSession }),
      }
    ),
    { name: "VocabularyStore" }
  )
);

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectWord = (wordId: string) => (s: VocabularyState) =>
  s.words[wordId] ?? null;
export const selectWordsByStatus =
  (status: VocabularyWord["status"]) => (s: VocabularyState) =>
    Object.values(s.words).filter((w) => w.status === status);
export const selectWordsByCategory =
  (category: VocabularyWord["category"]) => (s: VocabularyState) =>
    Object.values(s.words).filter((w) => w.category === category);
export const selectCurrentSession = (s: VocabularyState) => s.currentSession;
export const selectVocabStats = (s: VocabularyState) => ({
  totalWords: s.totalWords,
  totalLearned: s.totalLearned,
  totalMastered: s.totalMastered,
  totalDueToday: s.totalDueToday,
});
