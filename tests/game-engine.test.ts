import { describe, expect, it } from 'vitest';
import { startupSprint } from '../src/game-content/game.config';
import { applyChoice, createInitialState, selectEnding } from '../src/game-engine/logic';
import type { PlayState } from '../src/types/game';

const initial = () => createInitialState(startupSprint, '00000000-0000-4000-8000-000000000001');
const choose = (state: PlayState, choiceId: string) => {
  const scene = startupSprint.scenes.find((item) => item.id === state.currentSceneId);
  const choice = scene?.decision.choices.find((item) => item.id === choiceId);
  if (!choice) throw new Error(`Missing test choice ${choiceId}`);
  return applyChoice(startupSprint, state, choice);
};

describe('reusable game engine', () => {
  it('applies multiple variable and inventory effects without mutating prior state', () => {
    const before = initial();
    const afterScene1 = choose(before, 'interview-first');
    const afterScene2 = choose(afterScene1, 'past-behavior');
    expect(before.variables.cash).toBe(100);
    expect(afterScene2.variables.cash).toBe(95);
    expect(afterScene2.variables.evidence).toBe(37);
    expect(afterScene2.inventory).toContain('interview-notes');
  });

  it('supports a direct branch around the build scene', () => {
    let state = choose(initial(), 'research-alternatives');
    state = choose(state, 'frequency-scan');
    state = choose(state, 'stop-immediately');
    expect(state.currentSceneId).toBe('final-decision');
  });

  it.each([
    ['pivot-solution', 'productive-pivot'],
    ['disciplined-stop', 'disciplined-stop-ending'],
  ])('selects the priority ending for %s', (lastChoice, endingId) => {
    let state = choose(initial(), 'interview-first');
    state = choose(state, 'past-behavior');
    state = choose(state, 'narrow-segment');
    state = choose(state, 'concierge-test');
    state = choose(state, lastChoice);
    expect(state.completed).toBe(true);
    expect(selectEnding(startupSprint, state).id).toBe(endingId);
  });

  it('finds the evidence-based ending after a focused, behavior-rich path', () => {
    let state = choose(initial(), 'interview-first');
    state = choose(state, 'past-behavior');
    state = choose(state, 'targeted-interviews');
    state = choose(state, 'concierge-test');
    state = choose(state, 'proceed-focused');
    expect(state.variables.evidence).toBeGreaterThanOrEqual(55);
    expect(selectEnding(startupSprint, state).id).toBe('evidence-next-step');
  });

  it('finds premature-build and popular-unproven endings from final snapshots', () => {
    const base = { ...initial(), completed: true };
    const premature = { ...base, variables: { cash: 10, time: 5, evidence: 25, confidence: 70 } };
    const popular = { ...base, variables: { cash: 60, time: 50, evidence: 35, confidence: 90 } };
    expect(selectEnding(startupSprint, premature).id).toBe('premature-build');
    expect(selectEnding(startupSprint, popular).id).toBe('popular-unproven');
  });

  it('rejects a choice from another scene', () => {
    const unrelated = startupSprint.scenes[1]!.decision.choices[0]!;
    expect(() => applyChoice(startupSprint, initial(), unrelated)).toThrow('not available');
  });
});
