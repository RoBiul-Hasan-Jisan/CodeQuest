/**
 * Central store barrel.
 * Import any Zustand store or selector from here instead of
 * reaching into feature directories directly.
 *
 * Pattern:
 *   import { useProgressStore, selectLevelInfo } from "@/store";
 */

// ── Global UI store ────────────────────────────────────────────────────────────
export { useUIStore } from "./ui-store";

// ── Auth store ────────────────────────────────────────────────────────────────
export { useAuthStore } from "@/features/auth/store/auth-store";

// ── Progress (XP, levels, courses, lessons) ────────────────────────────────────
export {
  useProgressStore,
  selectTotalXP,
  selectLevelInfo,
  selectCourse,
  selectLesson,
  selectCourseList,
  selectCompletedCourses,
  selectRecentXPEvents,
} from "@/features/progress/store/progress-store";

// ── Vocabulary (words, SRS sessions) ──────────────────────────────────────────
export {
  useVocabularyStore,
  selectWord,
  selectWordsByStatus,
  selectWordsByCategory,
  selectCurrentSession,
  selectVocabStats,
} from "@/features/vocabulary/store/vocabulary-store";

// ── Grammar (topic scores, attempts) ─────────────────────────────────────────
export {
  useGrammarStore,
  selectTopic,
  selectAllTopics,
  selectTopicsByCategory,
  selectGrammarOverview,
  selectRecentAttempts,
  selectTopicHistory,
} from "@/features/grammar/store/grammar-store";

// ── Streak (daily goals, streak counters, history) ────────────────────────────
export {
  useStreakStore,
  selectCurrentStreak,
  selectLongestStreak,
  selectTodayProgress,
  selectStreakHistory,
  selectWeekHistory,
  selectGoalFraction,
} from "@/features/streak/store/streak-store";

// ── Dashboard (snapshot, achievements, weekly activity) ───────────────────────
export {
  useDashboardStore,
  selectSnapshot,
  selectAchievements,
  selectRecentAchievements,
  selectIsAchievementUnlocked,
  selectAchievementsByCategory,
  selectAchievementsByTier,
  selectWeeklyActivity,
  selectTotalAchievementXP,
} from "@/features/dashboard/store/dashboard-store";
