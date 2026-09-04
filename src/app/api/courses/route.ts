import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { courses } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requireUser } from '@/lib/api-helpers';

export async function GET(req: NextRequest) {
  const { user, error } = await requireUser(req);
  if (error) return error;
  const all = await db.select().from(courses).where(eq(courses.userId, user!.sub)).all();
  return NextResponse.json(all);
}

export async function POST(req: NextRequest) {
  const { user, error } = await requireUser(req);
  if (error) return error;
  const body = await req.json().catch(() => ({}));
  if (!body.code || !body.name) {
    return NextResponse.json({ error: 'Code and name are required' }, { status: 400 });
  }
  const id = crypto.randomUUID();
  try {
    await db.insert(courses).values({
      id,
      userId: user!.sub,
      code: body.code,
      name: body.name,
      instructor: body.instructor || null,
      imagePath: body.imagePath || null,
    });
  } catch {
    return NextResponse.json({ error: 'Course code already exists' }, { status: 409 });
  }
  const created = await db.select().from(courses).where(eq(courses.id, id)).get();
  return NextResponse.json(created);
}
