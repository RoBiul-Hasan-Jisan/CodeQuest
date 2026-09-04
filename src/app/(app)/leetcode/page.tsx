'use client';

import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '@/lib/api-client';
import { Card, SectionTitle, Button, Input, Select, Badge, Empty } from '@/components/ui';
import type { LeetCodeProblem } from '@/lib/types';

const DIFF_TONE = { Easy: 'teal', Medium: 'amber', Hard: 'rose' } as const;

export default function LeetCodePage() {
  const [problems, setProblems] = useState<LeetCodeProblem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState('');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [url, setUrl] = useState('');
  const [diffFilter, setDiffFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  async function load() {
    setLoading(true);
    setProblems(await apiFetch<LeetCodeProblem[]>('/api/leetcode'));
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    await apiFetch('/api/leetcode', {
      method: 'POST',
      body: JSON.stringify({ title, tags: tags || undefined, difficulty, url: url || undefined }),
    });
    setTitle('');
    setTags('');
    setUrl('');
    setDifficulty('Medium');
    setShowForm(false);
    load();
  }

  async function toggleSolved(p: LeetCodeProblem) {
    setProblems((prev) => prev.map((x) => (x.id === p.id ? { ...x, solved: !x.solved } : x)));
    await apiFetch(`/api/leetcode/${p.id}`, { method: 'PATCH', body: JSON.stringify({ solved: !p.solved }) });
  }

  async function remove(id: string) {
    setProblems((prev) => prev.filter((x) => x.id !== id));
    await apiFetch(`/api/leetcode/${id}`, { method: 'DELETE' });
  }

  const filtered = useMemo(
    () =>
      problems.filter((p) => {
        if (diffFilter !== 'all' && p.difficulty !== diffFilter) return false;
        if (statusFilter === 'solved' && !p.solved) return false;
        if (statusFilter === 'unsolved' && p.solved) return false;
        return true;
      }),
    [problems, diffFilter, statusFilter]
  );

  const solvedCount = problems.filter((p) => p.solved).length;

  return (
    <div className="rise">
      <SectionTitle
        eyebrow="lc"
        title="LeetCode Tracker"
        action={<Button onClick={() => setShowForm((s) => !s)}>{showForm ? 'Cancel' : '+ Add problem'}</Button>}
      />

      <Card className="mb-6 flex items-center gap-6">
        <div>
          <p className="text-xs text-ink-dim">Total solved</p>
          <p className="text-2xl font-semibold font-mono-tag text-teal">{solvedCount}</p>
        </div>
        <div>
          <p className="text-xs text-ink-dim">Tracked</p>
          <p className="text-2xl font-semibold font-mono-tag text-violet">{problems.length}</p>
        </div>
      </Card>

      {showForm && (
        <Card className="mb-6">
          <form onSubmit={handleCreate} className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs text-ink-dim mb-1.5 block">Problem title</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} required autoFocus />
            </div>
            <div>
              <label className="text-xs text-ink-dim mb-1.5 block">Difficulty</label>
              <Select value={difficulty} onChange={(e) => setDifficulty(e.target.value as typeof difficulty)}>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </Select>
            </div>
            <div>
              <label className="text-xs text-ink-dim mb-1.5 block">Tags</label>
              <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="array, two-pointers" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs text-ink-dim mb-1.5 block">URL</label>
              <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://leetcode.com/problems/…" />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit">Add problem</Button>
            </div>
          </form>
        </Card>
      )}

      <div className="flex gap-2 mb-5 flex-wrap">
        {['all', 'Easy', 'Medium', 'Hard'].map((d) => (
          <button
            key={d}
            onClick={() => setDiffFilter(d)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-mono-tag ${diffFilter === d ? 'bg-surface-hi text-ink' : 'text-ink-dim'}`}
          >
            {d}
          </button>
        ))}
        <span className="w-px bg-border mx-1" />
        {['all', 'solved', 'unsolved'].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-mono-tag ${statusFilter === s ? 'bg-surface-hi text-ink' : 'text-ink-dim'}`}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-ink-dim">Loading…</p>
      ) : filtered.length === 0 ? (
        <Empty label="No problems match this filter." />
      ) : (
        <ul className="space-y-2">
          {filtered.map((p) => (
            <li key={p.id}>
              <Card className="flex items-center gap-3 py-3.5">
                <button
                  onClick={() => toggleSolved(p)}
                  className={`w-5 h-5 rounded-md border shrink-0 flex items-center justify-center ${
                    p.solved ? 'bg-teal border-teal text-bg' : 'border-border hover:border-violet'
                  }`}
                >
                  {p.solved && '✓'}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {p.url ? (
                      <a
                        href={p.url}
                        target="_blank"
                        rel="noreferrer"
                        className={`text-sm font-medium hover:text-teal ${p.solved ? 'text-ink-dim line-through' : ''}`}
                      >
                        {p.title}
                      </a>
                    ) : (
                      <span className={`text-sm font-medium ${p.solved ? 'text-ink-dim line-through' : ''}`}>{p.title}</span>
                    )}
                    <Badge tone={DIFF_TONE[p.difficulty]}>{p.difficulty}</Badge>
                    {p.tags && <span className="text-xs text-ink-dim">{p.tags}</span>}
                  </div>
                </div>
                <button onClick={() => remove(p.id)} className="text-ink-dim hover:text-rose text-xs shrink-0">
                  delete
                </button>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
