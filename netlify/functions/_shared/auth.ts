import { createHash, randomBytes } from 'node:crypto';
import { and, eq, gt } from 'drizzle-orm';
import type { Role } from '../../../src/types/game';
import { createDatabase } from '../../../database/client';
import { demoSessions } from '../../../database/schema';

const cookieName = 'learning_game_demo_session';
const hash = (token: string) => createHash('sha256').update(token).digest('hex');

export async function createRoleSession(role: Role) {
  const token = randomBytes(32).toString('base64url');
  const { db, client } = createDatabase();
  try { await db.insert(demoSessions).values({ tokenHash: hash(token), role, expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000) }); }
  finally { await client.end(); }
  return `${cookieName}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=28800${process.env.CONTEXT === 'production' ? '; Secure' : ''}`;
}

export async function requireRole(request: Request, allowed: Role[]) {
  const token = request.headers.get('cookie')?.split(';').map((item) => item.trim()).find((item) => item.startsWith(`${cookieName}=`))?.slice(cookieName.length + 1);
  if (!token) return null;
  const { db, client } = createDatabase();
  try {
    const [session] = await db.select({ role: demoSessions.role }).from(demoSessions).where(and(eq(demoSessions.tokenHash, hash(token)), gt(demoSessions.expiresAt, new Date()))).limit(1);
    return session && allowed.includes(session.role) ? session.role : null;
  } finally { await client.end(); }
}
