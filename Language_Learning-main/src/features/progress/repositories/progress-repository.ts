import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";


import { COLLECTIONS } from "@/lib/constants";
import { createSubConverter } from "@/lib/firebase/converters";
import { normalizeError } from "@/lib/firebase/errors";
import { db } from "@/lib/firebase/firestore";

import type {
  LessonProgressDoc,
  QuizProgressDoc,
  RecordLessonInput,
  RecordQuizInput,
  RecordVocabReviewInput,
  UserProgressSummary,
  VocabProgressDoc,
} from "../types/firestore";


/* ============================================================================
   ProgressRepository — /progress/{userId} + subcollections
   ============================================================================ */

export interface IProgressRepository {
  // Root summary document
  getSummary(userId: string): Promise<UserProgressSummary | null>;
  upsertSummary(userId: string, data: Partial<UserProgressSummary>): Promise<void>;
  initSummary(userId: string): Promise<void>;

  // Lesson progress subcollection
  getLessonProgress(userId: string, lessonId: string): Promise<LessonProgressDoc | null>;
  getAllLessonProgress(userId: string): Promise<LessonProgressDoc[]>;
  recordLesson(userId: string, lessonId: string, input: RecordLessonInput): Promise<void>;

  // Vocabulary progress subcollection
  getVocabProgress(userId: string, wordId: string): Promise<VocabProgressDoc | null>;
  getDueVocabProgress(userId: string, today: string): Promise<VocabProgressDoc[]>;
  recordVocabReview(userId: string, input: RecordVocabReviewInput): Promise<void>;

  // Quiz progress subcollection
  getQuizProgress(userId: string, quizId: string): Promise<QuizProgressDoc | null>;
  getAllQuizProgress(userId: string): Promise<QuizProgressDoc[]>;
  recordQuiz(userId: string, quizId: string, input: RecordQuizInput): Promise<void>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function userDocRef(userId: string) {
  return doc(db, COLLECTIONS.PROGRESS, userId);
}

function lessonsCol(userId: string) {
  return collection(db, COLLECTIONS.PROGRESS, userId, "lessons").withConverter(
    createSubConverter<LessonProgressDoc>()
  );
}

function lessonDocRef(userId: string, lessonId: string) {
  return doc(db, COLLECTIONS.PROGRESS, userId, "lessons", lessonId).withConverter(
    createSubConverter<LessonProgressDoc>()
  );
}

function vocabularyCol(userId: string) {
  return collection(db, COLLECTIONS.PROGRESS, userId, "vocabulary").withConverter(
    createSubConverter<VocabProgressDoc>()
  );
}

function vocabDocRef(userId: string, wordId: string) {
  return doc(db, COLLECTIONS.PROGRESS, userId, "vocabulary", wordId).withConverter(
    createSubConverter<VocabProgressDoc>()
  );
}

function quizzesCol(userId: string) {
  return collection(db, COLLECTIONS.PROGRESS, userId, "quizzes").withConverter(
    createSubConverter<QuizProgressDoc>()
  );
}

function quizDocRef(userId: string, quizId: string) {
  return doc(db, COLLECTIONS.PROGRESS, userId, "quizzes", quizId).withConverter(
    createSubConverter<QuizProgressDoc>()
  );
}

function nowISO() {
  return new Date().toISOString();
}

// ─── Implementation ────────────────────────────────────────────────────────────

class ProgressRepository implements IProgressRepository {
  // ── Summary ────────────────────────────────────────────────────────────────

  async getSummary(userId: string): Promise<UserProgressSummary | null> {
    try {
      const snap = await getDoc(userDocRef(userId));
      if (!snap.exists()) return null;
      return snap.data() as UserProgressSummary;
    } catch (err) {
      throw normalizeError(err);
    }
  }

  async upsertSummary(userId: string, data: Partial<UserProgressSummary>): Promise<void> {
    try {
      const ref = userDocRef(userId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
      } else {
        await setDoc(ref, {
          id: userId,
          totalXP: 0,
          totalLessonsCompleted: 0,
          totalQuizzesPassed: 0,
          totalWordsMastered: 0,
          totalWordsLearned: 0,
          currentStreak: 0,
          longestStreak: 0,
          lastActiveDate: null,
          createdAt: nowISO(),
          updatedAt: nowISO(),
          ...data,
        });
      }
    } catch (err) {
      throw normalizeError(err);
    }
  }

  async initSummary(userId: string): Promise<void> {
    try {
      const ref = userDocRef(userId);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        await setDoc(ref, {
          id: userId,
          totalXP: 0,
          totalLessonsCompleted: 0,
          totalQuizzesPassed: 0,
          totalWordsMastered: 0,
          totalWordsLearned: 0,
          currentStreak: 0,
          longestStreak: 0,
          lastActiveDate: null,
          createdAt: nowISO(),
          updatedAt: nowISO(),
        });
      }
    } catch (err) {
      throw normalizeError(err);
    }
  }

  // ── Lesson progress ────────────────────────────────────────────────────────

  async getLessonProgress(userId: string, lessonId: string): Promise<LessonProgressDoc | null> {
    try {
      const snap = await getDoc(lessonDocRef(userId, lessonId));
      return snap.exists() ? snap.data() : null;
    } catch (err) {
      throw normalizeError(err);
    }
  }

  async getAllLessonProgress(userId: string): Promise<LessonProgressDoc[]> {
    try {
      const snap = await getDocs(lessonsCol(userId));
      return snap.docs.map((d) => d.data());
    } catch (err) {
      throw normalizeError(err);
    }
  }

  async recordLesson(userId: string, lessonId: string, input: RecordLessonInput): Promise<void> {
    try {
      const ref = lessonDocRef(userId, lessonId);
      const existing = await getDoc(ref);
      const now = nowISO();

      if (!existing.exists()) {
        // First attempt
        await setDoc(ref as unknown as Parameters<typeof setDoc>[0], {
          id: lessonId,
          userId,
          completed: true,
          score: input.score,
          bestScore: input.score,
          attempts: 1,
          timeSpentSeconds: input.timeSpentSeconds,
          completedAt: now,
          lastAttemptAt: now,
          xpEarned: input.xpEarned,
          createdAt: now,
          updatedAt: now,
        });
        // Increment summary
        await this.upsertSummary(userId, {
          totalLessonsCompleted: await this._incrementField(userId, "totalLessonsCompleted"),
          totalXP: await this._incrementField(userId, "totalXP", input.xpEarned),
          lastActiveDate: now.slice(0, 10),
        });
      } else {
        const prev = existing.data() as LessonProgressDoc;
        const newBest = Math.max(prev.bestScore, input.score);
        const isFirstCompletion = !prev.completed;

        await updateDoc(ref as unknown as Parameters<typeof updateDoc>[0], {
          score: input.score,
          bestScore: newBest,
          attempts: prev.attempts + 1,
          timeSpentSeconds: prev.timeSpentSeconds + input.timeSpentSeconds,
          completedAt: prev.completedAt ?? now,
          lastAttemptAt: now,
          xpEarned: isFirstCompletion ? input.xpEarned : prev.xpEarned,
          completed: true,
          updatedAt: now,
        });

        if (isFirstCompletion) {
          await this.upsertSummary(userId, {
            totalLessonsCompleted: await this._incrementField(userId, "totalLessonsCompleted"),
            totalXP: await this._incrementField(userId, "totalXP", input.xpEarned),
            lastActiveDate: now.slice(0, 10),
          });
        } else {
          await this.upsertSummary(userId, { lastActiveDate: now.slice(0, 10) });
        }
      }
    } catch (err) {
      throw normalizeError(err);
    }
  }

  // ── Vocabulary progress ────────────────────────────────────────────────────

  async getVocabProgress(userId: string, wordId: string): Promise<VocabProgressDoc | null> {
    try {
      const snap = await getDoc(vocabDocRef(userId, wordId));
      return snap.exists() ? snap.data() : null;
    } catch (err) {
      throw normalizeError(err);
    }
  }

  async getDueVocabProgress(userId: string, today: string): Promise<VocabProgressDoc[]> {
    try {
      const q = query(vocabularyCol(userId), where("nextReviewDate", "<=", today));
      const snap = await getDocs(q);
      return snap.docs.map((d) => d.data());
    } catch (err) {
      throw normalizeError(err);
    }
  }

  async recordVocabReview(userId: string, input: RecordVocabReviewInput): Promise<void> {
    try {
      const ref = vocabDocRef(userId, input.wordId);
      const existing = await getDoc(ref);
      const now = nowISO();

      if (!existing.exists()) {
        await setDoc(ref as unknown as Parameters<typeof setDoc>[0], {
          id: input.wordId,
          userId,
          status: input.srsUpdate.status,
          easinessFactor: input.srsUpdate.easinessFactor,
          interval: input.srsUpdate.interval,
          repetitions: input.srsUpdate.repetitions,
          nextReviewDate: input.srsUpdate.nextReviewDate,
          lastReviewedAt: now,
          correctReviews: input.correct ? 1 : 0,
          incorrectReviews: input.correct ? 0 : 1,
          accuracy: input.correct ? 1 : 0,
          createdAt: now,
          updatedAt: now,
        });
        await this.upsertSummary(userId, {
          totalWordsLearned: await this._incrementField(userId, "totalWordsLearned"),
          lastActiveDate: now.slice(0, 10),
        });
      } else {
        const prev = existing.data() as VocabProgressDoc;
        const wasNotMastered = prev.status !== "mastered";
        const nowMastered = input.srsUpdate.status === "mastered";
        const correctReviews = prev.correctReviews + (input.correct ? 1 : 0);
        const incorrectReviews = prev.incorrectReviews + (input.correct ? 0 : 1);
        const totalReviews = correctReviews + incorrectReviews;
        const accuracy = totalReviews > 0 ? correctReviews / totalReviews : 0;

        await updateDoc(ref as unknown as Parameters<typeof updateDoc>[0], {
          status: input.srsUpdate.status,
          easinessFactor: input.srsUpdate.easinessFactor,
          interval: input.srsUpdate.interval,
          repetitions: input.srsUpdate.repetitions,
          nextReviewDate: input.srsUpdate.nextReviewDate,
          lastReviewedAt: now,
          correctReviews,
          incorrectReviews,
          accuracy,
          updatedAt: now,
        });

        if (wasNotMastered && nowMastered) {
          await this.upsertSummary(userId, {
            totalWordsMastered: await this._incrementField(userId, "totalWordsMastered"),
            lastActiveDate: now.slice(0, 10),
          });
        } else {
          await this.upsertSummary(userId, { lastActiveDate: now.slice(0, 10) });
        }
      }
    } catch (err) {
      throw normalizeError(err);
    }
  }

  // ── Quiz progress ──────────────────────────────────────────────────────────

  async getQuizProgress(userId: string, quizId: string): Promise<QuizProgressDoc | null> {
    try {
      const snap = await getDoc(quizDocRef(userId, quizId));
      return snap.exists() ? snap.data() : null;
    } catch (err) {
      throw normalizeError(err);
    }
  }

  async getAllQuizProgress(userId: string): Promise<QuizProgressDoc[]> {
    try {
      const snap = await getDocs(quizzesCol(userId));
      return snap.docs.map((d) => d.data());
    } catch (err) {
      throw normalizeError(err);
    }
  }

  async recordQuiz(userId: string, quizId: string, input: RecordQuizInput): Promise<void> {
    try {
      const ref = quizDocRef(userId, quizId);
      const existing = await getDoc(ref);
      const now = nowISO();

      if (!existing.exists()) {
        await setDoc(ref as unknown as Parameters<typeof setDoc>[0], {
          id: quizId,
          userId,
          bestScore: input.score,
          lastScore: input.score,
          attempts: 1,
          passed: input.passed,
          lastAttemptAt: now,
          xpEarned: input.xpEarned,
          createdAt: now,
          updatedAt: now,
        });
        if (input.passed) {
          await this.upsertSummary(userId, {
            totalQuizzesPassed: await this._incrementField(userId, "totalQuizzesPassed"),
            totalXP: await this._incrementField(userId, "totalXP", input.xpEarned),
            lastActiveDate: now.slice(0, 10),
          });
        } else {
          await this.upsertSummary(userId, { lastActiveDate: now.slice(0, 10) });
        }
      } else {
        const prev = existing.data() as QuizProgressDoc;
        const isFirstPass = !prev.passed && input.passed;
        const newBest = Math.max(prev.bestScore, input.score);

        await updateDoc(ref as unknown as Parameters<typeof updateDoc>[0], {
          bestScore: newBest,
          lastScore: input.score,
          attempts: prev.attempts + 1,
          passed: prev.passed || input.passed,
          lastAttemptAt: now,
          xpEarned: isFirstPass ? input.xpEarned : prev.xpEarned,
          updatedAt: now,
        });

        if (isFirstPass) {
          await this.upsertSummary(userId, {
            totalQuizzesPassed: await this._incrementField(userId, "totalQuizzesPassed"),
            totalXP: await this._incrementField(userId, "totalXP", input.xpEarned),
            lastActiveDate: now.slice(0, 10),
          });
        } else {
          await this.upsertSummary(userId, { lastActiveDate: now.slice(0, 10) });
        }
      }
    } catch (err) {
      throw normalizeError(err);
    }
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  /** Read current value of a numeric field and return value + delta. */
  private async _incrementField(
    userId: string,
    field: keyof UserProgressSummary,
    delta = 1
  ): Promise<number> {
    const summary = await this.getSummary(userId);
    const current = (summary?.[field] as number | null) ?? 0;
    return current + delta;
  }
}

// ─── Singleton ─────────────────────────────────────────────────────────────────

export const progressRepository = new ProgressRepository();
