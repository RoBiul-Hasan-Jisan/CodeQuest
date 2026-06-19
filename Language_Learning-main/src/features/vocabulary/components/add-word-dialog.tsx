"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Plus, Loader2 } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

import { WORD_CATEGORIES } from "../constants";
import { useVocabularyStore } from "../store/vocabulary-store";
import type { VocabularyWordInput, WordCategory } from "../types";


// ─── Small reusable field ─────────────────────────────────────────────────────

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-foreground">
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls = cn(
  "rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground",
  "placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ds-violet/40",
  "transition-all duration-150"
);

// ─── Difficulty selector ──────────────────────────────────────────────────────

function DifficultyPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={cn(
            "flex-1 rounded-lg border py-1.5 text-xs font-medium transition-all",
            n === value
              ? n <= 2
                ? "border-ds-green/40 bg-ds-green/10 text-ds-green"
                : n === 3
                ? "border-ds-amber/40 bg-ds-amber/10 text-ds-amber"
                : "border-destructive/40 bg-destructive/10 text-destructive"
              : "border-border bg-muted/50 text-muted-foreground hover:bg-muted"
          )}
        >
          {n}
        </button>
      ))}
    </div>
  );
}

// ─── Main dialog ──────────────────────────────────────────────────────────────

interface AddWordDialogProps {
  open: boolean;
  onClose: () => void;
}

const DEFAULT_FORM = {
  word: "",
  translation: "",
  pronunciation: "",
  definition: "",
  exampleSentence: "",
  language: "English",
  category: "other" as WordCategory,
  tags: "",
  difficulty: 2 as 1 | 2 | 3 | 4 | 5,
  isFavorite: false,
};

export function AddWordDialog({ open, onClose }: AddWordDialogProps) {
  const addWord = useVocabularyStore((s) => s.addWord);
  const setAIExamples = useVocabularyStore((s) => s.setAIExamples);

  const [form, setForm] = useState(DEFAULT_FORM);
  const [aiExamples, setAiExamples] = useState<string[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const set = (key: keyof typeof DEFAULT_FORM, value: unknown) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const generateExamples = async () => {
    if (!form.word.trim()) return;
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await fetch("/api/vocabulary/examples", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word: form.word, definition: form.definition }),
      });
      const data = (await res.json()) as { examples?: string[]; error?: string };
      if (data.examples) {
        setAiExamples(data.examples);
      } else {
        setAiError(data.error ?? "Failed to generate");
      }
    } catch {
      setAiError("Network error");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.word.trim() || !form.translation.trim()) return;

    setSubmitting(true);
    const tags = form.tags
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    const input: VocabularyWordInput = {
      word: form.word.trim(),
      translation: form.translation.trim(),
      pronunciation: form.pronunciation.trim() || undefined,
      definition: form.definition.trim() || undefined,
      exampleSentence: form.exampleSentence.trim() || undefined,
      language: form.language,
      category: form.category,
      tags,
      difficulty: form.difficulty,
      isFavorite: form.isFavorite,
      aiExamples: aiExamples.length > 0 ? aiExamples : undefined,
    };

    const wordId = addWord(input);
    if (aiExamples.length > 0) setAIExamples(wordId, aiExamples);

    setForm(DEFAULT_FORM);
    setAiExamples([]);
    setSubmitting(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="fixed inset-x-4 top-[5%] z-50 mx-auto max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-float md:inset-x-auto md:left-1/2 md:-translate-x-1/2"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div>
                <h2 className="font-semibold text-foreground">Add New Word</h2>
                <p className="text-xs text-muted-foreground">Build your vocabulary library</p>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex max-h-[80vh] flex-col gap-4 overflow-y-auto p-5">
              {/* Word + Translation */}
              <div className="grid grid-cols-2 gap-3">
                <Field label="Word" required>
                  <input
                    type="text"
                    value={form.word}
                    onChange={(e) => set("word", e.target.value)}
                    placeholder="e.g. Serendipity"
                    className={inputCls}
                    required
                  />
                </Field>
                <Field label="Translation / Meaning" required>
                  <input
                    type="text"
                    value={form.translation}
                    onChange={(e) => set("translation", e.target.value)}
                    placeholder="e.g. Happy coincidence"
                    className={inputCls}
                    required
                  />
                </Field>
              </div>

              {/* Pronunciation + Language */}
              <div className="grid grid-cols-2 gap-3">
                <Field label="Pronunciation (IPA)">
                  <input
                    type="text"
                    value={form.pronunciation}
                    onChange={(e) => set("pronunciation", e.target.value)}
                    placeholder="e.g. /ˌsɛrənˈdɪpɪti/"
                    className={inputCls}
                  />
                </Field>
                <Field label="Language">
                  <input
                    type="text"
                    value={form.language}
                    onChange={(e) => set("language", e.target.value)}
                    className={inputCls}
                  />
                </Field>
              </div>

              {/* Category */}
              <Field label="Category">
                <select
                  value={form.category}
                  onChange={(e) => set("category", e.target.value as WordCategory)}
                  className={inputCls}
                >
                  {WORD_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </Field>

              {/* Definition */}
              <Field label="Definition">
                <textarea
                  value={form.definition}
                  onChange={(e) => set("definition", e.target.value)}
                  placeholder="Brief dictionary-style definition…"
                  rows={2}
                  className={cn(inputCls, "resize-none")}
                />
              </Field>

              {/* Difficulty */}
              <Field label="Difficulty Level">
                <DifficultyPicker
                  value={form.difficulty}
                  onChange={(v) => set("difficulty", v as 1 | 2 | 3 | 4 | 5)}
                />
              </Field>

              {/* Tags */}
              <Field label="Tags (comma-separated)">
                <input
                  type="text"
                  value={form.tags}
                  onChange={(e) => set("tags", e.target.value)}
                  placeholder="e.g. business, formal, advanced"
                  className={inputCls}
                />
              </Field>

              {/* Favourite */}
              <label className="flex cursor-pointer items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={form.isFavorite}
                  onChange={(e) => set("isFavorite", e.target.checked)}
                  className="h-4 w-4 rounded border-border accent-ds-amber"
                />
                <span className="text-sm text-foreground">Add to favorites ⭐</span>
              </label>

              {/* AI Examples */}
              <div className="flex flex-col gap-2 rounded-xl border border-dashed border-ds-violet/30 bg-ds-violet/5 p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-ds-violet" />
                    <span className="text-xs font-medium text-ds-violet">AI-Generated Examples</span>
                  </div>
                  <button
                    type="button"
                    onClick={generateExamples}
                    disabled={!form.word.trim() || aiLoading}
                    className={cn(
                      "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                      form.word.trim()
                        ? "bg-ds-violet text-white hover:bg-ds-violet/90"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {aiLoading ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Sparkles className="h-3 w-3" />
                    )}
                    {aiLoading ? "Generating…" : "Generate"}
                  </button>
                </div>
                {aiError && <p className="text-xs text-destructive">{aiError}</p>}
                {aiExamples.length > 0 && (
                  <div className="flex flex-col gap-1">
                    {aiExamples.map((ex, i) => (
                      <p key={i} className="text-xs italic text-muted-foreground">
                        {i + 1}. &ldquo;{ex}&rdquo;
                      </p>
                    ))}
                  </div>
                )}
                {aiExamples.length === 0 && !aiLoading && (
                  <p className="text-[10px] text-muted-foreground/60">
                    Enter a word above, then click Generate to get real example sentences.
                  </p>
                )}
              </div>

              {/* Submit */}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-xl border border-border py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !form.word.trim() || !form.translation.trim()}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-ds-violet py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" />
                  Add Word
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
