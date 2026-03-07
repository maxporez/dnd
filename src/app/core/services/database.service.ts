import { Injectable } from '@angular/core';
import Dexie, { type EntityTable } from 'dexie';
import type { Character } from '../../models/character.model';
import type { HomebrewPack, HomebrewRule } from '../../models/rules.model';
import type {
  GameRace, GameClass, GameSpell, GameItem,
  GameBackground, GameFeat, DataImportStatus, AppSettings,
} from '../../models/game-data.model';

@Injectable({ providedIn: 'root' })
export class DatabaseService extends Dexie {
  characters!: EntityTable<Character, 'id'>;
  homebrewPacks!: EntityTable<HomebrewPack, 'id'>;
  homebrewRules!: EntityTable<HomebrewRule, 'id'>;
  settings!: EntityTable<AppSettings, 'id'>;
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

  async isDataImported(): Promise<boolean> {
    const status = await this.dataStatus.get('status');
    return !!status;
  }

  async getDataStatus(): Promise<DataImportStatus | undefined> {
    return this.dataStatus.get('status');
  }

  async initializeSettings(): Promise<AppSettings> {
    const existing = await this.settings.get('main');
    if (!existing) {
      const defaults: AppSettings = {
        id: 'main',
        theme: 'dark',
        language: 'fr',
        defaultDiceRoller: true,
        autoSave: true,
        dataImported: false,
      };
      await this.settings.add(defaults);
      return defaults;
    }
    return existing;
  }
}
