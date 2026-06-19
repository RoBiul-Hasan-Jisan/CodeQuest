import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

import type { ChatMessage, TutorMode, TutorState } from "../types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

let _idCounter = 0;
function genId() {
  return `msg_${Date.now()}_${++_idCounter}`;
}

const HISTORY_LIMIT = 200; // max persisted messages

// ─── Store ────────────────────────────────────────────────────────────────────

export const useTutorStore = create<TutorState>()(
  devtools(
    persist(
      (set, _get) => ({
        messages: [],
        activeMode: "general",
        isStreaming: false,

        // ── addMessage ──────────────────────────────────────────────────
        addMessage: (msg) => {
          const newMsg: ChatMessage = {
            ...msg,
            id: genId(),
            createdAt: new Date().toISOString(),
          };
          set((state) => ({
            messages: [...state.messages, newMsg].slice(-HISTORY_LIMIT),
          }));
          return newMsg;
        },

        // ── appendToLastAssistant ───────────────────────────────────────
        // Called for each streaming chunk from the AI
        appendToLastAssistant: (chunk) => {
          set((state) => {
            const msgs = [...state.messages];
            const last = msgs[msgs.length - 1];
            if (last?.role === "assistant") {
              msgs[msgs.length - 1] = { ...last, content: last.content + chunk };
            }
            return { messages: msgs };
          });
        },

        // ── clearHistory ────────────────────────────────────────────────
        clearHistory: () => set({ messages: [] }),

        // ── setActiveMode ───────────────────────────────────────────────
        setActiveMode: (mode: TutorMode) => set({ activeMode: mode }),

        // ── setIsStreaming ──────────────────────────────────────────────
        setIsStreaming: (v) => set({ isStreaming: v }),
      }),
      {
        name: "ll:tutor",
        version: 1,
        partialize: ({ messages, activeMode }) => ({ messages, activeMode }),
      }
    ),
    { name: "TutorStore" }
  )
);

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectMessages   = (s: TutorState) => s.messages;
export const selectActiveMode = (s: TutorState) => s.activeMode;
export const selectIsStreaming = (s: TutorState) => s.isStreaming;

/** Last N messages formatted for Gemini API history */
export const selectApiHistory = (limit = 20) => (s: TutorState) =>
  s.messages
    .slice(-limit)
    .map(({ role, content }) => ({ role, content }));
