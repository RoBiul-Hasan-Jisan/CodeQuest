import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { tasks } from '@/db/schema';
import { and, eq } from 'drizzle-orm';
import { requireUser } from '@/lib/api-helpers';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireUser(req);
  if (error) return error;
  const { id } = await params;

  const existing = await db.select().from(tasks).where(and(eq(tasks.id, id), eq(tasks.userId, user!.sub))).get();
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const updates: Partial<typeof existing> = {};
  if (body.title !== undefined) updates.title = body.title;
  if (body.description !== undefined) updates.description = body.description;
  if (body.priority !== undefined) updates.priority = body.priority;
  if (body.dueDate !== undefined) updates.dueDate = body.dueDate;
  if (body.category !== undefined) updates.category = body.category;
  if (body.completed !== undefined) {
    updates.completed = body.completed;
    updates.completedAt = body.completed ? new Date().toISOString() : null;
  }

  await db.update(tasks).set(updates).where(eq(tasks.id, id));
  const updated = await db.select().from(tasks).where(eq(tasks.id, id)).get();
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireUser(req);
  if (error) return error;
  const { id } = await params;

  const existing = await db.select().from(tasks).where(and(eq(tasks.id, id), eq(tasks.userId, user!.sub))).get();
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await db.delete(tasks).where(eq(tasks.id, id));
  return NextResponse.json({ deleted: true });
}
