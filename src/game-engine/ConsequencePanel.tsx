import type { Choice, GameDefinition } from '../types/game';

export function ConsequencePanel({ game, choice, onContinue }: { game: GameDefinition; choice: Choice; onContinue: () => void }) {
  return <div className="consequence-screen"><section className="consequence-card"><p className="eyebrow">The consequence</p><h1>{choice.label}</h1><p className="consequence-copy">{choice.consequence}</p><div className="effect-row">{choice.variableEffects.map((effect) => { const variable = game.variables.find((item) => item.id === effect.variableId); return variable ? <span className={effect.amount >= 0 ? 'positive' : 'negative'} key={effect.variableId}>{variable.icon} {variable.label} <strong>{effect.amount > 0 ? '+' : ''}{effect.amount}</strong></span> : null; })}</div><div className="learning-note"><span>WHY THIS MATTERS</span><p>{choice.feedback}</p></div><button className="primary-button" onClick={onContinue}>Continue the story →</button></section></div>;
}
