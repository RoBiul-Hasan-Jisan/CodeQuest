import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/api-helpers';
import { areFriends } from '@/lib/friends';

export async function GET(req: NextRequest) {
  const { user, error } = await requireUser(req);
  if (error) return error;
  const target = req.nextUrl.searchParams.get('username');
  const result = target ? await areFriends(user!.username, target) : false;
  return NextResponse.json({ areFriends: result });
}
