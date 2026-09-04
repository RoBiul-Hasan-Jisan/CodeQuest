import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { courses, courseItems } from '@/db/schema';
import { and, eq } from 'drizzle-orm';
import { requireUser } from '@/lib/api-helpers';

export async function GET(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { user, error } = await requireUser(req);
  if (error) return error;
  const { code } = await params;
  const decoded = decodeURIComponent(code);

  const course = await db.select().from(courses).where(and(eq(courses.userId, user!.sub), eq(courses.code, decoded))).get();
  if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 });

  const items = await db.select().from(courseItems).where(eq(courseItems.courseId, course.id)).all();
  return NextResponse.json({
    course,
    notes: items.filter((i) => i.type === 'notes'),
    resources: items.filter((i) => i.type === 'resources'),
    slides: items.filter((i) => i.type === 'slides'),
    tasks: items.filter((i) => i.type === 'tasks'),
  });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { user, error } = await requireUser(req);
  if (error) return error;
  const { code } = await params;
  const decoded = decodeURIComponent(code);

  const course = await db.select().from(courses).where(and(eq(courses.userId, user!.sub), eq(courses.code, decoded))).get();
  if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 });

  await db.delete(courseItems).where(eq(courseItems.courseId, course.id));
  await db.delete(courses).where(eq(courses.id, course.id));
  return NextResponse.json({ deleted: true });
}
