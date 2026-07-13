import { boolean, index, integer, jsonb, pgEnum, pgTable, primaryKey, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';

export const roleEnum = pgEnum('demo_role', ['player', 'designer']);
export const gameStatusEnum = pgEnum('game_status', ['draft', 'published']);
export const sessionStatusEnum = pgEnum('play_status', ['active', 'completed', 'abandoned']);
export const itemActionEnum = pgEnum('item_action', ['award', 'remove']);

const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
};

export const demoUsers = pgTable('demo_users', {
  id: uuid('id').primaryKey().defaultRandom(),
  displayName: text('display_name').notNull(),
  role: roleEnum('role').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const demoSessions = pgTable('demo_sessions', {
  tokenHash: text('token_hash').primaryKey(),
  role: roleEnum('role').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
}, (table) => [index('demo_sessions_expires_idx').on(table.expiresAt)]);

export const games = pgTable('games', {
  id: text('id').primaryKey(), title: text('title').notNull(), subtitle: text('subtitle').notNull().default(''), description: text('description').notNull(),
  learningObjective: text('learning_objective').notNull(), targetLearner: text('target_learner').notNull(), setting: text('setting').notNull(), playerRole: text('player_role').notNull(), openingStory: text('opening_story').notNull(), instructions: text('instructions').notNull(), estimatedPlayTime: text('estimated_play_time').notNull(), status: gameStatusEnum('status').notNull().default('draft'), theme: jsonb('theme').$type<Record<string, string>>().notNull().default({}), ...timestamps,
});

export const characters = pgTable('characters', {
  id: text('id').primaryKey(), gameId: text('game_id').notNull().references(() => games.id, { onDelete: 'cascade' }), name: text('name').notNull(), role: text('role').notNull(), description: text('description').notNull(), personality: text('personality').notNull(), goals: text('goals').notNull(), relationship: text('relationship').notNull(), initials: text('initials').notNull(), color: text('color').notNull(), openingDialogue: text('opening_dialogue').notNull(), aiEnabled: boolean('ai_enabled').notNull().default(false), aiInstructions: text('ai_instructions'), educationalPurpose: text('educational_purpose').notNull(), knowledgeBoundaries: text('knowledge_boundaries').notNull(), avoidTopics: text('avoid_topics').notNull(), maxAiInteractions: integer('max_ai_interactions').notNull().default(0), sortOrder: integer('sort_order').notNull(), ...timestamps,
}, (table) => [index('characters_game_sort_idx').on(table.gameId, table.sortOrder)]);

export const chapters = pgTable('chapters', {
  id: text('id').primaryKey(), gameId: text('game_id').notNull().references(() => games.id, { onDelete: 'cascade' }), title: text('title').notNull(), summary: text('summary').notNull(), learningFocus: text('learning_focus').notNull(), completionRequirements: text('completion_requirements').notNull(), sortOrder: integer('sort_order').notNull(), ...timestamps,
}, (table) => [index('chapters_game_sort_idx').on(table.gameId, table.sortOrder)]);

export const scenes = pgTable('scenes', {
  id: text('id').primaryKey(), gameId: text('game_id').notNull().references(() => games.id, { onDelete: 'cascade' }), chapterId: text('chapter_id').notNull().references(() => chapters.id, { onDelete: 'cascade' }), title: text('title').notNull(), location: text('location').notNull(), narrative: text('narrative').notNull(), objective: text('objective').notNull(), learningFocus: text('learning_focus').notNull(), aiCharacterId: text('ai_character_id').references(() => characters.id, { onDelete: 'set null' }), aiPrompt: text('ai_prompt'), nextSceneId: text('next_scene_id'), sortOrder: integer('sort_order').notNull(), ...timestamps,
}, (table) => [index('scenes_chapter_sort_idx').on(table.chapterId, table.sortOrder), index('scenes_game_idx').on(table.gameId)]);

export const sceneCharacters = pgTable('scene_characters', {
  sceneId: text('scene_id').notNull().references(() => scenes.id, { onDelete: 'cascade' }), characterId: text('character_id').notNull().references(() => characters.id, { onDelete: 'cascade' }), sortOrder: integer('sort_order').notNull().default(0),
}, (table) => [primaryKey({ columns: [table.sceneId, table.characterId] })]);

export const dialogueLines = pgTable('dialogue_lines', {
  id: text('id').primaryKey(), sceneId: text('scene_id').notNull().references(() => scenes.id, { onDelete: 'cascade' }), characterId: text('character_id').notNull().references(() => characters.id, { onDelete: 'cascade' }), text: text('text').notNull(), playerResponse: text('player_response'), relationshipEffect: integer('relationship_effect'), sortOrder: integer('sort_order').notNull(), ...timestamps,
}, (table) => [index('dialogue_scene_sort_idx').on(table.sceneId, table.sortOrder)]);

export const decisions = pgTable('decisions', {
  id: text('id').primaryKey(), sceneId: text('scene_id').notNull().unique().references(() => scenes.id, { onDelete: 'cascade' }), prompt: text('prompt').notNull(), context: text('context').notNull(), ...timestamps,
});

export const choices = pgTable('choices', {
  id: text('id').primaryKey(), decisionId: text('decision_id').notNull().references(() => decisions.id, { onDelete: 'cascade' }), label: text('label').notNull(), description: text('description').notNull(), consequence: text('consequence').notNull(), feedback: text('feedback').notNull(), nextSceneId: text('next_scene_id'), requiredItemId: text('required_item_id'), sortOrder: integer('sort_order').notNull(), ...timestamps,
}, (table) => [index('choices_decision_sort_idx').on(table.decisionId, table.sortOrder)]);

export const gameVariables = pgTable('game_variables', {
  id: text('id').primaryKey(), gameId: text('game_id').notNull().references(() => games.id, { onDelete: 'cascade' }), name: text('name').notNull(), label: text('label').notNull(), startingValue: integer('starting_value').notNull(), min: integer('min_value').notNull(), max: integer('max_value').notNull(), icon: text('icon'), explanation: text('explanation').notNull(), sortOrder: integer('sort_order').notNull(), ...timestamps,
}, (table) => [uniqueIndex('game_variables_game_name_idx').on(table.gameId, table.name)]);

export const choiceEffects = pgTable('choice_effects', {
  id: uuid('id').primaryKey().defaultRandom(), choiceId: text('choice_id').notNull().references(() => choices.id, { onDelete: 'cascade' }), variableId: text('variable_id').notNull().references(() => gameVariables.id, { onDelete: 'cascade' }), amount: integer('amount').notNull(),
}, (table) => [uniqueIndex('choice_effect_unique_idx').on(table.choiceId, table.variableId)]);

export const inventoryItems = pgTable('inventory_items', {
  id: text('id').primaryKey(), gameId: text('game_id').notNull().references(() => games.id, { onDelete: 'cascade' }), name: text('name').notNull(), description: text('description').notNull(), type: text('type').notNull(), icon: text('icon').notNull(), sortOrder: integer('sort_order').notNull(), ...timestamps,
}, (table) => [index('items_game_sort_idx').on(table.gameId, table.sortOrder)]);

export const choiceItemEffects = pgTable('choice_item_effects', {
  id: uuid('id').primaryKey().defaultRandom(), choiceId: text('choice_id').notNull().references(() => choices.id, { onDelete: 'cascade' }), itemId: text('item_id').notNull().references(() => inventoryItems.id, { onDelete: 'cascade' }), action: itemActionEnum('action').notNull(),
}, (table) => [uniqueIndex('choice_item_effect_unique_idx').on(table.choiceId, table.itemId, table.action)]);

export const endings = pgTable('endings', {
  id: text('id').primaryKey(), gameId: text('game_id').notNull().references(() => games.id, { onDelete: 'cascade' }), title: text('title').notNull(), narrative: text('narrative').notNull(), explanation: text('explanation').notNull(), learningDebrief: text('learning_debrief').notNull(), principles: jsonb('principles').$type<string[]>().notNull().default([]), reflectionQuestion: text('reflection_question').notNull(), replaySuggestion: text('replay_suggestion').notNull(), priority: integer('priority').notNull(), tone: text('tone').notNull(), sortOrder: integer('sort_order').notNull(), ...timestamps,
}, (table) => [index('endings_game_priority_idx').on(table.gameId, table.priority)]);

export const endingConditions = pgTable('ending_conditions', {
  id: uuid('id').primaryKey().defaultRandom(), endingId: text('ending_id').notNull().references(() => endings.id, { onDelete: 'cascade' }), variableId: text('variable_id').references(() => gameVariables.id, { onDelete: 'cascade' }), operator: text('operator'), value: integer('value'), choiceId: text('choice_id').references(() => choices.id, { onDelete: 'cascade' }), itemId: text('item_id').references(() => inventoryItems.id, { onDelete: 'cascade' }),
}, (table) => [index('ending_conditions_ending_idx').on(table.endingId)]);

export const playSessions = pgTable('play_sessions', {
  id: uuid('id').primaryKey(), gameId: text('game_id').notNull().references(() => games.id, { onDelete: 'cascade' }), currentSceneId: text('current_scene_id').references(() => scenes.id, { onDelete: 'set null' }), status: sessionStatusEnum('status').notNull().default('active'), endingId: text('ending_id').references(() => endings.id, { onDelete: 'set null' }), aiInteractionCount: integer('ai_interaction_count').notNull().default(0), createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(), updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(), completedAt: timestamp('completed_at', { withTimezone: true }),
}, (table) => [index('play_sessions_game_status_idx').on(table.gameId, table.status)]);

export const playerResponses = pgTable('player_responses', {
  id: uuid('id').primaryKey().defaultRandom(), sessionId: uuid('session_id').notNull().references(() => playSessions.id, { onDelete: 'cascade' }), sceneId: text('scene_id').notNull().references(() => scenes.id, { onDelete: 'cascade' }), choiceId: text('choice_id').notNull().references(() => choices.id, { onDelete: 'cascade' }), createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [index('responses_session_idx').on(table.sessionId)]);

export const playerVariableState = pgTable('player_variable_state', {
  sessionId: uuid('session_id').notNull().references(() => playSessions.id, { onDelete: 'cascade' }), variableId: text('variable_id').notNull().references(() => gameVariables.id, { onDelete: 'cascade' }), value: integer('value').notNull(), updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [primaryKey({ columns: [table.sessionId, table.variableId] })]);

export const playerInventory = pgTable('player_inventory', {
  sessionId: uuid('session_id').notNull().references(() => playSessions.id, { onDelete: 'cascade' }), itemId: text('item_id').notNull().references(() => inventoryItems.id, { onDelete: 'cascade' }), awardedAt: timestamp('awarded_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [primaryKey({ columns: [table.sessionId, table.itemId] })]);

export const aiInteractions = pgTable('ai_interactions', {
  id: uuid('id').primaryKey().defaultRandom(), sessionId: uuid('session_id').notNull().references(() => playSessions.id, { onDelete: 'cascade' }), characterId: text('character_id').notNull().references(() => characters.id, { onDelete: 'cascade' }), sceneId: text('scene_id').notNull().references(() => scenes.id, { onDelete: 'cascade' }), requestHash: text('request_hash').notNull(), status: text('status').notNull(), createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [index('ai_interactions_session_created_idx').on(table.sessionId, table.createdAt), uniqueIndex('ai_interactions_request_hash_idx').on(table.sessionId, table.requestHash)]);
