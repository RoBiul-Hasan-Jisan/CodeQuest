import type { RecallQuality } from "@/features/vocabulary/types";
import { applySpacedRepetition } from "@/features/vocabulary/types";

import { progressRepository, type IProgressRepository } from "../repositories/progress-repository";
import type {
  LessonProgressDoc,
  QuizProgressDoc,
  RecordLessonInput,
  RecordQuizInput,
  UserProgressSummary,
  VocabProgressDoc,
} from "../types/firestore";



/* ============================================================================
   ProgressService — coordinates Firestore persistence for all progress types
   ============================================================================ */

class ProgressService {
  constructor(private readonly repo: IProgressRepository) {}

  // ── Summary ────────────────────────────────────────────────────────────────

  async getUserStats(userId: string): Promise<UserProgressSummary | null> {
    return this.repo.getSummary(userId);
  }

  /** Ensure a summary document exists for a newly registered user. */
  async initUserProgress(userId: string): Promise<void> {
    return this.repo.initSummary(userId);
  }

  /** Sync streak data from the local Zustand store to Firestore. */
  async syncStreakToFirestore(
    userId: string,
    currentStreak: number,
    longestStreak: number,
    lastActiveDate: string | null
  ): Promise<void> {
    return this.repo.upsertSummary(userId, { currentStreak, longestStreak, lastActiveDate });
  }

  // ── Lesson ─────────────────────────────────────────────────────────────────

  async getLessonProgress(userId: string, lessonId: string): Promise<LessonProgressDoc | null> {
    return this.repo.getLessonProgress(userId, lessonId);
  }

  async getAllLessonProgress(userId: string): Promise<LessonProgressDoc[]> {
    return this.repo.getAllLessonProgress(userId);
  }

  async recordLessonCompletion(
    userId: string,
    lessonId: string,
    input: RecordLessonInput
  ): Promise<void> {
    await this.repo.recordLesson(userId, lessonId, input);
  }

  // ── Vocabulary ─────────────────────────────────────────────────────────────

  async getVocabProgress(userId: string, wordId: string): Promise<VocabProgressDoc | null> {
    return this.repo.getVocabProgress(userId, wordId);
  }

  /**
   * Return words due for review today.
   * `today` should be YYYY-MM-DD in local time.
   */
  async getDueWords(userId: string, today: string): Promise<VocabProgressDoc[]> {
    return this.repo.getDueVocabProgress(userId, today);
  }

  /**
   * Apply SM-2 algorithm and persist the result.
   * The service computes srsUpdate so callers only need wordId + quality.
   */
  async recordVocabReview(
    userId: string,
    wordId: string,
    quality: RecallQuality,
    correct: boolean
  ): Promise<VocabProgressDoc | null> {
    const existing = await this.repo.getVocabProgress(userId, wordId);

    // Build a minimal SM-2 compatible object for the algorithm
    const currentWord = existing
      ? {
          easinessFactor: existing.easinessFactor,
          interval: existing.interval,
          repetitions: existing.repetitions,
          nextReviewDate: existing.nextReviewDate,
          status: existing.status,
          // Required by applySpacedRepetition but not stored in progress
          id: wordId,
          word: "",
          translation: "",
          language: "",
          category: "",
          lastReviewedAt: existing.lastReviewedAt,
          correctReviews: existing.correctReviews,
          incorrectReviews: existing.incorrectReviews,
          accuracy: existing.accuracy,
          addedAt: existing.createdAt,
        }
      : null;

    const srsUpdate = currentWord
      ? applySpacedRepetition(currentWord as Parameters<typeof applySpacedRepetition>[0], quality)
      : {
          easinessFactor: 2.5,
          interval: correct ? 1 : 0,
          repetitions: correct ? 1 : 0,
          nextReviewDate: new Date(Date.now() + (correct ? 86400000 : 0))
            .toISOString()
            .slice(0, 10),
          status: "learning" as const,
        };

    await this.repo.recordVocabReview(userId, {
      wordId,
      quality,
      srsUpdate,
      correct,
    });

    return this.repo.getVocabProgress(userId, wordId);
  }

  // ── Quiz ───────────────────────────────────────────────────────────────────

  async getQuizProgress(userId: string, quizId: string): Promise<QuizProgressDoc | null> {
    return this.repo.getQuizProgress(userId, quizId);
  }

  async getAllQuizProgress(userId: string): Promise<QuizProgressDoc[]> {
    return this.repo.getAllQuizProgress(userId);
  }

  async recordQuizAttempt(
    userId: string,
    quizId: string,
    input: RecordQuizInput
  ): Promise<void> {
    await this.repo.recordQuiz(userId, quizId, input);
  }
}

export const progressService = new ProgressService(progressRepository);
