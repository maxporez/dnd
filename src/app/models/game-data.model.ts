export interface GameRace {
  id: string;
  name: string;
  source: string;
  speed: number;
  size: string;
  abilityBonuses: { ability: string; bonus: number }[];
  traits: string[];
  languages: string[];
  darkvision?: number;
  subraces?: string[];
  description?: string;
}

export interface GameClass {
  id: string;
  name: string;
  source: string;
  hitDie: number;
  primaryAbility: string[];
  savingThrows: string[];
  skillChoices: { count: number; from: string[] };
  armorProficiencies: string[];
  weaponProficiencies: string[];
  spellcasting?: { ability: string; type: string };
  description?: string;
}

export interface GameSpell {
  id: string;
  name: string;
  level: number;
  school: string;
  castingTime: string;
  range: string;
  components: { verbal: boolean; somatic: boolean; material?: string };
  duration: string;
  description: string;
  higherLevels?: string;
  classes: string[];
  source: string;
}

export interface GameBackground {
  id: string;
  name: string;
  source: string;
  skillProficiencies: string[];
  toolProficiencies?: string[];
  languages?: number;
  equipment: string[];
  feature: { name: string; description: string };
  description?: string;
}

export interface GameFeat {
  id: string;
  name: string;
  source: string;
  prerequisite?: string;
  description: string;
  abilityBonus?: { ability: string; bonus: number }[];
}

export interface GameItem {
  id: string;
  name: string;
  source: string;
  category: string;
  cost?: { quantity: number; unit: string };
  weight?: number;
  description: string;
  damage?: { dice: string; type: string };
  weaponCategory?: string;
  weaponRange?: string;
  properties?: string[];
  armorCategory?: string;
  armorClass?: { base: number; dexBonus?: boolean; maxBonus?: number };
  strengthRequirement?: number;
  stealthDisadvantage?: boolean;
  rarity?: string;
  requiresAttunement?: boolean;
  magicBonus?: number;
}

export interface DataImportStatus {
  id: 'status';
  version: string;
  lastImport: string;
  racesCount: number;
  classesCount: number;
  spellsCount: number;
  itemsCount: number;
  backgroundsCount: number;
  featsCount: number;
}

export interface AppSettings {
  id: 'main';
  theme: 'light' | 'dark' | 'system';
  language: 'fr' | 'en';
  defaultDiceRoller: boolean;
  autoSave: boolean;
  lastOpenedCharacterId?: string;
  dataImported: boolean;
}
