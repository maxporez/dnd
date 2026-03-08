import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import type { GameRace, GameClass, GameSpell, GameItem, GameBackground, GameFeat, DataImportStatus } from '../../models/game-data.model';
import type { Character } from '../../models/character.model';
import type { HomebrewPack, HomebrewRule } from '../../models/rules.model';

// ============================================================
// Row types (colonnes plates + data JSONB)
// ============================================================

interface GameDataRow<T> {
  id: string;
  name: string;
  source: string;
  is_homebrew: boolean;
  data: T;
  updated_at?: string;
}

interface SpellRow extends GameDataRow<GameSpell> {
  level: number;
  school: string | null;
}

interface ItemRow extends GameDataRow<GameItem> {
  category: string | null;
  rarity: string | null;
}

interface CharacterRow {
  id: string;
  user_id: string | null;
  name: string;
  race_name: string | null;
  level: number | null;
  updated_at: string;
  created_at: string;
  data: Character;
}

interface ImportStatusRow {
  id: string;
  version: string | null;
  last_import: string | null;
  races_count: number;
  classes_count: number;
  spells_count: number;
  items_count: number;
  backgrounds_count: number;
  feats_count: number;
}

// ============================================================
// Service
// ============================================================

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private client: SupabaseClient;

  constructor() {
    this.client = createClient(
      environment.supabase.url,
      environment.supabase.anonKey,
    );
  }

  get supabase(): SupabaseClient {
    return this.client;
  }

  get isConfigured(): boolean {
    return (
      environment.supabase.url !== 'YOUR_SUPABASE_URL' &&
      environment.supabase.anonKey !== 'YOUR_SUPABASE_ANON_KEY'
    );
  }

  // ============================================================
  // GAME DATA — Races
  // ============================================================

  async fetchRaces(): Promise<GameRace[]> {
    const { data, error } = await this.client
      .from('races')
      .select('data')
      .order('name');
    if (error) throw error;
    return (data as { data: GameRace }[]).map(r => r.data);
  }

  async upsertRaces(races: GameRace[]): Promise<void> {
    const rows: GameDataRow<GameRace>[] = races.map(r => ({
      id: r.id,
      name: r.name,
      source: r.source,
      is_homebrew: false,
      data: r,
    }));
    const { error } = await this.client.from('races').upsert(rows, { onConflict: 'id' });
    if (error) throw error;
  }

  // ============================================================
  // GAME DATA — Classes
  // ============================================================

  async fetchClasses(): Promise<GameClass[]> {
    const { data, error } = await this.client
      .from('classes')
      .select('data')
      .order('name');
    if (error) throw error;
    return (data as { data: GameClass }[]).map(r => r.data);
  }

  async upsertClasses(classes: GameClass[]): Promise<void> {
    const rows: GameDataRow<GameClass>[] = classes.map(c => ({
      id: c.id,
      name: c.name,
      source: c.source,
      is_homebrew: false,
      data: c,
    }));
    const { error } = await this.client.from('classes').upsert(rows, { onConflict: 'id' });
    if (error) throw error;
  }

  // ============================================================
  // GAME DATA — Spells
  // ============================================================

  async fetchSpells(): Promise<GameSpell[]> {
    const { data, error } = await this.client
      .from('spells')
      .select('data')
      .order('name');
    if (error) throw error;
    return (data as { data: GameSpell }[]).map(r => r.data);
  }

  async fetchSpellsByLevel(level: number): Promise<GameSpell[]> {
    const { data, error } = await this.client
      .from('spells')
      .select('data')
      .eq('level', level)
      .order('name');
    if (error) throw error;
    return (data as { data: GameSpell }[]).map(r => r.data);
  }

  async upsertSpells(spells: GameSpell[]): Promise<void> {
    // Supabase upsert en batches de 500 pour ne pas dépasser les limites
    const batchSize = 500;
    for (let i = 0; i < spells.length; i += batchSize) {
      const batch = spells.slice(i, i + batchSize);
      const rows: SpellRow[] = batch.map(s => ({
        id: s.id,
        name: s.name,
        level: s.level,
        school: s.school ?? null,
        source: s.source,
        is_homebrew: false,
        data: s,
      }));
      const { error } = await this.client.from('spells').upsert(rows, { onConflict: 'id' });
      if (error) throw error;
    }
  }

  // ============================================================
  // GAME DATA — Items
  // ============================================================

  async fetchItems(): Promise<GameItem[]> {
    const { data, error } = await this.client
      .from('items')
      .select('data')
      .order('name');
    if (error) throw error;
    return (data as { data: GameItem }[]).map(r => r.data);
  }

  async fetchItemsByCategory(category: string): Promise<GameItem[]> {
    const { data, error } = await this.client
      .from('items')
      .select('data')
      .eq('category', category)
      .order('name');
    if (error) throw error;
    return (data as { data: GameItem }[]).map(r => r.data);
  }

  async upsertItems(items: GameItem[]): Promise<void> {
    const batchSize = 500;
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const rows: ItemRow[] = batch.map(item => ({
        id: item.id,
        name: item.name,
        category: item.category ?? null,
        rarity: item.rarity ?? null,
        source: item.source,
        is_homebrew: false,
        data: item,
      }));
      const { error } = await this.client.from('items').upsert(rows, { onConflict: 'id' });
      if (error) throw error;
    }
  }

  // ============================================================
  // GAME DATA — Backgrounds & Feats
  // ============================================================

  async fetchBackgrounds(): Promise<GameBackground[]> {
    const { data, error } = await this.client
      .from('backgrounds')
      .select('data')
      .order('name');
    if (error) throw error;
    return (data as { data: GameBackground }[]).map(r => r.data);
  }

  async upsertBackgrounds(backgrounds: GameBackground[]): Promise<void> {
    const rows = backgrounds.map(b => ({ id: b.id, name: b.name, source: b.source, is_homebrew: false, data: b }));
    const { error } = await this.client.from('backgrounds').upsert(rows, { onConflict: 'id' });
    if (error) throw error;
  }

  async fetchFeats(): Promise<GameFeat[]> {
    const { data, error } = await this.client
      .from('feats')
      .select('data')
      .order('name');
    if (error) throw error;
    return (data as { data: GameFeat }[]).map(r => r.data);
  }

  async upsertFeats(feats: GameFeat[]): Promise<void> {
    const rows = feats.map(f => ({ id: f.id, name: f.name, source: f.source, is_homebrew: false, data: f }));
    const { error } = await this.client.from('feats').upsert(rows, { onConflict: 'id' });
    if (error) throw error;
  }

  // ============================================================
  // CHARACTERS
  // ============================================================

  async fetchCharacters(userId?: string): Promise<Character[]> {
    let query = this.client.from('characters').select('data').order('updated_at', { ascending: false });
    if (userId) query = query.eq('user_id', userId);
    const { data, error } = await query;
    if (error) throw error;
    return (data as { data: Character }[]).map(r => r.data);
  }

  async upsertCharacter(character: Character, userId?: string): Promise<void> {
    const totalLevel = character.classes.reduce((sum, c) => sum + c.level, 0);
    const row: CharacterRow = {
      id: character.id,
      user_id: userId ?? null,
      name: character.name,
      race_name: character.race.raceName ?? null,
      level: totalLevel,
      updated_at: character.updatedAt,
      created_at: character.createdAt,
      data: character,
    };
    const { error } = await this.client.from('characters').upsert(row, { onConflict: 'id' });
    if (error) throw error;
  }

  async deleteCharacter(id: string): Promise<void> {
    const { error } = await this.client.from('characters').delete().eq('id', id);
    if (error) throw error;
  }

  // ============================================================
  // HOMEBREW
  // ============================================================

  async fetchHomebrewPacks(userId?: string): Promise<HomebrewPack[]> {
    let query = this.client.from('homebrew_packs').select('data').order('updated_at', { ascending: false });
    if (userId) query = query.eq('user_id', userId);
    const { data, error } = await query;
    if (error) throw error;
    return (data as { data: HomebrewPack }[]).map(r => r.data);
  }

  async upsertHomebrewPack(pack: HomebrewPack, userId?: string): Promise<void> {
    const { error } = await this.client.from('homebrew_packs').upsert({
      id: pack.id,
      user_id: userId ?? null,
      name: pack.name,
      author: pack.author ?? null,
      version: pack.version ?? null,
      data: pack,
    }, { onConflict: 'id' });
    if (error) throw error;
  }

  async deleteHomebrewPack(id: string): Promise<void> {
    const { error } = await this.client.from('homebrew_packs').delete().eq('id', id);
    if (error) throw error;
  }

  // ============================================================
  // IMPORT STATUS
  // ============================================================

  async fetchImportStatus(): Promise<DataImportStatus | null> {
    const { data, error } = await this.client
      .from('import_status')
      .select('*')
      .eq('id', 'status')
      .single();
    if (error) return null;
    const row = data as ImportStatusRow;
    return {
      id: 'status',
      version: row.version ?? '0',
      lastImport: row.last_import ?? '',
      racesCount: row.races_count,
      classesCount: row.classes_count,
      spellsCount: row.spells_count,
      itemsCount: row.items_count,
      backgroundsCount: row.backgrounds_count,
      featsCount: row.feats_count,
    };
  }

  async upsertImportStatus(status: DataImportStatus): Promise<void> {
    const { error } = await this.client.from('import_status').upsert({
      id: 'status',
      version: status.version,
      last_import: status.lastImport,
      races_count: status.racesCount,
      classes_count: status.classesCount,
      spells_count: status.spellsCount,
      items_count: status.itemsCount,
      backgrounds_count: status.backgroundsCount,
      feats_count: status.featsCount,
    }, { onConflict: 'id' });
    if (error) throw error;
  }

  // ============================================================
  // HEALTH CHECK
  // ============================================================

  async ping(): Promise<boolean> {
    try {
      const { error } = await this.client.from('import_status').select('id').limit(1);
      return !error;
    } catch {
      return false;
    }
  }
}
