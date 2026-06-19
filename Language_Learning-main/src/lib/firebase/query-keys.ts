/**
 * Centralised React Query key factory.
 *
 * Pattern: hierarchical tuples — each level extends the previous so
 * `queryClient.invalidateQueries({ queryKey: lessonKeys.all() })` busts
 * every lesson query at once.
 *
 * Usage:
 *   queryClient.invalidateQueries({ queryKey: lessonKeys.all() })
 *   queryClient.invalidateQueries({ queryKey: lessonKeys.lists() })
 *   queryClient.invalidateQueries({ queryKey: lessonKeys.detail(id) })
 */

// ─── Shared filter types ──────────────────────────────────────────────────────

export type Language = string;
export type DifficultyLevel = "beginner" | "intermediate" | "advanced";

export interface PaginationParams {
  pageSize?: number;
  cursor?: string | null;
}

// ─── Lesson keys ──────────────────────────────────────────────────────────────

export interface LessonListFilters extends PaginationParams {
  language?: Language;
  level?: DifficultyLevel;
  courseId?: string;
  published?: boolean;
}

export const lessonKeys = {
  all: () => ["lessons"] as const,
  lists: () => [...lessonKeys.all(), "list"] as const,
  list: (filters?: LessonListFilters) => [...lessonKeys.lists(), filters ?? {}] as const,
  details: () => [...lessonKeys.all(), "detail"] as const,
  detail: (id: string) => [...lessonKeys.details(), id] as const,
  sections: (lessonId: string) => [...lessonKeys.detail(lessonId), "sections"] as const,
  byCourse: (courseId: string) => [...lessonKeys.all(), "course", courseId] as const,
};

// ─── Vocabulary keys ──────────────────────────────────────────────────────────

export interface VocabularyListFilters extends PaginationParams {
  language?: Language;
  lessonId?: string;
  category?: string;
  difficulty?: number;
  tags?: string[];
}

export const vocabularyKeys = {
  all: () => ["vocabulary"] as const,
  lists: () => [...vocabularyKeys.all(), "list"] as const,
  list: (filters?: VocabularyListFilters) => [...vocabularyKeys.lists(), filters ?? {}] as const,
  details: () => [...vocabularyKeys.all(), "detail"] as const,
  detail: (id: string) => [...vocabularyKeys.details(), id] as const,
  byLesson: (lessonId: string) => [...vocabularyKeys.all(), "lesson", lessonId] as const,
  search: (query: string) => [...vocabularyKeys.all(), "search", query] as const,
};

// ─── Quiz keys ────────────────────────────────────────────────────────────────

export type QuizType =
  | "multiple_choice"
  | "fill_blank"
  | "matching"
  | "reorder"
  | "speaking"
  | "listening"
  | "translation";

export interface QuizListFilters extends PaginationParams {
  lessonId?: string;
  language?: Language;
  type?: QuizType;
  difficulty?: DifficultyLevel;
  published?: boolean;
  limit?: number;
}

export const quizKeys = {
  all: () => ["quizzes"] as const,
  lists: () => [...quizKeys.all(), "list"] as const,
  list: (filters?: QuizListFilters) => [...quizKeys.lists(), filters ?? {}] as const,
  details: () => [...quizKeys.all(), "detail"] as const,
  detail: (id: string) => [...quizKeys.details(), id] as const,
  questions: (quizId: string) => [...quizKeys.detail(quizId), "questions"] as const,
  byLesson: (lessonId: string) => [...quizKeys.all(), "lesson", lessonId] as const,
};

// ─── Progress keys ────────────────────────────────────────────────────────────

export const progressKeys = {
  all: (userId: string) => ["progress", userId] as const,

  // Lesson progress
  lessons: (userId: string) => [...progressKeys.all(userId), "lessons"] as const,
  lesson: (userId: string, lessonId: string) =>
    [...progressKeys.lessons(userId), lessonId] as const,

  // Vocabulary progress
  vocabulary: (userId: string) => [...progressKeys.all(userId), "vocabulary"] as const,
  vocabularyWord: (userId: string, wordId: string) =>
    [...progressKeys.vocabulary(userId), wordId] as const,
  vocabularyDue: (userId: string) =>
    [...progressKeys.vocabulary(userId), "due"] as const,

  // Quiz progress
  quizzes: (userId: string) => [...progressKeys.all(userId), "quizzes"] as const,
  quiz: (userId: string, quizId: string) =>
    [...progressKeys.quizzes(userId), quizId] as const,

  // Aggregated stats
  stats: (userId: string) => [...progressKeys.all(userId), "stats"] as const,
};
