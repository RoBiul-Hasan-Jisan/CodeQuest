// ─── Achievement system ────────────────────────────────────────────────────────

export type AchievementCategory =
  | "streak"
  | "xp"
  | "vocabulary"
  | "grammar"
  | "lessons"
  | "special";

export type AchievementTier = "bronze" | "silver" | "gold" | "platinum";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  /** Emoji or icon identifier */
  icon: string;
  category: AchievementCategory;
  tier: AchievementTier;
  xpReward: number;
  /** ISO 8601 — when the user unlocked it */
  unlockedAt: string;
}

export type AchievementInput = Omit<Achievement, "unlockedAt">;

// ─── Achievement definitions ──────────────────────────────────────────────────

/** Preset achievements. Pass `id` to `unlockAchievement` to award one. */
export const ACHIEVEMENT_DEFINITIONS: Omit<Achievement, "unlockedAt">[] = [
  // Streak
  { id: "streak_3",   title: "Hat Trick",       description: "Maintain a 3-day streak",       icon: "🔥", category: "streak",     tier: "bronze",   xpReward: 30  },
  { id: "streak_7",   title: "Week Warrior",     description: "Maintain a 7-day streak",       icon: "🔥", category: "streak",     tier: "silver",   xpReward: 75  },
  { id: "streak_30",  title: "Monthly Master",   description: "Maintain a 30-day streak",      icon: "🔥", category: "streak",     tier: "gold",     xpReward: 200 },
  { id: "streak_100", title: "Century Streak",   description: "Maintain a 100-day streak",     icon: "🔥", category: "streak",     tier: "platinum", xpReward: 500 },
  // XP
  { id: "xp_500",     title: "First Steps",      description: "Earn 500 total XP",             icon: "⭐", category: "xp",         tier: "bronze",   xpReward: 25  },
  { id: "xp_2000",    title: "Rising Star",      description: "Earn 2,000 total XP",           icon: "⭐", category: "xp",         tier: "silver",   xpReward: 100 },
  { id: "xp_10000",   title: "XP Legend",        description: "Earn 10,000 total XP",          icon: "⭐", category: "xp",         tier: "gold",     xpReward: 300 },
  // Vocabulary
  { id: "vocab_50",   title: "Word Collector",   description: "Add 50 words to your library",  icon: "📚", category: "vocabulary", tier: "bronze",   xpReward: 50  },
  { id: "vocab_200",  title: "Lexicon Builder",  description: "Add 200 words to your library", icon: "📚", category: "vocabulary", tier: "silver",   xpReward: 150 },
  { id: "vocab_m10",  title: "Master Speaker",   description: "Master 10 vocabulary words",    icon: "🧠", category: "vocabulary", tier: "bronze",   xpReward: 40  },
  // Grammar
  { id: "gram_a",     title: "Grammar A",        description: "Reach grade A in any topic",    icon: "✏️", category: "grammar",    tier: "silver",   xpReward: 75  },
  { id: "gram_s",     title: "Perfectionist",    description: "Reach grade S in any topic",    icon: "✏️", category: "grammar",    tier: "gold",     xpReward: 200 },
  // Lessons
  { id: "lesson_1",   title: "First Lesson",     description: "Complete your first lesson",    icon: "🎓", category: "lessons",    tier: "bronze",   xpReward: 20  },
  { id: "lesson_10",  title: "Dedicated Learner",description: "Complete 10 lessons",           icon: "🎓", category: "lessons",    tier: "silver",   xpReward: 100 },
  { id: "lesson_50",  title: "Course Champion",  description: "Complete 50 lessons",           icon: "🎓", category: "lessons",    tier: "gold",     xpReward: 250 },
  // Special
  { id: "first_login",title: "Welcome!",         description: "Joined Language Learning",      icon: "🌍", category: "special",    tier: "bronze",   xpReward: 10  },
] as const;

// ─── Weekly activity entry ─────────────────────────────────────────────────────

export interface WeeklyActivity {
  /** YYYY-MM-DD */
  date: string;
  xp: number;
  minutesPracticed: number;
  lessonsCompleted: number;
  wordsReviewed: number;
}

// ─── Dashboard snapshot ───────────────────────────────────────────────────────

/**
 * Pre-computed aggregated snapshot of the user's state.
 * Populated via `updateSnapshot` which is typically called from a hook
 * that reads across all feature stores.
 */
export interface DashboardSnapshot {
  /** ISO 8601 — when the snapshot was last computed */
  updatedAt: string;

  // ── Progress & XP ─────────────────────────────────────────────────────
  totalXP: number;
  level: number;
  /** 0–1 fraction through current level */
  levelProgress: number;
  xpToNextLevel: number;

  // ── Streak ────────────────────────────────────────────────────────────
  currentStreak: number;
  longestStreak: number;
  todayGoalCompleted: boolean;
  streakFreezes: number;

  // ── Vocabulary ────────────────────────────────────────────────────────
  totalWordsLearned: number;
  totalWordsMastered: number;
  wordsDueToday: number;
  vocabularyAccuracy: number; // 0–1

  // ── Grammar ───────────────────────────────────────────────────────────
  overallGrammarScore: number; // 0–100
  masteredGrammarTopics: number;
  weakGrammarTopics: number;

  // ── Courses ───────────────────────────────────────────────────────────
  activeCourses: number;
  completedCourses: number;
  totalLessonsCompleted: number;
}

// ─── Store state ──────────────────────────────────────────────────────────────

export interface DashboardState {
  snapshot: DashboardSnapshot | null;
  weeklyActivity: WeeklyActivity[];
  achievements: Achievement[];
  /** Set of unlocked achievement IDs for O(1) lookup */
  unlockedIds: string[];
  /** Last 5 newly unlocked achievements (for toast/celebration) */
  recentAchievements: Achievement[];

  // ── Actions ───────────────────────────────────────────────────────────
  updateSnapshot: (data: Partial<Omit<DashboardSnapshot, "updatedAt">>) => void;
  /**
   * Attempt to unlock an achievement.
   * Returns the achievement if newly unlocked, null if already unlocked.
   */
  unlockAchievement: (idOrInput: string | AchievementInput) => Achievement | null;
  updateWeeklyActivity: (day: Omit<WeeklyActivity, "date"> & { date?: string }) => void;
  /** Clear the recentAchievements queue (call after showing notifications). */
  clearRecentAchievements: () => void;
  resetAll: () => void;
}
