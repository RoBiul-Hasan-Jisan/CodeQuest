import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { projects } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requireUser } from '@/lib/api-helpers';

export async function GET(req: NextRequest) {
  const { user, error } = await requireUser(req);
  if (error) return error;
  const all = await db.select().from(projects).where(eq(projects.userId, user!.sub)).all();
  return NextResponse.json(all);
}

export async function POST(req: NextRequest) {
  const { user, error } = await requireUser(req);
  if (error) return error;
  const body = await req.json().catch(() => ({}));
  if (!body.title) return NextResponse.json({ error: 'Title is required' }, { status: 400 });

  const id = crypto.randomUUID();
  await db.insert(projects).values({
    id,
    userId: user!.sub,
    title: body.title,
    description: body.description || null,
    dueDate: body.dueDate || null,
    color: body.color || '#6366f1',
    progress: body.progress ?? 0,
  });
  const created = await db.select().from(projects).where(eq(projects.id, id)).get();
  return NextResponse.json(created);
}
