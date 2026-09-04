import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { progress } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requireUser } from '@/lib/api-helpers';

export async function GET(req: NextRequest) {
  const { user, error } = await requireUser(req);
  if (error) return error;

  const days = parseInt(req.nextUrl.searchParams.get('days') || '30', 10);
  const since = new Date();
  since.setDate(since.getDate() - days);
  const sinceStr = since.toISOString().slice(0, 10);

  const all = await db.select().from(progress).where(eq(progress.userId, user!.sub)).all();
  const filtered = all.filter((p) => p.progressDate >= sinceStr).sort((a, b) => (a.progressDate < b.progressDate ? -1 : 1));
  return NextResponse.json(filtered);
}
