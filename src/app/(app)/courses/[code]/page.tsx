'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/api-client';
import { Card, SectionTitle, Button, Input, Textarea, Empty } from '@/components/ui';
import type { Course, CourseItem } from '@/lib/types';

type WorkspaceData = {
  course: Course;
  notes: CourseItem[];
  resources: CourseItem[];
  slides: CourseItem[];
  tasks: CourseItem[];
};

const TABS = [
  { key: 'notes', label: 'Notes' },
  { key: 'resources', label: 'Resources' },
  { key: 'slides', label: 'Slides' },
  { key: 'tasks', label: 'Tasks' },
] as const;

export default function CourseWorkspacePage() {
  const params = useParams<{ code: string }>();
  const router = useRouter();
  const code = decodeURIComponent(params.code);

  const [data, setData] = useState<WorkspaceData | null>(null);
  const [tab, setTab] = useState<(typeof TABS)[number]['key']>('notes');
  const [noteText, setNoteText] = useState('');
  const [itemName, setItemName] = useState('');
  const [itemLink, setItemLink] = useState('');
  const [taskTitle, setTaskTitle] = useState('');

  async function load() {
    try {
      setData(await apiFetch<WorkspaceData>(`/api/courses/${encodeURIComponent(code)}`));
    } catch {
      router.push('/courses');
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  async function addNote(e: React.FormEvent) {
    e.preventDefault();
    if (!noteText.trim()) return;
    await apiFetch(`/api/courses/${encodeURIComponent(code)}/notes`, {
      method: 'POST',
      body: JSON.stringify({ text: noteText }),
    });
    setNoteText('');
    load();
  }

  async function addLinkItem(type: 'resources' | 'slides', e: React.FormEvent) {
    e.preventDefault();
    if (!itemName.trim()) return;
    await apiFetch(`/api/courses/${encodeURIComponent(code)}/${type}`, {
      method: 'POST',
      body: JSON.stringify({ name: itemName, link: itemLink }),
    });
    setItemName('');
    setItemLink('');
    load();
  }

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    await apiFetch(`/api/courses/${encodeURIComponent(code)}/tasks`, {
      method: 'POST',
      body: JSON.stringify({ title: taskTitle }),
    });
    setTaskTitle('');
    load();
  }

  async function toggleTask(item: CourseItem) {
    await apiFetch(
      `/api/courses/${encodeURIComponent(code)}/tasks/${item.id}/${item.completed ? 'uncomplete' : 'complete'}`,
      { method: 'PATCH' }
    );
    load();
  }

  async function removeItem(type: string, id: string) {
    await apiFetch(`/api/courses/${encodeURIComponent(code)}/${type}/${id}`, { method: 'DELETE' });
    load();
  }

  if (!data) return <p className="text-sm text-ink-dim">Loading…</p>;

  return (
    <div className="rise">
      <Link href="/courses" className="text-xs text-ink-dim hover:text-ink mb-4 inline-block">
        ← Course Hub
      </Link>
      <SectionTitle eyebrow={data.course.code} title={data.course.name} />

      <div className="flex gap-2 mb-6">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-full px-4 py-1.5 text-sm ${tab === t.key ? 'bg-surface-hi text-ink' : 'text-ink-dim hover:text-ink'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'notes' && (
        <div>
          <Card className="mb-4">
            <form onSubmit={addNote} className="flex gap-3">
              <Textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} rows={2} placeholder="Write a note…" />
              <Button type="submit" className="self-end">Add</Button>
            </form>
          </Card>
          {data.notes.length === 0 ? (
            <Empty label="No notes yet." />
          ) : (
            <div className="space-y-2">
              {data.notes.map((n) => (
                <Card key={n.id} className="flex justify-between items-start gap-3 py-3">
                  <p className="text-sm whitespace-pre-wrap">{n.text}</p>
                  <button onClick={() => removeItem('notes', n.id)} className="text-xs text-ink-dim hover:text-rose shrink-0">
                    delete
                  </button>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {(tab === 'resources' || tab === 'slides') && (
        <div>
          <Card className="mb-4">
            <form onSubmit={(e) => addLinkItem(tab, e)} className="grid sm:grid-cols-2 gap-3">
              <Input value={itemName} onChange={(e) => setItemName(e.target.value)} placeholder="Name" required />
              <Input value={itemLink} onChange={(e) => setItemLink(e.target.value)} placeholder="Link (optional)" />
              <Button type="submit" className="sm:col-span-2">
                Add {tab === 'resources' ? 'resource' : 'slide'}
              </Button>
            </form>
          </Card>
          {data[tab].length === 0 ? (
            <Empty label={`No ${tab} yet.`} />
          ) : (
            <div className="space-y-2">
              {data[tab].map((item) => (
                <Card key={item.id} className="flex justify-between items-center py-3">
                  {item.link ? (
                    <a href={item.link} target="_blank" rel="noreferrer" className="text-sm hover:text-teal">
                      {item.name}
                    </a>
                  ) : (
                    <span className="text-sm">{item.name}</span>
                  )}
                  <button onClick={() => removeItem(tab, item.id)} className="text-xs text-ink-dim hover:text-rose">
                    delete
                  </button>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'tasks' && (
        <div>
          <Card className="mb-4">
            <form onSubmit={addTask} className="flex gap-3">
              <Input value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} placeholder="New course task…" />
              <Button type="submit">Add</Button>
            </form>
          </Card>
          {data.tasks.length === 0 ? (
            <Empty label="No course tasks yet." />
          ) : (
            <div className="space-y-2">
              {data.tasks.map((t) => (
                <Card key={t.id} className="flex items-center gap-3 py-3">
                  <button
                    onClick={() => toggleTask(t)}
                    className={`w-5 h-5 rounded-md border shrink-0 flex items-center justify-center ${
                      t.completed ? 'bg-teal border-teal text-bg' : 'border-border hover:border-violet'
                    }`}
                  >
                    {t.completed && '✓'}
                  </button>
                  <span className={`text-sm flex-1 ${t.completed ? 'line-through text-ink-dim' : ''}`}>{t.title}</span>
                  <button onClick={() => removeItem('tasks', t.id)} className="text-xs text-ink-dim hover:text-rose">
                    delete
                  </button>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
