import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { messages } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requireUser } from '@/lib/api-helpers';
import { areFriends } from '@/lib/friends';

export async function GET(req: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  const { user, error } = await requireUser(req);
  if (error) return error;
  const { username: partner } = await params;

  const all = await db.select().from(messages).all();
  const thread = all
    .filter(
      (m) =>
        (m.senderUsername === user!.username && m.receiverUsername === partner) ||
        (m.senderUsername === partner && m.receiverUsername === user!.username)
    )
    .sort((a, b) => (a.sentAt < b.sentAt ? -1 : 1));

  // Mark incoming messages as read
  for (const m of thread) {
    if (m.receiverUsername === user!.username && !m.readAt) {
      await db.update(messages).set({ readAt: new Date().toISOString() }).where(eq(messages.id, m.id));
    }
  }

  return NextResponse.json(thread);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  const { user, error } = await requireUser(req);
  if (error) return error;
  const { username: partner } = await params;

  if (!(await areFriends(user!.username, partner))) {
    return NextResponse.json({ error: 'You can only message friends' }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const content = (body.content || '').trim();
  if (!content) return NextResponse.json({ error: 'Message content is required' }, { status: 400 });

  const id = crypto.randomUUID();
  await db.insert(messages).values({
    id,
    senderUsername: user!.username,
    receiverUsername: partner,
    content,
  });
  const created = await db.select().from(messages).where(eq(messages.id, id)).get();
  return NextResponse.json(created);
}
