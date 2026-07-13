import type { Config } from '@netlify/functions';
import { z } from 'zod';
import { seedStartupSprint } from '../../database/seed-lib';
import { requireRole } from './_shared/auth';
import { fail, ok, safeError } from './_shared/http';

const schema = z.object({ gameId: z.literal('startup-sprint'), confirmation: z.literal('RESET STARTUP SPRINT') }).strict();
export default async (request: Request) => {
  if (request.method !== 'POST') return fail(405, 'Method not allowed.');
  try {
    if (!await requireRole(request, ['designer'])) return fail(403, 'Only the simulated Game Designer can reset demonstration data.');
    if (!schema.safeParse(await request.json()).success) return fail(400, 'Reset confirmation did not match.');
    await seedStartupSprint();
    return ok({ reset: true });
  } catch (error) { return safeError(error); }
};
export const config: Config = { path: '/.netlify/functions/reset-demo' };
