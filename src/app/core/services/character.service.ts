import { Injectable, inject } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
import { DatabaseService } from './database.service';
import { SupabaseSyncService } from './supabase-sync.service';
import { createEmptyCharacter } from '../../models/character.model';
import type { Character } from '../../models/character.model';

@Injectable({ providedIn: 'root' })
export class CharacterService {
  private db = inject(DatabaseService);
  private supabaseSync = inject(SupabaseSyncService);

  async createCharacter(data: Partial<Omit<Character, 'id' | 'createdAt' | 'updatedAt' | 'version'>> = {}): Promise<Character> {
    const now = new Date().toISOString();
    const character: Character = {
      ...createEmptyCharacter(),
      ...data,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
      version: 1,
    };
    await this.db.characters.add(character);
    this.supabaseSync.pushCharacterBackground(character);
    return character;
  }

  async getAllCharacters(): Promise<Character[]> {
    return this.db.characters.orderBy('updatedAt').reverse().toArray();
  }

  async getCharacter(id: string): Promise<Character | undefined> {
    return this.db.characters.get(id);
  }

  async updateCharacter(id: string, updates: Partial<Omit<Character, 'id' | 'createdAt'>>): Promise<Character | undefined> {
    const character = await this.db.characters.get(id);
    if (!character) return undefined;

    const updated: Character = {
      ...character,
      ...updates,
      updatedAt: new Date().toISOString(),
      version: character.version + 1,
    };
    await this.db.characters.put(updated);
    this.supabaseSync.pushCharacterBackground(updated);
    return updated;
  }

  async deleteCharacter(id: string): Promise<boolean> {
    const character = await this.db.characters.get(id);
    if (!character) return false;
    await this.db.characters.delete(id);
    this.supabaseSync.deleteCharacterBackground(id);
    return true;
  }

  async duplicateCharacter(id: string): Promise<Character | undefined> {
    const original = await this.db.characters.get(id);
    if (!original) return undefined;

    const now = new Date().toISOString();
    const duplicate: Character = {
      ...original,
      id: uuidv4(),
      name: `${original.name} (copie)`,
      createdAt: now,
      updatedAt: now,
      version: 1,
    };
    await this.db.characters.add(duplicate);
    this.supabaseSync.pushCharacterBackground(duplicate);
    return duplicate;
  }

  exportCharacterToJson(character: Character): string {
    return JSON.stringify(character, null, 2);
  }

  async importCharacterFromJson(json: string): Promise<Character> {
    const data = JSON.parse(json) as Character;
    const now = new Date().toISOString();
    const character: Character = {
      ...data,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
      version: 1,
    };
    await this.db.characters.add(character);
    this.supabaseSync.pushCharacterBackground(character);
    return character;
  }

  async searchCharacters(query: string): Promise<Character[]> {
    const lowerQuery = query.toLowerCase();
    const all = await this.db.characters.toArray();
    return all.filter(
      (c) =>
        c.name.toLowerCase().includes(lowerQuery) ||
        c.race.raceName.toLowerCase().includes(lowerQuery) ||
        c.classes.some((cl) => cl.className.toLowerCase().includes(lowerQuery)),
    );
  }
}
