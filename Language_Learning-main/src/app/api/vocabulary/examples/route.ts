import { headers } from "next/headers";
import type { NextRequest } from "next/server";

import { getTutorModel } from "@/lib/gemini";
import { checkRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headersList.get("x-real-ip") ??
    "anonymous";

  const rateLimit = checkRateLimit(`vocab-examples:${ip}`, 40, 60_000);
  if (!rateLimit.allowed) {
    return Response.json(
      { error: `Rate limit exceeded. Retry in ${rateLimit.retryAfterSeconds}s.` },
      { status: 429 }
    );
  }

  let body: { word: string; definition?: string; partOfSpeech?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const { word, definition, partOfSpeech } = body;
  if (!word?.trim()) {
    return Response.json({ error: "word is required." }, { status: 400 });
  }

  const prompt = `Generate exactly 3 natural, varied example sentences for the English word "${word}"${partOfSpeech ? ` (${partOfSpeech})` : ""}${definition ? `. Definition: ${definition}` : ""}.

Requirements:
- Each sentence must clearly illustrate the word's meaning in context
- Vary the sentence structure and context (e.g., academic, everyday, professional)
- Keep sentences concise (10–20 words each)
- Do NOT number or bullet the sentences
- Return ONLY the 3 sentences, separated by the pipe character |
- No extra text, no labels, no newlines

Example format: First sentence here | Second sentence here | Third sentence here`;

  try {
    const model = getTutorModel();
    const result = await model.generateContent(prompt);
    const raw = result.response.text().trim();

    const examples = raw
      .split("|")
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .slice(0, 3);

    if (examples.length === 0) {
      return Response.json({ error: "Could not generate examples." }, { status: 500 });
    }

    return Response.json({ examples });
  } catch {
    return Response.json({ error: "Failed to generate examples. Please try again." }, { status: 500 });
  }
}
