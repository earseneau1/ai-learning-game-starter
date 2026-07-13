export type Role = 'player' | 'designer';

export interface GameVariable {
  id: string;
  name: string;
  label: string;
  startingValue: number;
  min: number;
  max: number;
  icon?: string;
  explanation: string;
  sortOrder: number;
}

export interface Character {
  id: string;
  name: string;
  role: string;
  description: string;
  personality: string;
  goals: string;
  relationship: string;
  initials: string;
  color: string;
  openingDialogue: string;
  aiEnabled: boolean;
  aiInstructions?: string;
  educationalPurpose: string;
  knowledgeBoundaries: string;
  avoidTopics: string;
  maxAiInteractions: number;
  sortOrder: number;
}

export interface DialogueLine {
  id: string;
  characterId: string;
  text: string;
  sortOrder: number;
}

export interface VariableEffect { variableId: string; amount: number }
export interface ItemEffect { itemId: string; action: 'award' | 'remove' }

export interface Choice {
  id: string;
  label: string;
  description: string;
  consequence: string;
  feedback: string;
  variableEffects: VariableEffect[];
  itemEffects: ItemEffect[];
  nextSceneId?: string;
  requiredItemId?: string;
  sortOrder: number;
}

export interface Decision {
  id: string;
  prompt: string;
  context: string;
  choices: Choice[];
}

export interface Scene {
  id: string;
  chapterId: string;
  title: string;
  location: string;
  narrative: string;
  objective: string;
  learningFocus: string;
  characterIds: string[];
  dialogue: DialogueLine[];
  decision: Decision;
  aiCharacterId?: string;
  aiPrompt?: string;
  nextSceneId?: string;
  sortOrder: number;
}

export interface Chapter {
  id: string;
  title: string;
  summary: string;
  learningFocus: string;
  completionRequirements: string;
  sortOrder: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  type: 'evidence' | 'resource' | 'note';
  icon: string;
  sortOrder: number;
}

export interface EndingCondition {
  variableId?: string;
  operator?: 'gte' | 'lte' | 'gt' | 'lt';
  value?: number;
  choiceId?: string;
  itemId?: string;
}

export interface Ending {
  id: string;
  title: string;
  narrative: string;
  explanation: string;
  learningDebrief: string;
  principles: string[];
  reflectionQuestion: string;
  replaySuggestion: string;
  conditions: EndingCondition[];
  priority: number;
  tone: 'strong' | 'mixed' | 'pivot' | 'stop';
  sortOrder: number;
}

export interface GameDefinition {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  learningObjective: string;
  targetLearner: string;
  setting: string;
  playerRole: string;
  openingStory: string;
  instructions: string;
  estimatedPlayTime: string;
  status: 'draft' | 'published';
  chapters: Chapter[];
  characters: Character[];
  scenes: Scene[];
  variables: GameVariable[];
  inventory: InventoryItem[];
  endings: Ending[];
}

export interface DecisionRecord {
  sceneId: string;
  choiceId: string;
  choiceLabel: string;
  consequence: string;
}

export interface PlayState {
  sessionId: string;
  gameId: string;
  currentSceneId: string;
  variables: Record<string, number>;
  inventory: string[];
  decisions: DecisionRecord[];
  aiInteractions: number;
  completed: boolean;
  endingId?: string;
  updatedAt: string;
}

export interface ChatMessage { role: 'user' | 'assistant'; content: string }
