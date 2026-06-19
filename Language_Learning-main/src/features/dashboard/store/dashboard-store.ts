import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

import {
  ACHIEVEMENT_DEFINITIONS,
  type Achievement,
  type AchievementInput,
  type DashboardSnapshot,
  type DashboardState,
  type WeeklyActivity,
} from "../types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const now = () => new Date().toISOString();
const todayDate = () => new Date().toISOString().split("T")[0]!;
const RECENT_ACHIEVEMENTS_MAX = 5;
const WEEKLY_ACTIVITY_MAX = 30; // keep 30 days

// ─── Initial state ─────────────────────────────────────────────────────────────

const initialDashboardState: Omit<
  DashboardState,
  | "updateSnapshot"
  | "unlockAchievement"
  | "updateWeeklyActivity"
  | "clearRecentAchievements"
  | "resetAll"
> = {
  snapshot: null,
  weeklyActivity: [],
  achievements: [],
  unlockedIds: [],
  recentAchievements: [],
};

// ─── Store ─────────────────────────────────────────────────────────────────────

export const useDashboardStore = create<DashboardState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialDashboardState,

        // ── updateSnapshot ────────────────────────────────────────────────
        updateSnapshot: (data: Partial<Omit<DashboardSnapshot, "updatedAt">>) => {
          set((state) => ({
            snapshot: {
              // Defaults for first-ever snapshot
              totalXP: 0,
              level: 1,
              levelProgress: 0,
              xpToNextLevel: 200,
              currentStreak: 0,
              longestStreak: 0,
              todayGoalCompleted: false,
              streakFreezes: 0,
              totalWordsLearned: 0,
              totalWordsMastered: 0,
              wordsDueToday: 0,
              vocabularyAccuracy: 0,
              overallGrammarScore: 0,
              masteredGrammarTopics: 0,
              weakGrammarTopics: 0,
              activeCourses: 0,
              completedCourses: 0,
              totalLessonsCompleted: 0,
              // Merge with existing snapshot
              ...state.snapshot,
              // Apply new data
              ...data,
              updatedAt: now(),
            },
          }));
        },

        // ── unlockAchievement ─────────────────────────────────────────────
        unlockAchievement: (idOrInput: string | AchievementInput): Achievement | null => {
          const state = get();

          // Resolve the achievement definition
          let input: AchievementInput;
          if (typeof idOrInput === "string") {
            const def = ACHIEVEMENT_DEFINITIONS.find((a) => a.id === idOrInput);
            if (!def) {
              console.warn(`[DashboardStore] Unknown achievement id: "${idOrInput}"`);
              return null;
            }
            input = def;
          } else {
            input = idOrInput;
          }

          // Already unlocked?
          if (state.unlockedIds.includes(input.id)) return null;

          const achievement: Achievement = {
            ...input,
            unlockedAt: now(),
          };

          set((s) => ({
            achievements: [achievement, ...s.achievements],
            unlockedIds: [...s.unlockedIds, achievement.id],
            recentAchievements: [achievement, ...s.recentAchievements].slice(
              0,
              RECENT_ACHIEVEMENTS_MAX
            ),
          }));

          return achievement;
        },

        // ── updateWeeklyActivity ──────────────────────────────────────────
        updateWeeklyActivity: ({
          date = todayDate(),
          xp,
          minutesPracticed,
          lessonsCompleted,
          wordsReviewed,
        }) => {
          set((state) => {
            const idx = state.weeklyActivity.findIndex((d) => d.date === date);

            let weeklyActivity: WeeklyActivity[];
            if (idx !== -1) {
              // Accumulate onto existing day
              const existing = state.weeklyActivity[idx]!;
              const updated: WeeklyActivity = {
                date,
                xp: existing.xp + xp,
                minutesPracticed: existing.minutesPracticed + minutesPracticed,
                lessonsCompleted: existing.lessonsCompleted + lessonsCompleted,
                wordsReviewed: existing.wordsReviewed + wordsReviewed,
              };
              weeklyActivity = [
                ...state.weeklyActivity.slice(0, idx),
                updated,
                ...state.weeklyActivity.slice(idx + 1),
              ].slice(0, WEEKLY_ACTIVITY_MAX);
            } else {
              weeklyActivity = [
                { date, xp, minutesPracticed, lessonsCompleted, wordsReviewed },
                ...state.weeklyActivity,
              ].slice(0, WEEKLY_ACTIVITY_MAX);
            }

            return { weeklyActivity };
          });
        },

        // ── clearRecentAchievements ───────────────────────────────────────
        clearRecentAchievements: () => {
          set({ recentAchievements: [] });
        },

        // ── resetAll ──────────────────────────────────────────────────────
        resetAll: () => set({ ...initialDashboardState }),
      }),
      {
        name: "ll:dashboard",
        version: 1,
      }
    ),
    { name: "DashboardStore" }
  )
);

// ─── Selectors ─────────────────────────────────────────────────────────────────

export const selectSnapshot = (s: DashboardState) => s.snapshot;
export const selectAchievements = (s: DashboardState) => s.achievements;
export const selectRecentAchievements = (s: DashboardState) => s.recentAchievements;
export const selectIsAchievementUnlocked = (id: string) => (s: DashboardState) =>
  s.unlockedIds.includes(id);
export const selectAchievementsByCategory =
  (category: Achievement["category"]) => (s: DashboardState) =>
    s.achievements.filter((a) => a.category === category);
export const selectAchievementsByTier =
  (tier: Achievement["tier"]) => (s: DashboardState) =>
    s.achievements.filter((a) => a.tier === tier);
export const selectWeeklyActivity = (days = 7) => (s: DashboardState) =>
  [...s.weeklyActivity]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, days)
    .reverse();
export const selectTotalAchievementXP = (s: DashboardState) =>
  s.achievements.reduce((acc, a) => acc + a.xpReward, 0);
