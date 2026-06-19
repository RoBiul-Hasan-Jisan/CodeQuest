"use client";

import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, Volume2, VolumeX } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

import { useSpeechRecognition } from "../hooks/use-speech-recognition";
import { useSpeakingStore } from "../store/speaking-store";
import type { ConversationTurn, GeminiHistoryItem, ScenarioConfig } from "../types";

import { VoiceRecorder } from "./voice-recorder";


// ─── Message bubble ───────────────────────────────────────────────────────────

function MessageBubble({
  turn,
  scenarioColor,
  scenarioBg,
  scenarioBorder,
}: {
  turn: ConversationTurn;
  scenarioColor: string;
  scenarioBg: string;
  scenarioBorder: string;
}) {
  const isAI = turn.role === "ai";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25 }}
      className={cn("flex w-full", isAI ? "justify-start" : "justify-end")}
    >
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
          isAI
            ? cn("border", scenarioBg, scenarioBorder, "text-foreground")
            : "bg-foreground text-background"
        )}
      >
        {isAI && (
          <p className={cn("mb-1 text-[10px] font-bold uppercase tracking-wider", scenarioColor)}>
            AI Partner
          </p>
        )}
        {turn.text}
      </div>
    </motion.div>
  );
}

// ─── Streaming cursor ─────────────────────────────────────────────────────────

function StreamingCursor() {
  return (
    <motion.span
      animate={{ opacity: [1, 0] }}
      transition={{ duration: 0.6, repeat: Infinity, repeatType: "reverse" }}
      className="ml-0.5 inline-block h-3.5 w-0.5 translate-y-0.5 rounded-full bg-current align-middle"
    />
  );
}

// ─── TTS helper ───────────────────────────────────────────────────────────────

function speak(text: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = 0.95;
  utterance.pitch = 1;
  window.speechSynthesis.speak(utterance);
}

function stopSpeaking() {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface ConversationSessionProps {
  scenario: ScenarioConfig;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ConversationSession({ scenario }: ConversationSessionProps) {
  const [turns, setTurns] = useState<ConversationTurn[]>([]);
  const [geminiHistory, setGeminiHistory] = useState<GeminiHistoryItem[]>([]);
  const [streamingText, setStreamingText] = useState("");
  const [isAIResponding, setIsAIResponding] = useState(false);
  const [finalText, setFinalText] = useState("");
  const [interimText, setInterimText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const recordSession = useSpeakingStore((s) => s.recordSession);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [turns, streamingText]);

  // ── Start conversation with AI opener ─────────────────────────────────────

  const startConversation = useCallback(async () => {
    setHasStarted(true);
    setIsAIResponding(true);
    setStreamingText("");
    setError(null);

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    let accumulated = "";

    try {
      const res = await fetch("/api/speaking/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "__START__",
          scenario: scenario.id,
          history: [],
        }),
        signal: abortRef.current.signal,
      });

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No stream");

      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        if (chunk.startsWith("__ERROR__:")) {
          setError(chunk.slice(10));
          setIsAIResponding(false);
          setStreamingText("");
          return;
        }
        accumulated += chunk;
        setStreamingText(accumulated);
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      // Fall back to the static starter prompt on network error
      accumulated = scenario.starterPrompt;
    }

    const aiText = accumulated || scenario.starterPrompt;
    const aiTurn: ConversationTurn = {
      role: "ai",
      text: aiText,
      timestamp: new Date().toISOString(),
    };

    setTurns([aiTurn]);
    setGeminiHistory([
      { role: "user", parts: [{ text: "__START__" }] },
      { role: "model", parts: [{ text: aiText }] },
    ]);
    setStreamingText("");
    setIsAIResponding(false);

    if (ttsEnabled) speak(aiText);
  }, [scenario, ttsEnabled]);

  // ── Send user message → get AI response ───────────────────────────────────

  const sendUserMessage = useCallback(
    async (userText: string) => {
      const text = userText.trim();
      if (!text || isAIResponding) return;

      const userTurn: ConversationTurn = {
        role: "user",
        text,
        timestamp: new Date().toISOString(),
      };

      setTurns((prev) => [...prev, userTurn]);
      setFinalText("");
      setInterimText("");
      setIsAIResponding(true);
      setStreamingText("");
      setError(null);

      // Update Gemini history with user message
      const updatedHistory: GeminiHistoryItem[] = [
        ...geminiHistory,
        { role: "user", parts: [{ text }] },
      ];

      abortRef.current?.abort();
      abortRef.current = new AbortController();

      let accumulated = "";

      try {
        const res = await fetch("/api/speaking/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text,
            scenario: scenario.id,
            history: geminiHistory, // send history WITHOUT this new message (chat.sendMessage adds it)
          }),
          signal: abortRef.current.signal,
        });

        const reader = res.body?.getReader();
        if (!reader) throw new Error("No stream");

        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          if (accumulated === "" && chunk.startsWith("__ERROR__:")) {
            setError(chunk.slice(10));
            setIsAIResponding(false);
            setStreamingText("");
            return;
          }
          accumulated += chunk;
          setStreamingText(accumulated);
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") {
          setIsAIResponding(false);
          setStreamingText("");
          return;
        }
        setError("Network error. Please check your connection.");
        setIsAIResponding(false);
        setStreamingText("");
        return;
      }

      const aiTurn: ConversationTurn = {
        role: "ai",
        text: accumulated,
        timestamp: new Date().toISOString(),
      };

      setTurns((prev) => [...prev, aiTurn]);
      setGeminiHistory([
        ...updatedHistory,
        { role: "model", parts: [{ text: accumulated }] },
      ]);
      setStreamingText("");
      setIsAIResponding(false);

      if (ttsEnabled && accumulated) speak(accumulated);

      // Save session snapshot every AI turn
      recordSession({
        scenario: scenario.id,
        mode: "conversation",
        transcript: text,
        feedback: null,
        durationSeconds: 0,
      });
    },
    [geminiHistory, isAIResponding, scenario, ttsEnabled, recordSession]
  );

  // ── Speech recognition ─────────────────────────────────────────────────────

  const { isListening, isSupported, start, stop } = useSpeechRecognition({
    onInterimResult: (text) => setInterimText(text),
    onFinalResult: (text) => {
      setFinalText(text);
      setInterimText("");
    },
    onError: (msg) => {
      setError(msg);
    },
    onEnd: () => setInterimText(""),
  });

  const handleMicStart = useCallback(() => {
    stopSpeaking();
    setError(null);
    setFinalText("");
    setInterimText("");
    start();
  }, [start]);

  const handleMicStop = useCallback(() => {
    stop();
  }, [stop]);

  const handleSendVoice = useCallback(() => {
    void sendUserMessage(finalText);
  }, [finalText, sendUserMessage]);

  const handleReset = useCallback(() => {
    abortRef.current?.abort();
    stopSpeaking();
    stop();
    setTurns([]);
    setGeminiHistory([]);
    setStreamingText("");
    setFinalText("");
    setInterimText("");
    setError(null);
    setIsAIResponding(false);
    setHasStarted(false);
  }, [stop]);

  // ── Not started yet ────────────────────────────────────────────────────────

  if (!hasStarted) {
    return (
      <div className="flex flex-col items-center gap-6 py-8 text-center">
        <div
          className={cn(
            "flex h-20 w-20 items-center justify-center rounded-2xl text-4xl",
            scenario.bg
          )}
        >
          {scenario.icon}
        </div>
        <div>
          <p className="text-base font-semibold text-foreground">
            {scenario.label}
          </p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            {scenario.description}. The AI will open the conversation and you&apos;ll respond by speaking.
          </p>
        </div>
        <button
          onClick={() => void startConversation()}
          className={cn(
            "rounded-xl px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90",
            scenario.bg.replace("/10", "")
          )}
        >
          Start Conversation
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {turns.filter((t) => t.role === "user").length} response
          {turns.filter((t) => t.role === "user").length !== 1 ? "s" : ""}
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setTtsEnabled((v) => !v);
              if (!ttsEnabled) return;
              stopSpeaking();
            }}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all",
              ttsEnabled
                ? cn(scenario.bg, scenario.border, "border", scenario.color)
                : "bg-muted text-muted-foreground hover:bg-muted/70"
            )}
            title={ttsEnabled ? "Mute AI voice" : "Enable AI voice"}
          >
            {ttsEnabled ? (
              <Volume2 className="h-3.5 w-3.5" />
            ) : (
              <VolumeX className="h-3.5 w-3.5" />
            )}
            {ttsEnabled ? "AI Voice On" : "AI Voice Off"}
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 rounded-lg bg-muted px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted/70"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Restart
          </button>
        </div>
      </div>

      {/* Chat messages */}
      <div
        ref={scrollRef}
        className="flex max-h-96 min-h-48 flex-col gap-3 overflow-y-auto rounded-2xl border border-border bg-muted/20 p-4 scrollbar-thin"
      >
        {turns.map((turn, i) => (
          <MessageBubble
            key={i}
            turn={turn}
            scenarioColor={scenario.color}
            scenarioBg={scenario.bg}
            scenarioBorder={scenario.border}
          />
        ))}

        {/* Streaming AI message */}
        {isAIResponding && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div
              className={cn(
                "max-w-[80%] rounded-2xl border px-4 py-3 text-sm leading-relaxed",
                scenario.bg,
                scenario.border
              )}
            >
              <p className={cn("mb-1 text-[10px] font-bold uppercase tracking-wider", scenario.color)}>
                AI Partner
              </p>
              {streamingText || (
                <span className="flex items-center gap-1 text-muted-foreground">
                  <motion.span
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    ···
                  </motion.span>
                </span>
              )}
              {streamingText && <StreamingCursor />}
            </div>
          </motion.div>
        )}
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-2.5 text-xs text-destructive"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Voice input area */}
      <div
        className={cn(
          "rounded-2xl border p-5",
          isListening ? cn(scenario.bg, scenario.border) : "border-border bg-card"
        )}
      >
        <VoiceRecorder
          isListening={isListening}
          isSupported={isSupported}
          isDisabled={isAIResponding}
          interimText={interimText}
          finalText={finalText}
          onStart={handleMicStart}
          onStop={handleMicStop}
          accentColor={scenario.color}
          accentBg={scenario.bg.replace("/10", "")}
        />

        {/* Send voice button */}
        <AnimatePresence>
          {finalText.trim().length > 0 && !isListening && !isAIResponding && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4 flex justify-center"
            >
              <button
                onClick={handleSendVoice}
                className={cn(
                  "rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90",
                  scenario.bg.replace("/10", "")
                )}
              >
                Send Response
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
