'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api-client';

const NAV = [
  { href: '/dashboard', label: 'Dashboard', tag: '~/' },
  { href: '/tasks', label: 'Tasks', tag: 'todo' },
  { href: '/calendar', label: 'Projects', tag: 'cal' },
  { href: '/leetcode', label: 'LeetCode', tag: 'lc' },
  { href: '/progress', label: 'Progress', tag: 'stats' },
  { href: '/pomodoro', label: 'Focus Timer', tag: 'timer' },
  { href: '/courses', label: 'Courses', tag: 'hub' },
  { href: '/friends', label: 'Friends', tag: 'net' },
  { href: '/messages', label: 'Messages', tag: 'msg' },
];

export default function AppShell({
  username,
  children,
}: {
  username: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await apiFetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  return (
    <div className="min-h-screen flex">
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-border bg-bg-alt/60 backdrop-blur-sm px-4 py-6">
        <Link href="/dashboard" className="flex items-center gap-2 px-2 mb-8">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet to-teal flex items-center justify-center text-bg font-bold text-sm">
            CQ
          </span>
          <span className="font-semibold text-lg tracking-tight">CodeQuest</span>
        </Link>

        <nav className="flex-1 flex flex-col gap-1">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                  active
                    ? 'bg-surface-hi text-ink'
                    : 'text-ink-dim hover:bg-surface hover:text-ink'
                }`}
              >
                <span>{item.label}</span>
                <span
                  className={`font-mono-tag text-[10px] ${
                    active ? 'text-teal' : 'text-ink-dim/50 group-hover:text-ink-dim'
                  }`}
                >
                  {item.tag}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-6 pt-4 border-t border-border flex items-center justify-between px-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-7 h-7 rounded-full bg-surface-hi flex items-center justify-center text-xs font-semibold shrink-0">
              {username.slice(0, 1).toUpperCase()}
            </span>
            <span className="text-sm text-ink-dim truncate">{username}</span>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs text-ink-dim hover:text-rose transition-colors font-mono-tag"
          >
            exit
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-bg-alt/80 backdrop-blur">
          <Link href="/dashboard" className="font-semibold">CodeQuest</Link>
          <button onClick={handleLogout} className="text-xs text-ink-dim">exit</button>
        </header>
        <nav className="md:hidden flex gap-1 overflow-x-auto px-3 py-2 border-b border-border bg-bg-alt/40">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs ${
                pathname.startsWith(item.href) ? 'bg-surface-hi text-ink' : 'text-ink-dim'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <main className="flex-1 p-5 md:p-8 max-w-6xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
