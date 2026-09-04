import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { messages } from '@/db/schema';
import { requireUser } from '@/lib/api-helpers';

export async function GET(req: NextRequest) {
  const { user, error } = await requireUser(req);
  if (error) return error;

  const all = await db.select().from(messages).all();
  const mine = all.filter((m) => m.senderUsername === user!.username || m.receiverUsername === user!.username);

  const byPartner = new Map<string, (typeof mine)[number]>();
  for (const m of mine) {
    const partner = m.senderUsername === user!.username ? m.receiverUsername : m.senderUsername;
    const existing = byPartner.get(partner);
    if (!existing || existing.sentAt < m.sentAt) byPartner.set(partner, m);
  }

  const result = Array.from(byPartner.entries())
    .map(([partner, m]) => ({
      partner,
      lastMessage: m.content,
      sentAt: m.sentAt,
      unread: m.receiverUsername === user!.username && !m.readAt,
    }))
    .sort((a, b) => (a.sentAt < b.sentAt ? 1 : -1));

  return NextResponse.json(result);
}
