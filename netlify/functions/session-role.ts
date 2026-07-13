import type { Config } from '@netlify/functions';
import { createRoleSession } from './_shared/auth';
import { fail, ok, safeError } from './_shared/http';
import { roleSchema } from './_shared/validation';

export default async (request: Request) => {
  if (request.method !== 'POST') return fail(405, 'Method not allowed.');
  try {
    const parsed = roleSchema.safeParse(await request.json());
    if (!parsed.success) return fail(400, 'Choose either the Player or Game Designer role.');
    const cookie = await createRoleSession(parsed.data.role);
    return ok({ role: parsed.data.role }, 200, { 'Set-Cookie': cookie });
  } catch (error) { return safeError(error); }
};

export const config: Config = { path: '/.netlify/functions/session-role' };
