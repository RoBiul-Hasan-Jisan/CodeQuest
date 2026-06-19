"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Square } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

// ─── Waveform bar heights (deterministic to avoid hydration issues) ──────────

const BAR_HEIGHTS = [10, 22, 16, 28, 12, 32, 18, 28, 14, 22, 10, 20];

function Waveform({ active }: { active: boolean }) {
  return (
    <div className="flex items-center justify-center gap-1" aria-hidden>
      {BAR_HEIGHTS.map((maxH, i) => (
        <motion.div
          key={i}
          className="w-1 rounded-full bg-current"
          animate={
            active
              ? { height: [4, maxH, 4], opacity: [0.6, 1, 0.6] }
              : { height: 4, opacity: 0.3 }
          }
          transition={
            active
              ? {
                  duration: 0.5 + i * 0.04,
                  repeat: Infinity,
                  delay: i * 0.07,
                  ease: "easeInOut",
                }
              : { duration: 0.2 }
          }
        />
      ))}
    </div>
  );
}

// ─── Duration counter ─────────────────────────────────────────────────────────

function DurationCounter({ isRunning }: { isRunning: boolean }) {
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isRunning) {
      setSeconds(0);
      intervalRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <span className="font-mono text-sm tabular-nums text-muted-foreground">
      {mm}:{ss}
    </span>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface VoiceRecorderProps {
  isListening: boolean;
  isSupported: boolean;
  isDisabled?: boolean;
  interimText: string;
  finalText: string;
  onStart: () => void;
  onStop: () => void;
  /** Accent color classes e.g. "text-ds-violet" */
  accentColor?: string;
  accentBg?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function VoiceRecorder({
  isListening,
  isSupported,
  isDisabled = false,
  interimText,
  finalText,
  onStart,
  onStop,
  accentColor = "text-ds-violet",
  accentBg = "bg-ds-violet",
}: VoiceRecorderProps) {
  const hasText = finalText.trim().length > 0 || interimText.trim().length > 0;

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Main mic button */}
      <div className="relative flex flex-col items-center gap-4">
        {/* Outer pulse ring (only while listening) */}
        <AnimatePresence>
          {isListening && (
            <motion.div
              key="pulse"
              className={cn(
                "absolute inset-0 -m-4 rounded-full",
                accentBg,
                "opacity-20"
              )}
              initial={{ scale: 1, opacity: 0.2 }}
              animate={{ scale: 1.4, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut" }}
            />
          )}
        </AnimatePresence>

        <motion.button
          onClick={isListening ? onStop : onStart}
          disabled={!isSupported || isDisabled}
          whileHover={!isDisabled && isSupported ? { scale: 1.05 } : undefined}
          whileTap={!isDisabled && isSupported ? { scale: 0.95 } : undefined}
          className={cn(
            "relative flex h-20 w-20 items-center justify-center rounded-full border-2 transition-all duration-200",
            isListening
              ? cn(accentBg, "border-transparent text-white shadow-lg")
              : isSupported && !isDisabled
              ? cn(
                  "border-border bg-card",
                  accentColor,
                  "hover:border-current/40 hover:bg-muted"
                )
              : "cursor-not-allowed border-border bg-muted text-muted-foreground opacity-50"
          )}
          aria-label={isListening ? "Stop recording" : "Start recording"}
        >
          <AnimatePresence mode="wait">
            {!isSupported ? (
              <MicOff key="off" className="h-8 w-8" />
            ) : isListening ? (
              <motion.div
                key="stop"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <Square className="h-7 w-7 fill-current" />
              </motion.div>
            ) : (
              <motion.div
                key="mic"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <Mic className="h-8 w-8" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Status label */}
        <div className="flex flex-col items-center gap-1">
          <AnimatePresence mode="wait">
            {!isSupported ? (
              <motion.p
                key="unsupported"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-destructive"
              >
                Browser not supported — use Chrome or Edge
              </motion.p>
            ) : isListening ? (
              <motion.div
                key="listening"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className={cn("flex items-center gap-2", accentColor)}
              >
                <motion.span
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="h-2 w-2 rounded-full bg-current"
                />
                <span className="text-sm font-medium">Listening…</span>
                <DurationCounter isRunning={isListening} />
              </motion.div>
            ) : (
              <motion.p
                key="idle"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="text-xs text-muted-foreground"
              >
                {hasText ? "Tap to re-record" : "Tap the mic to start speaking"}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Waveform (only while listening) */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            key="waveform"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className={cn("w-full max-w-xs", accentColor)}
          >
            <Waveform active={isListening} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transcript display */}
      <AnimatePresence>
        {hasText && (
          <motion.div
            key="transcript"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="w-full rounded-2xl border border-border bg-muted/40 px-4 py-3"
          >
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Transcript
            </p>
            <p className="text-sm leading-relaxed text-foreground">
              {finalText}
              {interimText && !finalText.endsWith(interimText) && (
                <span className="text-muted-foreground">{interimText}</span>
              )}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
