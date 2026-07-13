import type { Character } from '../types/game';

export function CharacterPortrait({ character, size = 'normal' }: { character: Character; size?: 'small' | 'normal' | 'large' }) {
  return <div className={`portrait portrait-${size}`} style={{ '--portrait-color': character.color } as React.CSSProperties} role="img" aria-label={`${character.name}, ${character.role}`}>
    <span>{character.initials}</span>
  </div>;
}
