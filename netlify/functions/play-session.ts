import type { Config } from '@netlify/functions';
import { eq, sql } from 'drizzle-orm';
import { createDatabase } from '../../database/client';
import { playerInventory, playerResponses, playerVariableState, playSessions } from '../../database/schema';
import { requireRole } from './_shared/auth';
import { fail, ok, safeError } from './_shared/http';
import { playStateSchema } from './_shared/validation';

export default async (request: Request) => {
  if (request.method !== 'PUT') return fail(405, 'Method not allowed.');
  try {
    if (!await requireRole(request, ['player', 'designer'])) return fail(403, 'Select a Player role before saving a game.');
    const parsed = playStateSchema.safeParse(await request.json());
    if (!parsed.success) return fail(400, 'The play session contains invalid data.');
    const state = parsed.data; const { db, client } = createDatabase();
    try {
      await db.transaction(async (tx) => {
        await tx.insert(playSessions).values({ id: state.sessionId, gameId: state.gameId, currentSceneId: state.currentSceneId, status: state.completed ? 'completed' : 'active', endingId: state.endingId, aiInteractionCount: state.aiInteractions, updatedAt: new Date(state.updatedAt), completedAt: state.completed ? new Date() : null }).onConflictDoUpdate({ target: playSessions.id, set: { currentSceneId: state.currentSceneId, status: state.completed ? 'completed' : 'active', endingId: state.endingId, updatedAt: new Date(state.updatedAt), completedAt: state.completed ? new Date() : null } });
        await tx.delete(playerResponses).where(eq(playerResponses.sessionId, state.sessionId));
        if (state.decisions.length) await tx.insert(playerResponses).values(state.decisions.map((item) => ({ sessionId: state.sessionId, sceneId: item.sceneId, choiceId: item.choiceId })));
        await tx.delete(playerVariableState).where(eq(playerVariableState.sessionId, state.sessionId));
        await tx.insert(playerVariableState).values(Object.entries(state.variables).map(([variableId, value]) => ({ sessionId: state.sessionId, variableId, value })));
        await tx.delete(playerInventory).where(eq(playerInventory.sessionId, state.sessionId));
        if (state.inventory.length) await tx.insert(playerInventory).values(state.inventory.map((itemId) => ({ sessionId: state.sessionId, itemId })));
        await tx.execute(sql`select 1`);
      });
      return ok(state);
    } finally { await client.end(); }
  } catch (error) { return safeError(error); }
};

export const config: Config = { path: '/.netlify/functions/play-session' };
