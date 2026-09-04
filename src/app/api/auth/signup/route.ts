import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq, or } from 'drizzle-orm';
import { hashPassword, signToken, setAuthCookie } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const username = (body.username || '').trim();
  const email = (body.email || '').trim().toLowerCase();
  const password = body.password || '';

  if (!username || !email || !password) {
    return NextResponse.json({ error: 'Username, email and password are required' }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
  }

  const existing = await db
    .select()
    .from(users)
    .where(or(eq(users.username, username), eq(users.email, email)))
    .get();

  if (existing) {
    return NextResponse.json({ error: 'Username or email already taken' }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const id = crypto.randomUUID();
  await db.insert(users).values({ id, username, email, passwordHash });

  const token = await signToken({ sub: id, username });
  await setAuthCookie(token);

  return NextResponse.json({ id, username, email });
}
