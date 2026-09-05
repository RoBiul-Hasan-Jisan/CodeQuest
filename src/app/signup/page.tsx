'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api-client';
import { Input, Button } from '@/components/ui';

export default function SignupPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await apiFetch('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ username, email, password }),
      });
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm rise">
        <Link href="/" className="flex items-center gap-2 mb-8 justify-center">
          <span className="w-8 h-8 rounded-lg bg-linear-to-br from-violet to-teal flex items-center justify-center text-bg font-bold text-sm">
            CQ
          </span>
          <span className="font-semibold text-lg tracking-tight">CodeQuest</span>
        </Link>
        <div className="rounded-xl border border-border bg-surface/70 p-6">
          <h1 className="text-xl font-semibold mb-1">Start your quest</h1>
          <p className="text-sm text-ink-dim mb-6">One account for tasks, practice and your study crew.</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-ink-dim mb-1.5 block">Username</label>
              <Input value={username} onChange={(e) => setUsername(e.target.value)} required autoFocus />
            </div>
            <div>
              <label className="text-xs text-ink-dim mb-1.5 block">Email</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="text-xs text-ink-dim mb-1.5 block">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            {error && <p className="text-sm text-rose">{error}</p>}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Creating account…' : 'Create account'}
            </Button>
          </form>
        </div>
        <p className="text-center text-sm text-ink-dim mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-teal hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
