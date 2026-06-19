// ─── Quiz taxonomy ────────────────────────────────────────────────────────────

export type QuizType =
  | "multiple_choice"
  | "fill_blank"
  | "matching"
  | "reorder"
  | "speaking"
  | "listening"
  | "translation";

export type QuestionType =
  | "multiple_choice"  // Pick one from 2–6 options
  | "true_false"       // Binary
  | "fill_blank"       // Type the missing word(s)
  | "matching"         // Connect pairs
  | "reorder"          // Arrange words in correct order
  | "listening"        // Hear audio, answer
  | "speaking"         // Say the correct answer (Web Speech API)
  | "translation";     // Translate a sentence

export type DifficultyLevel = "beginner" | "intermediate" | "advanced";

// ─── Quiz document (/quizzes/{quizId}) ───────────────────────────────────────

export interface Quiz {
  id: string;
  title: string;
  description: string;
  lessonId: string;
  language: string;
  type: QuizType;
  difficulty: DifficultyLevel;
  /** Total number of questions */
  questionCount: number;
  /** Time limit in seconds. null = untimed */
  timeLimitSeconds: number | null;
  /** XP reward for passing */
  xpReward: number;
  /** Minimum % score to pass, 0–100 */
  passingScore: number;
  published: boolean;
  /** Total times any user has attempted this quiz */
  attemptCount: number;
  /** Average score across all attempts */
  averageScore: number;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

// ─── Question (/quizzes/{quizId}/questions/{questionId}) ─────────────────────

export interface QuizQuestion {
  id: string;
  type: QuestionType;
  /** Question prompt / stem */
  prompt: string;
  /** For listening/speaking questions */
  promptAudioUrl: string | null;
  promptImageUrl: string | null;
  /** The correct answer (string representation) */
  correctAnswer: string;
  /** For multiple-choice — all answer options (correct included) */
  options: string[];
  /** For matching — pairs as { left, right } */
  pairs: { left: string; right: string }[] | null;
  /** For reorder — list of words to rearrange */
  words: string[] | null;
  /** Explanation shown after answering */
  explanation: string | null;
  audioUrl: string | null;
  /** Points awarded for a correct answer */
  points: number;
  /** Sort order within the quiz */
  order: number;
}

// ─── Input types ──────────────────────────────────────────────────────────────

export type CreateQuizInput = Omit<
  Quiz,
  "id" | "createdAt" | "updatedAt" | "questionCount" | "attemptCount" | "averageScore"
>;

export type UpdateQuizInput = Partial<Omit<Quiz, "id" | "createdAt" | "lessonId" | "language">>;

export type CreateQuestionInput = Omit<QuizQuestion, "id">;
export type UpdateQuestionInput = Partial<Omit<QuizQuestion, "id">>;

// ─── Composite types ──────────────────────────────────────────────────────────

export interface QuizWithQuestions extends Quiz {
  questions: QuizQuestion[];
}

// ─── Quiz filters ─────────────────────────────────────────────────────────────

export interface QuizListFilters {
  lessonId?: string;
  language?: string;
  type?: QuizType;
  difficulty?: DifficultyLevel;
  published?: boolean;
  limit?: number;
}

// ─── Grading helpers ──────────────────────────────────────────────────────────

export interface QuizAnswer {
  questionId: string;
  answer: string;
  timeTakenMs: number;
}

export interface QuizGrade {
  score: number;           // 0–100
  correctCount: number;
  totalQuestions: number;
  passed: boolean;
  xpEarned: number;
  timeTakenSeconds: number;
  /** Per-question breakdown */
  breakdown: {
    questionId: string;
    correct: boolean;
    pointsEarned: number;
    correctAnswer: string;
    givenAnswer: string;
  }[];
}

/** Grade a completed quiz attempt in the client (no server round-trip needed). */
export function gradeQuiz(
  quiz: Quiz,
  questions: QuizQuestion[],
  answers: QuizAnswer[],
  totalTimeSec: number
): QuizGrade {
  const answerMap = Object.fromEntries(answers.map((a) => [a.questionId, a]));
  const totalPoints = questions.reduce((acc, q) => acc + q.points, 0);
  let earnedPoints = 0;
  let correctCount = 0;

  const breakdown = questions.map((q) => {
    const given = answerMap[q.id]?.answer ?? "";
    const correct = given.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
    if (correct) {
      earnedPoints += q.points;
      correctCount++;
    }
    return {
      questionId: q.id,
      correct,
      pointsEarned: correct ? q.points : 0,
      correctAnswer: q.correctAnswer,
      givenAnswer: given,
    };
  });

  const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
  const passed = score >= quiz.passingScore;
  const xpEarned = passed ? quiz.xpReward : Math.round(quiz.xpReward * 0.1);

  return { score, correctCount, totalQuestions: questions.length, passed, xpEarned, timeTakenSeconds: totalTimeSec, breakdown };
}
