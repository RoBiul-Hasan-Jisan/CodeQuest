import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { friendships, users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requireUser } from '@/lib/api-helpers';
import { friendshipExists } from '@/lib/friends';

export async function POST(req: NextRequest) {
  const { user, error } = await requireUser(req);
  if (error) return error;

  const body = await req.json().catch(() => ({}));
  const target = (body.username || '').trim();

  if (!target || target === user!.username) {
    return NextResponse.json({ error: 'Invalid target' }, { status: 400 });
  }
  const targetUser = await db.select().from(users).where(eq(users.username, target)).get();
  if (!targetUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  if (await friendshipExists(user!.username, target)) {
    return NextResponse.json({ error: 'Already friends or request pending' }, { status: 400 });
  }

  await db.insert(friendships).values({
    id: crypto.randomUUID(),
    fromUsername: user!.username,
    toUsername: target,
    status: 'PENDING',
  });

  return NextResponse.json({ message: `Friend request sent to ${target}` });
}
