import type { Config } from '@netlify/functions';
import { loadGame } from '../../database/load-game';
import { fail, ok, safeError } from './_shared/http';

export default async (request: Request) => {
  if (request.method !== 'GET') return fail(405, 'Method not allowed.');
  const gameId = new URL(request.url).searchParams.get('gameId') ?? 'startup-sprint';
  if (gameId !== 'startup-sprint') return fail(404, 'That game could not be found.');
  try {
    const game = await loadGame(gameId);
    if (!game) return fail(404, 'Startup Sprint has not been seeded yet. Run the database seed command.');
    return ok(game);
  } catch (error) { return safeError(error); }
};

export const config: Config = { path: '/.netlify/functions/game-content' };
