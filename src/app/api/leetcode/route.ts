import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { leetcodeProblems } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requireUser } from '@/lib/api-helpers';

export async function GET(req: NextRequest) {
  const { user, error } = await requireUser(req);
  if (error) return error;
  const all = await db.select().from(leetcodeProblems).where(eq(leetcodeProblems.userId, user!.sub)).all();
  return NextResponse.json(all.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)));
}

export async function POST(req: NextRequest) {
  const { user, error } = await requireUser(req);
  if (error) return error;
  const body = await req.json().catch(() => ({}));
  if (!body.title || !body.difficulty) {
    return NextResponse.json({ error: 'Title and difficulty are required' }, { status: 400 });
  }
  const id = crypto.randomUUID();
  const solved = !!body.solved;
  await db.insert(leetcodeProblems).values({
    id,
    userId: user!.sub,
    title: body.title,
    tags: body.tags || null,
    difficulty: body.difficulty,
    solved,
    url: body.url || null,
    solvedAt: solved ? new Date().toISOString() : null,
  });
  const created = await db.select().from(leetcodeProblems).where(eq(leetcodeProblems.id, id)).get();
  return NextResponse.json(created);
}
