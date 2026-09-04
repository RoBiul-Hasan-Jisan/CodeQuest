'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api-client';
import { Card, SectionTitle, Button, Input, Textarea, Empty } from '@/components/ui';
import type { Project } from '@/lib/types';

const COLORS = ['#8b7fff', '#5ce6c3', '#ffb454', '#ff6b81', '#54c7ff'];

export default function CalendarPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [color, setColor] = useState(COLORS[0]);

  async function load() {
    setLoading(true);
    setProjects(await apiFetch<Project[]>('/api/projects'));
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    await apiFetch('/api/projects', {
      method: 'POST',
      body: JSON.stringify({ title, description: description || undefined, dueDate: dueDate || undefined, color }),
    });
    setTitle('');
    setDescription('');
    setDueDate('');
    setColor(COLORS[0]);
    setShowForm(false);
    load();
  }

  async function updateProgress(p: Project, delta: number) {
    const next = Math.max(0, Math.min(100, p.progress + delta));
    setProjects((prev) => prev.map((x) => (x.id === p.id ? { ...x, progress: next } : x)));
    await apiFetch(`/api/projects/${p.id}`, { method: 'PATCH', body: JSON.stringify({ progress: next }) });
  }

  async function remove(id: string) {
    setProjects((prev) => prev.filter((x) => x.id !== id));
    await apiFetch(`/api/projects/${id}`, { method: 'DELETE' });
  }

  const today = new Date().toISOString().slice(0, 10);
  const sorted = [...projects].sort((a, b) => (a.dueDate || '9999') < (b.dueDate || '9999') ? -1 : 1);

  return (
    <div className="rise">
      <SectionTitle
        eyebrow="cal"
        title="Projects"
        action={<Button onClick={() => setShowForm((s) => !s)}>{showForm ? 'Cancel' : '+ New project'}</Button>}
      />

      {showForm && (
        <Card className="mb-6">
          <form onSubmit={handleCreate} className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs text-ink-dim mb-1.5 block">Title</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} required autoFocus />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs text-ink-dim mb-1.5 block">Description</label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
            </div>
            <div>
              <label className="text-xs text-ink-dim mb-1.5 block">Due date</label>
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-ink-dim mb-1.5 block">Color</label>
              <div className="flex gap-2 pt-2">
                {COLORS.map((c) => (
                  <button
                    type="button"
                    key={c}
                    onClick={() => setColor(c)}
                    className={`w-7 h-7 rounded-full transition-transform ${color === c ? 'scale-110 ring-2 ring-ink' : ''}`}
                    style={{ background: c }}
                  />
                ))}
              </div>
            </div>
            <div className="sm:col-span-2">
              <Button type="submit">Add project</Button>
            </div>
          </form>
        </Card>
      )}

      {loading ? (
        <p className="text-sm text-ink-dim">Loading…</p>
      ) : projects.length === 0 ? (
        <Empty label="No projects yet. Add one to start tracking a deadline." />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {sorted.map((p) => {
            const overdue = p.dueDate && p.dueDate < today && p.progress < 100;
            return (
              <Card key={p.id} className="relative overflow-hidden">
                <span className="absolute top-0 left-0 w-1 h-full" style={{ background: p.color }} />
                <div className="flex items-start justify-between gap-2 pl-2">
                  <div>
                    <h3 className="font-semibold">{p.title}</h3>
                    {p.dueDate && (
                      <p className={`text-xs font-mono-tag mt-1 ${overdue ? 'text-rose' : 'text-ink-dim'}`}>
                        due {p.dueDate}
                      </p>
                    )}
                  </div>
                  <button onClick={() => remove(p.id)} className="text-ink-dim hover:text-rose text-xs">
                    delete
                  </button>
                </div>
                {p.description && <p className="text-sm text-ink-dim mt-2 pl-2">{p.description}</p>}
                <div className="mt-4 pl-2">
                  <div className="flex items-center justify-between text-xs text-ink-dim mb-1.5">
                    <span>Progress</span>
                    <span className="font-mono-tag">{p.progress}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-bg-alt overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${p.progress}%`, background: p.color }}
                    />
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button variant="ghost" className="text-xs px-2 py-1" onClick={() => updateProgress(p, -10)}>
                      −10%
                    </Button>
                    <Button variant="ghost" className="text-xs px-2 py-1" onClick={() => updateProgress(p, 10)}>
                      +10%
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
