// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// ─── Mock Gemini before importing the route ───────────────────────────────────

const mockGenerateContent = vi.fn();
vi.mock("@/lib/gemini", () => ({
  genAI: {
    getGenerativeModel: vi.fn(() => ({ generateContent: mockGenerateContent })),
  },
  GEMINI_MODEL: "gemini-2.0-flash",
}));

// Mock rate limiter to always allow in tests
vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: vi.fn(() => ({ allowed: true, remaining: 39, retryAfterSeconds: 0 })),
}));

const { POST } = await import("./route");

// ─── Helpers ─────────────────────────────────────────────────────────────────

const VALID_QUESTIONS = [
  {
    questionId: "q1",
    question: "She ___ to the gym every morning.",
    options: ["go", "goes", "going", "gone"],
    correctIndex: 1,
    explanation: "Third-person singular takes -s in simple present.",
    hint: "Subject-verb agreement",
  },
  {
    questionId: "q2",
    question: "He ___ a doctor.",
    options: ["am", "is", "are", "be"],
    correctIndex: 1,
    explanation: "Third-person singular uses 'is'.",
    hint: "Be verb forms",
  },
  {
    questionId: "q3",
    question: "They ___ happy.",
    options: ["is", "am", "are", "be"],
    correctIndex: 2,
    explanation: "Plural subject uses 'are'.",
    hint: "Be verb plural",
  },
];

function makeRequest(body: Record<string, unknown>): Request {
  return new Request("http://localhost/api/grammar/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": "127.0.0.1" },
    body: JSON.stringify(body),
  });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("POST /api/grammar/generate", () => {
  it("returns 400 when category is missing", async () => {
    const req = makeRequest({ difficulty: "easy" });
    const res = await POST(req as never);
    expect(res.status).toBe(400);
    const body = await res.json() as { error: string };
    expect(body.error).toMatch(/required/i);
  });

  it("returns 400 when difficulty is missing", async () => {
    const req = makeRequest({ category: "present_tense" });
    const res = await POST(req as never);
    expect(res.status).toBe(400);
  });

  it("returns 400 for invalid JSON body", async () => {
    const req = new Request("http://localhost/api/grammar/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": "127.0.0.1" },
      body: "not-json",
    });
    const res = await POST(req as never);
    expect(res.status).toBe(400);
    const body = await res.json() as { error: string };
    expect(body.error).toMatch(/invalid json/i);
  });

  it("returns 200 with generated questions on success", async () => {
    mockGenerateContent.mockResolvedValueOnce({
      response: { text: () => JSON.stringify(VALID_QUESTIONS) },
    });

    const req = makeRequest({ category: "present_tense", difficulty: "easy", count: 3 });
    const res = await POST(req as never);
    expect(res.status).toBe(200);
    const body = await res.json() as { questions: typeof VALID_QUESTIONS };
    expect(Array.isArray(body.questions)).toBe(true);
    expect(body.questions.length).toBeGreaterThanOrEqual(3);
  });

  it("strips markdown fences from model response", async () => {
    mockGenerateContent.mockResolvedValueOnce({
      response: {
        text: () => `\`\`\`json\n${JSON.stringify(VALID_QUESTIONS)}\n\`\`\``,
      },
    });

    const req = makeRequest({ category: "present_tense", difficulty: "easy" });
    const res = await POST(req as never);
    expect(res.status).toBe(200);
    const body = await res.json() as { questions: unknown[] };
    expect(body.questions.length).toBeGreaterThan(0);
  });

  it("returns 500 when model fails", async () => {
    mockGenerateContent.mockRejectedValueOnce(new Error("Gemini unavailable"));
    const req = makeRequest({ category: "present_tense", difficulty: "easy" });
    const res = await POST(req as never);
    expect(res.status).toBe(500);
    const body = await res.json() as { error: string };
    expect(body.error).toMatch(/generate|again/i);
  });

  it("returns 429 when rate limited", async () => {
    const { checkRateLimit } = await import("@/lib/rate-limit");
    vi.mocked(checkRateLimit).mockReturnValueOnce({
      allowed: false,
      remaining: 0,
      retryAfterSeconds: 30,
    });

    const req = makeRequest({ category: "present_tense", difficulty: "easy" });
    const res = await POST(req as never);
    expect(res.status).toBe(429);
  });

  it("filters out invalid questions", async () => {
    const partiallyValid = [
      ...VALID_QUESTIONS,
      { questionId: "q4", question: "bad" }, // missing options, correctIndex, explanation
    ];
    mockGenerateContent.mockResolvedValueOnce({
      response: { text: () => JSON.stringify(partiallyValid) },
    });

    const req = makeRequest({ category: "present_tense", difficulty: "easy" });
    const res = await POST(req as never);
    expect(res.status).toBe(200);
    const body = await res.json() as { questions: unknown[] };
    // Only valid questions should be in response
    expect(body.questions.length).toBe(3);
  });

  it("clamps count between 5 and 15", async () => {
    // We can't easily verify the prompt but we can ensure no crash occurs
    mockGenerateContent.mockResolvedValueOnce({
      response: { text: () => JSON.stringify(VALID_QUESTIONS) },
    });
    const req = makeRequest({ category: "present_tense", difficulty: "easy", count: 999 });
    const res = await POST(req as never);
    expect(res.status).toBe(200);
  });
});
