// ─── Tutor modes ──────────────────────────────────────────────────────────────

export type TutorMode =
  | "general"        // Open conversation / Q&A
  | "grammar"        // Detect and explain grammar errors
  | "vocabulary"     // Word definitions, synonyms, examples
  | "translation"    // Translate to/from English
  | "rewrite"        // Improve / rephrase sentences
  | "pronunciation"; // IPA, phonetics, tips

export interface TutorModeConfig {
  id: TutorMode;
  label: string;
  icon: string;
  description: string;
  placeholder: string;
  color: string;
}

export const TUTOR_MODES: TutorModeConfig[] = [
  {
    id: "general",
    label: "Chat",
    icon: "💬",
    description: "Practise natural English conversation",
    placeholder: "Ask me anything in English…",
    color: "bg-ds-violet/10 text-ds-violet border-ds-violet/20",
  },
  {
    id: "grammar",
    label: "Grammar",
    icon: "✏️",
    description: "Get your sentences corrected with explanations",
    placeholder: "Type a sentence to check for grammar errors…",
    color: "bg-ds-green/10 text-ds-green border-ds-green/20",
  },
  {
    id: "vocabulary",
    label: "Vocabulary",
    icon: "📚",
    description: "Look up words, synonyms, and usage examples",
    placeholder: "Enter a word or phrase to explore…",
    color: "bg-ds-teal/10 text-ds-teal border-ds-teal/20",
  },
  {
    id: "translation",
    label: "Translate",
    icon: "🌐",
    description: "Translate text and understand the meaning",
    placeholder: "Enter text to translate into English…",
    color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  },
  {
    id: "rewrite",
    label: "Rewrite",
    icon: "✨",
    description: "Get your text rewritten in better English",
    placeholder: "Paste a sentence or paragraph to improve…",
    color: "bg-ds-amber/10 text-ds-amber border-ds-amber/20",
  },
  {
    id: "pronunciation",
    label: "Pronunciation",
    icon: "🔊",
    description: "Learn how to pronounce words correctly",
    placeholder: "Enter a word or phrase to learn how to pronounce…",
    color: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  },
];

// ─── Message types ────────────────────────────────────────────────────────────

export type MessageRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  mode: TutorMode;
  createdAt: string; // ISO 8601
}

// ─── API request / response ───────────────────────────────────────────────────

export interface TutorRequest {
  message: string;
  mode: TutorMode;
  /** Last N messages for context (sent to API) */
  history: Array<{ role: MessageRole; content: string }>;
}

export interface TutorErrorResponse {
  error: string;
  retryAfterSeconds?: number;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export interface TutorState {
  messages: ChatMessage[];
  activeMode: TutorMode;
  isStreaming: boolean;

  // Actions
  addMessage: (msg: Omit<ChatMessage, "id" | "createdAt">) => ChatMessage;
  appendToLastAssistant: (chunk: string) => void;
  clearHistory: () => void;
  setActiveMode: (mode: TutorMode) => void;
  setIsStreaming: (v: boolean) => void;
}
