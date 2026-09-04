'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api-client';
import { Card, SectionTitle, Button, Input } from '@/components/ui';
import type { ProgressEntry } from '@/lib/types';

function levelColor(count: number) {
  if (count === 0) return 'var(--surface-hi)';
  if (count <= 1) return 'rgba(92,230,195,0.35)';
  if (count <= 3) return 'rgba(92,230,195,0.6)';
  if (count <= 5) return 'rgba(92,230,195,0.85)';
  return 'var(--teal)';
}

export default function ProgressPage() {
  const [entries, setEntries] = useState<ProgressEntry[]>([]);
  const [stats, setStats] = useState<{ totalSolved: number; weekSolved: number } | null>(null);
  const [count, setCount] = useState('');
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const [e, s] = await Promise.all([
      apiFetch<ProgressEntry[]>('/api/progress?days=119'),
      apiFetch<{ totalSolved: number; weekSolved: number }>('/api/progress/stats'),
    ]);
    setEntries(e);
    setStats(s);
    const today = new Date().toISOString().slice(0, 10);
    const todays = e.find((x) => x.progressDate === today);
    setCount(todays ? String(todays.problemsSolved) : '');
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    await apiFetch('/api/progress/update', { method: 'POST', body: JSON.stringify({ count: parseInt(count || '0', 10) }) });
    load();
  }

  const byDate = new Map(entries.map((e) => [e.progressDate, e.problemsSolved]));
  const days: { date: string; count: number }[] = [];
  const today = new Date();
  for (let i = 118; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    days.push({ date: key, count: byDate.get(key) || 0 });
  }
  const weeks: { date: string; count: number }[][] = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));

  return (
    <div className="rise">
      <SectionTitle eyebrow="stats" title="Progress" />

      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <Card>
          <p className="text-xs text-ink-dim mb-2">Total problems solved</p>
          <p className="text-3xl font-semibold font-mono-tag text-teal">{loading ? '…' : stats?.totalSolved ?? 0}</p>
        </Card>
        <Card>
          <p className="text-xs text-ink-dim mb-2">Solved this week</p>
          <p className="text-3xl font-semibold font-mono-tag text-amber">{loading ? '…' : stats?.weekSolved ?? 0}</p>
        </Card>
      </div>

      <Card className="mb-6">
        <h2 className="font-semibold mb-3">Log today&apos;s count</h2>
        <form onSubmit={handleUpdate} className="flex items-end gap-3">
          <div className="flex-1 max-w-[160px]">
            <label className="text-xs text-ink-dim mb-1.5 block">Problems solved today</label>
            <Input type="number" min={0} value={count} onChange={(e) => setCount(e.target.value)} />
          </div>
          <Button type="submit">Save</Button>
        </form>
      </Card>

      <Card>
        <h2 className="font-semibold mb-4">Last 17 weeks</h2>
        <div className="overflow-x-auto">
          <div className="flex gap-1">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-1">
                {week.map((d) => (
                  <div
                    key={d.date}
                    title={`${d.date}: ${d.count} solved`}
                    className="w-3.5 h-3.5 rounded-sm"
                    style={{ background: levelColor(d.count) }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 mt-4 text-xs text-ink-dim">
          <span>Less</span>
          {[0, 1, 3, 5, 6].map((c) => (
            <span key={c} className="w-3.5 h-3.5 rounded-sm" style={{ background: levelColor(c) }} />
          ))}
          <span>More</span>
        </div>
      </Card>
    </div>
  );
}
