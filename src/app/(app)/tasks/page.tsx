'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api-client';
import { Card, SectionTitle, Button, Input, Select, Badge, Empty } from '@/components/ui';
import type { Task } from '@/lib/types';

const FILTERS = ['all', 'today', 'active', 'completed'] as const;

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('all');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'HIGH' | 'MEDIUM' | 'LOW'>('MEDIUM');
  const [dueDate, setDueDate] = useState('');
  const [category, setCategory] = useState('');

  async function load(f: (typeof FILTERS)[number] = filter) {
    setLoading(true);
    const data = await apiFetch<Task[]>(`/api/tasks?filter=${f}`);
    setTasks(data);
    setLoading(false);
  }

  useEffect(() => {
    load(filter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    await apiFetch('/api/tasks', {
      method: 'POST',
      body: JSON.stringify({
        title,
        description: description || undefined,
        priority,
        dueDate: dueDate || undefined,
        category: category || undefined,
      }),
    });
    setTitle('');
    setDescription('');
    setDueDate('');
    setCategory('');
    setPriority('MEDIUM');
    setShowForm(false);
    load();
  }

  async function toggleComplete(t: Task) {
    setTasks((prev) => prev.map((x) => (x.id === t.id ? { ...x, completed: !x.completed } : x)));
    await apiFetch(`/api/tasks/${t.id}`, { method: 'PATCH', body: JSON.stringify({ completed: !t.completed }) });
  }

  async function remove(id: string) {
    setTasks((prev) => prev.filter((x) => x.id !== id));
    await apiFetch(`/api/tasks/${id}`, { method: 'DELETE' });
  }

  const priorityTone = { HIGH: 'rose', MEDIUM: 'amber', LOW: 'teal' } as const;

  return (
    <div className="rise">
      <SectionTitle
        eyebrow="todo"
        title="Tasks"
        action={<Button onClick={() => setShowForm((s) => !s)}>{showForm ? 'Cancel' : '+ New task'}</Button>}
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
              <Input value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-ink-dim mb-1.5 block">Priority</label>
              <Select value={priority} onChange={(e) => setPriority(e.target.value as typeof priority)}>
                <option value="HIGH">High Priority</option>
                <option value="MEDIUM">Medium Priority</option>
                <option value="LOW">Low Priority</option>
              </Select>
            </div>
            <div>
              <label className="text-xs text-ink-dim mb-1.5 block">Due date</label>
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs text-ink-dim mb-1.5 block">Category</label>
              <Input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Coursework, Interview prep"
              />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit">Add task</Button>
            </div>
          </form>
        </Card>
      )}

      <div className="flex gap-2 mb-5">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-mono-tag transition-colors ${
              filter === f ? 'bg-surface-hi text-ink' : 'text-ink-dim hover:text-ink'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-ink-dim">Loading…</p>
      ) : tasks.length === 0 ? (
        <Empty label="No tasks here yet." />
      ) : (
        <ul className="space-y-2">
          {tasks.map((t) => (
            <li key={t.id}>
              <Card className="flex items-start gap-3 py-3.5">
                <button
                  onClick={() => toggleComplete(t)}
                  className={`mt-0.5 w-5 h-5 rounded-md border shrink-0 transition-colors flex items-center justify-center ${
                    t.completed ? 'bg-teal border-teal text-bg' : 'border-border hover:border-violet'
                  }`}
                >
                  {t.completed && '✓'}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-sm font-medium ${t.completed ? 'line-through text-ink-dim' : ''}`}>
                      {t.title}
                    </span>
                    <Badge tone={priorityTone[t.priority]}>{t.priority.toLowerCase()}</Badge>
                    {t.category && <Badge>{t.category}</Badge>}
                    {t.dueDate && (
                      <span className="text-xs text-ink-dim font-mono-tag">{t.dueDate}</span>
                    )}
                  </div>
                  {t.description && <p className="text-xs text-ink-dim mt-1">{t.description}</p>}
                </div>
                <button onClick={() => remove(t.id)} className="text-ink-dim hover:text-rose text-xs shrink-0">
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
