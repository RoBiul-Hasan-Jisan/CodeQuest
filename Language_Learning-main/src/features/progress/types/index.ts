// ─── Primitives ───────────────────────────────────────────────────────────────

export type DifficultyLevel = "beginner" | "intermediate" | "advanced";

export type LanguageCode =
  | "es" // Spanish
  | "fr" // French
  | "de" // German
  | "it" // Italian
  | "pt" // Portuguese
  | "ja" // Japanese
  | "zh" // Chinese
  | "ko" // Korean
  | "ar" // Arabic
  | "ru"; // Russian

// ─── XP / Level system ────────────────────────────────────────────────────────

/**
 * Cumulative XP thresholds per level (index = level - 1).
 * Level 1 starts at 0 XP. Max defined level = 20.
 */
export const XP_LEVEL_THRESHOLDS: readonly number[] = [
  0,      //  1
  200,    //  2
  500,    //  3
  950,    //  4
  1_500,  //  5
  2_200,  //  6
  3_050,  //  7
  4_050,  //  8
  5_200,  //  9
  6_500,  // 10
  8_000,  // 11
  9_700,  // 12
  11_600, // 13
  13_700, // 14
  16_000, // 15
  18_500, // 16
  21_200, // 17
  24_100, // 18
  27_200, // 19
  30_500, // 20
] as const;

export const MAX_LEVEL = XP_LEVEL_THRESHOLDS.length;

export interface LevelInfo {
  level: number;
  /** Total accumulated XP */
  totalXP: number;
  /** XP at the start of the current level */
  xpForCurrentLevel: number;
  /** XP needed to reach the next level (absolute) */
  xpForNextLevel: number;
  /** Fraction through the current level band, 0–1 */
  levelProgress: number;
  /** XP still needed to level up */
  xpToNextLevel: number;
  isMaxLevel: boolean;
}

/** Pure function — compute level info from raw XP. */
export function computeLevelInfo(totalXP: number): LevelInfo {
  let level = 1;
  for (let i = 1; i < XP_LEVEL_THRESHOLDS.length; i++) {
    if (totalXP >= XP_LEVEL_THRESHOLDS[i]!) level = i + 1;
    else break;
  }

  const isMaxLevel = level >= MAX_LEVEL;
  const xpForCurrentLevel = XP_LEVEL_THRESHOLDS[level - 1] ?? 0;
  const xpForNextLevel = XP_LEVEL_THRESHOLDS[level] ?? XP_LEVEL_THRESHOLDS[MAX_LEVEL - 1]!;
  const band = xpForNextLevel - xpForCurrentLevel;
  const xpInBand = totalXP - xpForCurrentLevel;
  const levelProgress = isMaxLevel ? 1 : Math.min(1, xpInBand / band);
  const xpToNextLevel = isMaxLevel ? 0 : Math.max(0, xpForNextLevel - totalXP);

  return {
    level,
    totalXP,
    xpForCurrentLevel,
    xpForNextLevel,
    levelProgress,
    xpToNextLevel,
    isMaxLevel,
  };
}

// ─── Course progress ──────────────────────────────────────────────────────────

export interface CourseProgress {
  courseId: string;
  name: string;
  language: LanguageCode;
  level: DifficultyLevel;
  completedLessonIds: string[];
  totalLessons: number;
  /** The lesson currently in progress */
  currentLessonId: string | null;
  xpEarned: number;
  enrolledAt: string; // ISO 8601
  lastAccessedAt: string; // ISO 8601
}

export type CourseProgressInput = Omit<
  CourseProgress,
  "completedLessonIds" | "xpEarned" | "enrolledAt" | "lastAccessedAt" | "currentLessonId"
>;

// ─── Lesson progress ──────────────────────────────────────────────────────────

export interface LessonProgress {
  lessonId: string;
  courseId: string;
  completed: boolean;
  /** Score from the most recent attempt, 0–100 */
  score: number | null;
  /** Highest score across all attempts */
  bestScore: number;
  attempts: number;
  completedAt: string | null; // ISO 8601
  timeSpentSeconds: number;
}

// ─── XP event log ─────────────────────────────────────────────────────────────

export type XPSource =
  | "lesson_complete"
  | "vocabulary_review"
  | "grammar_exercise"
  | "streak_bonus"
  | "achievement"
  | "daily_goal"
  | "manual";

export interface XPEvent {
  amount: number;
  source: XPSource;
  earnedAt: string; // ISO 8601
  meta?: string;    // optional label, e.g. lesson name
}

// ─── Store state ──────────────────────────────────────────────────────────────

export interface ProgressState {
  totalXP: number;
  levelInfo: LevelInfo;
  courses: Record<string, CourseProgress>;
  lessons: Record<string, LessonProgress>;
  /** Bounded log of XP events — max 200 entries */
  xpLog: XPEvent[];

  // ── Actions ───────────────────────────────────────────────────────────────
  earnXP: (amount: number, source: XPSource, meta?: string) => void;
  enrollCourse: (course: CourseProgressInput) => void;
  setCurrentLesson: (courseId: string, lessonId: string) => void;
  completeLesson: (
    lessonId: string,
    courseId: string,
    score: number,
    timeSpentSeconds: number,
    xpReward: number
  ) => void;
  resetCourse: (courseId: string) => void;
  resetAll: () => void;
}
