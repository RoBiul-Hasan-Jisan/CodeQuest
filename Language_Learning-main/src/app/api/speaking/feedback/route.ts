import type { NextRequest } from "next/server";

import type { SpeakingScenario } from "@/features/speaking/types";
import { genAI, GEMINI_MODEL } from "@/lib/gemini";
import { checkRateLimit } from "@/lib/rate-limit";

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for") ??
    req.headers.get("x-real-ip") ??
    "127.0.0.1";

  const rl = checkRateLimit(ip, 30, 60_000);
  if (!rl.allowed) {
    return Response.json(
      { error: `Rate limit exceeded. Please wait ${rl.retryAfterSeconds}s.` },
      { status: 429 }
    );
  }

  let transcript: string;
  let scenario: SpeakingScenario;
  let practicePrompt: string;

  try {
    const body = (await req.json()) as {
      transcript?: string;
      scenario?: SpeakingScenario;
      practicePrompt?: string;
    };

    if (!body.transcript?.trim() || !body.scenario) {
      return Response.json(
        { error: "transcript and scenario are required" },
        { status: 400 }
      );
    }

    transcript = body.transcript.trim();
    scenario = body.scenario;
    practicePrompt = body.practicePrompt?.trim() ?? "";

    if (transcript.length > 5_000) {
      return Response.json({ error: "Transcript too long." }, { status: 400 });
    }
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const prompt = `You are an expert English speaking coach specializing in pronunciation, fluency, and communication. Analyze the following spoken English transcript carefully.

${practicePrompt ? `Practice task: "${practicePrompt}"` : `Scenario: ${scenario.replace(/_/g, " ")}`}

Spoken transcript: "${transcript}"

Respond ONLY with valid JSON (no markdown fences, no extra text) in this exact format:
{
  "overallScore": <integer 0-100>,
  "clarity": <integer 0-100>,
  "fluency": <integer 0-100>,
  "vocabulary": <integer 0-100>,
  "grammar": <integer 0-100>,
  "strengths": ["<specific strength 1>", "<specific strength 2>"],
  "improvements": ["<specific improvement area 1>", "<specific improvement area 2>"],
  "correctedText": "<their transcript with grammar and word choice improvements applied>",
  "tips": ["<actionable speaking tip 1>", "<actionable speaking tip 2>"]
}

Scoring guide (be realistic — most learners score 40-75):
- overallScore: weighted average (clarity 30% + fluency 30% + vocabulary 20% + grammar 20%)
- clarity: how understandable the speech is — word choice, sentence structure, logical flow
- fluency: natural flow, appropriate pacing, variety in sentence length, minimal repetition
- vocabulary: range, precision, and appropriateness of words for the context
- grammar: grammatical accuracy (verb tenses, articles, prepositions, subject-verb agreement)
- strengths: 2 specific things they did well (reference actual words/phrases from their text)
- improvements: 2 specific areas to work on (be concrete, not generic)
- correctedText: their EXACT text with corrections — only change errors, preserve voice/meaning
- tips: 2 actionable, practical tips specific to their performance`;

  try {
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
    const result = await model.generateContent(prompt);
    const raw = result.response.text().trim();

    // Strip markdown fences if present
    const cleaned = raw
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```\s*$/, "");

    const feedback = JSON.parse(cleaned) as Record<string, unknown>;
    return Response.json(feedback);
  } catch {
    return Response.json({ error: "AI analysis failed. Please try again." }, { status: 500 });
  }
}
