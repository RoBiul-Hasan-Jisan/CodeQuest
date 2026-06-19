import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

import {
  daysBetween,
  DEFAULT_DAILY_GOAL,
  evaluateGoal,
  lastNDays,
  todayDate,
  yesterdayDate,
  type DailyGoal,
  type StreakDay,
  type StreakState,
} from "../types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const HISTORY_DAYS = 30;

/** Build or update the history entry for today. */
function upsertTodayInHistory(
  history: StreakDay[],
  today: string,
  update: Partial<Omit<StreakDay, "date" | "status">>,
  status: StreakDay["status"]
): StreakDay[] {
  const idx = history.findIndex((d) => d.date === today);
  if (idx !== -1) {
    const updated = { ...history[idx]!, ...update, status };
    return [updated, ...history.slice(0, idx), ...history.slice(idx + 1)].slice(
      0,
      HISTORY_DAYS
    );
  }
  const newDay: StreakDay = {
    date: today,
    status,
    xpEarned: update.xpEarned ?? 0,
    minutesPracticed: update.minutesPracticed ?? 0,
    lessonsCompleted: update.lessonsCompleted ?? 0,
    wordsReviewed: update.wordsReviewed ?? 0,
  };
  return [newDay, ...history].slice(0, HISTORY_DAYS);
}

/** Ensure all days in the last 30 days appear in history with the correct status. */
function fillHistoryGaps(
  history: StreakDay[],
  _lastActiveDate: string | null
): StreakDay[] {
  const days = lastNDays(HISTORY_DAYS);
  const historyMap = Object.fromEntries(history.map((d) => [d.date, d]));

  return days.map((date) => {
    if (historyMap[date]) return historyMap[date]!;
    const isPast = date < todayDate();
    return {
      date,
      status: isPast ? "missed" : "pending",
      xpEarned: 0,
      minutesPracticed: 0,
      lessonsCompleted: 0,
      wordsReviewed: 0,
    };
  });
}

// ─── Initial state ─────────────────────────────────────────────────────────────

const initialStreakState: Omit<
  StreakState,
  "recordActivity" | "setDailyGoal" | "useStreakFreeze" | "addStreakFreezes" | "syncOnAppLoad" | "resetAll"
> = {
  currentStreak: 0,
  longestStreak: 0,
  totalActiveDays: 0,
  lastActiveDate: null,
  todayXP: 0,
  todayMinutes: 0,
  todayLessons: 0,
  todayWordsReviewed: 0,
  todayGoalCompleted: false,
  dailyGoal: DEFAULT_DAILY_GOAL,
  history: [],
  streakFreezes: 0,
};

// ─── Store ─────────────────────────────────────────────────────────────────────

export const useStreakStore = create<StreakState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialStreakState,

        // ── recordActivity ─────────────────────────────────────────────
        recordActivity: ({
          xp = 0,
          minutes = 0,
          lessons = 0,
          wordsReviewed = 0,
        }) => {
          set((state) => {
            const today = todayDate();
            const yesterday = yesterdayDate();

            // Accumulate today's totals
            const todayXP = state.todayXP + xp;
            const todayMinutes = state.todayMinutes + minutes;
            const todayLessons = state.todayLessons + lessons;
            const todayWordsReviewed = state.todayWordsReviewed + wordsReviewed;

            const goalMet = evaluateGoal(
              state.dailyGoal,
              todayXP,
              todayMinutes,
              todayLessons
            );

            // ── Streak logic ─────────────────────────────────────────────
            let currentStreak = state.currentStreak;
            let totalActiveDays = state.totalActiveDays;

            if (state.lastActiveDate !== today) {
              // First activity today
              if (
                state.lastActiveDate === yesterday ||
                state.lastActiveDate === null
              ) {
                // Consecutive — extend streak
                currentStreak += 1;
              } else {
                // Gap detected — reset streak to 1 (today is the first day)
                currentStreak = 1;
              }
              totalActiveDays += 1;
            }
            // else: already recorded activity today, just accumulate totals

            const longestStreak = Math.max(state.longestStreak, currentStreak);

            // ── History ───────────────────────────────────────────────────
            const status = goalMet ? "completed" : "partial";
            const history = upsertTodayInHistory(
              state.history,
              today,
              { xpEarned: todayXP, minutesPracticed: todayMinutes, lessonsCompleted: todayLessons, wordsReviewed: todayWordsReviewed },
              status
            );

            return {
              todayXP,
              todayMinutes,
              todayLessons,
              todayWordsReviewed,
              todayGoalCompleted: goalMet,
              currentStreak,
              longestStreak,
              totalActiveDays,
              lastActiveDate: today,
              history,
            };
          });
        },

        // ── setDailyGoal ───────────────────────────────────────────────
        setDailyGoal: (goal: Partial<DailyGoal>) => {
          set((state) => ({
            dailyGoal: { ...state.dailyGoal, ...goal },
          }));
        },

        // ── useStreakFreeze ─────────────────────────────────────────────
        useStreakFreeze: (): boolean => {
          const { streakFreezes, currentStreak } = get();
          if (streakFreezes <= 0 || currentStreak === 0) return false;

          set((state) => {
            const yesterday = yesterdayDate();
            // Mark yesterday as frozen in history
            const history = upsertTodayInHistory(
              state.history,
              yesterday,
              {},
              "frozen"
            );
            return {
              streakFreezes: state.streakFreezes - 1,
              // Restore streak continuity — pretend yesterday was active
              lastActiveDate: yesterday,
              history,
            };
          });

          return true;
        },

        // ── addStreakFreezes ────────────────────────────────────────────
        addStreakFreezes: (count = 1) => {
          set((state) => ({
            streakFreezes: Math.min(state.streakFreezes + count, 5), // max 5 freezes
          }));
        },

        // ── syncOnAppLoad ──────────────────────────────────────────────
        // Call this when the app mounts to handle days where the user didn't open the app.
        syncOnAppLoad: () => {
          set((state) => {
            const today = todayDate();
            const yesterday = yesterdayDate();

            // Reset today's running totals if we haven't done so today
            const isFreshDay = state.lastActiveDate !== today;
            const todayXP = isFreshDay ? 0 : state.todayXP;
            const todayMinutes = isFreshDay ? 0 : state.todayMinutes;
            const todayLessons = isFreshDay ? 0 : state.todayLessons;
            const todayWordsReviewed = isFreshDay ? 0 : state.todayWordsReviewed;
            const todayGoalCompleted = isFreshDay ? false : state.todayGoalCompleted;

            // Determine if streak was broken
            let currentStreak = state.currentStreak;
            if (
              state.lastActiveDate !== today &&
              state.lastActiveDate !== yesterday &&
              state.lastActiveDate !== null
            ) {
              // Last active day was before yesterday — streak broken
              const gap = daysBetween(state.lastActiveDate, today);
              if (gap > 1) {
                currentStreak = 0;
              }
            }

            // Fill gaps in history
            const history = fillHistoryGaps(state.history, state.lastActiveDate);

            return {
              todayXP,
              todayMinutes,
              todayLessons,
              todayWordsReviewed,
              todayGoalCompleted,
              currentStreak,
              history,
            };
          });
        },

        // ── resetAll ────────────────────────────────────────────────────
        resetAll: () => set({ ...initialStreakState }),
      }),
      {
        name: "ll:streak",
        version: 1,
        onRehydrateStorage: () => (state) => {
          // Sync streak state immediately on hydration
          if (state) {
            state.syncOnAppLoad();
          }
        },
      }
    ),
    { name: "StreakStore" }
  )
);

// ─── Selectors ─────────────────────────────────────────────────────────────────

export const selectCurrentStreak = (s: StreakState) => s.currentStreak;
export const selectLongestStreak = (s: StreakState) => s.longestStreak;
export const selectTodayProgress = (s: StreakState) => ({
  xp: s.todayXP,
  minutes: s.todayMinutes,
  lessons: s.todayLessons,
  wordsReviewed: s.todayWordsReviewed,
  goalCompleted: s.todayGoalCompleted,
  goal: s.dailyGoal,
});
export const selectStreakHistory = (s: StreakState) => s.history;
export const selectWeekHistory = (s: StreakState) => {
  const today = todayDate();
  const days = lastNDays(7);
  const historyMap = Object.fromEntries(s.history.map((d) => [d.date, d]));
  return days.map(
    (date): StreakDay =>
      historyMap[date] ?? {
        date,
        status: date < today ? "missed" : "pending",
        xpEarned: 0,
        minutesPracticed: 0,
        lessonsCompleted: 0,
        wordsReviewed: 0,
      }
  );
};
export const selectGoalFraction = (s: StreakState) => ({
  xp: Math.min(1, s.todayXP / (s.dailyGoal.xpTarget || 1)),
  minutes: Math.min(1, s.todayMinutes / (s.dailyGoal.minutesTarget || 1)),
  lessons: Math.min(1, s.todayLessons / (s.dailyGoal.lessonsTarget || 1)),
});
