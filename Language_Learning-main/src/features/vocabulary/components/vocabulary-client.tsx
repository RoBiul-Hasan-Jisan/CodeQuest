"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  BookOpen,
  Star,
  Flame,
  Library,
  LayoutGrid,
  LayoutList,
  Download,
  Layers,
} from "lucide-react";
import { useState, useMemo, useCallback } from "react";
import { useShallow } from "zustand/react/shallow";


import { EmptyData, EmptySearch } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

import { SAMPLE_WORDS } from "../data/sample-words";
import { useVocabularyStore } from "../store/vocabulary-store";
import type { VocabularyStatus, VocabularyWord, WordCategory } from "../types";

import { AddWordDialog } from "./add-word-dialog";
import { DailyChallenge } from "./daily-challenge";
import { FlashcardSession } from "./flashcard-session";
import { SearchBar, CategoryFilter, StatusFilter, DifficultyFilter, SortControl, type SortOption } from "./vocabulary-filters";
import { WordCard } from "./word-card";


// ─── Tab types ────────────────────────────────────────────────────────────────

type Tab = "library" | "flashcards" | "favorites" | "challenge";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "library",    label: "Library",        icon: <Library className="h-4 w-4" /> },
  { id: "flashcards", label: "Flashcards",     icon: <Layers className="h-4 w-4" /> },
  { id: "favorites",  label: "Favorites",      icon: <Star className="h-4 w-4" /> },
  { id: "challenge",  label: "Daily Challenge",icon: <Flame className="h-4 w-4" /> },
];

// ─── Stats bar ────────────────────────────────────────────────────────────────

function StatsBar() {
  const { totalWords, totalLearned, totalMastered, totalDueToday } = useVocabularyStore(
    useShallow((s) => ({ totalWords: s.totalWords, totalLearned: s.totalLearned, totalMastered: s.totalMastered, totalDueToday: s.totalDueToday }))
  );

  const stats = [
    { label: "Total",    value: totalWords,    color: "text-foreground" },
    { label: "Learned",  value: totalLearned,  color: "text-ds-teal" },
    { label: "Mastered", value: totalMastered, color: "text-ds-green" },
    { label: "Due",      value: totalDueToday, color: totalDueToday > 0 ? "text-ds-amber" : "text-muted-foreground" },
  ];

  return (
    <div className="grid grid-cols-4 gap-2">
      {stats.map((s) => (
        <div key={s.label} className="flex flex-col items-center rounded-xl border border-border bg-card p-3 text-center shadow-soft">
          <span className={cn("text-xl font-bold tabular-nums", s.color)}>{s.value}</span>
          <span className="text-[10px] text-muted-foreground">{s.label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Word library ─────────────────────────────────────────────────────────────

function WordLibrary({ onFlashcard }: { onFlashcard: (words: VocabularyWord[]) => void }) {
  const allWords = useVocabularyStore(useShallow((s) => Object.values(s.words)));

  const [search, setSearch]         = useState("");
  const [category, setCategory]     = useState<WordCategory | "all">("all");
  const [status, setStatus]         = useState<VocabularyStatus | "all">("all");
  const [difficulty, setDifficulty] = useState<number | null>(null);
  const [sort, setSort]             = useState<SortOption>("date-new");
  const [view, setView]             = useState<"grid" | "list">("grid");

  // Status counts
  const statusCounts = useMemo(() => {
    const counts: Record<VocabularyStatus | "all", number> = {
      all: allWords.length, new: 0, learning: 0, reviewing: 0, mastered: 0,
    };
    for (const w of allWords) counts[w.status]++;
    return counts;
  }, [allWords]);

  // Filtered + sorted words
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return allWords
      .filter((w) => {
        if (q && !w.word.toLowerCase().includes(q) && !w.translation.toLowerCase().includes(q) && !w.definition?.toLowerCase().includes(q)) return false;
        if (category !== "all" && w.category !== category) return false;
        if (status !== "all" && w.status !== status) return false;
        if (difficulty !== null && w.difficulty !== difficulty) return false;
        return true;
      })
      .sort((a, b) => {
        switch (sort) {
          case "date-old":   return a.addedAt.localeCompare(b.addedAt);
          case "alpha":      return a.word.localeCompare(b.word);
          case "accuracy":   return a.accuracy - b.accuracy;
          case "due":        return a.nextReviewDate.localeCompare(b.nextReviewDate);
          default:           return b.addedAt.localeCompare(a.addedAt); // date-new
        }
      });
  }, [allWords, search, category, status, difficulty, sort]);

  if (allWords.length === 0) {
    return (
      <EmptyData
        title="Your library is empty"
        description="Add your first word using the button above, or load sample words to get started."
        size="sm"
        className="py-16"
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Search */}
      <SearchBar value={search} onChange={setSearch} />

      {/* Category filter */}
      <CategoryFilter value={category} onChange={setCategory} />

      {/* Second filter row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <StatusFilter value={status} onChange={setStatus} counts={statusCounts} />
        <div className="flex items-center gap-2">
          <DifficultyFilter value={difficulty} onChange={setDifficulty} />
          <SortControl value={sort} onChange={setSort} />
          <div className="flex rounded-xl border border-border">
            {(["grid", "list"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn(
                  "p-2 text-muted-foreground transition-colors first:rounded-l-xl last:rounded-r-xl",
                  view === v && "bg-muted text-foreground"
                )}
              >
                {v === "grid" ? <LayoutGrid className="h-3.5 w-3.5" /> : <LayoutList className="h-3.5 w-3.5" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Practice filtered button */}
      {filtered.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">{filtered.length} word{filtered.length !== 1 ? "s" : ""} shown</p>
          <button
            onClick={() => onFlashcard(filtered)}
            className="flex items-center gap-1.5 rounded-xl bg-ds-violet px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
          >
            <BookOpen className="h-3.5 w-3.5" />
            Practice {filtered.length > 1 ? `${filtered.length} words` : "this word"}
          </button>
        </div>
      )}

      {/* Word grid/list */}
      {filtered.length === 0 ? (
        <EmptySearch
          title="No words found"
          description="Try a different search term or filter combination."
          size="sm"
          className="py-10"
        />
      ) : (
        <div className={cn(
          "gap-3",
          view === "grid"
            ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
            : "flex flex-col"
        )}>
          {filtered.map((word, i) => (
            <WordCard
              key={word.wordId}
              word={word}
              index={i}
              onStartFlashcard={(w) => onFlashcard([w])}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Favorites view ───────────────────────────────────────────────────────────

function FavoritesView({ onFlashcard }: { onFlashcard: (words: VocabularyWord[]) => void }) {
  const favorites = useVocabularyStore(useShallow((s) =>
    Object.values(s.words).filter((w) => w.isFavorite)
  ));

  if (favorites.length === 0) {
    return (
      <EmptyData
        title="No favorites yet"
        description="Tap the ⭐ on any word card to add it to your favorites."
        size="sm"
        className="py-16"
        iconColor="amber"
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{favorites.length} favorited word{favorites.length !== 1 ? "s" : ""}</p>
        <button
          onClick={() => onFlashcard(favorites)}
          className="flex items-center gap-1.5 rounded-xl bg-ds-amber px-3 py-1.5 text-xs font-semibold text-ds-amber-foreground transition-opacity hover:opacity-90"
        >
          <Star className="h-3.5 w-3.5 fill-current" />
          Practice favorites
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {favorites.map((word, i) => (
          <WordCard key={word.wordId} word={word} index={i} onStartFlashcard={(w) => onFlashcard([w])} />
        ))}
      </div>
    </div>
  );
}

// ─── Flashcard view ───────────────────────────────────────────────────────────

function FlashcardsView() {
  const allWords = useVocabularyStore(useShallow((s) => Object.values(s.words)));
  const getDueWords = useVocabularyStore((s) => s.getDueWords);

  const [set, setSet] = useState<"due" | "all" | "new">("due");

  const words = useMemo(() => {
    if (set === "due") return getDueWords();
    if (set === "new") return allWords.filter((w) => w.status === "new");
    return allWords.sort(() => Math.random() - 0.5);
  }, [set, allWords, getDueWords]);

  return (
    <div className="flex flex-col gap-4">
      {/* Set selector */}
      <div className="flex gap-2">
        {([
          { id: "due",  label: `Due (${getDueWords().length})` },
          { id: "new",  label: `New (${allWords.filter(w => w.status === "new").length})` },
          { id: "all",  label: `All (${allWords.length})` },
        ] as const).map((opt) => (
          <button
            key={opt.id}
            onClick={() => setSet(opt.id)}
            className={cn(
              "rounded-xl border px-4 py-2 text-sm font-medium transition-all",
              set === opt.id
                ? "border-ds-violet/30 bg-ds-violet/10 text-ds-violet"
                : "border-border bg-transparent text-muted-foreground hover:bg-muted"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {words.length === 0 ? (
        <EmptyData
          title="No words in this set"
          description="Add words to your library or change the filter above."
          size="sm"
          className="py-16"
          iconColor="violet"
        />
      ) : (
        <FlashcardSession words={words} title={`${set === "due" ? "Due Today" : set === "new" ? "New Words" : "All Words"}`} />
      )}
    </div>
  );
}

// ─── Main vocabulary client ───────────────────────────────────────────────────

export function VocabularyClient() {
  const [activeTab, setActiveTab] = useState<Tab>("library");
  const [addOpen, setAddOpen] = useState(false);
  const [flashcardWords, setFlashcardWords] = useState<VocabularyWord[] | null>(null);

  const totalWords = useVocabularyStore((s) => s.totalWords);
  const addWords = useVocabularyStore((s) => s.addWords);

  const handleStartFlashcard = useCallback((words: VocabularyWord[]) => {
    setFlashcardWords(words);
    setActiveTab("flashcards");
  }, []);

  const loadSamples = () => {
    addWords(SAMPLE_WORDS);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Vocabulary Builder</h1>
          <p className="text-sm text-muted-foreground">
            {totalWords > 0
              ? `${totalWords} word${totalWords !== 1 ? "s" : ""} in your library`
              : "Build your personal word library"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {totalWords === 0 && (
            <button
              onClick={loadSamples}
              className="flex items-center gap-1.5 rounded-xl border border-border bg-muted px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/80"
            >
              <Download className="h-4 w-4" />
              Load samples
            </button>
          )}
          <button
            onClick={() => setAddOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-ds-violet px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-ds-violet/90 hover:shadow-glow-violet/30"
          >
            <Plus className="h-4 w-4" />
            Add Word
          </button>
        </div>
      </motion.div>

      {/* Stats */}
      <StatsBar />

      {/* Tabs */}
      <div className="flex gap-1.5 overflow-x-auto scrollbar-none rounded-2xl border border-border bg-muted/40 p-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "relative flex flex-1 shrink-0 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
              activeTab === tab.id
                ? "bg-card text-foreground shadow-soft"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "library" && (
            <WordLibrary onFlashcard={handleStartFlashcard} />
          )}
          {activeTab === "flashcards" && (
            flashcardWords ? (
              <FlashcardSession
                words={flashcardWords}
                title="Custom Practice"
                onClose={() => setFlashcardWords(null)}
              />
            ) : (
              <FlashcardsView />
            )
          )}
          {activeTab === "favorites" && (
            <FavoritesView onFlashcard={handleStartFlashcard} />
          )}
          {activeTab === "challenge" && (
            <DailyChallenge />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Add word dialog */}
      <AddWordDialog open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}
