import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  increment,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type FirestoreDataConverter,
} from "firebase/firestore";


import { COLLECTIONS } from "@/lib/constants";
import { BaseRepository } from "@/lib/firebase/base-repository";
import { createConverter, createSubConverter } from "@/lib/firebase/converters";
import { normalizeError } from "@/lib/firebase/errors";
import { db } from "@/lib/firebase/firestore";

import type {
  CreateQuestionInput,
  CreateQuizInput,
  Quiz,
  QuizListFilters,
  QuizQuestion,
  UpdateQuestionInput,
  UpdateQuizInput,
} from "../types";


/* ============================================================================
   QuizRepository — /quizzes collection + questions subcollection
   ============================================================================ */

export interface IQuizRepository {
  findById(id: string): Promise<Quiz | null>;
  findMany(filters?: QuizListFilters): Promise<Quiz[]>;
  findByLesson(lessonId: string): Promise<Quiz[]>;
  create(data: CreateQuizInput): Promise<string>;
  update(id: string, data: UpdateQuizInput): Promise<void>;
  delete(id: string): Promise<void>;
  // Questions subcollection
  getQuestions(quizId: string): Promise<QuizQuestion[]>;
  addQuestion(quizId: string, question: CreateQuestionInput): Promise<string>;
  updateQuestion(quizId: string, questionId: string, data: UpdateQuestionInput): Promise<void>;
  deleteQuestion(quizId: string, questionId: string): Promise<void>;
  reorderQuestions(quizId: string, orderedIds: string[]): Promise<void>;
  // Analytics
  recordAttempt(quizId: string, score: number): Promise<void>;
}

// ─── Implementation ────────────────────────────────────────────────────────────

class QuizRepository extends BaseRepository<Quiz> implements IQuizRepository {
  protected readonly collectionPath = COLLECTIONS.LESSONS?.replace("lessons", "quizzes") ?? "quizzes";
  protected readonly converter: FirestoreDataConverter<Quiz> = createConverter<Quiz>();

  // Override collectionPath to use the correct constant
  protected get collectionPathResolved() {
    return "quizzes";
  }

  async findMany(filters: QuizListFilters = {}): Promise<Quiz[]> {
    try {
      const constraints = [];
      if (filters.lessonId)   constraints.push(where("lessonId", "==", filters.lessonId));
      if (filters.language)   constraints.push(where("language", "==", filters.language));
      if (filters.type)       constraints.push(where("type", "==", filters.type));
      if (filters.difficulty) constraints.push(where("difficulty", "==", filters.difficulty));
      if (filters.published !== undefined) {
        constraints.push(where("published", "==", filters.published));
      }
      constraints.push(orderBy("createdAt", "desc"));
      if (filters.limit) constraints.push(limit(filters.limit));

      const q = query(this.col, ...constraints);
      const snap = await getDocs(q);
      return snap.docs.map((d) => d.data());
    } catch (err) {
      throw normalizeError(err);
    }
  }

  async findByLesson(lessonId: string): Promise<Quiz[]> {
    return this.findMany({ lessonId });
  }

  // ── Questions subcollection ──────────────────────────────────────────────────

  private questionsCol(quizId: string) {
    return collection(db, "quizzes", quizId, "questions").withConverter(
      createSubConverter<QuizQuestion>()
    );
  }

  private questionDocRef(quizId: string, questionId: string) {
    return doc(db, "quizzes", quizId, "questions", questionId).withConverter(
      createSubConverter<QuizQuestion>()
    );
  }

  async getQuestions(quizId: string): Promise<QuizQuestion[]> {
    try {
      const q = query(this.questionsCol(quizId), orderBy("order", "asc"));
      const snap = await getDocs(q);
      return snap.docs.map((d) => d.data());
    } catch (err) {
      throw normalizeError(err);
    }
  }

  async addQuestion(quizId: string, question: CreateQuestionInput): Promise<string> {
    try {
      const ref = await addDoc(this.questionsCol(quizId), question as QuizQuestion);
      await updateDoc(this.docRef(quizId), {
        questionCount: increment(1),
        updatedAt: serverTimestamp(),
      });
      return ref.id;
    } catch (err) {
      throw normalizeError(err);
    }
  }

  async updateQuestion(
    quizId: string,
    questionId: string,
    data: UpdateQuestionInput
  ): Promise<void> {
    try {
      await updateDoc(this.questionDocRef(quizId, questionId), data as Partial<QuizQuestion>);
    } catch (err) {
      throw normalizeError(err);
    }
  }

  async deleteQuestion(quizId: string, questionId: string): Promise<void> {
    try {
      await deleteDoc(this.questionDocRef(quizId, questionId));
      await updateDoc(this.docRef(quizId), {
        questionCount: increment(-1),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      throw normalizeError(err);
    }
  }

  async reorderQuestions(quizId: string, orderedIds: string[]): Promise<void> {
    try {
      await Promise.all(
        orderedIds.map((questionId, index) =>
          updateDoc(this.questionDocRef(quizId, questionId), { order: index })
        )
      );
    } catch (err) {
      throw normalizeError(err);
    }
  }

  /** Increment attempt count and update rolling average score. */
  async recordAttempt(quizId: string, score: number): Promise<void> {
    try {
      const ref = this.docRef(quizId);
      // Firestore doesn't support computed updates, so we read then write
      const quiz = await this.findById(quizId);
      if (!quiz) return;
      const newCount = quiz.attemptCount + 1;
      const newAvg = (quiz.averageScore * quiz.attemptCount + score) / newCount;
      await updateDoc(ref, {
        attemptCount: newCount,
        averageScore: Math.round(newAvg * 10) / 10,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      throw normalizeError(err);
    }
  }
}

// ─── Singleton ─────────────────────────────────────────────────────────────────

export const quizRepository = new QuizRepository();
