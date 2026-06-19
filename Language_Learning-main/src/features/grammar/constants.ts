import type { GrammarCategory } from "./types";

export const GRAMMAR_TOPICS: {
  category: GrammarCategory;
  label: string;
  icon: string;
  description: string;
}[] = [
  { category: "present_tense",    label: "Present Tense",   icon: "⏱️",  description: "Simple, continuous, perfect" },
  { category: "past_tense",       label: "Past Tense",      icon: "📅",  description: "Simple, continuous, perfect" },
  { category: "future_tense",     label: "Future Tense",    icon: "🔮",  description: "Will, going to, future perfect" },
  { category: "conditional",      label: "Conditionals",    icon: "🔀",  description: "Zero, first, second, third" },
  { category: "subjunctive",      label: "Subjunctive",     icon: "🎭",  description: "Wishes and hypotheticals" },
  { category: "imperative",       label: "Imperative",      icon: "📢",  description: "Commands and requests" },
  { category: "pronouns",         label: "Pronouns",        icon: "👤",  description: "Subject, object, possessive" },
  { category: "articles",         label: "Articles",        icon: "📖",  description: "A, an, the — definite & indefinite" },
  { category: "prepositions",     label: "Prepositions",    icon: "📍",  description: "In, on, at, by, with…" },
  { category: "conjunctions",     label: "Conjunctions",    icon: "🔗",  description: "And, but, or, because…" },
  { category: "adjectives",       label: "Adjectives",      icon: "🎨",  description: "Descriptive words and order" },
  { category: "adverbs",          label: "Adverbs",         icon: "⚡",  description: "How, when, where, degree" },
  { category: "word_order",       label: "Word Order",      icon: "🔢",  description: "Sentence structure (SVO)" },
  { category: "verb_conjugation", label: "Verb Forms",      icon: "🔄",  description: "Irregular verbs, -ing, -ed" },
  { category: "negation",         label: "Negation",        icon: "🚫",  description: "Not, never, neither, nor" },
  { category: "questions",        label: "Questions",       icon: "❓",  description: "Yes/no, wh-, tag questions" },
  { category: "comparative",      label: "Comparatives",    icon: "⚖️",  description: "Comparative and superlative" },
  { category: "other",            label: "Mixed Grammar",   icon: "📚",  description: "Mixed grammar topics" },
];

export const DIFFICULTY_CONFIG = {
  easy:   { label: "Easy",   color: "text-ds-green",  bg: "bg-ds-green/10",  border: "border-ds-green/30",  desc: "A1–A2 · Basic rules" },
  medium: { label: "Medium", color: "text-ds-amber",  bg: "bg-ds-amber/10",  border: "border-ds-amber/30",  desc: "B1–B2 · Intermediate" },
  hard:   { label: "Hard",   color: "text-destructive",bg: "bg-destructive/10",border: "border-destructive/30", desc: "C1–C2 · Advanced" },
} as const;

export const GRADE_CONFIG = {
  S: { color: "text-ds-violet", bg: "bg-ds-violet/15", label: "S" },
  A: { color: "text-ds-green",  bg: "bg-ds-green/15",  label: "A" },
  B: { color: "text-ds-teal",   bg: "bg-ds-teal/15",   label: "B" },
  C: { color: "text-ds-amber",  bg: "bg-ds-amber/15",  label: "C" },
  D: { color: "text-orange-400",bg: "bg-orange-400/15",label: "D" },
  F: { color: "text-destructive",bg: "bg-destructive/15", label: "F" },
} as const;
