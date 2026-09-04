import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { friendships } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requireUser } from '@/lib/api-helpers';

export async function POST(req: NextRequest) {
  const { user, error } = await requireUser(req);
  if (error) return error;
  const body = await req.json().catch(() => ({}));
  const target = (body.username || '').trim();

  const all = await db.select().from(friendships).all();
  for (const fs of all) {
    const match =
      (fs.fromUsername === user!.username && fs.toUsername === target) ||
      (fs.fromUsername === target && fs.toUsername === user!.username);
    if (match) await db.delete(friendships).where(eq(friendships.id, fs.id));
  }

  await db.insert(friendships).values({
    id: crypto.randomUUID(),
    fromUsername: user!.username,
    toUsername: target,
    status: 'BLOCKED',
  });

  return NextResponse.json({ message: 'Blocked' });
}
