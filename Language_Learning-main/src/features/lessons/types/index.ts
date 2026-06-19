// ─── Primitives ───────────────────────────────────────────────────────────────

export type DifficultyLevel = "beginner" | "intermediate" | "advanced";

export type LessonSectionType =
  | "text"
  | "audio"
  | "video"
  | "exercise"
  | "dialogue"
  | "flashcard";

// ─── Lesson document (/lessons/{lessonId}) ───────────────────────────────────

export interface Lesson {
  id: string;
  title: string;
  description: string;
  language: string;
  level: DifficultyLevel;
  /** Estimated reading/practice time */
  durationMinutes: number;
  /** XP awarded on first completion */
  xpReward: number;
  /** Whether the lesson is visible to learners */
  published: boolean;
  /** Sort order within the course */
  order: number;
  courseId: string;
  tags: string[];
  thumbnailUrl: string | null;
  /** Markdown / rich text content URL */
  contentUrl: string | null;
  /** Number of sections in this lesson */
  sectionCount: number;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

// ─── Lesson section (/lessons/{lessonId}/sections/{sectionId}) ────────────────

export interface LessonSection {
  id: string;
  type: LessonSectionType;
  title?: string;
  /** Markdown or plain text content */
  content: string;
  /** Sort order within the lesson */
  order: number;
  mediaUrl: string | null;
  /** Duration in seconds — for audio/video sections */
  mediaDurationSeconds: number | null;
  /** If this section links to a quiz */
  quizId: string | null;
}

// ─── Input types ──────────────────────────────────────────────────────────────

export type CreateLessonInput = Omit<
  Lesson,
  "id" | "createdAt" | "updatedAt" | "sectionCount"
>;

export type UpdateLessonInput = Partial<
  Omit<Lesson, "id" | "createdAt" | "courseId">
>;

export type CreateSectionInput = Omit<LessonSection, "id">;
export type UpdateSectionInput = Partial<Omit<LessonSection, "id">>;

// ─── Composite / view types ───────────────────────────────────────────────────

export interface LessonWithSections extends Lesson {
  sections: LessonSection[];
}

// ─── Query filters ────────────────────────────────────────────────────────────

export interface LessonListFilters {
  language?: string;
  level?: DifficultyLevel;
  courseId?: string;
  published?: boolean;
  limit?: number;
}
