import { startupSprint } from '../game-content/game.config';
import type { ChatMessage, GameDefinition, PlayState, Role } from '../types/game';

interface ApiEnvelope<T> { data: T; message?: string }

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/.netlify/functions/${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    credentials: 'include',
  });
  const payload = await response.json().catch(() => ({ message: 'The server returned an unreadable response.' })) as ApiEnvelope<T> & { message?: string };
  if (!response.ok) throw new Error(payload.message ?? 'The request could not be completed.');
  return payload.data;
}

export const api = {
  async selectRole(role: Role) { return request<{ role: Role }>('session-role', { method: 'POST', body: JSON.stringify({ role }) }); },
  async getGame(): Promise<GameDefinition> {
    try { return await request<GameDefinition>('game-content?gameId=startup-sprint'); }
    catch { return startupSprint; }
  },
  savePlayState(state: PlayState) { return request<PlayState>('play-session', { method: 'PUT', body: JSON.stringify(state) }); },
  async chat(input: { sessionId: string; gameId: string; characterId: string; sceneId: string; variables: Record<string, number>; inventory: string[]; history: ChatMessage[]; message: string }) {
    return request<{ reply: string; remaining: number; generated: boolean }>('game-chat', { method: 'POST', body: JSON.stringify(input) });
  },
  mutateContent(resource: string, method: 'POST' | 'PUT' | 'DELETE', payload: unknown) {
    return request<{ id: string }>('designer-content', { method, body: JSON.stringify({ resource, payload }) });
  },
  resetDemo() { return request<{ reset: boolean }>('reset-demo', { method: 'POST', body: JSON.stringify({ gameId: 'startup-sprint', confirmation: 'RESET STARTUP SPRINT' }) }); },
};
