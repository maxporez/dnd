import { Injectable, inject } from '@angular/core';
import { DatabaseService } from './database.service';
import type { GameRace, GameClass, GameSpell, GameItem } from '../../models/game-data.model';

@Injectable({ providedIn: 'root' })
export class GameDataService {
  private db = inject(DatabaseService);

  // Races
  async getAllRaces(): Promise<GameRace[]> {
    return this.db.races.orderBy('name').toArray();
  }

  async getRace(id: string): Promise<GameRace | undefined> {
    return this.db.races.get(id);
  }

  async saveRace(race: GameRace): Promise<void> {
    await this.db.races.put(race);
  }

  async deleteRace(id: string): Promise<void> {
    await this.db.races.delete(id);
  }

  // Classes
  async getAllClasses(): Promise<GameClass[]> {
    return this.db.classes.orderBy('name').toArray();
  }

  async getClass(id: string): Promise<GameClass | undefined> {
    return this.db.classes.get(id);
  }

  async saveClass(gameClass: GameClass): Promise<void> {
    await this.db.classes.put(gameClass);
  }

  async deleteClass(id: string): Promise<void> {
    await this.db.classes.delete(id);
  }

  // Spells
  async getAllSpells(): Promise<GameSpell[]> {
    return this.db.spells.orderBy('name').toArray();
  }

  async getSpellsByClass(className: string): Promise<GameSpell[]> {
    return this.db.spells.filter((spell) =>
      spell.classes.some((c) => c.toLowerCase() === className.toLowerCase()),
    ).toArray();
  }

  async getSpellsByLevel(level: number): Promise<GameSpell[]> {
    return this.db.spells.where('level').equals(level).toArray();
  }

  async saveSpell(spell: GameSpell): Promise<void> {
    await this.db.spells.put(spell);
  }

  async deleteSpell(id: string): Promise<void> {
    await this.db.spells.delete(id);
  }

  // Items
  async getAllItems(): Promise<GameItem[]> {
    return this.db.items.orderBy('name').toArray();
  }

  async getItemsByCategory(category: string): Promise<GameItem[]> {
    return this.db.items.where('category').equals(category).toArray();
  }

  async saveItem(item: GameItem): Promise<void> {
    await this.db.items.put(item);
  }

  async deleteItem(id: string): Promise<void> {
    await this.db.items.delete(id);
  }

  // Utility
  async getDataCounts(): Promise<{ races: number; classes: number; spells: number; items: number }> {
    const [races, classes, spells, items] = await Promise.all([
      this.db.races.count(),
      this.db.classes.count(),
      this.db.spells.count(),
      this.db.items.count(),
    ]);
    return { races, classes, spells, items };
  }

  async clearAllGameData(): Promise<void> {
    await Promise.all([
      this.db.races.clear(),
      this.db.classes.clear(),
      this.db.spells.clear(),
      this.db.items.clear(),
      this.db.backgrounds.clear(),
      this.db.feats.clear(),
      this.db.dataStatus.clear(),
    ]);
  }
}
