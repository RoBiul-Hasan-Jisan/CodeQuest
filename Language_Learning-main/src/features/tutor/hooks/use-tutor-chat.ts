"use client";

import { useCallback, useRef } from "react";
import { useShallow } from "zustand/react/shallow";

import {
  useTutorStore,
  selectActiveMode,
  selectApiHistory,
} from "../store/tutor-store";
import type { TutorErrorResponse } from "../types";

/* ============================================================================
   useTutorChat — drives streaming AI responses
   ============================================================================ */

export function useTutorChat() {
  const addMessage      = useTutorStore((s) => s.addMessage);
  const appendChunk     = useTutorStore((s) => s.appendToLastAssistant);
  const setIsStreaming  = useTutorStore((s) => s.setIsStreaming);
  const isStreaming     = useTutorStore((s) => s.isStreaming);
  const activeMode      = useTutorStore(selectActiveMode);
  const getApiHistory   = useTutorStore(useShallow(selectApiHistory(20)));

  // Abort controller so users can cancel mid-stream
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (userText: string) => {
      const trimmed = userText.trim();
      if (!trimmed || isStreaming) return;

      // 1. Add user message
      addMessage({ role: "user", content: trimmed, mode: activeMode });

      // 2. Placeholder assistant message (will be filled by stream)
      addMessage({ role: "assistant", content: "", mode: activeMode });

      setIsStreaming(true);
      abortRef.current = new AbortController();

      try {
        const res = await fetch("/api/tutor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: abortRef.current.signal,
          body: JSON.stringify({
            message: trimmed,
            mode: activeMode,
            history: getApiHistory,
          }),
        });

        if (!res.ok) {
          const json = (await res.json()) as TutorErrorResponse;
          const detail =
            res.status === 429
              ? `Rate limit reached. Try again in ${json.retryAfterSeconds ?? 60} s.`
              : json.error ?? `Server error (${res.status}).`;
          appendChunk(`\n\n> ⚠️ **${detail}**`);
          return;
        }

        // 3. Stream body chunks into the assistant placeholder
        const reader = res.body?.getReader();
        if (!reader) {
          appendChunk("\n\n> ⚠️ **Failed to read response stream.**");
          return;
        }

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          buffer += chunk;

          // Check for error sentinel from the server
          if (buffer.includes("__ERROR__:")) {
            const errMsg = buffer.split("__ERROR__:")[1] ?? "Unknown server error.";
            appendChunk(`\n\n> ⚠️ **${errMsg.trim()}**`);
            break;
          }

          appendChunk(chunk);
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          appendChunk("\n\n*(Response stopped)*");
        } else {
          const msg = err instanceof Error ? err.message : "Unknown error";
          appendChunk(`\n\n> ⚠️ **${msg}**`);
        }
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [isStreaming, activeMode, addMessage, appendChunk, setIsStreaming, getApiHistory]
  );

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return { sendMessage, stopStreaming, isStreaming };
}
