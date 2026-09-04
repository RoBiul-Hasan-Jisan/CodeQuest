import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { leetcodeProblems } from '@/db/schema';
import { and, eq } from 'drizzle-orm';
import { requireUser } from '@/lib/api-helpers';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireUser(req);
  if (error) return error;
  const { id } = await params;

  const existing = await db
    .select()
    .from(leetcodeProblems)
    .where(and(eq(leetcodeProblems.id, id), eq(leetcodeProblems.userId, user!.sub)))
    .get();
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const updates: Partial<typeof existing> = {};
  if (body.title !== undefined) updates.title = body.title;
  if (body.tags !== undefined) updates.tags = body.tags;
  if (body.difficulty !== undefined) updates.difficulty = body.difficulty;
  if (body.url !== undefined) updates.url = body.url;
  if (body.solved !== undefined) {
    updates.solved = body.solved;
    updates.solvedAt = body.solved ? existing.solvedAt || new Date().toISOString() : null;
  }

  await db.update(leetcodeProblems).set(updates).where(eq(leetcodeProblems.id, id));
  const updated = await db.select().from(leetcodeProblems).where(eq(leetcodeProblems.id, id)).get();
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireUser(req);
  if (error) return error;
  const { id } = await params;

  const existing = await db
    .select()
    .from(leetcodeProblems)
    .where(and(eq(leetcodeProblems.id, id), eq(leetcodeProblems.userId, user!.sub)))
    .get();
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await db.delete(leetcodeProblems).where(eq(leetcodeProblems.id, id));
  return NextResponse.json({ deleted: true });
}
