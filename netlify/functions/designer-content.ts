import type { Config } from '@netlify/functions';
import { eq } from 'drizzle-orm';
import { createDatabase } from '../../database/client';
import { chapters, characters, choices, decisions, dialogueLines, endings, gameVariables, games, inventoryItems, scenes } from '../../database/schema';
import { requireRole } from './_shared/auth';
import { fail, ok, safeError } from './_shared/http';
import { designerSchema } from './_shared/validation';

const stringValue = (value: unknown, fallback = '') => typeof value === 'string' ? value.trim() : fallback;
const numberValue = (value: unknown, fallback: number) => typeof value === 'number' && Number.isFinite(value) ? Math.round(value) : fallback;
const booleanValue = (value: unknown, fallback = false) => typeof value === 'boolean' ? value : fallback;

export default async (request: Request) => {
  if (!['POST', 'PUT', 'DELETE'].includes(request.method)) return fail(405, 'Method not allowed.');
  try {
    if (!await requireRole(request, ['designer'])) return fail(403, 'Only the simulated Game Designer can change game content.');
    const parsed = designerSchema.safeParse(await request.json());
    if (!parsed.success) return fail(400, 'The content form contains invalid data.');
    const { resource, payload } = parsed.data; const id = stringValue(payload.id);
    if (!id || id.length > 120) return fail(400, 'A valid content ID is required.');
    const { db, client } = createDatabase();
    try {
      if (request.method === 'DELETE') {
        switch (resource) {
          case 'characters': await db.delete(characters).where(eq(characters.id, id)); break;
          case 'chapters': await db.delete(chapters).where(eq(chapters.id, id)); break;
          case 'scenes': await db.delete(scenes).where(eq(scenes.id, id)); break;
          case 'dialogue': await db.delete(dialogueLines).where(eq(dialogueLines.id, id)); break;
          case 'decisions': await db.delete(decisions).where(eq(decisions.id, id)); break;
          case 'choices': await db.delete(choices).where(eq(choices.id, id)); break;
          case 'variables': await db.delete(gameVariables).where(eq(gameVariables.id, id)); break;
          case 'inventory': await db.delete(inventoryItems).where(eq(inventoryItems.id, id)); break;
          case 'endings': await db.delete(endings).where(eq(endings.id, id)); break;
          default: return fail(400, 'Game settings cannot be deleted.');
        }
        return ok({ id });
      }

      const title = stringValue(payload.title, stringValue(payload.name, stringValue(payload.label, 'Untitled')));
      const detail = stringValue(payload.description, stringValue(payload.text, stringValue(payload.narrative, 'Add a description.')));
      const sortOrder = numberValue(payload.sortOrder, 999);
      if (request.method === 'PUT') {
        switch (resource) {
          case 'settings': await db.update(games).set({ title, subtitle: stringValue(payload.subtitle), description: detail, learningObjective: stringValue(payload.learningObjective, detail), targetLearner: stringValue(payload.targetLearner, 'High school learners'), setting: stringValue(payload.setting, 'A learning game'), playerRole: stringValue(payload.playerRole, 'The player'), openingStory: stringValue(payload.openingStory, detail), instructions: stringValue(payload.instructions, 'Make choices and reflect.'), estimatedPlayTime: stringValue(payload.estimatedPlayTime, '5–8 minutes'), updatedAt: new Date() }).where(eq(games.id, id)); break;
          case 'characters': await db.update(characters).set({ name: stringValue(payload.name, title), role: stringValue(payload.role, 'Character'), description: detail, personality: stringValue(payload.personality, detail), goals: stringValue(payload.goals, detail), relationship: stringValue(payload.relationship, 'Game character'), openingDialogue: stringValue(payload.openingDialogue, detail), educationalPurpose: stringValue(payload.educationalPurpose, detail), knowledgeBoundaries: stringValue(payload.knowledgeBoundaries, 'Game context only'), avoidTopics: stringValue(payload.avoidTopics, 'Personal information'), aiEnabled: booleanValue(payload.aiEnabled), maxAiInteractions: numberValue(payload.maxAiInteractions, 0), sortOrder, updatedAt: new Date() }).where(eq(characters.id, id)); break;
          case 'chapters': await db.update(chapters).set({ title, summary: detail, learningFocus: stringValue(payload.learningFocus, detail), completionRequirements: stringValue(payload.completionRequirements, 'Complete the chapter scenes'), sortOrder, updatedAt: new Date() }).where(eq(chapters.id, id)); break;
          case 'scenes': await db.update(scenes).set({ title, location: stringValue(payload.location, 'Story location'), narrative: detail, objective: stringValue(payload.objective, detail), learningFocus: stringValue(payload.learningFocus, detail), sortOrder, updatedAt: new Date() }).where(eq(scenes.id, id)); break;
          case 'dialogue': await db.update(dialogueLines).set({ text: detail, sortOrder, updatedAt: new Date() }).where(eq(dialogueLines.id, id)); break;
          case 'decisions': await db.update(decisions).set({ prompt: stringValue(payload.prompt, title), context: detail, updatedAt: new Date() }).where(eq(decisions.id, id)); break;
          case 'choices': await db.update(choices).set({ label: stringValue(payload.label, title), description: detail, consequence: stringValue(payload.consequence, detail), feedback: stringValue(payload.feedback, detail), sortOrder, updatedAt: new Date() }).where(eq(choices.id, id)); break;
          case 'variables': await db.update(gameVariables).set({ label: stringValue(payload.label, title), explanation: detail, startingValue: numberValue(payload.startingValue, 50), min: numberValue(payload.min, 0), max: numberValue(payload.max, 100), sortOrder, updatedAt: new Date() }).where(eq(gameVariables.id, id)); break;
          case 'inventory': await db.update(inventoryItems).set({ name: stringValue(payload.name, title), description: detail, type: stringValue(payload.type, 'evidence'), sortOrder, updatedAt: new Date() }).where(eq(inventoryItems.id, id)); break;
          case 'endings': await db.update(endings).set({ title, narrative: detail, explanation: stringValue(payload.explanation, detail), learningDebrief: stringValue(payload.learningDebrief, detail), reflectionQuestion: stringValue(payload.reflectionQuestion, 'What would you do differently?'), replaySuggestion: stringValue(payload.replaySuggestion, 'Try another path.'), priority: numberValue(payload.priority, 1), tone: stringValue(payload.tone, 'mixed'), sortOrder, updatedAt: new Date() }).where(eq(endings.id, id)); break;
        }
        return ok({ id });
      }

      switch (resource) {
        case 'characters': await db.insert(characters).values({ id, gameId: 'startup-sprint', name: title, role: stringValue(payload.role, 'Supporting character'), description: detail, personality: detail, goals: detail, relationship: 'Game character', initials: title.slice(0, 2).toUpperCase(), color: '#8cb8aa', openingDialogue: detail, educationalPurpose: detail, knowledgeBoundaries: 'Game context only', avoidTopics: 'Personal information', sortOrder }); break;
        case 'chapters': await db.insert(chapters).values({ id, gameId: 'startup-sprint', title, summary: detail, learningFocus: detail, completionRequirements: 'Complete the chapter scenes', sortOrder }); break;
        case 'scenes': await db.insert(scenes).values({ id, gameId: 'startup-sprint', chapterId: stringValue(payload.chapterId, 'discover'), title, location: stringValue(payload.location, 'Story location'), narrative: detail, objective: detail, learningFocus: detail, sortOrder }); break;
        case 'dialogue': await db.insert(dialogueLines).values({ id, sceneId: stringValue(payload.sceneId, 'big-idea'), characterId: stringValue(payload.characterId, 'jordan'), text: detail, sortOrder }); break;
        case 'decisions': await db.insert(decisions).values({ id, sceneId: stringValue(payload.sceneId), prompt: title, context: detail }); break;
        case 'choices': await db.insert(choices).values({ id, decisionId: stringValue(payload.decisionId, 'first-move'), label: title, description: detail, consequence: stringValue(payload.consequence, detail), feedback: stringValue(payload.feedback, detail), sortOrder }); break;
        case 'variables': await db.insert(gameVariables).values({ id, gameId: 'startup-sprint', name: stringValue(payload.name, id), label: title, startingValue: numberValue(payload.startingValue, 50), min: numberValue(payload.min, 0), max: numberValue(payload.max, 100), icon: stringValue(payload.icon, '◇'), explanation: detail, sortOrder }); break;
        case 'inventory': await db.insert(inventoryItems).values({ id, gameId: 'startup-sprint', name: title, description: detail, type: stringValue(payload.type, 'evidence'), icon: stringValue(payload.icon, '▤'), sortOrder }); break;
        case 'endings': await db.insert(endings).values({ id, gameId: 'startup-sprint', title, narrative: detail, explanation: detail, learningDebrief: detail, principles: [], reflectionQuestion: 'What would you do differently?', replaySuggestion: 'Try another path.', priority: numberValue(payload.priority, 1), tone: stringValue(payload.tone, 'mixed'), sortOrder }); break;
        default: return fail(400, 'Use edit for game settings.');
      }
      return ok({ id }, 201);
    } finally { await client.end(); }
  } catch (error) { return safeError(error); }
};

export const config: Config = { path: '/.netlify/functions/designer-content' };
