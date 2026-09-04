import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { progress } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requireUser } from '@/lib/api-helpers';

export async function GET(req: NextRequest) {
  const { user, error } = await requireUser(req);
  if (error) return error;

  const all = await db.select().from(progress).where(eq(progress.userId, user!.sub)).all();
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekAgoStr = weekAgo.toISOString().slice(0, 10);

  let total = 0;
  let week = 0;
  for (const p of all) {
    total += p.problemsSolved;
    if (p.progressDate >= weekAgoStr) week += p.problemsSolved;
  }

  return NextResponse.json({ totalSolved: total, weekSolved: week });
}
