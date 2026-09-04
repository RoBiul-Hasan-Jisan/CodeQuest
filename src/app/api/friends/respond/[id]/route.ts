import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { friendships } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requireUser } from '@/lib/api-helpers';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireUser(req);
  if (error) return error;
  const { id } = await params;

  const body = await req.json().catch(() => ({}));
  const action = body.action || '';

  const fs = await db.select().from(friendships).where(eq(friendships.id, id)).get();
  if (!fs || fs.toUsername !== user!.username) {
    return NextResponse.json({ error: 'Request not found' }, { status: 404 });
  }

  await db
    .update(friendships)
    .set({ status: action === 'accept' ? 'ACCEPTED' : 'DECLINED' })
    .where(eq(friendships.id, id));

  return NextResponse.json({ message: 'Done' });
}
