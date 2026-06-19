import { quizRepository, type IQuizRepository } from "../repositories/quiz-repository";
import type {
  CreateQuestionInput,
  CreateQuizInput,
  Quiz,
  QuizAnswer,
  QuizGrade,
  QuizListFilters,
  QuizQuestion,
  QuizWithQuestions,
  UpdateQuestionInput,
  UpdateQuizInput,
} from "../types";
import { gradeQuiz } from "../types";

/* ============================================================================
   QuizService — business logic for quizzes
   ============================================================================ */

class QuizService {
  constructor(private readonly repo: IQuizRepository) {}

  // ── Queries ─────────────────────────────────────────────────────────────────

  async getById(id: string): Promise<Quiz | null> {
    return this.repo.findById(id);
  }

  async list(filters: QuizListFilters = {}): Promise<Quiz[]> {
    return this.repo.findMany(filters);
  }

  async getPublishedByLesson(lessonId: string): Promise<Quiz[]> {
    return this.repo.findByLesson(lessonId).then((quizzes) =>
      quizzes.filter((q) => q.published)
    );
  }

  async getQuestions(quizId: string): Promise<QuizQuestion[]> {
    return this.repo.getQuestions(quizId);
  }

  /** Fetch a quiz with all its questions in one call. */
  async getQuizWithQuestions(quizId: string): Promise<QuizWithQuestions | null> {
    const [quiz, questions] = await Promise.all([
      this.repo.findById(quizId),
      this.repo.getQuestions(quizId),
    ]);
    if (!quiz) return null;
    return { ...quiz, questions };
  }

  // ── Mutations ───────────────────────────────────────────────────────────────

  async create(data: CreateQuizInput): Promise<string> {
    return this.repo.create(data);
  }

  async update(id: string, data: UpdateQuizInput): Promise<void> {
    return this.repo.update(id, data);
  }

  async publish(id: string): Promise<void> {
    return this.repo.update(id, { published: true });
  }

  async unpublish(id: string): Promise<void> {
    return this.repo.update(id, { published: false });
  }

  async delete(id: string): Promise<void> {
    return this.repo.delete(id);
  }

  async addQuestion(quizId: string, question: CreateQuestionInput): Promise<string> {
    return this.repo.addQuestion(quizId, question);
  }

  async updateQuestion(
    quizId: string,
    questionId: string,
    data: UpdateQuestionInput
  ): Promise<void> {
    return this.repo.updateQuestion(quizId, questionId, data);
  }

  async deleteQuestion(quizId: string, questionId: string): Promise<void> {
    return this.repo.deleteQuestion(quizId, questionId);
  }

  async reorderQuestions(quizId: string, orderedIds: string[]): Promise<void> {
    return this.repo.reorderQuestions(quizId, orderedIds);
  }

  // ── Grading ─────────────────────────────────────────────────────────────────

  /**
   * Grade a quiz attempt.
   * Grading is done client-side for speed; the result is persisted via
   * ProgressService.recordQuizAttempt.
   */
  async gradeAttempt(
    quizId: string,
    answers: QuizAnswer[],
    totalTimeSec: number
  ): Promise<QuizGrade> {
    const [quiz, questions] = await Promise.all([
      this.repo.findById(quizId),
      this.repo.getQuestions(quizId),
    ]);

    if (!quiz) throw new Error(`Quiz "${quizId}" not found.`);

    const grade = gradeQuiz(quiz, questions, answers, totalTimeSec);

    // Update aggregate analytics in the background (don't await)
    this.repo.recordAttempt(quizId, grade.score).catch(console.error);

    return grade;
  }
}

export const quizService = new QuizService(quizRepository);
