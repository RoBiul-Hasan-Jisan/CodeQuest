import type { NextRequest } from "next/server";

import { ACTION_PROMPTS } from "@/features/writing/types";
import type { WritingAction } from "@/features/writing/types";
import { genAI, GEMINI_MODEL } from "@/lib/gemini";
import { checkRateLimit } from "@/lib/rate-limit";

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // Rate limit: 40 requests / minute per IP
  const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "127.0.0.1";
  const rl = checkRateLimit(ip, 40, 60_000);
  if (!rl.allowed) {
    return new Response(`__ERROR__:Rate limit exceeded. Please wait ${rl.retryAfterSeconds}s.`, {
      status: 429,
      headers: { "Content-Type": "text/plain", "Retry-After": String(rl.retryAfterSeconds) },
    });
  }

  let text: string;
  let action: WritingAction;

  try {
    const body = (await req.json()) as { text?: string; action?: WritingAction };
    if (!body.text?.trim() || !body.action) {
      return new Response("__ERROR__:text and action are required", { status: 400 });
    }
    text = body.text.trim();
    action = body.action;

    if (text.length > 8_000) {
      return new Response("__ERROR__:Text is too long. Please limit to 8,000 characters.", { status: 400 });
    }
  } catch {
    return new Response("__ERROR__:Invalid JSON body", { status: 400 });
  }

  const systemPrompt = ACTION_PROMPTS[action];
  if (!systemPrompt) {
    return new Response("__ERROR__:Unknown action", { status: 400 });
  }

  const fullPrompt = `${systemPrompt}\n\n---\n\n${text}`;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
        const result = await model.generateContentStream(fullPrompt);

        for await (const chunk of result.stream) {
          const chunkText = chunk.text();
          if (chunkText) {
            controller.enqueue(encoder.encode(chunkText));
          }
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
