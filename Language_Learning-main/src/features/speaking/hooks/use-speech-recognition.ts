"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// ─── Web Speech API type declarations ────────────────────────────────────────
// These are not in all TypeScript lib versions; declare them explicitly.

interface SpeechRecognitionResultItem {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  [index: number]: SpeechRecognitionResultItem;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}

interface ISpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onstart: ((this: ISpeechRecognition, ev: Event) => void) | null;
  onresult: ((this: ISpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
  onerror: ((this: ISpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null;
  onend: ((this: ISpeechRecognition, ev: Event) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => ISpeechRecognition;
    webkitSpeechRecognition: new () => ISpeechRecognition;
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface UseSpeechRecognitionOptions {
  onInterimResult?: (text: string) => void;
  onFinalResult?: (text: string) => void;
  onError?: (message: string) => void;
  onEnd?: () => void;
  language?: string;
}

interface UseSpeechRecognitionReturn {
  isListening: boolean;
  isSupported: boolean;
  start: () => void;
  stop: () => void;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useSpeechRecognition({
  onInterimResult,
  onFinalResult,
  onError,
  onEnd,
  language = "en-US",
}: UseSpeechRecognitionOptions = {}): UseSpeechRecognitionReturn {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const finalTextRef = useRef("");
  const stoppedManuallyRef = useRef(false);

  // Check browser support (client-side only)
  const isSupported =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
    };
  }, []);

  const start = useCallback(() => {
    if (!isSupported) {
      onError?.(
        "Speech recognition is not supported in this browser. Please use Chrome or Edge."
      );
      return;
    }

    // Abort any in-flight session
    recognitionRef.current?.abort();
    finalTextRef.current = "";
    stoppedManuallyRef.current = false;

    const SpeechRecognitionCtor =
      window.SpeechRecognition ?? window.webkitSpeechRecognition;

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = language;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimText = "";
      let finalText = finalTextRef.current;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (!result) continue;
        const transcript = result[0]?.transcript ?? "";

        if (result.isFinal) {
          finalText += transcript + " ";
          finalTextRef.current = finalText;
          onFinalResult?.(finalText.trim());
        } else {
          interimText += transcript;
        }
      }

      onInterimResult?.(finalText + interimText);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === "aborted" || stoppedManuallyRef.current) return;

      const messages: Record<string, string> = {
        "not-allowed":
          "Microphone access denied. Please allow microphone permissions and try again.",
        "no-speech": "No speech detected. Please speak clearly and try again.",
        network: "Network error. Please check your connection.",
        "audio-capture":
          "No microphone found. Please connect a microphone and try again.",
      };

      onError?.(
        messages[event.error] ?? `Speech recognition error: ${event.error}`
      );
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      if (!stoppedManuallyRef.current) {
        onEnd?.();
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [isSupported, language, onInterimResult, onFinalResult, onError, onEnd]);

  const stop = useCallback(() => {
    stoppedManuallyRef.current = true;
    recognitionRef.current?.stop();
    setIsListening(false);
    onEnd?.();
  }, [onEnd]);

  return { isListening, isSupported, start, stop };
}
