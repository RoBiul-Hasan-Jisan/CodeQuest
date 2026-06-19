import { beforeEach, describe, expect, it, vi } from "vitest";

import { XP_LEVEL_THRESHOLDS } from "@/features/progress/types";

import { useProgressStore } from "./progress-store";



// ─── Setup ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2025-06-15T10:00:00"));
  useProgressStore.getState().resetAll();
});

// ─── earnXP ──────────────────────────────────────────────────────────────────

describe("earnXP", () => {
  it("increments totalXP", () => {
    useProgressStore.getState().earnXP(50, "grammar");
    expect(useProgressStore.getState().totalXP).toBe(50);
  });

  it("accumulates XP from multiple calls", () => {
    useProgressStore.getState().earnXP(50, "grammar");
    useProgressStore.getState().earnXP(30, "vocabulary");
    expect(useProgressStore.getState().totalXP).toBe(80);
  });

  it("ignores zero or negative XP", () => {
    useProgressStore.getState().earnXP(0, "grammar");
    useProgressStore.getState().earnXP(-10, "vocabulary");
    expect(useProgressStore.getState().totalXP).toBe(0);
    expect(useProgressStore.getState().xpLog).toHaveLength(0);
  });

  it("logs the XP event", () => {
    useProgressStore.getState().earnXP(25, "speaking", "daily_challenge");
    const log = useProgressStore.getState().xpLog;
    expect(log).toHaveLength(1);
    expect(log[0]?.amount).toBe(25);
    expect(log[0]?.source).toBe("speaking");
    expect(log[0]?.meta).toBe("daily_challenge");
  });

  it("prepends to log (newest first)", () => {
    useProgressStore.getState().earnXP(10, "grammar");
    useProgressStore.getState().earnXP(20, "vocabulary");
    const log = useProgressStore.getState().xpLog;
    expect(log[0]?.amount).toBe(20); // most recent
    expect(log[1]?.amount).toBe(10);
  });
});

// ─── Level progression ────────────────────────────────────────────────────────

describe("level progression", () => {
  it("starts at level 1 with 0 XP", () => {
    expect(useProgressStore.getState().levelInfo.level).toBe(1);
    expect(useProgressStore.getState().levelInfo.totalXP).toBe(0);
  });

  it("advances to level 2 at 200 XP", () => {
    useProgressStore.getState().earnXP(XP_LEVEL_THRESHOLDS[1]!, "grammar"); // 200
    expect(useProgressStore.getState().levelInfo.level).toBe(2);
  });

  it("advances to level 3 at 500 XP", () => {
    useProgressStore.getState().earnXP(XP_LEVEL_THRESHOLDS[2]!, "grammar"); // 500
    expect(useProgressStore.getState().levelInfo.level).toBe(3);
  });

  it("tracks levelProgress as a fraction 0–1", () => {
    // Earn exactly half of level 1 → level 2 band (200 XP wide)
    useProgressStore.getState().earnXP(100, "grammar");
    const { levelProgress, level } = useProgressStore.getState().levelInfo;
    expect(level).toBe(1);
    expect(levelProgress).toBeCloseTo(0.5, 5);
  });

  it("xpToNextLevel decreases as XP grows", () => {
    const before = useProgressStore.getState().levelInfo.xpToNextLevel;
    useProgressStore.getState().earnXP(50, "grammar");
    const after = useProgressStore.getState().levelInfo.xpToNextLevel;
    expect(after).toBe(before - 50);
  });

  it("is not max level at start", () => {
    expect(useProgressStore.getState().levelInfo.isMaxLevel).toBe(false);
  });
});

// ─── resetAll ────────────────────────────────────────────────────────────────

describe("resetAll", () => {
  it("resets XP and level to zero/1", () => {
    useProgressStore.getState().earnXP(500, "grammar");
    useProgressStore.getState().resetAll();
    expect(useProgressStore.getState().totalXP).toBe(0);
    expect(useProgressStore.getState().levelInfo.level).toBe(1);
    expect(useProgressStore.getState().xpLog).toHaveLength(0);
  });
});
