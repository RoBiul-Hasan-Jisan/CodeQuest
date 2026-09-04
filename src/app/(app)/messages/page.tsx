'use client';

import { useEffect, useRef, useState } from 'react';
import { apiFetch } from '@/lib/api-client';
import { Card, SectionTitle, Input, Button, Empty } from '@/components/ui';

type Conversation = { partner: string; lastMessage: string; sentAt: string; unread: boolean };
type Message = { id: string; senderUsername: string; receiverUsername: string; content: string; sentAt: string };
type Friend = { username: string };

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [thread, setThread] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  async function loadConversations() {
    const [c, f] = await Promise.all([
      apiFetch<Conversation[]>('/api/messages/conversations'),
      apiFetch<Friend[]>('/api/friends/list'),
    ]);
    setConversations(c);
    setFriends(f);
  }

  useEffect(() => {
    loadConversations();
    const poll = setInterval(loadConversations, 8000);
    return () => clearInterval(poll);
  }, []);

  useEffect(() => {
    if (!active) return;
    let stop = false;
    async function poll() {
      const data = await apiFetch<Message[]>(`/api/messages/${active}`);
      if (!stop) setThread(data);
    }
    poll();
    const interval = setInterval(poll, 4000);
    return () => {
      stop = true;
      clearInterval(interval);
    };
  }, [active]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [thread]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!active || !draft.trim()) return;
    const content = draft;
    setDraft('');
    await apiFetch(`/api/messages/${active}`, { method: 'POST', body: JSON.stringify({ content }) });
    const data = await apiFetch<Message[]>(`/api/messages/${active}`);
    setThread(data);
    loadConversations();
  }

  const knownPartners = new Set(conversations.map((c) => c.partner));
  const friendsWithoutThread = friends.filter((f) => !knownPartners.has(f.username));

  return (
    <div className="rise">
      <SectionTitle eyebrow="msg" title="Messages" />

      <div className="grid md:grid-cols-[280px_1fr] gap-6 h-[calc(100vh-220px)] min-h-[420px]">
        <Card className="overflow-y-auto p-3">
          {conversations.length === 0 && friendsWithoutThread.length === 0 ? (
            <Empty label="Add a friend to start messaging." />
          ) : (
            <ul className="space-y-1">
              {conversations.map((c) => (
                <li key={c.partner}>
                  <button
                    onClick={() => setActive(c.partner)}
                    className={`w-full text-left rounded-lg px-3 py-2.5 transition-colors ${
                      active === c.partner ? 'bg-surface-hi' : 'hover:bg-bg-alt'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{c.partner}</span>
                      {c.unread && <span className="w-2 h-2 rounded-full bg-teal" />}
                    </div>
                    <p className="text-xs text-ink-dim truncate mt-0.5">{c.lastMessage}</p>
                  </button>
                </li>
              ))}
              {friendsWithoutThread.map((f) => (
                <li key={f.username}>
                  <button
                    onClick={() => setActive(f.username)}
                    className={`w-full text-left rounded-lg px-3 py-2.5 transition-colors ${
                      active === f.username ? 'bg-surface-hi' : 'hover:bg-bg-alt'
                    }`}
                  >
                    <span className="text-sm font-medium">{f.username}</span>
                    <p className="text-xs text-ink-dim mt-0.5">Say hi 👋</p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="flex flex-col p-0 overflow-hidden">
          {!active ? (
            <div className="flex-1 flex items-center justify-center text-sm text-ink-dim">
              Select a conversation to start chatting.
            </div>
          ) : (
            <>
              <div className="px-4 py-3 border-b border-border font-medium text-sm">{active}</div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {thread.map((m) => {
                  const mine = m.senderUsername !== active;
                  return (
                    <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[70%] rounded-xl px-3.5 py-2 text-sm ${
                          mine ? 'bg-violet text-white' : 'bg-bg-alt text-ink'
                        }`}
                      >
                        {m.content}
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>
              <form onSubmit={send} className="flex gap-2 p-3 border-t border-border">
                <Input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Type a message…" />
                <Button type="submit">Send</Button>
              </form>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
