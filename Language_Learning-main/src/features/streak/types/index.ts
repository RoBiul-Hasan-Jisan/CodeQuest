// ─── Day status ───────────────────────────────────────────────────────────────

/** Status of a calendar day in the streak history. */
export type DayStatus =
  | "completed"  // user met their daily goal
  | "partial"    // user practiced but didn't hit goal
  | "missed"     // user was inactive and no freeze was used
  | "frozen"     // streak freeze protected this day
  | "pending";   // today, not yet evaluated

// ─── Streak history entry ─────────────────────────────────────────────────────

export interface StreakDay {
  /** YYYY-MM-DD */
  date: string;
  status: DayStatus;
  xpEarned: number;
  minutesPracticed: number;
  lessonsCompleted: number;
  wordsReviewed: number;
}

// ─── Daily goal ───────────────────────────────────────────────────────────────

export interface DailyGoal {
  /** XP to earn each day */
  xpTarget: number;
  /** Minutes to practice each day */
  minutesTarget: number;
  /** Lessons to complete each day */
  lessonsTarget: number;
}

export const DEFAULT_DAILY_GOAL: DailyGoal = {
  xpTarget: 50,
  minutesTarget: 15,
  lessonsTarget: 1,
};

// ─── Date utilities ───────────────────────────────────────────────────────────

/** Returns today's date as YYYY-MM-DD in local time. */
export function todayDate(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Returns yesterday's date as YYYY-MM-DD. */
export function yesterdayDate(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Returns an array of YYYY-MM-DD strings for the last N days (newest first). */
export function lastNDays(n: number): string[] {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  });
}

/** Days between two YYYY-MM-DD strings. Positive if b > a. */
export function daysBetween(a: string, b: string): number {
  const msPerDay = 86_400_000;
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / msPerDay);
}

// ─── Goal evaluation ──────────────────────────────────────────────────────────

export function evaluateGoal(
  goal: DailyGoal,
  xp: number,
  minutes: number,
  lessons: number
): boolean {
  return xp >= goal.xpTarget || minutes >= goal.minutesTarget || lessons >= goal.lessonsTarget;
}

// ─── Store state ──────────────────────────────────────────────────────────────

export interface StreakState {
  // ── Streak counters ────────────────────────────────────────────────────
  currentStreak: number;
  longestStreak: number;
  totalActiveDays: number;

  // ── Last activity ──────────────────────────────────────────────────────
  /** YYYY-MM-DD of last day the user was active */
  lastActiveDate: string | null;

  // ── Today's running totals ─────────────────────────────────────────────
  todayXP: number;
  todayMinutes: number;
  todayLessons: number;
  todayWordsReviewed: number;
  todayGoalCompleted: boolean;

  // ── Goal configuration ─────────────────────────────────────────────────
  dailyGoal: DailyGoal;

  // ── History (last 30 days) ─────────────────────────────────────────────
  history: StreakDay[];

  // ── Streak freezes (Duolingo shield) ──────────────────────────────────
  streakFreezes: number;

  // ── Actions ───────────────────────────────────────────────────────────
  recordActivity: (params: {
    xp?: number;
    minutes?: number;
    lessons?: number;
    wordsReviewed?: number;
  }) => void;
  setDailyGoal: (goal: Partial<DailyGoal>) => void;
  /** Try to use a streak freeze. Returns true if freeze was applied. */
  useStreakFreeze: () => boolean;
  addStreakFreezes: (count?: number) => void;
  /** Call on app launch to detect missed days and update streak accordingly. */
  syncOnAppLoad: () => void;
  resetAll: () => void;
}
