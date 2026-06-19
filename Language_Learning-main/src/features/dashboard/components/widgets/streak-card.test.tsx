import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";


import { useStreakStore } from "@/features/streak/store/streak-store";
import { render, screen } from "@/test/test-utils";

import { StreakCard } from "./streak-card";


// ─── Setup ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2025-06-15T10:00:00"));
  useStreakStore.getState().resetAll();
});

afterEach(() => {
  vi.useRealTimers();
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("StreakCard", () => {
  it("renders the card heading", () => {
    render(<StreakCard />);
    expect(screen.getByText("Learning Streak")).toBeInTheDocument();
  });

  it("shows 0 streak count when no activity", () => {
    render(<StreakCard />);
    // The streak count appears in the flame badge (orange circle)
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("shows current streak after recording activity", () => {
    useStreakStore.getState().recordActivity({ xp: 30 });
    render(<StreakCard />);
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("shows longest streak in the Best section", () => {
    useStreakStore.getState().recordActivity({ xp: 10 });
    vi.setSystemTime(new Date("2025-06-16T10:00:00"));
    useStreakStore.getState().recordActivity({ xp: 10 });
    render(<StreakCard />);
    // longestStreak = 2 → shown next to Trophy icon as "2d"
    expect(screen.getByText("2d")).toBeInTheDocument();
  });

  it("renders 7 day pills", () => {
    render(<StreakCard />);
    // 7 days: each pill shows either a day label (Mon–Sun) or "Today"
    // Check that "Today" appears for current day pill
    expect(screen.getByText("Today")).toBeInTheDocument();
  });

  it("renders the legend", () => {
    render(<StreakCard />);
    expect(screen.getByText(/completed/i)).toBeInTheDocument();
    expect(screen.getByText(/partial/i)).toBeInTheDocument();
    expect(screen.getByText(/missed/i)).toBeInTheDocument();
  });

  it("shows 'Last 7 days' subtitle", () => {
    render(<StreakCard />);
    expect(screen.getByText("Last 7 days")).toBeInTheDocument();
  });
});
