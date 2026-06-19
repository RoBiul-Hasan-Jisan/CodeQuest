import type { Metadata } from "next";

import { VocabularyClient } from "@/features/vocabulary/components/vocabulary-client";

export const metadata: Metadata = {
  title: "Vocabulary Builder",
  description: "Build and review your personal word library with spaced repetition flashcards.",
};

export default function VocabularyPage() {
  return <VocabularyClient />;
}
