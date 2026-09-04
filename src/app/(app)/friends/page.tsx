'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api-client';
import { Card, SectionTitle, Button, Input, Empty } from '@/components/ui';

type Pending = { id: string; from: string };
type Friend = { username: string };

export default function FriendsPage() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pending, setPending] = useState<Pending[]>([]);
  const [target, setTarget] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const [f, p] = await Promise.all([
      apiFetch<Friend[]>('/api/friends/list'),
      apiFetch<Pending[]>('/api/friends/pending'),
    ]);
    setFriends(f);
    setPending(p);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function sendRequest(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const res = await apiFetch<{ message: string }>('/api/friends/request', {
        method: 'POST',
        body: JSON.stringify({ username: target }),
      });
      setMessage(res.message);
      setTarget('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send request');
    }
  }

  async function respond(id: string, action: 'accept' | 'decline') {
    await apiFetch(`/api/friends/respond/${id}`, { method: 'POST', body: JSON.stringify({ action }) });
    load();
  }

  async function removeFriend(username: string) {
    await apiFetch('/api/friends/remove', { method: 'DELETE', body: JSON.stringify({ username }) });
    load();
  }

  return (
    <div className="rise">
      <SectionTitle eyebrow="net" title="Friends" />

      <Card className="mb-6">
        <h2 className="font-semibold mb-3">Add a friend</h2>
        <form onSubmit={sendRequest} className="flex gap-3">
          <Input value={target} onChange={(e) => setTarget(e.target.value)} placeholder="username" required />
          <Button type="submit">Send request</Button>
        </form>
        {message && <p className="text-sm text-teal mt-2">{message}</p>}
        {error && <p className="text-sm text-rose mt-2">{error}</p>}
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <h2 className="font-semibold mb-4">Pending requests</h2>
          {loading ? (
            <p className="text-sm text-ink-dim">Loading…</p>
          ) : pending.length === 0 ? (
            <Empty label="No pending requests." />
          ) : (
            <ul className="space-y-2">
              {pending.map((p) => (
                <li key={p.id} className="flex items-center justify-between rounded-lg bg-bg-alt px-3 py-2.5">
                  <span className="text-sm">{p.from}</span>
                  <div className="flex gap-2">
                    <button onClick={() => respond(p.id, 'accept')} className="text-xs text-teal hover:underline">
                      accept
                    </button>
                    <button onClick={() => respond(p.id, 'decline')} className="text-xs text-rose hover:underline">
                      decline
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <h2 className="font-semibold mb-4">Your friends</h2>
          {loading ? (
            <p className="text-sm text-ink-dim">Loading…</p>
          ) : friends.length === 0 ? (
            <Empty label="No friends yet — send a request above." />
          ) : (
            <ul className="space-y-2">
              {friends.map((f) => (
                <li key={f.username} className="flex items-center justify-between rounded-lg bg-bg-alt px-3 py-2.5">
                  <span className="flex items-center gap-2 text-sm">
                    <span className="w-6 h-6 rounded-full bg-surface-hi flex items-center justify-center text-xs">
                      {f.username.slice(0, 1).toUpperCase()}
                    </span>
                    {f.username}
                  </span>
                  <button onClick={() => removeFriend(f.username)} className="text-xs text-ink-dim hover:text-rose">
                    remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
