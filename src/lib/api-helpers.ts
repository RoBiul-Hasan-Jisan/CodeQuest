import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from './auth';

export async function requireUser(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return { user: null, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  return { user, error: null };
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}
