import { db } from '@/db';
import { friendships } from '@/db/schema';

export async function friendshipExists(a: string, b: string) {
  const all = await db.select().from(friendships).all();
  return all.some((fs) => {
    if (fs.status === 'DECLINED' || fs.status === 'BLOCKED') return false;
    return (fs.fromUsername === a && fs.toUsername === b) || (fs.fromUsername === b && fs.toUsername === a);
  });
}

export async function areFriends(a: string, b: string) {
  const all = await db.select().from(friendships).all();
  return all.some((fs) => {
    if (fs.status !== 'ACCEPTED') return false;
    return (fs.fromUsername === a && fs.toUsername === b) || (fs.fromUsername === b && fs.toUsername === a);
  });
}
