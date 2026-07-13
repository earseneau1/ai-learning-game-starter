import { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useRole } from '../hooks/useRole';
import { startupSprint } from '../game-content/game.config';
import { applyChoice, createInitialState, selectEnding } from '../game-engine/logic';
import { GameScene } from '../game-engine/GameScene';
import { VariableRail } from '../game-engine/VariableRail';
import { ConsequencePanel } from '../game-engine/ConsequencePanel';
import { EndingScreen } from '../game-engine/EndingScreen';
import type { Choice, PlayState } from '../types/game';
import { api } from '../services/api';

const storageKey = 'startup-sprint-play-state';

export function PlayerPage() {
  const { role } = useRole();
  const [state, setState] = useState<PlayState | null>(() => { const saved = localStorage.getItem(storageKey); try { return saved ? JSON.parse(saved) as PlayState : null; } catch { return null; } });
  const [started, setStarted] = useState(Boolean(state));
  const [pending, setPending] = useState<{ choice: Choice; next: PlayState } | null>(null);
  const [game, setGame] = useState(startupSprint);
  useEffect(() => { void api.getGame().then(setGame).catch(() => undefined); }, []);
  useEffect(() => { if (state) { localStorage.setItem(storageKey, JSON.stringify(state)); void api.savePlayState(state).catch(() => undefined); } }, [state]);
  const ending = useMemo(() => state?.completed ? selectEnding(game, state) : null, [game, state]);
  if (role !== 'player') return <Navigate to={role === 'designer' ? '/designer' : '/'} replace />;
  const begin = () => { const next = createInitialState(game); setState(next); setStarted(true); };
  const restart = () => { localStorage.removeItem(storageKey); begin(); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  if (!started || !state) return <main className="game-intro"><div className="intro-backdrop"><div className="intro-copy"><p className="eyebrow">A narrative entrepreneurship game</p><h1>{game.title}</h1><h2>{game.subtitle}</h2><p>{game.openingStory}</p><div className="intro-meta"><span><small>YOUR ROLE</small>{game.playerRole}</span><span><small>PLAY TIME</small>{game.estimatedPlayTime}</span></div><button className="primary-button large" onClick={begin}>Start the sprint →</button></div><div className="intro-objective"><span>LEARNING OBJECTIVE</span><p>{game.learningObjective}</p><small>{game.instructions}</small></div></div></main>;
  if (ending) return <EndingScreen game={game} state={state} ending={ending} onRestart={restart} />;
  if (pending) return <ConsequencePanel game={game} choice={pending.choice} onContinue={() => { setState(pending.next); setPending(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />;
  const scene = game.scenes.find((item) => item.id === state.currentSceneId);
  if (!scene) return <main className="error-page"><h1>This scene is missing.</h1><p>Return to the beginning to restore the demo path.</p><button className="primary-button" onClick={restart}>Restart game</button></main>;
  const choose = (choice: Choice) => setPending({ choice, next: applyChoice(game, state, choice) });
  return <main className="player-layout"><VariableRail game={game} state={state} /><GameScene game={game} scene={scene} state={state} onChoose={choose} onAiCount={(remaining) => setState((current) => current ? { ...current, aiInteractions: Math.max(0, game.characters.find((item) => item.id === 'rivera')!.maxAiInteractions - remaining) } : current)} /></main>;
}
