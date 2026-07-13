import { useState } from 'react';
import type { Choice, GameDefinition, PlayState, Scene } from '../types/game';
import { CharacterPortrait } from '../components/CharacterPortrait';
import { AiConversation } from './AiConversation';

export function GameScene({ game, scene, state, onChoose, onAiCount }: { game: GameDefinition; scene: Scene; state: PlayState; onChoose: (choice: Choice) => void; onAiCount: (remaining: number) => void }) {
  const [selected, setSelected] = useState<Choice | null>(null);
  const chapter = game.chapters.find((item) => item.id === scene.chapterId);
  return <article className="scene-card">
    <header className="scene-heading"><div><span>Chapter {chapter?.sortOrder} · Scene {scene.sortOrder} of {game.scenes.length}</span><h1>{scene.title}</h1><p>{scene.location}</p></div><div className="progress-ring" aria-label={`${scene.sortOrder} of ${game.scenes.length} scenes`}><strong>{scene.sortOrder}</strong><span>/{game.scenes.length}</span></div></header>
    <div className="narrative"><span className="drop-mark">{scene.sortOrder}</span><p>{scene.narrative}</p></div>
    <div className="dialogue-stack">
      {scene.dialogue.sort((a, b) => a.sortOrder - b.sortOrder).map((line) => {
        const character = game.characters.find((item) => item.id === line.characterId);
        return character ? <div className="dialogue" key={line.id}><CharacterPortrait character={character} /><div><span>{character.name}<small>{character.role}</small></span><blockquote>“{line.text}”</blockquote></div></div> : null;
      })}
    </div>
    {scene.aiCharacterId && (() => { const character = game.characters.find((item) => item.id === scene.aiCharacterId); return character ? <AiConversation character={character} state={state} sceneId={scene.id} prompt={scene.aiPrompt ?? ''} onCount={onAiCount} /> : null; })()}
    <section className="decision-block" aria-labelledby="decision-title"><div className="decision-label">YOUR DECISION</div><h2 id="decision-title">{scene.decision.prompt}</h2><p>{scene.decision.context}</p><div className="choice-grid">{scene.decision.choices.sort((a, b) => a.sortOrder - b.sortOrder).map((choice, index) => <button key={choice.id} className={selected?.id === choice.id ? 'choice selected' : 'choice'} onClick={() => setSelected(choice)} disabled={Boolean(choice.requiredItemId && !state.inventory.includes(choice.requiredItemId))}><span>{String.fromCharCode(65 + index)}</span><div><strong>{choice.label}</strong><small>{choice.description}</small></div><b aria-hidden="true">{selected?.id === choice.id ? '✓' : '→'}</b></button>)}</div></section>
    {selected && <section className="choice-confirm"><div><small>READY TO COMMIT?</small><strong>{selected.label}</strong><p>You’ll see the consequence and learning note before moving on.</p></div><button className="secondary-button" onClick={() => setSelected(null)}>Change choice</button><button className="primary-button" onClick={() => onChoose(selected)}>Make this choice →</button></section>}
  </article>;
}
