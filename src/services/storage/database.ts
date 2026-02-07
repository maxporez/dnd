import Dexie, { type EntityTable } from 'dexie';
import type { Character, HomebrewPack, HomebrewRule } from '../../types';

// Types pour les données de jeu importées
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
  category: string; // weapon, armor, adventuring-gear, tool, etc.
  cost?: { quantity: number; unit: string };
  weight?: number;
  description: string;
  // Pour les armes
  damage?: { dice: string; type: string };
  weaponCategory?: string;
  weaponRange?: string;
  properties?: string[];
  // Pour les armures
  armorCategory?: string;
  armorClass?: { base: number; dexBonus?: boolean; maxBonus?: number };
  strengthRequirement?: number;
  stealthDisadvantage?: boolean;
  // Pour les objets magiques
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

// Définition de la base de données
export class DnDDatabase extends Dexie {
  characters!: EntityTable<Character, 'id'>;
  homebrewPacks!: EntityTable<HomebrewPack, 'id'>;
  homebrewRules!: EntityTable<HomebrewRule, 'id'>;
  settings!: EntityTable<AppSettings, 'id'>;
  // Données de jeu
  races!: EntityTable<GameRace, 'id'>;
  classes!: EntityTable<GameClass, 'id'>;
  spells!: EntityTable<GameSpell, 'id'>;
  items!: EntityTable<GameItem, 'id'>;
  backgrounds!: EntityTable<GameBackground, 'id'>;
  feats!: EntityTable<GameFeat, 'id'>;
  dataStatus!: EntityTable<DataImportStatus, 'id'>;

  constructor() {
    super('DnDCharacterSheet');

    this.version(1).stores({
      characters: 'id, name, updatedAt',
      homebrewPacks: 'id, name, author, updatedAt',
      homebrewRules: 'id, name, category, enabled',
      settings: 'id',
    });

    // Version 2: Ajout des tables de données de jeu
    this.version(2).stores({
      characters: 'id, name, updatedAt',
      homebrewPacks: 'id, name, author, updatedAt',
      homebrewRules: 'id, name, category, enabled',
      settings: 'id',
      races: 'id, name, source',
      classes: 'id, name, source',
      spells: 'id, name, level, school, source',
      backgrounds: 'id, name, source',
      feats: 'id, name, source',
      dataStatus: 'id',
    });

    // Version 3: Ajout de la table items
    this.version(3).stores({
      characters: 'id, name, updatedAt',
      homebrewPacks: 'id, name, author, updatedAt',
      homebrewRules: 'id, name, category, enabled',
      settings: 'id',
      races: 'id, name, source',
      classes: 'id, name, source',
      spells: 'id, name, level, school, source',
      items: 'id, name, category, source, rarity',
      backgrounds: 'id, name, source',
      feats: 'id, name, source',
      dataStatus: 'id',
    });
  }
}

// Paramètres de l'application
export interface AppSettings {
  id: 'main';
  theme: 'light' | 'dark' | 'system';
  language: 'fr' | 'en';
  defaultDiceRoller: boolean;
  autoSave: boolean;
  lastOpenedCharacterId?: string;
  dataImported: boolean;
}

// Instance singleton de la base de données
export const db = new DnDDatabase();

// Paramètres par défaut
export const defaultSettings: AppSettings = {
  id: 'main',
  theme: 'dark',
  language: 'fr',
  defaultDiceRoller: true,
  autoSave: true,
  dataImported: false,
};

// Initialiser les paramètres si nécessaire
export async function initializeSettings(): Promise<AppSettings> {
  const existing = await db.settings.get('main');
  if (!existing) {
    await db.settings.add(defaultSettings);
    return defaultSettings;
  }
  return existing;
}

// Vérifier si les données sont importées
export async function isDataImported(): Promise<boolean> {
  const status = await db.dataStatus.get('status');
  return !!status;
}

// Récupérer le statut d'import
export async function getDataStatus(): Promise<DataImportStatus | undefined> {
  return db.dataStatus.get('status');
}
