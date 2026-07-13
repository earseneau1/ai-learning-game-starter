import { eq } from 'drizzle-orm';
import { createDatabase } from '../database/client';
import { loadGame } from '../database/load-game';
import { playSessions } from '../database/schema';
import designerContent from '../netlify/functions/designer-content';
import gameChat from '../netlify/functions/game-chat';
import playSession from '../netlify/functions/play-session';
import resetDemo from '../netlify/functions/reset-demo';
import sessionRole from '../netlify/functions/session-role';
import { createInitialState } from '../src/game-engine/logic';
import { startupSprint } from '../src/game-content/game.config';

const assertStatus = (response: Response, expected: number, label: string) => {
  if (response.status !== expected) throw new Error(`${label}: expected ${expected}, received ${response.status}`);
};
const body = (value: unknown) => JSON.stringify(value);
const cookieFrom = (response: Response) => response.headers.get('set-cookie')?.split(';')[0] ?? '';

async function roleCookie(role: 'player' | 'designer') {
  const response = await sessionRole(new Request('http://local/.netlify/functions/session-role', { method: 'POST', body: body({ role }) }));
  assertStatus(response, 200, `${role} session`);
  const cookie = cookieFrom(response);
  if (!cookie) throw new Error(`${role} session did not return a cookie.`);
  return cookie;
}

const playerCookie = await roleCookie('player');
const forbidden = await designerContent(new Request('http://local/.netlify/functions/designer-content', { method: 'PUT', headers: { cookie: playerCookie }, body: body({ resource: 'characters', payload: { id: 'jordan', name: 'Unauthorized change', description: 'Should not persist.' } }) }));
assertStatus(forbidden, 403, 'Player designer mutation');

const state = createInitialState(startupSprint);
state.currentSceneId = 'customer-discovery';
const saved = await playSession(new Request('http://local/.netlify/functions/play-session', { method: 'PUT', headers: { cookie: playerCookie }, body: body(state) }));
assertStatus(saved, 200, 'Player session save');

delete process.env.OPENAI_API_KEY;
delete process.env.OPENAI_MODEL;
const offline = await gameChat(new Request('http://local/.netlify/functions/game-chat', { method: 'POST', headers: { cookie: playerCookie }, body: body({ sessionId: state.sessionId, gameId: startupSprint.id, characterId: 'rivera', sceneId: 'customer-discovery', variables: state.variables, inventory: [], history: [], message: 'How should I improve this interview?' }) }));
assertStatus(offline, 200, 'Missing-key AI fallback');

const { db, client } = createDatabase();
await db.update(playSessions).set({ aiInteractionCount: 4 }).where(eq(playSessions.id, state.sessionId));
await client.end();
process.env.OPENAI_API_KEY = 'integration-test-placeholder';
process.env.OPENAI_MODEL = 'integration-test-model';
const limited = await gameChat(new Request('http://local/.netlify/functions/game-chat', { method: 'POST', headers: { cookie: playerCookie }, body: body({ sessionId: state.sessionId, gameId: startupSprint.id, characterId: 'rivera', sceneId: 'customer-discovery', variables: state.variables, inventory: [], history: [], message: 'Help me improve this interview.' }) }));
assertStatus(limited, 429, 'Server AI interaction limit');

const designerCookie = await roleCookie('designer');
const resourceBody = { resource: 'characters', payload: { id: 'integration-test-character', title: 'Test Character', description: 'Temporary CRUD integration character.', sortOrder: 999 } };
const created = await designerContent(new Request('http://local/.netlify/functions/designer-content', { method: 'POST', headers: { cookie: designerCookie }, body: body(resourceBody) }));
assertStatus(created, 201, 'Designer create');
const updated = await designerContent(new Request('http://local/.netlify/functions/designer-content', { method: 'PUT', headers: { cookie: designerCookie }, body: body({ resource: 'characters', payload: { ...resourceBody.payload, name: 'Updated Test Character', description: 'Updated through the Function.' } }) }));
assertStatus(updated, 200, 'Designer update');
const deleted = await designerContent(new Request('http://local/.netlify/functions/designer-content', { method: 'DELETE', headers: { cookie: designerCookie }, body: body({ resource: 'characters', payload: { id: 'integration-test-character' } }) }));
assertStatus(deleted, 200, 'Designer delete');

const reset = await resetDemo(new Request('http://local/.netlify/functions/reset-demo', { method: 'POST', headers: { cookie: designerCookie }, body: body({ gameId: 'startup-sprint', confirmation: 'RESET STARTUP SPRINT' }) }));
assertStatus(reset, 200, 'Designer reset');

const publicGame = await loadGame('startup-sprint');
if (!publicGame || publicGame.characters.some((character) => character.aiInstructions)) throw new Error('Public game content exposed server-only AI instructions.');

console.log('Function integration passed: roles, Player denial, persistence, AI fallback/limit, prompt privacy, Designer CRUD, and reset.');
