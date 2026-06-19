import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useStreakStore } from "./streak-store";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const TODAY = "2025-06-15";
const YESTERDAY = "2025-06-14";
const TWO_DAYS_AGO = "2025-06-13";

function resetStore() {
  useStreakStore.getState().resetAll();
}

// ─── Setup ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(`${TODAY}T10:00:00`));
  resetStore();
});

afterEach(() => {
  vi.useRealTimers();
});

// ─── Initial state ────────────────────────────────────────────────────────────

describe("initial state", () => {
  it("starts with zero streak", () => {
    const { currentStreak, longestStreak } = useStreakStore.getState();
    expect(currentStreak).toBe(0);
    expect(longestStreak).toBe(0);
  });

  it("starts with no history", () => {
    expect(useStreakStore.getState().history).toHaveLength(0);
  });

  it("starts with zero today totals", () => {
    const { todayXP, todayMinutes, todayLessons } = useStreakStore.getState();
    expect(todayXP).toBe(0);
    expect(todayMinutes).toBe(0);
    expect(todayLessons).toBe(0);
  });
});

// ─── recordActivity ───────────────────────────────────────────────────────────

describe("recordActivity", () => {
  it("accumulates XP", () => {
    const { recordActivity } = useStreakStore.getState();
    recordActivity({ xp: 30 });
    recordActivity({ xp: 20 });
    expect(useStreakStore.getState().todayXP).toBe(50);
  });

  it("accumulates minutes and lessons", () => {
    const { recordActivity } = useStreakStore.getState();
    recordActivity({ minutes: 10, lessons: 1 });
    recordActivity({ minutes: 5 });
    expect(useStreakStore.getState().todayMinutes).toBe(15);
    expect(useStreakStore.getState().todayLessons).toBe(1);
  });

  it("increments streak on first activity today", () => {
    useStreakStore.getState().recordActivity({ xp: 10 });
    expect(useStreakStore.getState().currentStreak).toBe(1);
  });

  it("does not double-count streak within the same day", () => {
    const { recordActivity } = useStreakStore.getState();
    recordActivity({ xp: 10 });
    recordActivity({ xp: 10 });
    expect(useStreakStore.getState().currentStreak).toBe(1);
  });

  it("extends streak on consecutive days", () => {
    // Day 1
    useStreakStore.getState().recordActivity({ xp: 10 });
    expect(useStreakStore.getState().currentStreak).toBe(1);

    // Day 2 (advance to tomorrow)
    vi.setSystemTime(new Date("2025-06-16T10:00:00"));
    useStreakStore.getState().recordActivity({ xp: 10 });
    expect(useStreakStore.getState().currentStreak).toBe(2);
  });

  it("resets streak after a gap", () => {
    useStreakStore.getState().recordActivity({ xp: 10 });

    // Skip a day → advance 2 days
    vi.setSystemTime(new Date("2025-06-17T10:00:00"));
    useStreakStore.getState().recordActivity({ xp: 10 });
    expect(useStreakStore.getState().currentStreak).toBe(1);
  });

  it("updates longestStreak", () => {
    useStreakStore.getState().recordActivity({ xp: 10 });
    vi.setSystemTime(new Date("2025-06-16T10:00:00"));
    useStreakStore.getState().recordActivity({ xp: 10 });
    vi.setSystemTime(new Date("2025-06-17T10:00:00"));
    useStreakStore.getState().recordActivity({ xp: 10 });
    expect(useStreakStore.getState().longestStreak).toBe(3);
  });

  it("marks goal completed when XP target is met", () => {
    useStreakStore.getState().recordActivity({ xp: 50 }); // default xpTarget = 50
    expect(useStreakStore.getState().todayGoalCompleted).toBe(true);
  });

  it("marks goal incomplete before target is met", () => {
    useStreakStore.getState().recordActivity({ xp: 49 });
    expect(useStreakStore.getState().todayGoalCompleted).toBe(false);
  });

  it("adds today to history", () => {
    useStreakStore.getState().recordActivity({ xp: 10, minutes: 5 });
    const history = useStreakStore.getState().history;
    const todayEntry = history.find((d) => d.date === TODAY);
    expect(todayEntry).toBeDefined();
    expect(todayEntry?.xpEarned).toBe(10);
    expect(todayEntry?.minutesPracticed).toBe(5);
  });

  it("history entry status is 'partial' when goal not met", () => {
    useStreakStore.getState().recordActivity({ xp: 10 });
    const entry = useStreakStore.getState().history.find((d) => d.date === TODAY);
    expect(entry?.status).toBe("partial");
  });

  it("history entry status is 'completed' when goal is met", () => {
    useStreakStore.getState().recordActivity({ xp: 50 });
    const entry = useStreakStore.getState().history.find((d) => d.date === TODAY);
    expect(entry?.status).toBe("completed");
  });
});

// ─── setDailyGoal ─────────────────────────────────────────────────────────────

describe("setDailyGoal", () => {
  it("updates the XP target", () => {
    useStreakStore.getState().setDailyGoal({ xpTarget: 100 });
    expect(useStreakStore.getState().dailyGoal.xpTarget).toBe(100);
  });

  it("partially updates goal without clobbering other fields", () => {
    useStreakStore.getState().setDailyGoal({ minutesTarget: 30 });
    const { dailyGoal } = useStreakStore.getState();
    expect(dailyGoal.minutesTarget).toBe(30);
    expect(dailyGoal.xpTarget).toBe(50); // unchanged default
  });
});

// ─── addStreakFreezes ─────────────────────────────────────────────────────────

describe("addStreakFreezes", () => {
  it("adds freezes", () => {
    useStreakStore.getState().addStreakFreezes(2);
    expect(useStreakStore.getState().streakFreezes).toBe(2);
  });

  it("caps at 5 freezes", () => {
    useStreakStore.getState().addStreakFreezes(10);
    expect(useStreakStore.getState().streakFreezes).toBe(5);
  });

  it("defaults to adding 1 freeze", () => {
    useStreakStore.getState().addStreakFreezes();
    expect(useStreakStore.getState().streakFreezes).toBe(1);
  });
});

// ─── useStreakFreeze ──────────────────────────────────────────────────────────

describe("useStreakFreeze", () => {
  it("returns false when no freezes available", () => {
    useStreakStore.getState().recordActivity({ xp: 10 }); // build a streak
    const result = useStreakStore.getState().useStreakFreeze();
    expect(result).toBe(false);
  });

  it("returns false when streak is 0", () => {
    useStreakStore.getState().addStreakFreezes(1);
    const result = useStreakStore.getState().useStreakFreeze();
    expect(result).toBe(false);
  });

  it("consumes a freeze and marks yesterday as frozen", () => {
    useStreakStore.getState().recordActivity({ xp: 10 }); // streak = 1
    useStreakStore.getState().addStreakFreezes(2);

    const result = useStreakStore.getState().useStreakFreeze();
    expect(result).toBe(true);
    expect(useStreakStore.getState().streakFreezes).toBe(1);

    const yesterdayEntry = useStreakStore.getState().history.find((d) => d.date === YESTERDAY);
    expect(yesterdayEntry?.status).toBe("frozen");
  });
});

// ─── syncOnAppLoad ────────────────────────────────────────────────────────────

describe("syncOnAppLoad", () => {
  it("resets today totals on a fresh day", () => {
    // Set up state from yesterday
    useStreakStore.setState({ todayXP: 50, todayMinutes: 20, lastActiveDate: YESTERDAY });

    useStreakStore.getState().syncOnAppLoad();

    const { todayXP, todayMinutes } = useStreakStore.getState();
    expect(todayXP).toBe(0);
    expect(todayMinutes).toBe(0);
  });

  it("breaks streak when last activity was 2+ days ago", () => {
    useStreakStore.setState({
      currentStreak: 5,
      lastActiveDate: TWO_DAYS_AGO,
    });

    useStreakStore.getState().syncOnAppLoad();
    expect(useStreakStore.getState().currentStreak).toBe(0);
  });

  it("preserves streak when last active was today", () => {
    useStreakStore.setState({ currentStreak: 3, lastActiveDate: TODAY });
    useStreakStore.getState().syncOnAppLoad();
    expect(useStreakStore.getState().currentStreak).toBe(3);
  });
});

// ─── resetAll ────────────────────────────────────────────────────────────────

describe("resetAll", () => {
  it("returns store to initial state", () => {
    useStreakStore.getState().recordActivity({ xp: 100 });
    useStreakStore.getState().addStreakFreezes(3);
    useStreakStore.getState().resetAll();

    const state = useStreakStore.getState();
    expect(state.currentStreak).toBe(0);
    expect(state.todayXP).toBe(0);
    expect(state.streakFreezes).toBe(0);
    expect(state.history).toHaveLength(0);
  });
});
