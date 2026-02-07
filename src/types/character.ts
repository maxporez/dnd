import type { AbilityScores, SkillProficiencies, SavingThrowProficiencies, DerivedStats } from './stats';
import type { Modifier } from './rules';

// Niveau dans une classe
export interface ClassLevel {
  classId: string;
  className: string;
  subclassId?: string;
  subclassName?: string;
  level: number;
  isHomebrew: boolean;
}

// Référence à une race
export interface RaceRef {
  raceId: string;
  raceName: string;
  subraceId?: string;
  subraceName?: string;
  isHomebrew: boolean;
}

// Référence au background
export interface BackgroundRef {
  backgroundId: string;
  backgroundName: string;
  isHomebrew: boolean;
}

// Don/Feat
export interface FeatRef {
  featId: string;
  featName: string;
  isHomebrew: boolean;
}

// Objet possédé
export interface InventoryItem {
  id: string;
  itemId: string;
  name: string;
  quantity: number;
  equipped: boolean;
  attuned: boolean;
  notes?: string;
  isHomebrew: boolean;
}

// Sort connu ou préparé
export interface SpellEntry {
  spellId: string;
  name: string;
  level: number;
  prepared: boolean;
  alwaysPrepared: boolean;
  source: string; // Classe ou autre source
  isHomebrew: boolean;
}

// Emplacements de sorts
export interface SpellSlots {
  [level: number]: {
    max: number;
    used: number;
  };
}

// Trait ou capacité
export interface Feature {
  id: string;
  name: string;
  description: string;
  source: string;
  sourceId: string;
  level?: number;
  uses?: {
    max: number | string; // Peut être une formule
    current: number;
    rechargeOn: 'shortRest' | 'longRest' | 'dawn' | 'never';
  };
  isHomebrew: boolean;
}

// Attaque (arme ou sort)
export interface Attack {
  id: string;
  name: string;
  type: 'melee' | 'ranged' | 'spell';
  ability: string;
  proficient: boolean;
  damageType: string;
  damageDice: string;
  bonusToHit?: number;
  bonusDamage?: number;
  range?: string;
  properties?: string[];
  notes?: string;
}

// Devise
export interface Currency {
  copper: number;
  silver: number;
  electrum: number;
  gold: number;
  platinum: number;
}

// Notes du personnage
export interface CharacterNotes {
  personality: string;
  ideals: string;
  bonds: string;
  flaws: string;
  backstory: string;
  allies: string;
  treasure: string;
  other: string;
}

// Personnage complet
export interface Character {
  id: string;
  name: string;
  playerName?: string;

  // Infos de base
  race: RaceRef;
  classes: ClassLevel[];
  background: BackgroundRef;
  alignment?: string;
  experience?: number;

  // Apparence
  appearance: {
    age?: string;
    height?: string;
    weight?: string;
    eyes?: string;
    skin?: string;
    hair?: string;
    portrait?: string; // URL ou base64
  };

  // Stats de base (avant modificateurs)
  baseAbilityScores: AbilityScores;

  // Maîtrises
  skillProficiencies: SkillProficiencies;
  savingThrowProficiencies: SavingThrowProficiencies;
  otherProficiencies: string[]; // Langues, outils, armes, armures

  // Dons
  feats: FeatRef[];

  // Traits et capacités
  features: Feature[];

  // Inventaire
  inventory: InventoryItem[];
  currency: Currency;

  // Magie
  spellcastingAbility?: string;
  spells: SpellEntry[];
  spellSlots: SpellSlots;

  // Attaques configurées
  attacks: Attack[];

  // État actuel
  currentState: {
    hitPoints: number;
    tempHitPoints: number;
    hitDiceRemaining: { [dieType: string]: number };
    deathSaves: { successes: number; failures: number };
    exhaustionLevel: number;
    conditions: string[];
    inspiration: boolean;
  };

  // Notes
  notes: CharacterNotes;

  // Modificateurs appliqués (homebrew et autres)
  activeModifiers: Modifier[];

  // Règles maison activées pour ce personnage
  activeHomebrewRules: string[]; // IDs des HomebrewRule

  // Métadonnées
  createdAt: string;
  updatedAt: string;
  version: number;
}

// Stats calculées (après application de tous les modificateurs)
export interface ComputedCharacter extends Character {
  computedAbilityScores: AbilityScores;
  abilityModifiers: AbilityScores;
  derivedStats: DerivedStats;
  computedSkillBonuses: { [skill: string]: number };
  computedSaveBonuses: { [ability: string]: number };
}

// Template pour créer un nouveau personnage
export function createEmptyCharacter(): Omit<Character, 'id' | 'createdAt' | 'updatedAt' | 'version'> {
  return {
    name: '',
    race: { raceId: '', raceName: '', isHomebrew: false },
    classes: [],
    background: { backgroundId: '', backgroundName: '', isHomebrew: false },
    appearance: {},
    baseAbilityScores: {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10,
    },
    skillProficiencies: {},
    savingThrowProficiencies: {
      strength: false,
      dexterity: false,
      constitution: false,
      intelligence: false,
      wisdom: false,
      charisma: false,
    },
    otherProficiencies: [],
    feats: [],
    features: [],
    inventory: [],
    currency: { copper: 0, silver: 0, electrum: 0, gold: 0, platinum: 0 },
    spells: [],
    spellSlots: {},
    attacks: [],
    currentState: {
      hitPoints: 0,
      tempHitPoints: 0,
      hitDiceRemaining: {},
      deathSaves: { successes: 0, failures: 0 },
      exhaustionLevel: 0,
      conditions: [],
      inspiration: false,
    },
    notes: {
      personality: '',
      ideals: '',
      bonds: '',
      flaws: '',
      backstory: '',
      allies: '',
      treasure: '',
      other: '',
    },
    activeModifiers: [],
    activeHomebrewRules: [],
  };
}
