// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// ─── Mock Gemini ──────────────────────────────────────────────────────────────

const mockGenerateContent = vi.fn();
vi.mock("@/lib/gemini", () => ({
  genAI: {
    getGenerativeModel: vi.fn(() => ({ generateContent: mockGenerateContent })),
  },
  GEMINI_MODEL: "gemini-2.0-flash",
}));

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: vi.fn(() => ({ allowed: true, remaining: 29, retryAfterSeconds: 0 })),
}));

const { POST } = await import("./route");

// ─── Fixtures ────────────────────────────────────────────────────────────────

const FEEDBACK_JSON = {
  overallScore: 72,
  clarity: 75,
  fluency: 70,
  vocabulary: 68,
  grammar: 74,
  strengths: ["Good use of varied vocabulary", "Clear sentence structure"],
  improvements: ["Work on verb tenses", "Use more complex sentences"],
  correctedText: "I went to the store yesterday and bought some groceries.",
  tips: ["Practice past tense forms", "Try longer sentences"],
};

function makeRequest(body: Record<string, unknown>): Request {
  return new Request("http://localhost/api/speaking/feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": "127.0.0.1" },
    body: JSON.stringify(body),
  });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

beforeEach(() => vi.clearAllMocks());
afterEach(() => vi.restoreAllMocks());

describe("POST /api/speaking/feedback", () => {
  it("returns 400 when transcript is missing", async () => {
    const req = makeRequest({ scenario: "daily_conversation" });
    const res = await POST(req as never);
    expect(res.status).toBe(400);
    const body = await res.json() as { error: string };
    expect(body.error).toMatch(/required/i);
  });

  it("returns 400 when scenario is missing", async () => {
    const req = makeRequest({ transcript: "Hello there" });
    const res = await POST(req as never);
    expect(res.status).toBe(400);
  });

  it("returns 400 when transcript is empty string", async () => {
    const req = makeRequest({ transcript: "  ", scenario: "daily_conversation" });
    const res = await POST(req as never);
    expect(res.status).toBe(400);
  });

  it("returns 400 when transcript exceeds 5000 chars", async () => {
    const req = makeRequest({
      transcript: "a".repeat(5001),
      scenario: "daily_conversation",
    });
    const res = await POST(req as never);
    expect(res.status).toBe(400);
    const body = await res.json() as { error: string };
    expect(body.error).toMatch(/too long/i);
  });

  it("returns feedback JSON on success", async () => {
    mockGenerateContent.mockResolvedValueOnce({
      response: { text: () => JSON.stringify(FEEDBACK_JSON) },
    });

    const req = makeRequest({
      transcript: "I went to the store yesterday and buyed some foods.",
      scenario: "daily_conversation",
    });
    const res = await POST(req as never);
    expect(res.status).toBe(200);
    const body = await res.json() as typeof FEEDBACK_JSON;
    expect(body.overallScore).toBe(72);
    expect(Array.isArray(body.strengths)).toBe(true);
    expect(Array.isArray(body.improvements)).toBe(true);
  });

  it("strips markdown fences from model response", async () => {
    mockGenerateContent.mockResolvedValueOnce({
      response: {
        text: () => `\`\`\`json\n${JSON.stringify(FEEDBACK_JSON)}\n\`\`\``,
      },
    });

    const req = makeRequest({
      transcript: "Hello how are you doing today",
      scenario: "daily_conversation",
    });
    const res = await POST(req as never);
    expect(res.status).toBe(200);
    const body = await res.json() as { overallScore: number };
    expect(body.overallScore).toBe(72);
  });

  it("returns 500 with generic message when model throws", async () => {
    mockGenerateContent.mockRejectedValueOnce(new Error("Quota exceeded"));
    const req = makeRequest({
      transcript: "Something I said",
      scenario: "daily_conversation",
    });
    const res = await POST(req as never);
    expect(res.status).toBe(500);
    const body = await res.json() as { error: string };
    // Should NOT leak the raw Gemini error message
    expect(body.error).not.toContain("Quota exceeded");
    expect(body.error).toMatch(/failed|again/i);
  });

  it("returns 429 when rate limited", async () => {
    const { checkRateLimit } = await import("@/lib/rate-limit");
    vi.mocked(checkRateLimit).mockReturnValueOnce({
      allowed: false,
      remaining: 0,
      retryAfterSeconds: 45,
    });

    const req = makeRequest({ transcript: "Hello", scenario: "daily_conversation" });
    const res = await POST(req as never);
    expect(res.status).toBe(429);
    const body = await res.json() as { error: string };
    expect(body.error).toMatch(/rate limit|wait/i);
  });

  it("returns 400 for invalid JSON body", async () => {
    const req = new Request("http://localhost/api/speaking/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": "127.0.0.1" },
      body: "{{not json}}",
    });
    const res = await POST(req as never);
    expect(res.status).toBe(400);
  });

  it("uses practicePrompt in the request when provided", async () => {
    mockGenerateContent.mockResolvedValueOnce({
      response: { text: () => JSON.stringify(FEEDBACK_JSON) },
    });
    const req = makeRequest({
      transcript: "Describe your morning routine",
      scenario: "daily_conversation",
      practicePrompt: "Talk about your morning",
    });
    const res = await POST(req as never);
    expect(res.status).toBe(200);
    // Verify prompt was built (model was called)
    expect(mockGenerateContent).toHaveBeenCalledOnce();
    const promptArg: string = (mockGenerateContent.mock.calls[0] as [string])[0];
    expect(promptArg).toContain("Talk about your morning");
  });
});
