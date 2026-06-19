import { describe, expect, it } from "vitest";

import {
  computeGrade,
  exponentialWeightedAverage,
  isMastered,
} from "./index";

// ─── computeGrade ─────────────────────────────────────────────────────────────

describe("computeGrade", () => {
  it("returns S for score >= 95", () => {
    expect(computeGrade(95)).toBe("S");
    expect(computeGrade(100)).toBe("S");
  });

  it("returns A for score >= 85 and < 95", () => {
    expect(computeGrade(85)).toBe("A");
    expect(computeGrade(94)).toBe("A");
  });

  it("returns B for score >= 75 and < 85", () => {
    expect(computeGrade(75)).toBe("B");
    expect(computeGrade(84)).toBe("B");
  });

  it("returns C for score >= 65 and < 75", () => {
    expect(computeGrade(65)).toBe("C");
    expect(computeGrade(74)).toBe("C");
  });

  it("returns D for score >= 50 and < 65", () => {
    expect(computeGrade(50)).toBe("D");
    expect(computeGrade(64)).toBe("D");
  });

  it("returns F for score < 50", () => {
    expect(computeGrade(49)).toBe("F");
    expect(computeGrade(0)).toBe("F");
  });
});

// ─── isMastered ───────────────────────────────────────────────────────────────

describe("isMastered", () => {
  it("returns true when score >= 90 and attempts >= 3", () => {
    expect(isMastered(90, 3)).toBe(true);
    expect(isMastered(100, 10)).toBe(true);
  });

  it("returns false when score < 90", () => {
    expect(isMastered(89, 5)).toBe(false);
  });

  it("returns false when attempts < 3", () => {
    expect(isMastered(95, 2)).toBe(false);
    expect(isMastered(100, 0)).toBe(false);
  });

  it("requires both conditions simultaneously", () => {
    expect(isMastered(89, 3)).toBe(false);
    expect(isMastered(90, 2)).toBe(false);
  });
});

// ─── exponentialWeightedAverage ───────────────────────────────────────────────

describe("exponentialWeightedAverage", () => {
  it("weights new score at 30% by default", () => {
    // current=60, new=100 → 60*0.7 + 100*0.3 = 42 + 30 = 72
    expect(exponentialWeightedAverage(60, 100)).toBe(72);
  });

  it("weights new score at 50% when alpha=0.5", () => {
    // current=40, new=80 → 40*0.5 + 80*0.5 = 20 + 40 = 60
    expect(exponentialWeightedAverage(40, 80, 0.5)).toBe(60);
  });

  it("returns current when alpha=0", () => {
    expect(exponentialWeightedAverage(50, 100, 0)).toBe(50);
  });

  it("returns new score when alpha=1", () => {
    expect(exponentialWeightedAverage(50, 80, 1)).toBe(80);
  });

  it("rounds to nearest integer", () => {
    // 70*0.7 + 65*0.3 = 49 + 19.5 = 68.5 → rounds to 69
    expect(exponentialWeightedAverage(70, 65)).toBe(69);
  });
});
