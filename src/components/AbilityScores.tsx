import type { AbilityScores as AbilityScoresType, AbilityName } from '../types';
import './AbilityScores.css';

interface AbilityScoresProps {
  scores: AbilityScoresType;
  modifiers: AbilityScoresType;
  onScoreChange?: (ability: AbilityName, value: number) => void;
  editable?: boolean;
}

const ABILITY_LABELS: Record<AbilityName, { fr: string; abbr: string }> = {
  strength: { fr: 'Force', abbr: 'FOR' },
  dexterity: { fr: 'Dextérité', abbr: 'DEX' },
  constitution: { fr: 'Constitution', abbr: 'CON' },
  intelligence: { fr: 'Intelligence', abbr: 'INT' },
  wisdom: { fr: 'Sagesse', abbr: 'SAG' },
  charisma: { fr: 'Charisme', abbr: 'CHA' },
};

const ABILITIES: AbilityName[] = [
  'strength',
  'dexterity',
  'constitution',
  'intelligence',
  'wisdom',
  'charisma',
];

function formatModifier(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

export function AbilityScoresDisplay({
  scores,
  modifiers,
  onScoreChange,
  editable = false,
}: AbilityScoresProps) {
  return (
    <div className="ability-scores">
      {ABILITIES.map((ability) => (
        <div key={ability} className="ability-score">
          <div className="ability-name">{ABILITY_LABELS[ability].abbr}</div>
          <div className="ability-modifier">{formatModifier(modifiers[ability])}</div>
          {editable ? (
            <input
              type="number"
              className="ability-value"
              value={scores[ability]}
              onChange={(e) => onScoreChange?.(ability, parseInt(e.target.value) || 0)}
              min={1}
              max={30}
            />
          ) : (
            <div className="ability-value">{scores[ability]}</div>
          )}
        </div>
      ))}
    </div>
  );
}
