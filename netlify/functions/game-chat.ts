import type { Config } from '@netlify/functions';
import { createHash } from 'node:crypto';
import { and, desc, eq, gte, sql } from 'drizzle-orm';
import OpenAI from 'openai';
import { createDatabase } from '../../database/client';
import { aiInteractions, playerInventory, playerVariableState, playSessions } from '../../database/schema';
import { startupSprint } from '../../src/game-content/game.config';
import { characterPromptById } from '../../src/game-content/character-prompts';
import { requireRole } from './_shared/auth';
import { fail, ok, safeError } from './_shared/http';
import { chatSchema } from './_shared/validation';

const fallback = 'Professor Rivera is offline, so use this coaching prompt: What assumption does your preferred choice test, and what behavior would make you change your mind?';

export default async (request: Request) => {
  if (request.method !== 'POST') return fail(405, 'Method not allowed.');
  try {
    if (!await requireRole(request, ['player', 'designer'])) return fail(403, 'Select a Player role before using the AI mentor.');
    const parsed = chatSchema.safeParse(await request.json());
    if (!parsed.success) return fail(400, 'Keep the message concise and use only the current game context.');
    const input = parsed.data;
    const character = startupSprint.characters.find((item) => item.id === input.characterId && item.aiEnabled);
    const scene = startupSprint.scenes.find((item) => item.id === input.sceneId);
    if (input.gameId !== startupSprint.id || !character || !scene || scene.aiCharacterId !== character.id) return fail(400, 'This AI character is not available in the current scene.');
    const configuredMax = Math.min(character.maxAiInteractions, Number(process.env.MAX_AI_INTERACTIONS_PER_SESSION ?? 4));
    const apiKey = process.env.OPENAI_API_KEY; const model = process.env.OPENAI_MODEL;
    const { db, client } = createDatabase();
    try {
      const [session] = await db.select({ count: playSessions.aiInteractionCount, currentSceneId: playSessions.currentSceneId }).from(playSessions).where(and(eq(playSessions.id, input.sessionId), eq(playSessions.gameId, input.gameId))).limit(1);
      if (!session) return fail(404, 'The play session could not be found. Restart the game and try again.');
      if (session.currentSceneId !== input.sceneId) return fail(409, 'The game has moved to another scene. Refresh before asking the mentor.');
      if (session.count >= configuredMax) return fail(429, 'The AI conversation limit has been reached. Continue with the prewritten game dialogue.');
      if (!apiKey || !model) return ok({ reply: fallback, remaining: Math.max(0, configuredMax - session.count), generated: false });
      const [recent] = await db.select({ id: aiInteractions.id }).from(aiInteractions).where(and(eq(aiInteractions.sessionId, input.sessionId), gte(aiInteractions.createdAt, new Date(Date.now() - 2500)))).orderBy(desc(aiInteractions.createdAt)).limit(1);
      if (recent) return fail(429, 'Please wait a moment before sending another message.');
      const requestHash = createHash('sha256').update(`${input.sessionId}:${input.sceneId}:${input.message}`).digest('hex');
      try { await db.insert(aiInteractions).values({ sessionId: input.sessionId, characterId: character.id, sceneId: scene.id, requestHash, status: 'pending' }); }
      catch { return fail(409, 'That message was already submitted.'); }
      await db.update(playSessions).set({ aiInteractionCount: sql`${playSessions.aiInteractionCount} + 1`, updatedAt: new Date() }).where(eq(playSessions.id, input.sessionId));

      const [authoritativeVariables, authoritativeInventory] = await Promise.all([
        db.select().from(playerVariableState).where(eq(playerVariableState.sessionId, input.sessionId)),
        db.select().from(playerInventory).where(eq(playerInventory.sessionId, input.sessionId)),
      ]);
      const variables = startupSprint.variables.map((item) => `${item.label}: ${authoritativeVariables.find((row) => row.variableId === item.id)?.value ?? item.startingValue}`).join(', ');
      const inventory = authoritativeInventory.map((row) => startupSprint.inventory.find((item) => item.id === row.itemId)?.name).filter(Boolean).join(', ') || 'none';
      const authoritativePrompt = characterPromptById[character.id];
      if (!authoritativePrompt) return fail(503, 'This AI character has not been configured on the server.');
      const system = `${authoritativePrompt}\n\nLearning objective: ${startupSprint.learningObjective}\nCurrent scene: ${scene.title}. ${scene.narrative}\nScene learning focus: ${scene.learningFocus}\nAuthoritative current variables: ${variables}\nEvidence held: ${inventory}\nEducational purpose: ${character.educationalPurpose}\nKnowledge boundaries: ${character.knowledgeBoundaries}\nAvoid: ${character.avoidTopics}`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), Number(process.env.AI_REQUEST_TIMEOUT_MS ?? 15000));
      try {
        const openai = new OpenAI({ apiKey });
        const completion = await openai.chat.completions.create({ model, max_tokens: Number(process.env.MAX_AI_OUTPUT_TOKENS ?? 500), messages: [{ role: 'system', content: system }, ...input.history.slice(-6), { role: 'user', content: input.message }] }, { signal: controller.signal });
        const reply = completion.choices[0]?.message.content?.trim() || fallback;
        await db.update(aiInteractions).set({ status: 'complete' }).where(and(eq(aiInteractions.sessionId, input.sessionId), eq(aiInteractions.requestHash, requestHash)));
        return ok({ reply, remaining: Math.max(0, configuredMax - session.count - 1), generated: Boolean(completion.choices[0]?.message.content) });
      } catch (error) {
        await db.update(aiInteractions).set({ status: 'failed' }).where(and(eq(aiInteractions.sessionId, input.sessionId), eq(aiInteractions.requestHash, requestHash)));
        if (error instanceof Error && error.name === 'AbortError') return fail(504, 'The AI mentor took too long to respond. Continue with the coaching prompt.');
        return fail(503, 'The AI mentor is temporarily unavailable. Continue with the prewritten game dialogue.');
      } finally { clearTimeout(timeout); }
    } finally { await client.end(); }
  } catch (error) { return safeError(error); }
};

export const config: Config = { path: '/.netlify/functions/game-chat' };
