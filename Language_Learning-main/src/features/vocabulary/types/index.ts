// ─── Vocabulary status ────────────────────────────────────────────────────────

/**
 * Learning lifecycle for a word:
 * new → learning → reviewing → mastered
 */
export type VocabularyStatus = "new" | "learning" | "reviewing" | "mastered";

/**
 * SM-2 recall quality rating (0–5).
 * < 3 = incorrect, ≥ 3 = correct with varying difficulty.
 */
export type RecallQuality = 0 | 1 | 2 | 3 | 4 | 5;

export type WordCategory =
  | "nouns"
  | "verbs"
  | "adjectives"
  | "adverbs"
  | "pronouns"
  | "prepositions"
  | "conjunctions"
  | "phrases"
  | "numbers"
  | "colors"
  | "food"
  | "travel"
  | "business"
  | "other";

// ─── Core word entity ─────────────────────────────────────────────────────────

export interface VocabularyWord {
  wordId: string;
  /** The word in the target language */
  word: string;
  /** Translation in the user's native language */
  translation: string;
  pronunciation?: string;
  exampleSentence?: string;
  exampleTranslation?: string;
  language: string; // e.g. "Spanish"
  category: WordCategory;
  tags: string[];
  imageUrl?: string;
  /** Concise dictionary-style definition */
  definition?: string;
  /** 1 = very easy, 5 = very hard */
  difficulty?: 1 | 2 | 3 | 4 | 5;
  /** Saved to favorites by the user */
  isFavorite?: boolean;
  /** AI-generated example sentences */
  aiExamples?: string[];

  // ── Learning status ────────────────────────────────────────────────────
  status: VocabularyStatus;
  addedAt: string; // ISO 8601

  // ── SM-2 spaced repetition fields ─────────────────────────────────────
  /** Easiness factor — minimum 1.3, default 2.5 */
  easinessFactor: number;
  /** Days until next review */
  interval: number;
  /** Consecutive successful reviews */
  repetitions: number;
  /** Date of next scheduled review (YYYY-MM-DD) */
  nextReviewDate: string;
  lastReviewedAt: string | null; // ISO 8601

  // ── Review stats ───────────────────────────────────────────────────────
  totalReviews: number;
  correctReviews: number;
  incorrectReviews: number;
  /** Correct / total, 0–1 */
  accuracy: number;
}

/** Input type for adding a new word — all SM-2 and stat fields are initialised by the store */
export type VocabularyWordInput = Omit<
  VocabularyWord,
  | "wordId"
  | "status"
  | "addedAt"
  | "easinessFactor"
  | "interval"
  | "repetitions"
  | "nextReviewDate"
  | "lastReviewedAt"
  | "totalReviews"
  | "correctReviews"
  | "incorrectReviews"
  | "accuracy"
>;

// ─── SM-2 algorithm ───────────────────────────────────────────────────────────

const SM2_MIN_EF = 1.3;
const SM2_DEFAULT_EF = 2.5;

function todayString(): string {
  return new Date().toISOString().split("T")[0]!;
}

function addDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0]!;
}

export interface SM2Result {
  easinessFactor: number;
  interval: number;
  repetitions: number;
  nextReviewDate: string;
  status: VocabularyStatus;
}

/**
 * SuperMemo SM-2 algorithm.
 * Returns updated scheduling fields for a word after a review.
 */
export function applySpacedRepetition(
  word: Pick<VocabularyWord, "easinessFactor" | "interval" | "repetitions">,
  quality: RecallQuality
): SM2Result {
  const correct = quality >= 3;

  let { easinessFactor, interval, repetitions } = word;

  if (!correct) {
    // Reset on failure
    repetitions = 0;
    interval = 1;
  } else {
    // Update easiness factor
    easinessFactor = Math.max(
      SM2_MIN_EF,
      easinessFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)
    );

    // Calculate next interval
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easinessFactor);
    }
    repetitions += 1;
  }

  // Determine status from repetitions
  let status: VocabularyStatus = "learning";
  if (!correct) {
    status = "learning";
  } else if (repetitions >= 8 && interval >= 21) {
    status = "mastered";
  } else if (repetitions >= 3) {
    status = "reviewing";
  } else {
    status = "learning";
  }

  return {
    easinessFactor,
    interval,
    repetitions,
    nextReviewDate: addDays(interval),
    status,
  };
}

/** Build initial SM-2 state for a brand-new word */
export function initialSM2State(): Pick<
  VocabularyWord,
  | "status"
  | "addedAt"
  | "easinessFactor"
  | "interval"
  | "repetitions"
  | "nextReviewDate"
  | "lastReviewedAt"
  | "totalReviews"
  | "correctReviews"
  | "incorrectReviews"
  | "accuracy"
> {
  return {
    status: "new",
    addedAt: new Date().toISOString(),
    easinessFactor: SM2_DEFAULT_EF,
    interval: 1,
    repetitions: 0,
    nextReviewDate: todayString(),
    lastReviewedAt: null,
    totalReviews: 0,
    correctReviews: 0,
    incorrectReviews: 0,
    accuracy: 0,
  };
}

// ─── Review session ───────────────────────────────────────────────────────────

export interface VocabularySession {
  sessionId: string;
  startedAt: string; // ISO 8601
  /** Word IDs queued for this session */
  wordIds: string[];
  reviewedWordIds: string[];
  correctWordIds: string[];
  incorrectWordIds: string[];
  xpEarned: number;
}

// ─── Store state ──────────────────────────────────────────────────────────────

export interface VocabularyState {
  words: Record<string, VocabularyWord>;
  currentSession: VocabularySession | null;

  // ── Derived counters (kept in sync by actions) ─────────────────────────
  totalWords: number;
  totalLearned: number;   // not 'new'
  totalMastered: number;  // 'mastered'
  totalDueToday: number;  // nextReviewDate ≤ today

  // ── Actions ───────────────────────────────────────────────────────────
  addWord: (word: VocabularyWordInput) => string; // returns new wordId
  addWords: (words: VocabularyWordInput[]) => void;
  reviewWord: (wordId: string, quality: RecallQuality) => number; // returns XP earned
  removeWord: (wordId: string) => void;
  startSession: (wordIds: string[]) => void;
  endSession: () => VocabularySession | null;
  getDueWords: () => VocabularyWord[];
  recomputeCounters: () => void;
  resetAll: () => void;
  // ── Meta updates ──────────────────────────────────────────────────────
  toggleFavorite: (wordId: string) => void;
  setDifficulty: (wordId: string, difficulty: 1 | 2 | 3 | 4 | 5) => void;
  setAIExamples: (wordId: string, examples: string[]) => void;
  updateWordMeta: (
    wordId: string,
    updates: Partial<Pick<VocabularyWord, "definition" | "pronunciation" | "exampleSentence" | "exampleTranslation" | "tags" | "isFavorite" | "difficulty" | "aiExamples">>
  ) => void;
}
