// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// ─── Module-level reset hack ──────────────────────────────────────────────────
// rate-limit.ts uses a module-level Map. We re-import the module fresh per
// describe block via vi.resetModules(), giving each group a clean slate.

describe("checkRateLimit", () => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  let checkRateLimit: typeof import("./rate-limit").checkRateLimit;

  beforeEach(async () => {
    vi.resetModules();
    // Stub setInterval so the cleanup interval doesn't leak
    vi.spyOn(globalThis, "setInterval").mockReturnValue(0 as unknown as ReturnType<typeof setInterval>);
    ({ checkRateLimit } = await import("./rate-limit"));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("allows requests within limit", () => {
    const result = checkRateLimit("user-1", 5, 60_000);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
    expect(result.retryAfterSeconds).toBe(0);
  });

  it("tracks remaining count correctly", () => {
    for (let i = 0; i < 3; i++) checkRateLimit("user-2", 5, 60_000);
    const result = checkRateLimit("user-2", 5, 60_000);
    expect(result.remaining).toBe(1); // 4 used, 1 left
  });

  it("blocks when limit is reached", () => {
    for (let i = 0; i < 5; i++) checkRateLimit("user-3", 5, 60_000);
    const result = checkRateLimit("user-3", 5, 60_000);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
    expect(result.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("uses separate buckets per identifier", () => {
    for (let i = 0; i < 5; i++) checkRateLimit("heavy-user", 5, 60_000);
    const blocked = checkRateLimit("heavy-user", 5, 60_000);
    expect(blocked.allowed).toBe(false);

    const other = checkRateLimit("light-user", 5, 60_000);
    expect(other.allowed).toBe(true);
  });

  it("allows requests again after window expires", async () => {
    vi.useFakeTimers();
    for (let i = 0; i < 3; i++) checkRateLimit("window-user", 3, 100);
    const blocked = checkRateLimit("window-user", 3, 100);
    expect(blocked.allowed).toBe(false);

    // Advance past the window
    vi.advanceTimersByTime(101);
    const allowed = checkRateLimit("window-user", 3, 100);
    expect(allowed.allowed).toBe(true);
    vi.useRealTimers();
  });

  it("retryAfterSeconds is ceil of remaining wait time", () => {
    vi.useFakeTimers();
    const windowMs = 60_000;
    for (let i = 0; i < 2; i++) checkRateLimit("retry-user", 2, windowMs);
    const blocked = checkRateLimit("retry-user", 2, windowMs);
    expect(blocked.retryAfterSeconds).toBe(60); // full window remains
    vi.useRealTimers();
  });
});
