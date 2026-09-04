'use client';

import { useEffect, useRef, useState } from 'react';
import { Card, SectionTitle, Button } from '@/components/ui';

const FOCUS_SECONDS = 25 * 60;
const BREAK_SECONDS = 5 * 60;

export default function PomodoroPage() {
  const [mode, setMode] = useState<'focus' | 'break'>('focus');
  const [secondsLeft, setSecondsLeft] = useState(FOCUS_SECONDS);
  const [running, setRunning] = useState(false);
  const [sessionsDone, setSessionsDone] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            const nextMode = mode === 'focus' ? 'break' : 'focus';
            if (mode === 'focus') setSessionsDone((n) => n + 1);
            setMode(nextMode);
            return nextMode === 'focus' ? FOCUS_SECONDS : BREAK_SECONDS;
          }
          return s - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, mode]);

  function reset() {
    setRunning(false);
    setMode('focus');
    setSecondsLeft(FOCUS_SECONDS);
  }

  const total = mode === 'focus' ? FOCUS_SECONDS : BREAK_SECONDS;
  const pct = ((total - secondsLeft) / total) * 100;
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');

  return (
    <div className="rise">
      <SectionTitle eyebrow="timer" title="Focus Timer" />

      <div className="grid md:grid-cols-[1fr_260px] gap-6">
        <Card className="flex flex-col items-center py-14">
          <p className="font-mono-tag text-xs text-ink-dim mb-6 uppercase tracking-wide">
            {mode === 'focus' ? 'Deep work' : 'Short break'}
          </p>

          <div className="relative w-56 h-56">
            <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90">
              <circle cx="100" cy="100" r="88" fill="none" stroke="var(--surface-hi)" strokeWidth="10" />
              <circle
                cx="100"
                cy="100"
                r="88"
                fill="none"
                stroke={mode === 'focus' ? 'var(--violet)' : 'var(--teal)'}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 88}
                strokeDashoffset={2 * Math.PI * 88 * (1 - pct / 100)}
                style={{ transition: 'stroke-dashoffset 1s linear' }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-5xl font-semibold font-mono-tag tabular-nums">
                {mm}:{ss}
              </span>
            </div>
          </div>

          <div className="flex gap-3 mt-8">
            <Button onClick={() => setRunning((r) => !r)}>{running ? 'Pause' : 'Start'}</Button>
            <Button variant="ghost" onClick={reset}>
              Reset
            </Button>
          </div>
        </Card>

        <Card>
          <h2 className="font-semibold mb-4">Session log</h2>
          <p className="text-xs text-ink-dim mb-1">Focus sessions completed today</p>
          <p className="text-3xl font-semibold font-mono-tag text-violet mb-6">{sessionsDone}</p>
          <p className="text-xs text-ink-dim leading-relaxed">
            25 minutes of focus, then a 5 minute break. Stay on one task per session — switch tabs less, ship more.
          </p>
        </Card>
      </div>
    </div>
  );
}
