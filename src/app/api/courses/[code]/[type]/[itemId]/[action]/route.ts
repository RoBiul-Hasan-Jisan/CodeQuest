import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { courses, courseItems } from '@/db/schema';
import { and, eq } from 'drizzle-orm';
import { requireUser } from '@/lib/api-helpers';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ code: string; type: string; itemId: string; action: string }> }
) {
  const { user, error } = await requireUser(req);
  if (error) return error;
  const { code, itemId, action } = await params;
  const decoded = decodeURIComponent(code);

  if (action !== 'complete' && action !== 'uncomplete') {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }

  const course = await db.select().from(courses).where(and(eq(courses.userId, user!.sub), eq(courses.code, decoded))).get();
  if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 });

  const item = await db.select().from(courseItems).where(and(eq(courseItems.id, itemId), eq(courseItems.courseId, course.id))).get();
  if (!item) return NextResponse.json({ error: 'Item not found' }, { status: 404 });

  await db.update(courseItems).set({ completed: action === 'complete' }).where(eq(courseItems.id, itemId));
  return NextResponse.json({ ok: true });
}
