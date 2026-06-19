/**
 * Firestore-specific vocabulary types.
 * The `vocabulary` collection stores the language catalog (static content).
 * User SRS progress lives in `progress/{userId}/vocabulary/{wordId}`.
 *
 * Kept separate from `./index.ts` which owns the local Zustand store types.
 */

export type PartOfSpeech =
  | "noun"
  | "verb"
  | "adjective"
  | "adverb"
  | "pronoun"
  | "preposition"
  | "conjunction"
  | "interjection"
  | "phrase"
  | "other";

export type WordDifficulty = 1 | 2 | 3 | 4 | 5;

// ─── /vocabulary/{wordId} ─────────────────────────────────────────────────────

/** Word catalog entry — shared across all learners. */
export interface VocabularyEntry {
  id: string;
  word: string;
  translation: string;
  pronunciation: string | null;
  exampleSentence: string | null;
  exampleTranslation: string | null;
  /** Target language, e.g. "Spanish" */
  language: string;
  partOfSpeech: PartOfSpeech;
  /** 1 (easiest) → 5 (hardest) */
  difficulty: WordDifficulty;
  category: string; // e.g. "travel", "food"
  tags: string[];
  imageUrl: string | null;
  audioUrl: string | null;
  /** Lesson this word is introduced in (nullable = standalone word) */
  lessonId: string | null;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

export type CreateVocabularyEntryInput = Omit<
  VocabularyEntry,
  "id" | "createdAt" | "updatedAt"
>;

export type UpdateVocabularyEntryInput = Partial<
  Omit<VocabularyEntry, "id" | "createdAt" | "language">
>;

// ─── Query filters ────────────────────────────────────────────────────────────

export interface VocabularyEntryFilters {
  language?: string;
  lessonId?: string;
  category?: string;
  partOfSpeech?: PartOfSpeech;
  difficulty?: WordDifficulty;
  tags?: string[];
  limit?: number;
}
