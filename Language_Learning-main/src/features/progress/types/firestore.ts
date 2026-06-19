/**
 * Firestore progress document types.
 *
 * Structure:
 *   /progress/{userId}/lessons/{lessonId}      → LessonProgressDoc
 *   /progress/{userId}/vocabulary/{wordId}     → VocabProgressDoc
 *   /progress/{userId}/quizzes/{quizId}        → QuizProgressDoc
 *
 * Kept separate from `./index.ts` which owns the local Zustand store types.
 */

import type { RecallQuality } from "@/features/vocabulary/types";

// ─── Lesson progress (/progress/{uid}/lessons/{lessonId}) ─────────────────────

export interface LessonProgressDoc {
  id: string; // = lessonId
  userId: string;
  completed: boolean;
  /** Score from the most recent attempt (0–100) */
  score: number | null;
  bestScore: number;
  attempts: number;
  timeSpentSeconds: number;
  completedAt: string | null; // ISO 8601
  lastAttemptAt: string;      // ISO 8601
  /** XP earned (only granted on first completion) */
  xpEarned: number;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

export type RecordLessonInput = {
  score: number;
  timeSpentSeconds: number;
  xpEarned: number;
};

// ─── Vocabulary progress (/progress/{uid}/vocabulary/{wordId}) ────────────────

export interface VocabProgressDoc {
  id: string; // = wordId
  userId: string;
  /** Maps to VocabularyStatus from local types */
  status: "new" | "learning" | "reviewing" | "mastered";
  /** SM-2 easiness factor (min 1.3) */
  easinessFactor: number;
  interval: number;
  repetitions: number;
  nextReviewDate: string;      // YYYY-MM-DD
  lastReviewedAt: string | null; // ISO 8601
  correctReviews: number;
  incorrectReviews: number;
  accuracy: number;            // 0–1
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

export type RecordVocabReviewInput = {
  wordId: string;
  quality: RecallQuality;
  /** Result of applySpacedRepetition() applied in the service */
  srsUpdate: {
    easinessFactor: number;
    interval: number;
    repetitions: number;
    nextReviewDate: string;
    status: VocabProgressDoc["status"];
  };
  correct: boolean;
};

// ─── Quiz progress (/progress/{uid}/quizzes/{quizId}) ─────────────────────────

export interface QuizProgressDoc {
  id: string; // = quizId
  userId: string;
  bestScore: number;
  lastScore: number | null;
  attempts: number;
  passed: boolean;
  lastAttemptAt: string | null; // ISO 8601
  /** XP earned (only granted for the first pass) */
  xpEarned: number;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

export type RecordQuizInput = {
  score: number;
  passed: boolean;
  xpEarned: number;
  timeTakenSeconds: number;
};

// ─── Aggregated user stats (denormalised document) ────────────────────────────

/** /progress/{userId} root document — fast single-read dashboard stats. */
export interface UserProgressSummary {
  id: string; // = userId
  totalXP: number;
  totalLessonsCompleted: number;
  totalQuizzesPassed: number;
  totalWordsMastered: number;
  totalWordsLearned: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null; // YYYY-MM-DD
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}
