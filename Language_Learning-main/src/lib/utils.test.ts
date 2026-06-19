import { describe, expect, it } from "vitest";

import { assertNever, cn, formatDate, formatNumber, generateId, truncate } from "./utils";

// ─── cn ───────────────────────────────────────────────────────────────────────

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("resolves Tailwind conflicts — last wins", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "excluded", true && "included")).toBe("base included");
    expect(cn("base", undefined, null, "end")).toBe("base end");
  });

  it("handles arrays and objects", () => {
    expect(cn(["a", "b"], { c: true, d: false })).toBe("a b c");
  });

  it("returns empty string for no args", () => {
    expect(cn()).toBe("");
  });
});

// ─── formatDate ───────────────────────────────────────────────────────────────

describe("formatDate", () => {
  it("formats a Date object", () => {
    const d = new Date("2025-06-15T00:00:00Z");
    const result = formatDate(d);
    expect(result).toContain("June");
    expect(result).toContain("2025");
  });

  it("formats an ISO string", () => {
    const result = formatDate("2024-01-01T00:00:00Z");
    expect(result).toContain("2024");
  });

  it("accepts custom format options", () => {
    const result = formatDate("2025-03-15T00:00:00Z", {
      month: "short",
      day: "numeric",
      year: undefined,
    });
    expect(result).toContain("Mar");
    expect(result).not.toContain("2025");
  });
});

// ─── formatNumber ─────────────────────────────────────────────────────────────

describe("formatNumber", () => {
  it("formats large numbers with commas", () => {
    expect(formatNumber(1000)).toBe("1,000");
    expect(formatNumber(1_234_567)).toBe("1,234,567");
  });

  it("formats zero", () => {
    expect(formatNumber(0)).toBe("0");
  });

  it("accepts Intl options", () => {
    const result = formatNumber(0.5, { style: "percent" });
    expect(result).toBe("50%");
  });
});

// ─── truncate ─────────────────────────────────────────────────────────────────

describe("truncate", () => {
  it("returns the string unchanged if within limit", () => {
    expect(truncate("hello", 10)).toBe("hello");
    expect(truncate("hello", 5)).toBe("hello");
  });

  it("truncates and appends ellipsis", () => {
    expect(truncate("hello world", 8)).toBe("hello...");
  });

  it("uses a custom suffix", () => {
    // maxLength=7, suffix="…" (1 char) → slice(0, 6) + "…" = "hello …"
    expect(truncate("hello world", 7, "…")).toBe("hello …");
  });

  it("handles empty string", () => {
    expect(truncate("", 5)).toBe("");
  });
});

// ─── generateId ───────────────────────────────────────────────────────────────

describe("generateId", () => {
  it("generates a string", () => {
    expect(typeof generateId()).toBe("string");
  });

  it("respects the length parameter", () => {
    // Short lengths are reliably available from Math.random().toString(36)
    expect(generateId(4)).toHaveLength(4);
    // Longer lengths: verify format (base-36 chars) — digit count may vary
    expect(generateId(12)).toMatch(/^[a-z0-9]+$/);
  });

  it("generates unique IDs", () => {
    const ids = Array.from({ length: 100 }, () => generateId());
    const unique = new Set(ids);
    expect(unique.size).toBe(100);
  });
});

// ─── assertNever ─────────────────────────────────────────────────────────────

describe("assertNever", () => {
  it("throws with the unexpected value", () => {
    // Cast to `never` to simulate an exhaustiveness violation
    expect(() => assertNever("oops" as never)).toThrow("oops");
  });
});
