import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  DEFAULT_DAILY_GOAL,
  daysBetween,
  evaluateGoal,
  lastNDays,
  todayDate,
  yesterdayDate,
} from "./index";

// ─── todayDate ────────────────────────────────────────────────────────────────

describe("todayDate", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-06-15T12:00:00"));
  });
  afterEach(() => vi.useRealTimers());

  it("returns YYYY-MM-DD format", () => {
    expect(todayDate()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("returns the current local date", () => {
    expect(todayDate()).toBe("2025-06-15");
  });
});

// ─── yesterdayDate ────────────────────────────────────────────────────────────

describe("yesterdayDate", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-06-15T12:00:00"));
  });
  afterEach(() => vi.useRealTimers());

  it("returns one day before today", () => {
    expect(yesterdayDate()).toBe("2025-06-14");
  });

  it("handles month boundary", () => {
    vi.setSystemTime(new Date("2025-07-01T12:00:00"));
    expect(yesterdayDate()).toBe("2025-06-30");
  });

  it("handles year boundary", () => {
    vi.setSystemTime(new Date("2025-01-01T12:00:00"));
    expect(yesterdayDate()).toBe("2024-12-31");
  });
});

// ─── lastNDays ────────────────────────────────────────────────────────────────

describe("lastNDays", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-06-15T12:00:00"));
  });
  afterEach(() => vi.useRealTimers());

  it("returns N dates", () => {
    expect(lastNDays(7)).toHaveLength(7);
    expect(lastNDays(30)).toHaveLength(30);
  });

  it("returns dates newest-first", () => {
    const days = lastNDays(3);
    expect(days[0]).toBe("2025-06-15"); // today
    expect(days[1]).toBe("2025-06-14"); // yesterday
    expect(days[2]).toBe("2025-06-13");
  });

  it("all dates are in YYYY-MM-DD format", () => {
    lastNDays(14).forEach((d) => expect(d).toMatch(/^\d{4}-\d{2}-\d{2}$/));
  });

  it("returns [today] for n=1", () => {
    expect(lastNDays(1)).toEqual(["2025-06-15"]);
  });
});

// ─── daysBetween ─────────────────────────────────────────────────────────────

describe("daysBetween", () => {
  it("returns 0 for same date", () => {
    expect(daysBetween("2025-01-01", "2025-01-01")).toBe(0);
  });

  it("returns positive when b > a", () => {
    expect(daysBetween("2025-01-01", "2025-01-08")).toBe(7);
  });

  it("returns negative when b < a", () => {
    expect(daysBetween("2025-01-08", "2025-01-01")).toBe(-7);
  });

  it("handles month boundaries", () => {
    expect(daysBetween("2025-01-30", "2025-02-02")).toBe(3);
  });

  it("handles year boundaries", () => {
    expect(daysBetween("2024-12-31", "2025-01-01")).toBe(1);
  });
});

// ─── evaluateGoal ─────────────────────────────────────────────────────────────

describe("evaluateGoal", () => {
  const goal = DEFAULT_DAILY_GOAL; // { xpTarget: 50, minutesTarget: 15, lessonsTarget: 1 }

  it("returns true when XP target met", () => {
    expect(evaluateGoal(goal, 50, 0, 0)).toBe(true);
    expect(evaluateGoal(goal, 100, 0, 0)).toBe(true);
  });

  it("returns true when minutes target met", () => {
    expect(evaluateGoal(goal, 0, 15, 0)).toBe(true);
  });

  it("returns true when lessons target met", () => {
    expect(evaluateGoal(goal, 0, 0, 1)).toBe(true);
  });

  it("returns false when nothing is met", () => {
    expect(evaluateGoal(goal, 49, 14, 0)).toBe(false);
  });

  it("returns false for all zeros", () => {
    expect(evaluateGoal(goal, 0, 0, 0)).toBe(false);
  });

  it("uses OR logic — any single threshold is enough", () => {
    // Only one condition needs to be true
    expect(evaluateGoal(goal, 50, 0, 0)).toBe(true);
    expect(evaluateGoal(goal, 0, 15, 0)).toBe(true);
    expect(evaluateGoal(goal, 0, 0, 1)).toBe(true);
  });
});
