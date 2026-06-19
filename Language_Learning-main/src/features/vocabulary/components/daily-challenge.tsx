"use client";

import { motion } from "framer-motion";
import { Clock, BookOpen } from "lucide-react";
import { useMemo } from "react";


import { EmptyData } from "@/components/ui/empty-state";

import { useVocabularyStore } from "../store/vocabulary-store";
import type { VocabularyWord } from "../types";

import { FlashcardSession } from "./flashcard-session";


interface DailyChallengeProps {
  onClose?: () => void;
}

export function DailyChallenge({ onClose }: DailyChallengeProps) {
  const getDueWords = useVocabularyStore((s) => s.getDueWords);
  const allWords = useVocabularyStore((s) => s.words);

  // Get up to 10 due words; if fewer than 3 are due, fill with random words
  const challengeWords = useMemo((): VocabularyWord[] => {
    const due = getDueWords().slice(0, 10);
    if (due.length >= 3) return due;

    const wordList = Object.values(allWords);
    const dueIds = new Set(due.map((w) => w.wordId));
    const extras = wordList
      .filter((w) => !dueIds.has(w.wordId))
      .sort(() => Math.random() - 0.5)
      .slice(0, 10 - due.length);

    return [...due, ...extras];
  }, [getDueWords, allWords]);

  if (challengeWords.length === 0) {
    return (
      <EmptyData
        title="No words to practice"
        description="Add some vocabulary words to your library to start your daily challenge."
        size="sm"
        iconColor="amber"
        className="py-16"
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col gap-4"
    >
      {/* Challenge header */}
      <div className="flex items-center gap-3 rounded-2xl border border-ds-amber/20 bg-ds-amber/5 p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ds-amber/20 text-xl">
          🔥
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground">Daily Challenge</h3>
          <p className="text-xs text-muted-foreground">
            {challengeWords.length} words to review today
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            ~{Math.ceil(challengeWords.length * 0.5)} min
          </div>
          <div className="flex items-center gap-1">
            <BookOpen className="h-3.5 w-3.5" />
            {challengeWords.length} cards
          </div>
        </div>
      </div>

      {/* Session */}
      <FlashcardSession
        words={challengeWords}
        title="Daily Challenge"
        onComplete={(_xp) => {
          // XP earned — could hook into progress store here
        }}
        onClose={onClose}
      />
    </motion.div>
  );
}
