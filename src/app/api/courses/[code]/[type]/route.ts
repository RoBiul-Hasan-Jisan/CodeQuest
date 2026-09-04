import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { courses, courseItems } from '@/db/schema';
import { and, eq } from 'drizzle-orm';
import { requireUser } from '@/lib/api-helpers';

const VALID_TYPES = ['notes', 'resources', 'slides', 'tasks'];

export async function POST(req: NextRequest, { params }: { params: Promise<{ code: string; type: string }> }) {
  const { user, error } = await requireUser(req);
  if (error) return error;
  const { code, type } = await params;
  const decoded = decodeURIComponent(code);

  if (!VALID_TYPES.includes(type)) return NextResponse.json({ error: 'Invalid type' }, { status: 400 });

  const course = await db.select().from(courses).where(and(eq(courses.userId, user!.sub), eq(courses.code, decoded))).get();
  if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const id = crypto.randomUUID();
  const record: Record<string, unknown> = { id, courseId: course.id, type, completed: false };

  if (type === 'notes') record.text = body.text || '';
  else if (type === 'resources' || type === 'slides') {
    record.name = body.name || '';
    record.link = body.link || '';
  } else if (type === 'tasks') record.title = body.title || '';

  await db.insert(courseItems).values(record as never);
  const created = await db.select().from(courseItems).where(eq(courseItems.id, id)).get();
  return NextResponse.json(created);
}
