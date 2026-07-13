import type { Choice, Ending, GameDefinition, PlayState } from '../types/game';

export const createInitialState = (game: GameDefinition, sessionId = crypto.randomUUID()): PlayState => ({
  sessionId,
  gameId: game.id,
  currentSceneId: [...game.scenes].sort((a, b) => a.sortOrder - b.sortOrder)[0]?.id ?? '',
  variables: Object.fromEntries(game.variables.map((variable) => [variable.id, variable.startingValue])),
  inventory: [],
  decisions: [],
  aiInteractions: 0,
  completed: false,
  updatedAt: new Date().toISOString(),
});

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export function applyChoice(game: GameDefinition, state: PlayState, choice: Choice): PlayState {
  const scene = game.scenes.find((candidate) => candidate.id === state.currentSceneId);
  if (!scene || !scene.decision.choices.some((candidate) => candidate.id === choice.id)) throw new Error('That choice is not available in this scene.');
  if (choice.requiredItemId && !state.inventory.includes(choice.requiredItemId)) throw new Error('A required evidence item is missing.');
  const variables = { ...state.variables };
  for (const effect of choice.variableEffects) {
    const definition = game.variables.find((variable) => variable.id === effect.variableId);
    if (definition) variables[effect.variableId] = clamp((variables[effect.variableId] ?? definition.startingValue) + effect.amount, definition.min, definition.max);
  }
  const inventory = new Set(state.inventory);
  for (const effect of choice.itemEffects) effect.action === 'award' ? inventory.add(effect.itemId) : inventory.delete(effect.itemId);
  const nextSceneId = choice.nextSceneId ?? scene.nextSceneId;
  const completed = !nextSceneId;
  return {
    ...state,
    currentSceneId: nextSceneId ?? state.currentSceneId,
    variables,
    inventory: [...inventory],
    decisions: [...state.decisions, { sceneId: scene.id, choiceId: choice.id, choiceLabel: choice.label, consequence: choice.consequence }],
    completed,
    updatedAt: new Date().toISOString(),
  };
}

const matchesCondition = (state: PlayState, condition: Ending['conditions'][number]) => {
  if (condition.choiceId) return state.decisions.some((decision) => decision.choiceId === condition.choiceId);
  if (condition.itemId) return state.inventory.includes(condition.itemId);
  if (!condition.variableId || !condition.operator || condition.value === undefined) return true;
  const value = state.variables[condition.variableId] ?? 0;
  return { gte: value >= condition.value, lte: value <= condition.value, gt: value > condition.value, lt: value < condition.value }[condition.operator];
};

export function selectEnding(game: GameDefinition, state: PlayState): Ending {
  const ending = [...game.endings].sort((a, b) => b.priority - a.priority).find((candidate) => candidate.conditions.every((condition) => matchesCondition(state, condition)));
  if (!ending) throw new Error('No ending is configured for this outcome.');
  return ending;
}
