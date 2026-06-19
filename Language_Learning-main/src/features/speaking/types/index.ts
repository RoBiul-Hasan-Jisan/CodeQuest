// ─── Scenario types ───────────────────────────────────────────────────────────

export type SpeakingScenario =
  | "daily_conversation"
  | "job_interview"
  | "travel"
  | "storytelling"
  | "debate"
  | "presentation";

export type SpeakingMode = "practice" | "conversation";

// ─── Scenario configs ─────────────────────────────────────────────────────────

export interface ScenarioConfig {
  id: SpeakingScenario;
  label: string;
  description: string;
  icon: string;
  color: string;
  bg: string;
  activeBg: string;
  border: string;
  systemPrompt: string;
  /** Opening line the AI says to start a conversation */
  starterPrompt: string;
  /** What the user is asked to say in practice mode */
  practicePrompt: string;
}

export const SCENARIOS: ScenarioConfig[] = [
  {
    id: "daily_conversation",
    label: "Daily Chat",
    description: "Everyday conversations with friends and colleagues",
    icon: "💬",
    color: "text-ds-violet",
    bg: "bg-ds-violet/10",
    activeBg: "bg-ds-violet/15",
    border: "border-ds-violet/30",
    systemPrompt:
      "You are a friendly English conversation partner helping someone practice everyday English. Keep responses natural, warm, and conversational — 2-3 sentences max. Ask a follow-up question to keep the conversation flowing. Use B1-B2 level English.",
    starterPrompt:
      "Hey! How's your day going? Anything interesting happen lately?",
    practicePrompt:
      "Describe your morning routine or talk about something you did recently.",
  },
  {
    id: "job_interview",
    label: "Job Interview",
    description: "Practice professional interview answers with confidence",
    icon: "💼",
    color: "text-ds-teal",
    bg: "bg-ds-teal/10",
    activeBg: "bg-ds-teal/15",
    border: "border-ds-teal/30",
    systemPrompt:
      "You are a professional interviewer at an English-speaking company. Ask one standard interview question at a time. After each answer, give a brief one-line comment (positive or constructive), then smoothly move to your next question. Be warm but professional. Keep each response under 3 sentences.",
    starterPrompt:
      "Welcome, thank you for coming in today. Let's get started — could you tell me a little about yourself?",
    practicePrompt:
      "Introduce yourself professionally: your background, experience, and what you're looking for.",
  },
  {
    id: "travel",
    label: "Travel English",
    description: "Navigate airports, hotels, and restaurants abroad",
    icon: "✈️",
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    activeBg: "bg-blue-400/15",
    border: "border-blue-400/30",
    systemPrompt:
      "You are roleplaying as travel service staff — airport agents, hotel receptionists, waiters, or tour guides. Help the user practice real travel English. Respond naturally as the staff member would. Keep responses short and practical (2-3 sentences).",
    starterPrompt:
      "Good afternoon! Welcome to the Grand Hotel. Do you have a reservation with us?",
    practicePrompt:
      "Ask for directions to the nearest metro station, or check in at a hotel reception desk.",
  },
  {
    id: "storytelling",
    label: "Storytelling",
    description: "Narrate stories and describe experiences vividly",
    icon: "📖",
    color: "text-ds-amber",
    bg: "bg-ds-amber/10",
    activeBg: "bg-ds-amber/15",
    border: "border-ds-amber/30",
    systemPrompt:
      "You are a storytelling coach who helps people practice narrative English. Encourage vivid descriptions, good story structure (beginning, middle, end), and natural transitions. After they speak, ask one engaging follow-up question to help them expand their story. Keep responses brief.",
    starterPrompt:
      "I'd love to hear a story from you! Tell me about the most memorable trip or adventure you've ever had.",
    practicePrompt:
      "Tell a short story about a memorable experience — a trip, a challenge you overcame, or a funny moment.",
  },
  {
    id: "debate",
    label: "Debate & Opinion",
    description: "Express and defend your opinions clearly in English",
    icon: "⚖️",
    color: "text-ds-green",
    bg: "bg-ds-green/10",
    activeBg: "bg-ds-green/15",
    border: "border-ds-green/30",
    systemPrompt:
      "You are a debate partner helping someone practice expressing and defending opinions in English. Respectfully challenge their points, ask for evidence or examples, and encourage clear logical reasoning. Keep your responses short (2-3 sentences) and focused on one counter-argument at a time.",
    starterPrompt:
      "Let's have a friendly debate! I'll argue that social media has done more harm than good to society. What's your position on this?",
    practicePrompt:
      "Share your opinion: 'Remote work is better than working in an office.' Give at least two reasons to support your view.",
  },
  {
    id: "presentation",
    label: "Presentation",
    description: "Deliver clear and confident presentations in English",
    icon: "🎤",
    color: "text-orange-400",
    bg: "bg-orange-400/10",
    activeBg: "bg-orange-400/15",
    border: "border-orange-400/30",
    systemPrompt:
      "You are a presentation coach helping someone practice public speaking in English. After they present, give specific feedback on structure, clarity, opening hook, and language use — one strength and one improvement. Then ask them to try a follow-up or give a second chance if needed.",
    starterPrompt:
      "Welcome! You'll practice a 60-second presentation. Your topic: explain what you do for work or study to someone who knows nothing about your field. Whenever you're ready, go ahead!",
    practicePrompt:
      "Give a 60-second elevator pitch: who you are, what you do (or study), and what makes your work interesting or unique.",
  },
];

// ─── Pronunciation feedback ───────────────────────────────────────────────────

export interface PronunciationFeedback {
  overallScore: number;   // 0-100
  clarity: number;        // 0-100
  fluency: number;        // 0-100
  vocabulary: number;     // 0-100
  grammar: number;        // 0-100
  strengths: string[];
  improvements: string[];
  correctedText: string;
  tips: string[];
}

// ─── Conversation turn ────────────────────────────────────────────────────────

export interface ConversationTurn {
  role: "user" | "ai";
  text: string;
  timestamp: string;
}

/** Gemini chat history format */
export interface GeminiHistoryItem {
  role: "user" | "model";
  parts: [{ text: string }];
}

// ─── Session record (saved to store) ─────────────────────────────────────────

export interface SpeakingSession {
  sessionId: string;
  scenario: SpeakingScenario;
  mode: SpeakingMode;
  transcript: string;
  feedback: PronunciationFeedback | null;
  durationSeconds: number;
  completedAt: string; // ISO 8601
}

// ─── Store state ──────────────────────────────────────────────────────────────

export type ScenarioStats = {
  attempts: number;
  avgScore: number;
  bestScore: number;
};

export interface SpeakingState {
  sessions: SpeakingSession[];
  scenarioStats: Record<SpeakingScenario, ScenarioStats>;
  totalSessions: number;
  overallScore: number;

  // Actions
  recordSession: (session: Omit<SpeakingSession, "sessionId" | "completedAt">) => void;
  resetAll: () => void;
}
