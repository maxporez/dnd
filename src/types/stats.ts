// Caractéristiques principales (abilities)
export type AbilityName = 'strength' | 'dexterity' | 'constitution' | 'intelligence' | 'wisdom' | 'charisma';

export interface AbilityScores {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

// Compétences (skills) liées à chaque caractéristique
export type SkillName =
  // Strength
  | 'athletics'
  // Dexterity
  | 'acrobatics' | 'sleightOfHand' | 'stealth'
  // Intelligence
  | 'arcana' | 'history' | 'investigation' | 'nature' | 'religion'
  // Wisdom
  | 'animalHandling' | 'insight' | 'medicine' | 'perception' | 'survival'
  // Charisma
  | 'deception' | 'intimidation' | 'performance' | 'persuasion';

export const SKILL_ABILITY_MAP: Record<SkillName, AbilityName> = {
  athletics: 'strength',
  acrobatics: 'dexterity',
  sleightOfHand: 'dexterity',
  stealth: 'dexterity',
  arcana: 'intelligence',
  history: 'intelligence',
  investigation: 'intelligence',
  nature: 'intelligence',
  religion: 'intelligence',
  animalHandling: 'wisdom',
  insight: 'wisdom',
  medicine: 'wisdom',
  perception: 'wisdom',
  survival: 'wisdom',
  deception: 'charisma',
  intimidation: 'charisma',
  performance: 'charisma',
  persuasion: 'charisma',
};

export interface SkillProficiencies {
  [key: string]: 'none' | 'proficient' | 'expert';
}

// Jets de sauvegarde
export interface SavingThrowProficiencies {
  strength: boolean;
  dexterity: boolean;
  constitution: boolean;
  intelligence: boolean;
  wisdom: boolean;
  charisma: boolean;
}

// Stats dérivées calculées
export interface DerivedStats {
  proficiencyBonus: number;
  initiative: number;
  armorClass: number;
  speed: number;
  hitPointsMax: number;
  hitPointsCurrent: number;
  hitPointsTemp: number;
  hitDice: string;
  hitDiceRemaining: number;
  passivePerception: number;
  passiveInvestigation: number;
  passiveInsight: number;
}

// Calcul du modificateur de caractéristique
export function getAbilityModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

// Calcul du bonus de maîtrise par niveau
export function getProficiencyBonus(level: number): number {
  return Math.floor((level - 1) / 4) + 2;
}
