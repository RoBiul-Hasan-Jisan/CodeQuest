import { beforeEach, describe, expect, it, vi } from "vitest";

import type { VocabularyWordInput } from "../types";

import { useVocabularyStore } from "./vocabulary-store";

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const WORD: VocabularyWordInput = {
  word: "serendipity",
  translation: "finding something good unexpectedly",
  definition: "The occurrence of events by chance in a happy or beneficial way.",
  exampleSentence: "It was sheer serendipity that they met.",
  language: "English",
  category: "abstract",
  difficulty: 4,
  tags: ["noun", "advanced"],
  pronunciation: "/ˌserənˈdɪpɪti/",
};

const WORD_2: VocabularyWordInput = {
  word: "ephemeral",
  translation: "fleeting, short-lived",
  definition: "Lasting for a very short time.",
  exampleSentence: "The ephemeral beauty of cherry blossoms.",
  language: "English",
  category: "adjective",
  difficulty: 3,
  tags: ["adjective", "intermediate"],
};

// ─── Setup ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2025-06-15T10:00:00"));
  useVocabularyStore.getState().resetAll();
});

// ─── addWord ─────────────────────────────────────────────────────────────────

describe("addWord", () => {
  it("adds a word to the library", () => {
    useVocabularyStore.getState().addWord(WORD);
    expect(useVocabularyStore.getState().totalWords).toBe(1);
  });

  it("assigns a unique wordId", () => {
    useVocabularyStore.getState().addWord(WORD);
    const words = Object.values(useVocabularyStore.getState().words);
    expect(words[0]?.wordId).toBeDefined();
    expect(words[0]?.wordId).toMatch(/^word_/);
  });

  it("starts word with status 'new'", () => {
    useVocabularyStore.getState().addWord(WORD);
    const word = Object.values(useVocabularyStore.getState().words)[0];
    expect(word?.status).toBe("new");
  });

  it("increments totalWords counter", () => {
    useVocabularyStore.getState().addWord(WORD);
    useVocabularyStore.getState().addWord(WORD_2);
    expect(useVocabularyStore.getState().totalWords).toBe(2);
  });
});

// ─── addWords ────────────────────────────────────────────────────────────────

describe("addWords", () => {
  it("adds multiple words at once", () => {
    useVocabularyStore.getState().addWords([WORD, WORD_2]);
    expect(useVocabularyStore.getState().totalWords).toBe(2);
  });
});

// ─── removeWord ──────────────────────────────────────────────────────────────

describe("removeWord", () => {
  it("removes a word by id", () => {
    useVocabularyStore.getState().addWord(WORD);
    const wordId = Object.keys(useVocabularyStore.getState().words)[0]!;
    useVocabularyStore.getState().removeWord(wordId);
    expect(useVocabularyStore.getState().totalWords).toBe(0);
    expect(useVocabularyStore.getState().words[wordId]).toBeUndefined();
  });
});

// ─── toggleFavorite ──────────────────────────────────────────────────────────

describe("toggleFavorite", () => {
  it("marks word as favorite", () => {
    useVocabularyStore.getState().addWord(WORD);
    const wordId = Object.keys(useVocabularyStore.getState().words)[0]!;
    useVocabularyStore.getState().toggleFavorite(wordId);
    expect(useVocabularyStore.getState().words[wordId]?.isFavorite).toBe(true);
  });

  it("un-favorites a favorited word", () => {
    useVocabularyStore.getState().addWord(WORD);
    const wordId = Object.keys(useVocabularyStore.getState().words)[0]!;
    useVocabularyStore.getState().toggleFavorite(wordId);
    useVocabularyStore.getState().toggleFavorite(wordId);
    expect(useVocabularyStore.getState().words[wordId]?.isFavorite).toBe(false);
  });
});

// ─── reviewWord ──────────────────────────────────────────────────────────────

describe("reviewWord", () => {
  it("changes word status from new → learning after first review", () => {
    useVocabularyStore.getState().addWord(WORD);
    const wordId = Object.keys(useVocabularyStore.getState().words)[0]!;
    useVocabularyStore.getState().reviewWord(wordId, 3); // quality 3 = good
    const word = useVocabularyStore.getState().words[wordId];
    expect(word?.status).not.toBe("new");
    expect(word?.totalReviews).toBe(1);
  });

  it("increments totalReviews", () => {
    useVocabularyStore.getState().addWord(WORD);
    const wordId = Object.keys(useVocabularyStore.getState().words)[0]!;
    useVocabularyStore.getState().reviewWord(wordId, 3);
    useVocabularyStore.getState().reviewWord(wordId, 4);
    expect(useVocabularyStore.getState().words[wordId]?.totalReviews).toBe(2);
  });

  it("sets lastReviewedAt to a timestamp", () => {
    useVocabularyStore.getState().addWord(WORD);
    const wordId = Object.keys(useVocabularyStore.getState().words)[0]!;
    useVocabularyStore.getState().reviewWord(wordId, 4);
    expect(useVocabularyStore.getState().words[wordId]?.lastReviewedAt).toBeDefined();
  });

  it("tracks accuracy", () => {
    useVocabularyStore.getState().addWord(WORD);
    const wordId = Object.keys(useVocabularyStore.getState().words)[0]!;
    // Quality >= 3 = correct
    useVocabularyStore.getState().reviewWord(wordId, 4); // correct
    useVocabularyStore.getState().reviewWord(wordId, 1); // incorrect
    const word = useVocabularyStore.getState().words[wordId];
    expect(word?.accuracy).toBeCloseTo(0.5, 5);
  });

  it("eventually marks word as mastered after many good reviews", () => {
    useVocabularyStore.getState().addWord(WORD);
    const wordId = Object.keys(useVocabularyStore.getState().words)[0]!;
    for (let i = 0; i < 15; i++) {
      useVocabularyStore.getState().reviewWord(wordId, 5); // perfect recall
      // Advance time so nextReviewDate is in the past for next review
      vi.advanceTimersByTime(24 * 60 * 60 * 1000);
    }
    const word = useVocabularyStore.getState().words[wordId];
    expect(word?.status).toBe("mastered");
  });
});

// ─── getDueWords ─────────────────────────────────────────────────────────────

describe("getDueWords", () => {
  it("returns all new words immediately (due from day 0)", () => {
    useVocabularyStore.getState().addWords([WORD, WORD_2]);
    const due = useVocabularyStore.getState().getDueWords();
    expect(due).toHaveLength(2);
  });

  it("excludes words whose next review is in the future", () => {
    useVocabularyStore.getState().addWord(WORD);
    const wordId = Object.keys(useVocabularyStore.getState().words)[0]!;
    // Review with quality 5 → long interval
    useVocabularyStore.getState().reviewWord(wordId, 5);
    // Word should now be scheduled far in the future
    const due = useVocabularyStore.getState().getDueWords();
    expect(due).toHaveLength(0);
  });
});

// ─── resetAll ────────────────────────────────────────────────────────────────

describe("resetAll", () => {
  it("clears all words", () => {
    useVocabularyStore.getState().addWords([WORD, WORD_2]);
    useVocabularyStore.getState().resetAll();
    expect(useVocabularyStore.getState().totalWords).toBe(0);
    expect(Object.keys(useVocabularyStore.getState().words)).toHaveLength(0);
  });
});
