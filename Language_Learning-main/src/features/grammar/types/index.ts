// ─── Grammar taxonomy ─────────────────────────────────────────────────────────

export type GrammarCategory =
  | "present_tense"
  | "past_tense"
  | "future_tense"
  | "conditional"
  | "subjunctive"
  | "imperative"
  | "pronouns"
  | "articles"
  | "prepositions"
  | "conjunctions"
  | "adjectives"
  | "adverbs"
  | "word_order"
  | "verb_conjugation"
  | "negation"
  | "questions"
  | "comparative"
  | "other";

export type GrammarDifficulty = "easy" | "medium" | "hard";

/**
 * Skill grade based on rolling score.
 * S ≥ 95 | A ≥ 85 | B ≥ 75 | C ≥ 65 | D ≥ 50 | F < 50
 */
export type SkillGrade = "S" | "A" | "B" | "C" | "D" | "F";

/** Compute letter grade from a 0–100 score. */
export function computeGrade(score: number): SkillGrade {
  if (score >= 95) return "S";
  if (score >= 85) return "A";
  if (score >= 75) return "B";
  if (score >= 65) return "C";
  if (score >= 50) return "D";
  return "F";
}

/** Is the topic considered mastered? */
export function isMastered(score: number, attempts: number): boolean {
  return score >= 90 && attempts >= 3;
}

// ─── Topic entity ─────────────────────────────────────────────────────────────

export interface GrammarTopic {
  topicId: string;
  name: string;
  category: GrammarCategory;
  language: string;
  difficulty: GrammarDifficulty;

  // ── Scoring ────────────────────────────────────────────────────────────
  /** Exponentially-weighted rolling score (EWA), 0–100 */
  currentScore: number;
  bestScore: number;
  totalAttempts: number;

  // ── Accuracy ───────────────────────────────────────────────────────────
  totalQuestions: number;
  correctAnswers: number;
  /** correctAnswers / totalQuestions, 0–1 */
  accuracy: number;

  // ── Temporal ───────────────────────────────────────────────────────────
  firstAttemptAt: string | null; // ISO 8601
  lastAttemptAt: string | null;  // ISO 8601

  // ── Computed ───────────────────────────────────────────────────────────
  grade: SkillGrade;
  mastered: boolean;
}

/** Minimum fields required to register a topic. */
export type GrammarTopicInput = Pick<
  GrammarTopic,
  "topicId" | "name" | "category" | "language" | "difficulty"
>;

// ─── Attempt record ───────────────────────────────────────────────────────────

export interface GrammarAttempt {
  attemptId: string;
  topicId: string;
  /** Percentage score for this attempt, 0–100 */
  score: number;
  questionsTotal: number;
  questionsCorrect: number;
  timeTakenSeconds: number;
  completedAt: string; // ISO 8601
}

export type GrammarAttemptInput = Omit<GrammarAttempt, "attemptId" | "completedAt">;

// ─── Scoring helpers ──────────────────────────────────────────────────────────

/**
 * Exponential weighted average — new score gets 30% weight, history 70%.
 * Gives responsive but stable rolling score.
 */
export function exponentialWeightedAverage(
  current: number,
  newScore: number,
  alpha = 0.3
): number {
  return Math.round(current * (1 - alpha) + newScore * alpha);
}

// ─── Quiz types ───────────────────────────────────────────────────────────────

export interface GrammarQuestion {
  questionId: string;
  question: string;
  options: string[];     // exactly 4 options
  correctIndex: number;  // 0-based
  explanation: string;
  hint?: string;
}

/** Firestore document — a cached quiz for one category + difficulty */
export interface GrammarQuizDoc {
  id: string;
  category: GrammarCategory;
  difficulty: GrammarDifficulty;
  questions: GrammarQuestion[];
  generatedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionResult {
  questionId: string;
  question: string;
  options: string[];
  selectedIndex: number | null;
  correctIndex: number;
  isCorrect: boolean;
  explanation: string;
}

export interface QuizResult {
  category: GrammarCategory;
  difficulty: GrammarDifficulty;
  score: number;
  questionsTotal: number;
  questionsCorrect: number;
  timeSeconds: number;
  completedAt: string;
  questionResults: QuestionResult[];
}

// ─── Store state ──────────────────────────────────────────────────────────────

export interface GrammarState {
  topics: Record<string, GrammarTopic>;
  /** Capped at 500 most recent attempts for chart/history queries */
  attemptHistory: GrammarAttempt[];

  // ── Derived (kept in sync by actions) ─────────────────────────────────
  overallScore: number;     // mean of all topic scores
  overallAccuracy: number;  // 0–1
  weakTopicIds: string[];   // currentScore < 60
  strongTopicIds: string[]; // currentScore ≥ 85
  masteredTopicIds: string[];

  // ── Actions ───────────────────────────────────────────────────────────
  /** Register a topic so it can receive attempts. Idempotent. */
  registerTopic: (topic: GrammarTopicInput) => void;
  recordAttempt: (attempt: GrammarAttemptInput) => void;
  resetTopic: (topicId: string) => void;
  resetAll: () => void;
}
