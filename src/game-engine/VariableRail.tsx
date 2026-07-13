import type { GameDefinition, PlayState } from '../types/game';

export function VariableRail({ game, state }: { game: GameDefinition; state: PlayState }) {
  return <aside className="variable-rail" aria-label="Current game variables">
    <h2>Your resources</h2>
    {game.variables.sort((a, b) => a.sortOrder - b.sortOrder).map((variable) => {
      const value = state.variables[variable.id] ?? variable.startingValue;
      const width = ((value - variable.min) / (variable.max - variable.min)) * 100;
      return <div className="variable" key={variable.id} title={variable.explanation}>
        <div><span className="variable-icon">{variable.icon}</span><span>{variable.label}</span><strong>{value}</strong></div>
        <div className="meter"><span style={{ width: `${width}%` }} /></div>
      </div>;
    })}
    <div className="evidence-list">
      <h2>Evidence collected <span>{state.inventory.length}</span></h2>
      {state.inventory.length === 0 ? <p>Choices can uncover useful artifacts.</p> : state.inventory.map((id) => {
        const item = game.inventory.find((candidate) => candidate.id === id);
        return item ? <div className="evidence-chip" key={id}><span>{item.icon}</span><span><strong>{item.name}</strong><small>{item.description}</small></span></div> : null;
      })}
    </div>
  </aside>;
}
