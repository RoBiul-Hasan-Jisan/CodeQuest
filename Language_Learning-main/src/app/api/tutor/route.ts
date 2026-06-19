import { headers } from "next/headers";
import type { NextRequest } from "next/server";

import type { TutorMode, TutorRequest } from "@/features/tutor/types";
import { getTutorModel } from "@/lib/gemini";
import { checkRateLimit } from "@/lib/rate-limit";

/* ============================================================================
   System prompts per tutor mode
   ============================================================================ */

const BASE_IDENTITY = `You are an expert, friendly English language tutor named Aria.
You help learners improve their English through clear explanations, examples, and encouragement.
Always respond in well-formatted Markdown. Use **bold** for key terms, bullet lists for multiple items,
and code blocks (\`\`) for individual words or short phrases. Keep responses focused and practical.`;

const SYSTEM_PROMPTS: Record<TutorMode, string> = {
  general: `${BASE_IDENTITY}

Mode: General English Conversation & Q&A.
- Engage in natural, educational English conversation
- Gently correct any English errors in the user's message by adding a "📝 Quick correction:" note at the end
- Suggest better vocabulary when appropriate with "(better: word)" inline
- Keep responses conversational and encouraging`,

  grammar: `${BASE_IDENTITY}

Mode: Grammar Correction & Explanation.
For each user message, provide a structured response:

1. **✅ Corrected sentence** — show the corrected version (or "Your sentence is correct! ✓")
2. **🔍 Errors found** — list each error with:
   - ❌ Original: the wrong part
   - ✅ Corrected: the right form
   - 📖 Rule: brief explanation of the grammar rule
3. **💡 Tip** — one practical tip to remember this rule

If there are no errors, praise the user and provide a related grammar insight.`,

  vocabulary: `${BASE_IDENTITY}

Mode: Vocabulary Coach.
For each word or phrase the user provides:

1. **📖 Definition** — clear, simple definition
2. **🏷️ Part of speech** — (noun / verb / adjective / etc.)
3. **🔤 Pronunciation** — IPA notation + simple phonetic spelling, e.g. /wɜːrd/ (wurd)
4. **📝 Examples** — 3 natural example sentences showing different contexts
5. **🔀 Synonyms** — 3–5 synonyms with subtle differences explained
6. **⚠️ Common mistakes** — typical errors learners make with this word
7. **💬 Collocations** — common word combinations (e.g., "make a decision", not "do a decision")`,

  translation: `${BASE_IDENTITY}

Mode: Translation & Meaning Explainer.
For each text the user provides:

1. **🌐 English translation** — natural, idiomatic English translation
2. **📝 Literal breakdown** — word-by-word or phrase-by-phrase if helpful
3. **🎯 Nuance** — any idioms, cultural notes, or tone differences to be aware of
4. **✏️ Alternative translations** — 1–2 other valid ways to express the same meaning
5. **💬 Usage context** — when/where you'd typically use this expression

If the input is already in English, improve it and explain the improvements.`,

  rewrite: `${BASE_IDENTITY}

Mode: Sentence Rewriter & Style Improver.
For each text the user provides, give:

1. **✨ Improved version** — the rewritten text, fixing errors and enhancing style
2. **🎯 Formal version** — a more professional/academic tone
3. **💬 Casual version** — a friendly, conversational tone
4. **🔍 Changes explained** — bullet list of key improvements made and why
5. **📊 Original score** — rate the original on Clarity / Grammar / Style (each out of 10)

Always preserve the original meaning while improving expression.`,

  pronunciation: `${BASE_IDENTITY}

Mode: Pronunciation Guide.
For each word or phrase the user provides:

1. **🔤 IPA notation** — International Phonetic Alphabet, e.g. /ˈɛŋɡlɪʃ/
2. **👄 Simple phonetic** — easy-to-read pronunciation guide, e.g. "ENG-lish"
3. **🎵 Syllables & stress** — break into syllables, mark the stressed syllable IN CAPS
4. **🗣️ Sound tips** — explain tricky sounds step by step (mouth position, airflow, etc.)
5. **⚠️ Common mistakes** — what learners often mispronounce and why
6. **🔗 Similar sounds** — compare with similar-sounding words to illustrate differences
7. **📱 Practice tip** — one actionable exercise to practise this sound`,
};

/* ============================================================================
   API Route
   ============================================================================ */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  // ── Rate limiting ───────────────────────────────────────────────────────────
  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headersList.get("x-real-ip") ??
    "anonymous";

  const rateLimit = checkRateLimit(ip, 30, 60_000); // 30 req/min

  if (!rateLimit.allowed) {
    return Response.json(
      {
        error: `Rate limit exceeded. Please wait ${rateLimit.retryAfterSeconds} seconds.`,
        retryAfterSeconds: rateLimit.retryAfterSeconds,
      },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
      }
    );
  }

  // ── Parse body ──────────────────────────────────────────────────────────────
  let body: TutorRequest;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { message, mode, history } = body;

  if (!message?.trim()) {
    return Response.json({ error: "Message is required." }, { status: 400 });
  }

  if (!mode || !SYSTEM_PROMPTS[mode]) {
    return Response.json({ error: "Invalid mode." }, { status: 400 });
  }

  // ── Build Gemini prompt ─────────────────────────────────────────────────────
  const systemPrompt = SYSTEM_PROMPTS[mode];

  // Build conversation history in Gemini's expected format
  // Gemini requires alternating user/model turns and starts with user
  const geminiHistory = (history ?? []).flatMap((msg, i) => {
    // Skip if this would create consecutive same-role turns
    if (i > 0 && msg.role === history[i - 1]?.role) return [];
    return [
      {
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      },
    ];
  });

  // ── Stream response ─────────────────────────────────────────────────────────
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const model = getTutorModel();

        const chat = model.startChat({
          history: geminiHistory,
          systemInstruction: systemPrompt,
          generationConfig: {
            maxOutputTokens: 1500,
            temperature: 0.7,
            topP: 0.9,
          },
        });

        const result = await chat.sendMessageStream(message);

        for await (const chunk of result.stream) {
          const text = chunk.text();
          if (text) {
            controller.enqueue(encoder.encode(text));
          }
        }

        controller.close();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "An unexpected error occurred.";

        // Signal error to client via a special prefix
        controller.enqueue(encoder.encode(`\n\n__ERROR__:${message}`));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-RateLimit-Remaining": String(rateLimit.remaining),
      "Cache-Control": "no-store",
    },
  });
}
