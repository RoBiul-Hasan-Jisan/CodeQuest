import { type NextRequest, NextResponse } from "next/server";

import type { GrammarCategory, GrammarDifficulty, GrammarQuestion } from "@/features/grammar/types";
import { genAI, GEMINI_MODEL } from "@/lib/gemini";
import { checkRateLimit } from "@/lib/rate-limit";

// ─── Difficulty context ───────────────────────────────────────────────────────

const DIFFICULTY_CONTEXT: Record<GrammarDifficulty, string> = {
  easy:   "beginner level (A1–A2): basic rules, simple, unambiguous sentences",
  medium: "intermediate level (B1–B2): common patterns, real-world usage",
  hard:   "advanced level (C1–C2): edge cases, subtle distinctions, nuanced rules",
};

// ─── Prompt builder ───────────────────────────────────────────────────────────

function buildPrompt(category: string, difficulty: GrammarDifficulty, count: number): string {
  return `Generate exactly ${count} English grammar multiple-choice questions about the topic "${category}" at ${DIFFICULTY_CONTEXT[difficulty]}.

Return ONLY a valid JSON array — no markdown fences, no commentary, no extra text:
[
  {
    "questionId": "q1",
    "question": "She ___ to the gym every morning.",
    "options": ["go", "goes", "going", "gone"],
    "correctIndex": 1,
    "explanation": "'Goes' is correct because with third-person singular subjects (she/he/it) in simple present tense, we add -s/-es to the verb.",
    "hint": "Think about subject-verb agreement"
  }
]

Rules:
- Exactly 4 options per question (plain text only — no A./B./C. prefixes)
- correctIndex is 0-based (0 = first option, 3 = last option)
- Mix question types: fill-in-the-blank, spot-the-error, choose-the-correct-form, sentence-transformation
- Explanation: 1–2 sentences clearly stating why the answer is correct
- Hint: ≤8 words, gives direction without revealing the answer
- questionId values: "q1", "q2", … "q${count}"
- All questions must be strictly about the "${category}" grammar topic`;
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // Rate limit: 30 requests / minute per IP
  const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "127.0.0.1";
  const rl = checkRateLimit(ip, 30, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please wait before generating more questions." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } }
    );
  }

  let category: GrammarCategory;
  let difficulty: GrammarDifficulty;
  let count: number;

  try {
    const body = (await req.json()) as {
      category?: GrammarCategory;
      difficulty?: GrammarDifficulty;
      count?: number;
    };
    if (!body.category || !body.difficulty) {
      return NextResponse.json({ error: "category and difficulty are required" }, { status: 400 });
    }
    category = body.category;
    difficulty = body.difficulty;
    count = Math.min(Math.max(body.count ?? 10, 5), 15);
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
    const result = await model.generateContent(buildPrompt(category, difficulty, count));
    const raw = result.response.text().trim();

    // Strip markdown fences if present despite instructions
    const jsonText = raw.startsWith("```")
      ? raw.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?\s*```$/, "")
      : raw;

    const questions = JSON.parse(jsonText) as GrammarQuestion[];

    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error("Empty or non-array response from model");
    }

    // Sanitise — ensure each question has the required shape
    const valid = questions.filter(
      (q) =>
        typeof q.question === "string" &&
        Array.isArray(q.options) &&
        q.options.length === 4 &&
        typeof q.correctIndex === "number" &&
        q.correctIndex >= 0 &&
        q.correctIndex <= 3 &&
        typeof q.explanation === "string"
    );

    if (valid.length < 3) {
      throw new Error(`Only ${valid.length} valid questions after sanitisation`);
    }

    return NextResponse.json({ questions: valid });
  } catch (err) {
    console.error("[grammar/generate] Error:", err);
    return NextResponse.json(
      { error: "Failed to generate questions. Please try again." },
      { status: 500 }
    );
  }
}
