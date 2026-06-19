import { beforeEach, describe, expect, it, vi } from "vitest";

import type { GrammarAttemptInput, GrammarTopicInput } from "../types";

import { useGrammarStore } from "./grammar-store";

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const TOPIC: GrammarTopicInput = {
  topicId: "present_tense",
  name: "Present Tense",
  category: "present_tense",
  language: "English",
  difficulty: "easy",
};

const ATTEMPT: GrammarAttemptInput = {
  topicId: "present_tense",
  score: 80,
  questionsTotal: 10,
  questionsCorrect: 8,
  timeTakenSeconds: 120,
};

// ─── Setup ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2025-06-15T10:00:00"));
  useGrammarStore.getState().resetAll();
});

// ─── registerTopic ────────────────────────────────────────────────────────────

describe("registerTopic", () => {
  it("adds a new topic", () => {
    useGrammarStore.getState().registerTopic(TOPIC);
    const state = useGrammarStore.getState();
    expect(state.topics["present_tense"]).toBeDefined();
    expect(state.topics["present_tense"]?.name).toBe("Present Tense");
  });

  it("does not overwrite an existing topic", () => {
    useGrammarStore.getState().registerTopic(TOPIC);
    useGrammarStore.getState().recordAttempt({ ...ATTEMPT, score: 90 });
    const scoreAfterAttempt = useGrammarStore.getState().topics["present_tense"]?.currentScore;

    // Re-register — should be a no-op
    useGrammarStore.getState().registerTopic(TOPIC);
    const scoreAfterReg = useGrammarStore.getState().topics["present_tense"]?.currentScore;
    expect(scoreAfterReg).toBe(scoreAfterAttempt);
  });

  it("initialises topic with zero score", () => {
    useGrammarStore.getState().registerTopic(TOPIC);
    const topic = useGrammarStore.getState().topics["present_tense"];
    expect(topic?.currentScore).toBe(0);
    expect(topic?.totalAttempts).toBe(0);
  });
});

// ─── recordAttempt ────────────────────────────────────────────────────────────

describe("recordAttempt", () => {
  beforeEach(() => {
    useGrammarStore.getState().registerTopic(TOPIC);
  });

  it("auto-registers missing topic before recording", () => {
    useGrammarStore.getState().resetAll();
    // Topic not registered yet
    useGrammarStore.getState().recordAttempt({
      ...ATTEMPT,
      topicId: "articles",
    });
    expect(useGrammarStore.getState().topics["articles"]).toBeDefined();
  });

  it("increments totalAttempts", () => {
    useGrammarStore.getState().recordAttempt(ATTEMPT);
    expect(useGrammarStore.getState().topics["present_tense"]?.totalAttempts).toBe(1);
    useGrammarStore.getState().recordAttempt(ATTEMPT);
    expect(useGrammarStore.getState().topics["present_tense"]?.totalAttempts).toBe(2);
  });

  it("updates currentScore via EWA", () => {
    useGrammarStore.getState().recordAttempt({ ...ATTEMPT, score: 100 });
    const score = useGrammarStore.getState().topics["present_tense"]?.currentScore;
    // First attempt sets score directly (not via EWA) → score = input.score
    expect(score).toBe(100);
    // Second attempt uses EWA: EWA(100, 80, 0.3) = 100*0.7 + 80*0.3 = 94
    useGrammarStore.getState().recordAttempt({ ...ATTEMPT, score: 80 });
    const score2 = useGrammarStore.getState().topics["present_tense"]?.currentScore;
    expect(score2).toBeCloseTo(94, 0);
  });

  it("tracks bestScore", () => {
    useGrammarStore.getState().recordAttempt({ ...ATTEMPT, score: 70 });
    useGrammarStore.getState().recordAttempt({ ...ATTEMPT, score: 90 });
    useGrammarStore.getState().recordAttempt({ ...ATTEMPT, score: 60 });
    expect(useGrammarStore.getState().topics["present_tense"]?.bestScore).toBe(90);
  });

  it("adds attempt to history", () => {
    useGrammarStore.getState().recordAttempt(ATTEMPT);
    const history = useGrammarStore.getState().attemptHistory;
    expect(history).toHaveLength(1);
    expect(history[0]?.topicId).toBe("present_tense");
    expect(history[0]?.score).toBe(80);
  });

  it("updates aggregate overallScore", () => {
    useGrammarStore.getState().recordAttempt({ ...ATTEMPT, score: 100 });
    expect(useGrammarStore.getState().overallScore).toBeGreaterThan(0);
  });

  it("marks topic mastered after high scores and enough attempts", () => {
    // Need score >= 90 and attempts >= 3
    for (let i = 0; i < 10; i++) {
      useGrammarStore.getState().recordAttempt({ ...ATTEMPT, score: 100 });
    }
    const topic = useGrammarStore.getState().topics["present_tense"];
    expect(topic?.mastered).toBe(true);
    expect(useGrammarStore.getState().masteredTopicIds).toContain("present_tense");
  });

  it("tracks accuracy correctly", () => {
    useGrammarStore.getState().recordAttempt({
      ...ATTEMPT,
      questionsTotal: 10,
      questionsCorrect: 7,
    });
    const topic = useGrammarStore.getState().topics["present_tense"];
    expect(topic?.accuracy).toBeCloseTo(0.7, 5);
  });
});

// ─── Aggregate selectors ──────────────────────────────────────────────────────

describe("aggregate state", () => {
  it("lists weak topics (score < 60)", () => {
    useGrammarStore.getState().registerTopic(TOPIC);
    useGrammarStore.getState().recordAttempt({ ...ATTEMPT, score: 20 });
    // EWA(0,20) = 6 → weak
    expect(useGrammarStore.getState().weakTopicIds).toContain("present_tense");
  });

  it("lists strong topics (score >= 85)", () => {
    useGrammarStore.getState().registerTopic(TOPIC);
    // Force score high via many perfect attempts
    for (let i = 0; i < 20; i++) {
      useGrammarStore.getState().recordAttempt({ ...ATTEMPT, score: 100 });
    }
    expect(useGrammarStore.getState().strongTopicIds).toContain("present_tense");
  });
});

// ─── resetAll ────────────────────────────────────────────────────────────────

describe("resetAll", () => {
  it("clears all topics and history", () => {
    useGrammarStore.getState().registerTopic(TOPIC);
    useGrammarStore.getState().recordAttempt(ATTEMPT);
    useGrammarStore.getState().resetAll();

    const state = useGrammarStore.getState();
    expect(Object.keys(state.topics)).toHaveLength(0);
    expect(state.attemptHistory).toHaveLength(0);
    expect(state.overallScore).toBe(0);
  });
});
