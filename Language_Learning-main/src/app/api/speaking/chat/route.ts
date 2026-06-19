import type { NextRequest } from "next/server";

import { SCENARIOS } from "@/features/speaking/types";
import type { GeminiHistoryItem, SpeakingScenario } from "@/features/speaking/types";
import { genAI, GEMINI_MODEL } from "@/lib/gemini";
import { checkRateLimit } from "@/lib/rate-limit";

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for") ??
    req.headers.get("x-real-ip") ??
    "127.0.0.1";

  const rl = checkRateLimit(ip, 40, 60_000);
  if (!rl.allowed) {
    return new Response(
      `__ERROR__:Rate limit exceeded. Please wait ${rl.retryAfterSeconds}s.`,
      { status: 429 }
    );
  }

  let userMessage: string;
  let scenario: SpeakingScenario;
  let history: GeminiHistoryItem[];

  try {
    const body = (await req.json()) as {
      message?: string;
      scenario?: SpeakingScenario;
      history?: GeminiHistoryItem[];
    };

    if (!body.message?.trim() || !body.scenario) {
      return new Response("__ERROR__:message and scenario are required", {
        status: 400,
      });
    }

    userMessage = body.message.trim();
    scenario = body.scenario;
    history = body.history ?? [];
  } catch {
    return new Response("__ERROR__:Invalid JSON body", { status: 400 });
  }

  const scenarioConfig = SCENARIOS.find((s) => s.id === scenario);
  if (!scenarioConfig) {
    return new Response("__ERROR__:Unknown scenario", { status: 400 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const model = genAI.getGenerativeModel({
          model: GEMINI_MODEL,
          systemInstruction: scenarioConfig.systemPrompt,
        });

        const chat = model.startChat({
          history,
          generationConfig: {
            temperature: 0.85,
            topP: 0.9,
            maxOutputTokens: 256,
          },
        });

        const result = await chat.sendMessageStream(userMessage);

        for await (const chunk of result.stream) {
          const text = chunk.text();
          if (text) controller.enqueue(encoder.encode(text));
        }
      } catch {
        controller.enqueue(encoder.encode("__ERROR__:AI request failed. Please try again."));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
