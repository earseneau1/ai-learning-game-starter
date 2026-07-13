import { eq } from 'drizzle-orm';
import { startupSprint } from '../src/game-content/game.config';
import { characterPromptById } from '../src/game-content/character-prompts';
import { createDatabase } from './client';
import { chapters, characters, choiceEffects, choiceItemEffects, choices, decisions, dialogueLines, endingConditions, endings, gameVariables, games, inventoryItems, sceneCharacters, scenes } from './schema';

export async function seedStartupSprint() {
  const { db, client } = createDatabase();
  const game = startupSprint;
  try {
    await db.transaction(async (tx) => {
      await tx.delete(games).where(eq(games.id, game.id));
      await tx.insert(games).values({ id: game.id, title: game.title, subtitle: game.subtitle, description: game.description, learningObjective: game.learningObjective, targetLearner: game.targetLearner, setting: game.setting, playerRole: game.playerRole, openingStory: game.openingStory, instructions: game.instructions, estimatedPlayTime: game.estimatedPlayTime, status: game.status, theme: { name: 'Launch Lab', accent: '#d9ed84', primary: '#123c34' } });
      await tx.insert(characters).values(game.characters.map((item) => ({ ...item, aiInstructions: characterPromptById[item.id], gameId: game.id })));
      await tx.insert(chapters).values(game.chapters.map((item) => ({ ...item, gameId: game.id })));
      await tx.insert(gameVariables).values(game.variables.map((item) => ({ ...item, gameId: game.id })));
      await tx.insert(inventoryItems).values(game.inventory.map((item) => ({ ...item, gameId: game.id })));
      await tx.insert(scenes).values(game.scenes.map((item) => ({ id: item.id, gameId: game.id, chapterId: item.chapterId, title: item.title, location: item.location, narrative: item.narrative, objective: item.objective, learningFocus: item.learningFocus, aiCharacterId: item.aiCharacterId, aiPrompt: item.aiPrompt, nextSceneId: item.nextSceneId, sortOrder: item.sortOrder })));
      await tx.insert(sceneCharacters).values(game.scenes.flatMap((scene) => scene.characterIds.map((characterId, sortOrder) => ({ sceneId: scene.id, characterId, sortOrder }))));
      await tx.insert(dialogueLines).values(game.scenes.flatMap((scene) => scene.dialogue.map((line) => ({ ...line, sceneId: scene.id }))));
      await tx.insert(decisions).values(game.scenes.map((scene) => ({ id: scene.decision.id, sceneId: scene.id, prompt: scene.decision.prompt, context: scene.decision.context })));
      const allChoices = game.scenes.flatMap((scene) => scene.decision.choices.map((choice) => ({ ...choice, decisionId: scene.decision.id })));
      await tx.insert(choices).values(allChoices.map(({ variableEffects: _variableEffects, itemEffects: _itemEffects, ...choice }) => choice));
      const variableRows = allChoices.flatMap((choice) => choice.variableEffects.map((effect) => ({ choiceId: choice.id, variableId: effect.variableId, amount: effect.amount })));
      if (variableRows.length) await tx.insert(choiceEffects).values(variableRows);
      const itemRows = allChoices.flatMap((choice) => choice.itemEffects.map((effect) => ({ choiceId: choice.id, itemId: effect.itemId, action: effect.action })));
      if (itemRows.length) await tx.insert(choiceItemEffects).values(itemRows);
      await tx.insert(endings).values(game.endings.map(({ conditions: _conditions, ...ending }) => ({ ...ending, gameId: game.id })));
      const conditionRows = game.endings.flatMap((ending) => ending.conditions.map((condition) => ({ endingId: ending.id, ...condition })));
      if (conditionRows.length) await tx.insert(endingConditions).values(conditionRows);
    });
  } finally { await client.end(); }
}
