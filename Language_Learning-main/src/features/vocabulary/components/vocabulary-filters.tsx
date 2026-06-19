"use client";

import { motion } from "framer-motion";
import { Search, X } from "lucide-react";

import { cn } from "@/lib/utils";

import { WORD_CATEGORIES } from "../constants";
import type { VocabularyStatus, WordCategory } from "../types";


// ─── Search bar ───────────────────────────────────────────────────────────────

interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder = "Search words…" }: SearchBarProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "w-full rounded-xl border border-border bg-background py-2.5 pl-9 pr-9 text-sm",
          "text-foreground placeholder:text-muted-foreground/60",
          "focus:outline-none focus:ring-2 focus:ring-ds-violet/40 transition-all"
        )}
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-muted-foreground/60 hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

// ─── Category filter ──────────────────────────────────────────────────────────

interface CategoryFilterProps {
  value: WordCategory | "all";
  onChange: (v: WordCategory | "all") => void;
}

export function CategoryFilter({ value, onChange }: CategoryFilterProps) {
  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
      <Pill active={value === "all"} onClick={() => onChange("all")}>
        All
      </Pill>
      {WORD_CATEGORIES.map((cat) => (
        <Pill key={cat.value} active={value === cat.value} onClick={() => onChange(cat.value)}>
          <span className="text-sm leading-none">{cat.icon}</span>
          {cat.label}
        </Pill>
      ))}
    </div>
  );
}

// ─── Status filter ────────────────────────────────────────────────────────────

const STATUSES: { value: VocabularyStatus | "all"; label: string; color: string }[] = [
  { value: "all",       label: "All",      color: "bg-muted text-foreground" },
  { value: "new",       label: "New",      color: "bg-slate-400/15 text-slate-400" },
  { value: "learning",  label: "Learning", color: "bg-ds-amber/15 text-ds-amber" },
  { value: "reviewing", label: "Reviewing",color: "bg-ds-violet/15 text-ds-violet" },
  { value: "mastered",  label: "Mastered", color: "bg-ds-green/15 text-ds-green" },
];

interface StatusFilterProps {
  value: VocabularyStatus | "all";
  onChange: (v: VocabularyStatus | "all") => void;
  counts: Record<VocabularyStatus | "all", number>;
}

export function StatusFilter({ value, onChange, counts }: StatusFilterProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {STATUSES.map((s) => (
        <button
          key={s.value}
          onClick={() => onChange(s.value)}
          className={cn(
            "flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition-all",
            value === s.value
              ? cn(s.color, "border-transparent shadow-sm")
              : "border-border bg-transparent text-muted-foreground hover:bg-muted"
          )}
        >
          {s.label}
          <span className="rounded-full bg-black/10 px-1.5 py-0.5 text-[10px] tabular-nums dark:bg-white/10">
            {counts[s.value] ?? 0}
          </span>
        </button>
      ))}
    </div>
  );
}

// ─── Difficulty filter ────────────────────────────────────────────────────────

interface DifficultyFilterProps {
  value: number | null;
  onChange: (v: number | null) => void;
}

export function DifficultyFilter({ value, onChange }: DifficultyFilterProps) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-muted-foreground">Difficulty:</span>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          onClick={() => onChange(value === n ? null : n)}
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-lg transition-all text-xs font-medium",
            value === n
              ? n <= 2
                ? "bg-ds-green/20 text-ds-green ring-1 ring-ds-green/40"
                : n === 3
                ? "bg-ds-amber/20 text-ds-amber ring-1 ring-ds-amber/40"
                : "bg-destructive/20 text-destructive ring-1 ring-destructive/40"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          )}
          title={`Difficulty ${n}`}
        >
          {n}
        </button>
      ))}
      {value !== null && (
        <button
          onClick={() => onChange(null)}
          className="text-[10px] text-muted-foreground hover:text-foreground"
        >
          Clear
        </button>
      )}
    </div>
  );
}

// ─── Sort control ─────────────────────────────────────────────────────────────

export type SortOption = "date-new" | "date-old" | "alpha" | "accuracy" | "due";

interface SortControlProps {
  value: SortOption;
  onChange: (v: SortOption) => void;
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "date-new",  label: "Newest first" },
  { value: "date-old",  label: "Oldest first" },
  { value: "alpha",     label: "A → Z" },
  { value: "due",       label: "Due first" },
  { value: "accuracy",  label: "Lowest accuracy" },
];

export function SortControl({ value, onChange }: SortControlProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as SortOption)}
      className="rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ds-violet/40"
    >
      {SORT_OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

// ─── Shared pill ──────────────────────────────────────────────────────────────

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex shrink-0 items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition-all",
        active
          ? "border-ds-violet/30 bg-ds-violet/10 text-ds-violet"
          : "border-border bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      {active && (
        <motion.span
          layoutId="category-pill"
          className="absolute inset-0 rounded-xl border border-ds-violet/30 bg-ds-violet/10"
          transition={{ type: "spring", stiffness: 500, damping: 35 }}
          style={{ zIndex: -1 }}
        />
      )}
      {children}
    </button>
  );
}
