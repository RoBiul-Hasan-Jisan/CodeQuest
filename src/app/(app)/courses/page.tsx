'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api-client';
import { Card, SectionTitle, Button, Input, Empty } from '@/components/ui';
import type { Course } from '@/lib/types';

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [instructor, setInstructor] = useState('');
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    setCourses(await apiFetch<Course[]>('/api/courses'));
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!code.trim() || !name.trim()) return;
    try {
      await apiFetch('/api/courses', {
        method: 'POST',
        body: JSON.stringify({ code, name, instructor: instructor || undefined }),
      });
      setCode('');
      setName('');
      setInstructor('');
      setShowForm(false);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add course');
    }
  }

  async function remove(courseCode: string) {
    setCourses((prev) => prev.filter((c) => c.code !== courseCode));
    await apiFetch(`/api/courses/${encodeURIComponent(courseCode)}`, { method: 'DELETE' });
  }

  return (
    <div className="rise">
      <SectionTitle
        eyebrow="hub"
        title="Course Hub"
        action={<Button onClick={() => setShowForm((s) => !s)}>{showForm ? 'Cancel' : '+ Add course'}</Button>}
      />

      {showForm && (
        <Card className="mb-6">
          <form onSubmit={handleCreate} className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-ink-dim mb-1.5 block">Course code</label>
              <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="CS 301" required autoFocus />
            </div>
            <div>
              <label className="text-xs text-ink-dim mb-1.5 block">Course name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Algorithms" required />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs text-ink-dim mb-1.5 block">Instructor</label>
              <Input value={instructor} onChange={(e) => setInstructor(e.target.value)} />
            </div>
            {error && <p className="text-sm text-rose sm:col-span-2">{error}</p>}
            <div className="sm:col-span-2">
              <Button type="submit">Add course</Button>
            </div>
          </form>
        </Card>
      )}

      {loading ? (
        <p className="text-sm text-ink-dim">Loading…</p>
      ) : courses.length === 0 ? (
        <Empty label="No courses yet. Add one to build out its workspace." />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((c) => (
            <Card key={c.id} className="relative">
              <button
                onClick={() => remove(c.code)}
                className="absolute top-3 right-3 text-xs text-ink-dim hover:text-rose"
              >
                delete
              </button>
              <Link href={`/courses/${encodeURIComponent(c.code)}`} className="block">
                <p className="font-mono-tag text-xs text-teal mb-2">{c.code}</p>
                <h3 className="font-semibold pr-10">{c.name}</h3>
                {c.instructor && <p className="text-sm text-ink-dim mt-1">{c.instructor}</p>}
                <p className="text-xs text-violet mt-4">Open workspace →</p>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
