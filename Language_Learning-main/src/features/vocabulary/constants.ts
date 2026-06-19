import type { WordCategory } from "./types";

export const WORD_CATEGORIES: { value: WordCategory; label: string; icon: string }[] = [
  { value: "other",        label: "Other",       icon: "📦" },
  { value: "nouns",        label: "Nouns",       icon: "🔵" },
  { value: "verbs",        label: "Verbs",       icon: "🟢" },
  { value: "adjectives",   label: "Adjectives",  icon: "🟡" },
  { value: "adverbs",      label: "Adverbs",     icon: "🟠" },
  { value: "pronouns",     label: "Pronouns",    icon: "🔴" },
  { value: "prepositions", label: "Prepositions",icon: "🔷" },
  { value: "conjunctions", label: "Conjunctions",icon: "🔗" },
  { value: "phrases",      label: "Phrases",     icon: "💬" },
  { value: "numbers",      label: "Numbers",     icon: "🔢" },
  { value: "colors",       label: "Colors",      icon: "🎨" },
  { value: "food",         label: "Food",        icon: "🍽️" },
  { value: "travel",       label: "Travel",      icon: "✈️" },
  { value: "business",     label: "Business",    icon: "💼" },
];
