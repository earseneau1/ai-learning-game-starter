import { asc, eq } from 'drizzle-orm';
import type { Choice, Decision, GameDefinition } from '../src/types/game';
import { createDatabase } from './client';
import { chapters, characters, choiceEffects, choiceItemEffects, choices, decisions, dialogueLines, endingConditions, endings, gameVariables, games, inventoryItems, sceneCharacters, scenes } from './schema';

export async function loadGame(gameId: string): Promise<GameDefinition | null> {
  const { db, client } = createDatabase();
  try {
    const [game] = await db.select().from(games).where(eq(games.id, gameId)).limit(1);
    if (!game) return null;
    const [characterRows, chapterRows, sceneRows, sceneCharacterRows, dialogueRows, decisionRows, choiceRows, effectRows, variableRows, itemRows, itemEffectRows, endingRows, conditionRows] = await Promise.all([
      db.select().from(characters).where(eq(characters.gameId, gameId)).orderBy(asc(characters.sortOrder)),
      db.select().from(chapters).where(eq(chapters.gameId, gameId)).orderBy(asc(chapters.sortOrder)),
      db.select().from(scenes).where(eq(scenes.gameId, gameId)).orderBy(asc(scenes.sortOrder)),
      db.select().from(sceneCharacters).orderBy(asc(sceneCharacters.sortOrder)),
      db.select().from(dialogueLines).orderBy(asc(dialogueLines.sortOrder)),
      db.select().from(decisions), db.select().from(choices).orderBy(asc(choices.sortOrder)), db.select().from(choiceEffects),
      db.select().from(gameVariables).where(eq(gameVariables.gameId, gameId)).orderBy(asc(gameVariables.sortOrder)),
      db.select().from(inventoryItems).where(eq(inventoryItems.gameId, gameId)).orderBy(asc(inventoryItems.sortOrder)),
      db.select().from(choiceItemEffects),
      db.select().from(endings).where(eq(endings.gameId, gameId)).orderBy(asc(endings.sortOrder)), db.select().from(endingConditions),
    ]);

    const decisionByScene = new Map<string, Decision>(decisionRows.map((decision) => {
      const decisionChoices: Choice[] = choiceRows.filter((choice) => choice.decisionId === decision.id).map((choice) => ({
        id: choice.id, label: choice.label, description: choice.description, consequence: choice.consequence, feedback: choice.feedback,
        nextSceneId: choice.nextSceneId ?? undefined, requiredItemId: choice.requiredItemId ?? undefined, sortOrder: choice.sortOrder,
        variableEffects: effectRows.filter((effect) => effect.choiceId === choice.id).map((effect) => ({ variableId: effect.variableId, amount: effect.amount })),
        itemEffects: itemEffectRows.filter((effect) => effect.choiceId === choice.id).map((effect) => ({ itemId: effect.itemId, action: effect.action })),
      }));
      return [decision.sceneId, { id: decision.id, prompt: decision.prompt, context: decision.context, choices: decisionChoices }];
    }));

    const publicCharacters = characterRows.map(({ aiInstructions: _serverOnly, gameId: _gameId, createdAt: _createdAt, updatedAt: _updatedAt, ...character }) => ({
      ...character, aiInstructions: undefined, color: character.color, openingDialogue: character.openingDialogue,
    }));
    const playableScenes = sceneRows.map((scene) => {
      const decision = decisionByScene.get(scene.id);
      if (!decision) throw new Error(`Scene ${scene.id} is missing a decision.`);
      return {
        id: scene.id, chapterId: scene.chapterId, title: scene.title, location: scene.location, narrative: scene.narrative, objective: scene.objective, learningFocus: scene.learningFocus,
        characterIds: sceneCharacterRows.filter((link) => link.sceneId === scene.id).map((link) => link.characterId),
        dialogue: dialogueRows.filter((line) => line.sceneId === scene.id).map((line) => ({ id: line.id, characterId: line.characterId, text: line.text, sortOrder: line.sortOrder })),
        decision, aiCharacterId: scene.aiCharacterId ?? undefined, aiPrompt: scene.aiPrompt ?? undefined, nextSceneId: scene.nextSceneId ?? undefined, sortOrder: scene.sortOrder,
      };
    });
    return {
      id: game.id, title: game.title, subtitle: game.subtitle, description: game.description, learningObjective: game.learningObjective, targetLearner: game.targetLearner,
      setting: game.setting, playerRole: game.playerRole, openingStory: game.openingStory, instructions: game.instructions, estimatedPlayTime: game.estimatedPlayTime, status: game.status,
      characters: publicCharacters,
      chapters: chapterRows.map(({ gameId: _gameId, createdAt: _createdAt, updatedAt: _updatedAt, ...chapter }) => chapter), scenes: playableScenes,
      variables: variableRows.map(({ gameId: _gameId, createdAt: _createdAt, updatedAt: _updatedAt, ...variable }) => ({ ...variable, icon: variable.icon ?? undefined })),
      inventory: itemRows.map(({ gameId: _gameId, createdAt: _createdAt, updatedAt: _updatedAt, ...item }) => ({ ...item, type: item.type === 'resource' || item.type === 'note' ? item.type : 'evidence' })),
      endings: endingRows.map((ending) => ({ id: ending.id, title: ending.title, narrative: ending.narrative, explanation: ending.explanation, learningDebrief: ending.learningDebrief, principles: ending.principles, reflectionQuestion: ending.reflectionQuestion, replaySuggestion: ending.replaySuggestion, priority: ending.priority, tone: ending.tone === 'strong' || ending.tone === 'pivot' || ending.tone === 'stop' ? ending.tone : 'mixed', sortOrder: ending.sortOrder, conditions: conditionRows.filter((condition) => condition.endingId === ending.id).map((condition) => ({ variableId: condition.variableId ?? undefined, operator: condition.operator === 'gte' || condition.operator === 'lte' || condition.operator === 'gt' || condition.operator === 'lt' ? condition.operator : undefined, value: condition.value ?? undefined, choiceId: condition.choiceId ?? undefined, itemId: condition.itemId ?? undefined })) })),
    };
  } finally { await client.end(); }
}
