import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { projects } from '@/db/schema';
import { and, eq } from 'drizzle-orm';
import { requireUser } from '@/lib/api-helpers';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireUser(req);
  if (error) return error;
  const { id } = await params;

  const existing = await db.select().from(projects).where(and(eq(projects.id, id), eq(projects.userId, user!.sub))).get();
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const updates: Partial<typeof existing> = {};
  if (body.title !== undefined) updates.title = body.title;
  if (body.description !== undefined) updates.description = body.description;
  if (body.dueDate !== undefined) updates.dueDate = body.dueDate;
  if (body.color !== undefined) updates.color = body.color;
  if (body.progress !== undefined) updates.progress = Math.max(0, Math.min(100, body.progress));

  await db.update(projects).set(updates).where(eq(projects.id, id));
  const updated = await db.select().from(projects).where(eq(projects.id, id)).get();
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireUser(req);
  if (error) return error;
  const { id } = await params;

  const existing = await db.select().from(projects).where(and(eq(projects.id, id), eq(projects.userId, user!.sub))).get();
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await db.delete(projects).where(eq(projects.id, id));
  return NextResponse.json({ deleted: true });
}
