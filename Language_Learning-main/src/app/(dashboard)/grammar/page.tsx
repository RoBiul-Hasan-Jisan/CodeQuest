import type { Metadata } from "next";

import { GrammarClient } from "@/features/grammar/components/grammar-client";

export const metadata: Metadata = {
  title: "Grammar Lab",
  description: "Practice English grammar with AI-generated multiple-choice quizzes across 18 topics.",
};

export default function GrammarPage() {
  return <GrammarClient />;
}
