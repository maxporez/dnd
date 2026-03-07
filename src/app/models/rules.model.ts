export type ModifierTarget =
  | `ability.${string}`
  | `skill.${string}`
  | `save.${string}`
  | `stat.${string}`
  | `resource.${string}`
  | `combat.${string}`
  | `proficiency.${string}`
  | string;

export type ModifierOperation =
  | 'add'
  | 'subtract'
  | 'multiply'
  | 'set'
  | 'min'
  | 'max'
  | 'formula';

export interface ModifierCondition {
  type: 'hasFeature' | 'hasItem' | 'levelMin' | 'levelMax' | 'abilityMin' | 'custom';
  value: string | number;
  customCheck?: string;
}

export interface Modifier {
  id: string;
  name: string;
  description?: string;
  source: ModifierSource;
  sourceId: string;
  target: ModifierTarget;
  operation: ModifierOperation;
  value: number | string;
  priority?: number;
  conditions?: ModifierCondition[];
  isHomebrew: boolean;
}

export type ModifierSource =
  | 'race' | 'subrace' | 'class' | 'subclass'
  | 'background' | 'feat' | 'item' | 'spell'
  | 'condition' | 'homebrew' | 'manual';

export interface HomebrewPack {
  id: string;
  name: string;
  author: string;
  version: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  content: {
    races?: HomebrewRace[];
    classes?: HomebrewClass[];
    feats?: HomebrewFeat[];
    spells?: HomebrewSpell[];
    items?: HomebrewItem[];
    rules?: HomebrewRule[];
    modifiers?: Modifier[];
  };
}

export interface HomebrewRule {
  id: string;
  name: string;
  description: string;
  category: 'rest' | 'combat' | 'magic' | 'exploration' | 'social' | 'encumbrance' | 'other';
  replaces?: string;
  modifiers: Modifier[];
  enabled: boolean;
}

export interface HomebrewRace {
  id: string;
  name: string;
  description: string;
  traits: string[];
  modifiers: Modifier[];
}

export interface HomebrewClass {
  id: string;
  name: string;
  description: string;
  hitDie: number;
  primaryAbility: string[];
  savingThrows: string[];
  modifiers: Modifier[];
}

export interface HomebrewFeat {
  id: string;
  name: string;
  description: string;
  prerequisites?: string;
  modifiers: Modifier[];
}

export interface HomebrewSpell {
  id: string;
  name: string;
  level: number;
  school: string;
  castingTime: string;
  range: string;
  components: string;
  duration: string;
  description: string;
  higherLevels?: string;
}

export interface HomebrewItem {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'gear' | 'magic' | 'consumable';
  rarity?: 'common' | 'uncommon' | 'rare' | 'veryRare' | 'legendary';
  description: string;
  weight?: number;
  cost?: string;
  modifiers: Modifier[];
}

export interface FormulaContext {
  level: number;
  proficiencyBonus: number;
  strMod: number;
  dexMod: number;
  conMod: number;
  intMod: number;
  wisMod: number;
  chaMod: number;
  [key: string]: number;
}
