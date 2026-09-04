import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { progress } from '@/db/schema';
import { and, eq } from 'drizzle-orm';
import { requireUser } from '@/lib/api-helpers';

export async function POST(req: NextRequest) {
  const { user, error } = await requireUser(req);
  if (error) return error;

  const body = await req.json().catch(() => ({}));
  const count = parseInt(body.count ?? 0, 10);
  const today = new Date().toISOString().slice(0, 10);

  const existing = await db
    .select()
    .from(progress)
    .where(and(eq(progress.userId, user!.sub), eq(progress.progressDate, today)))
    .get();

  if (existing) {
    await db.update(progress).set({ problemsSolved: count }).where(eq(progress.id, existing.id));
    const updated = await db.select().from(progress).where(eq(progress.id, existing.id)).get();
    return NextResponse.json(updated);
  } else {
    const id = crypto.randomUUID();
    await db.insert(progress).values({ id, userId: user!.sub, progressDate: today, problemsSolved: count });
    const created = await db.select().from(progress).where(eq(progress.id, id)).get();
    return NextResponse.json(created);
  }
}
