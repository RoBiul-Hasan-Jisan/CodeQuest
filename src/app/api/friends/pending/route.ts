import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { friendships } from '@/db/schema';
import { requireUser } from '@/lib/api-helpers';

export async function GET(req: NextRequest) {
  const { user, error } = await requireUser(req);
  if (error) return error;

  const all = await db.select().from(friendships).all();
  const result = all
    .filter((fs) => fs.toUsername === user!.username && fs.status === 'PENDING')
    .map((fs) => ({ id: fs.id, from: fs.fromUsername }));

  return NextResponse.json(result);
}
