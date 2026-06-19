// ─── Action types ─────────────────────────────────────────────────────────────

export type WritingAction =
  | "grammar"
  | "rewrite"
  | "formal"
  | "informal"
  | "vocabulary";

// ─── Action config (used by toolbar + API) ────────────────────────────────────

export interface ActionConfig {
  id: WritingAction;
  label: string;
  description: string;
  color: string;
  bg: string;
  activeBg: string;
  border: string;
  tag: string;
}

export const WRITING_ACTIONS: ActionConfig[] = [
  {
    id: "grammar",
    label: "Grammar Fix",
    description: "Correct grammar, spelling & punctuation errors",
    color: "text-ds-green",
    bg: "bg-ds-green/10",
    activeBg: "bg-ds-green/15",
    border: "border-ds-green/40",
    tag: "Grammar",
  },
  {
    id: "rewrite",
    label: "Rewrite",
    description: "Improve clarity, flow and readability",
    color: "text-ds-violet",
    bg: "bg-ds-violet/10",
    activeBg: "bg-ds-violet/15",
    border: "border-ds-violet/40",
    tag: "Rewrite",
  },
  {
    id: "formal",
    label: "Formal Tone",
    description: "Convert to a professional, business-ready style",
    color: "text-ds-teal",
    bg: "bg-ds-teal/10",
    activeBg: "bg-ds-teal/15",
    border: "border-ds-teal/40",
    tag: "Formal",
  },
  {
    id: "informal",
    label: "Casual Tone",
    description: "Make it friendly and conversational",
    color: "text-ds-amber",
    bg: "bg-ds-amber/10",
    activeBg: "bg-ds-amber/15",
    border: "border-ds-amber/40",
    tag: "Casual",
  },
  {
    id: "vocabulary",
    label: "Enhance Vocab",
    description: "Upgrade word choices for more impact",
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    activeBg: "bg-blue-400/15",
    border: "border-blue-400/40",
    tag: "Vocab",
  },
];

// ─── Gemini system prompts ────────────────────────────────────────────────────

export const ACTION_PROMPTS: Record<WritingAction, string> = {
  grammar: `You are a professional copy editor. Carefully correct ALL grammar, spelling, punctuation, and syntax errors in the text below.
- Fix subject-verb agreement, tense consistency, article usage, and comma splices
- Preserve the author's original meaning, voice, and structure exactly
- Do NOT rewrite sentences — only fix errors
- If the text is already correct, return it unchanged
Return ONLY the corrected text. No explanations, no preamble, no commentary.`,

  rewrite: `You are a skilled editor. Rewrite the text below to significantly improve its clarity, sentence flow, and overall readability.
- Vary sentence length, eliminate redundancy, and sharpen word choice
- Preserve the original meaning, tone, and intent
- Break up run-on sentences and combine choppy fragments where appropriate
Return ONLY the rewritten text. No explanations, no preamble, no commentary.`,

  formal: `You are a business writing specialist. Convert the text below into a formal, professional register suitable for business emails, reports, or official documents.
- Replace contractions with full forms (don't → do not)
- Remove slang, colloquialisms, and overly casual phrasing
- Use precise, professional vocabulary and a respectful tone
- Maintain paragraph structure from the original
Return ONLY the converted text. No explanations, no preamble, no commentary.`,

  informal: `You are a conversational writing coach. Convert the text below into a warm, casual, friendly tone — as if explaining something to a friend.
- Use contractions naturally (do not → don't)
- Replace stiff phrasing with simple, approachable language
- Add a natural, human rhythm — short sentences are fine
- Keep the same core message and information
Return ONLY the converted text. No explanations, no preamble, no commentary.`,

  vocabulary: `You are a vocabulary enhancement expert. Improve the text below by replacing weak, vague, or overused words with more precise, vivid, and sophisticated alternatives.
- Upgrade verbs, adjectives, and nouns where appropriate
- Keep the text fluent and natural — do NOT over-complicate it
- Preserve the original meaning and tone; only enhance word choice
- Aim for B2–C1 English vocabulary level
Return ONLY the enhanced text. No explanations, no preamble, no commentary.`,
};

// ─── Result snapshot ──────────────────────────────────────────────────────────

export interface WritingResult {
  action: WritingAction;
  originalText: string;
  resultText: string;
  completedAt: string;
}
