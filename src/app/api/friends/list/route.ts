import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { friendships } from '@/db/schema';
import { requireUser } from '@/lib/api-helpers';

export async function GET(req: NextRequest) {
  const { user, error } = await requireUser(req);
  if (error) return error;

  const all = await db.select().from(friendships).all();
  const result: { username: string }[] = [];
  for (const fs of all) {
    if (fs.status !== 'ACCEPTED') continue;
    let friend: string | null = null;
    if (fs.fromUsername === user!.username) friend = fs.toUsername;
    else if (fs.toUsername === user!.username) friend = fs.fromUsername;
    if (friend) result.push({ username: friend });
  }
  return NextResponse.json(result);
}
