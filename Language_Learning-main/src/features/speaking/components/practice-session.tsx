"use client";

import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, SendHorizonal, Loader2 } from "lucide-react";
import { useCallback, useRef, useState } from "react";

import { cn } from "@/lib/utils";

import { useSpeechRecognition } from "../hooks/use-speech-recognition";
import { useSpeakingStore } from "../store/speaking-store";
import type { PronunciationFeedback, ScenarioConfig } from "../types";

import { FeedbackPanel } from "./feedback-panel";
import { VoiceRecorder } from "./voice-recorder";


// ─── Practice step ────────────────────────────────────────────────────────────

type PracticeStep = "idle" | "recording" | "recorded" | "analyzing" | "feedback";

// ─── Props ────────────────────────────────────────────────────────────────────

interface PracticeSessionProps {
  scenario: ScenarioConfig;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PracticeSession({ scenario }: PracticeSessionProps) {
  const [step, setStep] = useState<PracticeStep>("idle");
  const [finalText, setFinalText] = useState("");
  const [interimText, setInterimText] = useState("");
  const [feedback, setFeedback] = useState<PronunciationFeedback | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startTimeRef = useRef<number | null>(null);
  const recordSession = useSpeakingStore((s) => s.recordSession);

  // ── Speech recognition ─────────────────────────────────────────────────────

  const handleInterim = useCallback((text: string) => {
    setInterimText(text);
  }, []);

  const handleFinal = useCallback((text: string) => {
    setFinalText(text);
    setInterimText("");
  }, []);

  const handleEnd = useCallback(() => {
    setStep((prev) => (prev === "recording" ? "recorded" : prev));
    setInterimText("");
  }, []);

  const { isListening, isSupported, start, stop } = useSpeechRecognition({
    onInterimResult: handleInterim,
    onFinalResult: handleFinal,
    onError: (msg) => {
      setError(msg);
      setStep("idle");
    },
    onEnd: handleEnd,
  });

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleStart = useCallback(() => {
    setError(null);
    setFinalText("");
    setInterimText("");
    setFeedback(null);
    startTimeRef.current = Date.now();
    setStep("recording");
    start();
  }, [start]);

  const handleStop = useCallback(() => {
    stop();
    setStep("recorded");
  }, [stop]);

  const handleAnalyze = useCallback(async () => {
    const text = finalText.trim();
    if (!text) return;

    setStep("analyzing");
    setError(null);

    const durationSeconds = startTimeRef.current
      ? Math.round((Date.now() - startTimeRef.current) / 1000)
      : 0;

    try {
      const res = await fetch("/api/speaking/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript: text,
          scenario: scenario.id,
          practicePrompt: scenario.practicePrompt,
        }),
      });

      const data = (await res.json()) as PronunciationFeedback & { error?: string };

      if (!res.ok || data.error) {
        setError(data.error ?? "Analysis failed. Please try again.");
        setStep("recorded");
        return;
      }

      setFeedback(data);
      setStep("feedback");

      // Save session to store
      recordSession({
        scenario: scenario.id,
        mode: "practice",
        transcript: text,
        feedback: data,
        durationSeconds,
      });
    } catch {
      setError("Network error. Please check your connection.");
      setStep("recorded");
    }
  }, [finalText, scenario, recordSession]);

  const handleReset = useCallback(() => {
    stop();
    setStep("idle");
    setFinalText("");
    setInterimText("");
    setFeedback(null);
    setError(null);
  }, [stop]);

  const hasTranscript = finalText.trim().length > 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Practice prompt card */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "rounded-2xl border p-4",
          scenario.bg,
          scenario.border
        )}
      >
        <p className={cn("mb-1 text-[10px] font-bold uppercase tracking-wider", scenario.color)}>
          Speaking Prompt
        </p>
        <p className="text-sm leading-relaxed text-foreground">
          {scenario.practicePrompt}
        </p>
      </motion.div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Recorder — shown until we have feedback */}
      <AnimatePresence mode="wait">
        {step !== "feedback" && (
          <motion.div
            key="recorder"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <VoiceRecorder
              isListening={isListening}
              isSupported={isSupported}
              isDisabled={step === "analyzing"}
              interimText={interimText}
              finalText={finalText}
              onStart={handleStart}
              onStop={handleStop}
              accentColor={scenario.color}
              accentBg={scenario.bg.replace("/10", "")}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action buttons */}
      <AnimatePresence>
        {(step === "recorded" || step === "analyzing") && hasTranscript && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center gap-3"
          >
            <button
              onClick={handleReset}
              disabled={step === "analyzing"}
              className="flex items-center gap-1.5 rounded-xl border border-border bg-muted px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted/70 disabled:opacity-50"
            >
              <RotateCcw className="h-4 w-4" />
              Try Again
            </button>

            <button
              onClick={() => void handleAnalyze()}
              disabled={step === "analyzing"}
              className={cn(
                "flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all",
                "disabled:opacity-70",
                scenario.bg.replace("/10", ""),
                "hover:opacity-90"
              )}
            >
              {step === "analyzing" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing…
                </>
              ) : (
                <>
                  <SendHorizonal className="h-4 w-4" />
                  Get Feedback
                </>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feedback panel */}
      <AnimatePresence>
        {step === "feedback" && feedback && (
          <motion.div
            key="feedback"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-4"
          >
            <FeedbackPanel
              feedback={feedback}
              scenarioColor={scenario.color}
              scenarioBg={scenario.bg}
              scenarioBorder={scenario.border}
            />

            {/* Practice again */}
            <div className="flex justify-center">
              <button
                onClick={handleReset}
                className={cn(
                  "flex items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-semibold transition-all",
                  scenario.bg,
                  scenario.border,
                  scenario.color,
                  "hover:opacity-80"
                )}
              >
                <RotateCcw className="h-4 w-4" />
                Practice Again
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
