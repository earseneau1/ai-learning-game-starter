import { z } from 'zod';

export const roleSchema = z.object({ role: z.enum(['player', 'designer']) }).strict();
export const playStateSchema = z.object({
  sessionId: z.string().uuid(), gameId: z.string().min(1).max(100), currentSceneId: z.string().min(1).max(100),
  variables: z.record(z.string(), z.number().int()), inventory: z.array(z.string().max(100)).max(50),
  decisions: z.array(z.object({ sceneId: z.string(), choiceId: z.string(), choiceLabel: z.string().max(200), consequence: z.string().max(2000) })).max(100),
  aiInteractions: z.number().int().min(0).max(100), completed: z.boolean(), endingId: z.string().optional(), updatedAt: z.string(),
}).strict();

export const chatSchema = z.object({
  sessionId: z.string().uuid(), gameId: z.string().min(1).max(100), characterId: z.string().min(1).max(100), sceneId: z.string().min(1).max(100),
  variables: z.record(z.string(), z.number().int()), inventory: z.array(z.string().max(100)).max(30),
  history: z.array(z.object({ role: z.enum(['user', 'assistant']), content: z.string().max(1500) })).max(8),
  message: z.string().trim().min(1).max(Number(process.env.MAX_AI_INPUT_CHARACTERS ?? 1500)),
}).strict();

export const designerSchema = z.object({
  resource: z.enum(['settings', 'characters', 'chapters', 'scenes', 'dialogue', 'decisions', 'choices', 'variables', 'inventory', 'endings']),
  payload: z.record(z.string(), z.unknown()),
}).strict();
