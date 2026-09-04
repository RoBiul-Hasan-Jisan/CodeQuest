'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api-client';
import { Card, SectionTitle, Badge, Empty } from '@/components/ui';
import type { Task, Project } from '@/lib/types';

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<{ totalSolved: number; weekSolved: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [t, p, s] = await Promise.all([
        apiFetch<Task[]>('/api/tasks?filter=all'),
        apiFetch<Project[]>('/api/projects'),
        apiFetch<{ totalSolved: number; weekSolved: number }>('/api/progress/stats'),
      ]);
      setTasks(t);
      setProjects(p);
      setStats(s);
      setLoading(false);
    })();
  }, []);

  const today = new Date().toISOString().slice(0, 10);
  const todaysTasks = tasks.filter((t) => t.dueDate === today);
  const activeCount = tasks.filter((t) => !t.completed).length;
  const completedTodayCount = tasks.filter((t) => t.completed && t.completedAt?.slice(0, 10) === today).length;
  const upcomingProjects = projects
    .filter((p) => p.dueDate && p.dueDate >= today)
    .sort((a, b) => (a.dueDate! < b.dueDate! ? -1 : 1))
    .slice(0, 4);

  if (loading) return <p className="text-ink-dim text-sm">Loading your dashboard…</p>;

  return (
    <div className="rise">
      <SectionTitle eyebrow="today" title="Dashboard" />

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <Card>
          <p className="text-xs text-ink-dim mb-2">Active tasks</p>
          <p className="text-3xl font-semibold font-mono-tag text-violet">{activeCount}</p>
        </Card>
        <Card>
          <p className="text-xs text-ink-dim mb-2">Completed today</p>
          <p className="text-3xl font-semibold font-mono-tag text-teal">{completedTodayCount}</p>
        </Card>
        <Card>
          <p className="text-xs text-ink-dim mb-2">Solved this week</p>
          <p className="text-3xl font-semibold font-mono-tag text-amber">{stats?.weekSolved ?? 0}</p>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Today&apos;s tasks</h2>
            <Link href="/tasks" className="text-xs text-teal hover:underline">
              View all →
            </Link>
          </div>
          {todaysTasks.length === 0 ? (
            <Empty label="Nothing due today. Add a task to get moving." />
          ) : (
            <ul className="space-y-2">
              {todaysTasks.map((t) => (
                <li key={t.id} className="flex items-center justify-between rounded-lg bg-bg-alt px-3 py-2.5">
                  <span className={`text-sm ${t.completed ? 'line-through text-ink-dim' : ''}`}>{t.title}</span>
                  <Badge tone={t.priority === 'HIGH' ? 'rose' : t.priority === 'MEDIUM' ? 'amber' : 'teal'}>
                    {t.priority.toLowerCase()}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Upcoming projects</h2>
            <Link href="/calendar" className="text-xs text-teal hover:underline">
              View all →
            </Link>
          </div>
          {upcomingProjects.length === 0 ? (
            <Empty label="No upcoming deadlines. Add a project to track one." />
          ) : (
            <ul className="space-y-2">
              {upcomingProjects.map((p) => (
                <li key={p.id} className="flex items-center gap-3 rounded-lg bg-bg-alt px-3 py-2.5">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} />
                  <span className="text-sm flex-1 truncate">{p.title}</span>
                  <span className="text-xs text-ink-dim font-mono-tag">{p.dueDate}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
