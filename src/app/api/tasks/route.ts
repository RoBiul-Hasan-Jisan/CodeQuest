import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { tasks } from '@/db/schema';
import { and, eq } from 'drizzle-orm';
import { requireUser } from '@/lib/api-helpers';

export async function GET(req: NextRequest) {
  const { user, error } = await requireUser(req);
  if (error) return error;

  const filter = req.nextUrl.searchParams.get('filter') || 'all';
  const all = await db.select().from(tasks).where(eq(tasks.userId, user!.sub)).all();

  const today = new Date().toISOString().slice(0, 10);
  let result = all;
  if (filter === 'today') result = all.filter((t) => t.dueDate === today && !t.completed);
  else if (filter === 'active') result = all.filter((t) => !t.completed);
  else if (filter === 'completed') result = all.filter((t) => t.completed);

  result = [...result].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const { user, error } = await requireUser(req);
  if (error) return error;

  const body = await req.json().catch(() => ({}));
  if (!body.title) return NextResponse.json({ error: 'Title is required' }, { status: 400 });

  const id = crypto.randomUUID();
  const record = {
    id,
    userId: user!.sub,
    title: body.title,
    description: body.description || null,
    priority: body.priority || 'MEDIUM',
    dueDate: body.dueDate || null,
    category: body.category || null,
    completed: false,
  };
  await db.insert(tasks).values(record);
  const created = await db.select().from(tasks).where(eq(tasks.id, id)).get();
  return NextResponse.json(created);
}
