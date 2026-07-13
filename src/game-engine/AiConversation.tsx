import { useState } from 'react';
import type { Character, ChatMessage, PlayState } from '../types/game';
import { api } from '../services/api';
import { CharacterPortrait } from '../components/CharacterPortrait';

export function AiConversation({ character, state, sceneId, prompt, onCount }: { character: Character; state: PlayState; sceneId: string; prompt: string; onCount: (remaining: number) => void }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [remaining, setRemaining] = useState(Math.max(0, character.maxAiInteractions - state.aiInteractions));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const send = async () => {
    const clean = message.trim();
    if (!clean || loading || remaining <= 0) return;
    setLoading(true); setError('');
    const next = [...history, { role: 'user' as const, content: clean }]; setHistory(next); setMessage('');
    try {
      const result = await api.chat({ sessionId: state.sessionId, gameId: state.gameId, characterId: character.id, sceneId, variables: state.variables, inventory: state.inventory, history: history.slice(-6), message: clean });
      setHistory([...next, { role: 'assistant', content: result.reply }]); setRemaining(result.remaining); onCount(result.remaining);
    } catch (caught) {
      const fallback = 'Professor Rivera is unavailable right now. Try this instead: name the assumption behind your preferred choice, then ask what observable behavior would support or challenge it.';
      setHistory([...next, { role: 'assistant', content: fallback }]); setError(caught instanceof Error ? caught.message : 'The AI mentor is unavailable.');
    } finally { setLoading(false); }
  };
  if (!open) return <button className="mentor-invite" onClick={() => setOpen(true)}><CharacterPortrait character={character} size="small" /><span><small>OPTIONAL AI MENTOR</small><strong>Talk with {character.name}</strong><em>{prompt}</em></span><b>Open · {remaining} left</b></button>;
  return <section className="ai-panel" aria-labelledby="ai-heading">
    <header><CharacterPortrait character={character} size="small" /><div><small>AI-GENERATED CHARACTER</small><h3 id="ai-heading">{character.name}</h3></div><span>{remaining} conversations remaining</span><button aria-label="Close AI conversation" onClick={() => setOpen(false)}>×</button></header>
    <p className="privacy-reminder">Do not enter personal, private, or confidential information.</p>
    <div className="chat-log" aria-live="polite">
      {history.length === 0 && <div className="mentor-opening">“{character.openingDialogue}”<small>{prompt}</small></div>}
      {history.map((item, index) => <div key={`${item.role}-${index}`} className={`chat-message ${item.role}`}><span>{item.role === 'assistant' ? 'AI · Professor Rivera' : 'You'}</span>{item.content}</div>)}
      {loading && <div className="thinking">Professor Rivera is thinking…</div>}
    </div>
    {error && <p className="form-error" role="alert">{error} The prewritten coaching prompt was shown so you can keep playing.</p>}
    <form onSubmit={(event) => { event.preventDefault(); void send(); }}><label htmlFor="mentor-message" className="sr-only">Message Professor Rivera</label><textarea id="mentor-message" maxLength={1500} value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Ask about the evidence, interview, or next experiment…" /><button className="primary-button" disabled={!message.trim() || loading || remaining <= 0}>{loading ? 'Sending…' : 'Ask mentor'}</button></form>
  </section>;
}
