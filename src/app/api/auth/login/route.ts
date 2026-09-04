import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { verifyPassword, signToken, setAuthCookie } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const usernameOrEmail = (body.username || '').trim();
  const password = body.password || '';

  if (!usernameOrEmail || !password) {
    return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
  }

  const user = await db
    .select()
    .from(users)
    .where(eq(users.username, usernameOrEmail))
    .get();

  const found = user || (await db.select().from(users).where(eq(users.email, usernameOrEmail.toLowerCase())).get());

  if (!found || !(await verifyPassword(password, found.passwordHash))) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  await db.update(users).set({ lastLogin: new Date().toISOString() }).where(eq(users.id, found.id));

  const token = await signToken({ sub: found.id, username: found.username });
  await setAuthCookie(token);

  return NextResponse.json({ id: found.id, username: found.username, email: found.email });
}
