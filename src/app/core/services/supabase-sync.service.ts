import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { DatabaseService } from './database.service';
import type { Character } from '../../models/character.model';
import type { HomebrewPack } from '../../models/rules.model';
import type { GameRace, GameClass, GameSpell, GameItem, DataImportStatus } from '../../models/game-data.model';

/**
 * SupabaseSyncService
 *
 * Stratégie offline-first :
 * - L'IDB (Dexie) est toujours la source locale (lecture rapide, offline)
 * - Supabase est la source cloud (partage multi-appareils)
 *
 * Game data (races/classes/spells/items) :
 *   - Au démarrage, si IDB vide → fetch Supabase → cache IDB
 *   - Après import SRD → écrit dans IDB ET Supabase
 *
 * Characters & Homebrew :
 *   - Sauvegarde locale IDB immédiate
 *   - Sync Supabase en arrière-plan (best-effort, sans bloquer l'UI)
 *   - Au démarrage, merge Supabase → IDB (les plus récents gagnent)
 */
@Injectable({ providedIn: 'root' })
export class SupabaseSyncService {
  private supabase = inject(SupabaseService);
  private db = inject(DatabaseService);

  // ============================================================
  // GAME DATA — Load depuis Supabase si IDB vide
  // ============================================================

  async loadGameDataIfEmpty(): Promise<boolean> {
    if (!this.supabase.isConfigured) return false;

    const [racesCount, spellsCount] = await Promise.all([
      this.db.races.count(),
      this.db.spells.count(),
    ]);

    if (racesCount > 0 && spellsCount > 0) return false; // IDB déjà rempli

    console.log('[SupabaseSync] IDB vide, chargement depuis Supabase...');

    try {
      const [races, classes, spells, items] = await Promise.all([
        this.supabase.fetchRaces(),
        this.supabase.fetchClasses(),
        this.supabase.fetchSpells(),
        this.supabase.fetchItems(),
      ]);

      if (races.length === 0 && spells.length === 0) return false; // Supabase aussi vide

      await Promise.all([
        races.length > 0 ? this.db.races.bulkPut(races) : Promise.resolve(),
        classes.length > 0 ? this.db.classes.bulkPut(classes) : Promise.resolve(),
        spells.length > 0 ? this.db.spells.bulkPut(spells) : Promise.resolve(),
        items.length > 0 ? this.db.items.bulkPut(items) : Promise.resolve(),
      ]);

      console.log(`[SupabaseSync] Chargé: ${races.length} races, ${classes.length} classes, ${spells.length} sorts, ${items.length} objets`);
      return true;
    } catch (err) {
      console.warn('[SupabaseSync] Erreur lors du chargement depuis Supabase:', err);
      return false;
    }
  }

  // ============================================================
  // GAME DATA — Push vers Supabase après import SRD
  // ============================================================

  async pushGameDataToSupabase(
    races: GameRace[],
    classes: GameClass[],
    spells: GameSpell[],
    items: GameItem[],
    status: DataImportStatus,
    onProgress?: (msg: string) => void,
  ): Promise<void> {
    if (!this.supabase.isConfigured) return;

    try {
      onProgress?.('Sync Supabase: races...');
      await this.supabase.upsertRaces(races);

      onProgress?.('Sync Supabase: classes...');
      await this.supabase.upsertClasses(classes);

      onProgress?.('Sync Supabase: sorts...');
      await this.supabase.upsertSpells(spells);

      onProgress?.('Sync Supabase: objets...');
      await this.supabase.upsertItems(items);

      onProgress?.('Sync Supabase: statut...');
      await this.supabase.upsertImportStatus(status);

      console.log('[SupabaseSync] Game data synchronisé avec Supabase');
    } catch (err) {
      console.warn('[SupabaseSync] Erreur sync game data vers Supabase:', err);
      // Ne pas propager — l'IDB local est déjà à jour
    }
  }

  // ============================================================
  // CHARACTERS — Sync bidirectionnel au démarrage
  // ============================================================

  async syncCharactersOnStartup(userId?: string): Promise<void> {
    if (!this.supabase.isConfigured) return;

    try {
      const [localChars, remoteChars] = await Promise.all([
        this.db.characters.toArray(),
        this.supabase.fetchCharacters(userId),
      ]);

      // Merge: le plus récent (updatedAt) gagne
      const localMap = new Map(localChars.map(c => [c.id, c]));
      const remoteMap = new Map(remoteChars.map(c => [c.id, c]));

      const toWriteLocal: Character[] = [];
      const toWriteRemote: Character[] = [];

      // Remote → local si plus récent ou absent
      for (const remote of remoteChars) {
        const local = localMap.get(remote.id);
        if (!local || new Date(remote.updatedAt) > new Date(local.updatedAt)) {
          toWriteLocal.push(remote);
        }
      }

      // Local → remote si plus récent ou absent
      for (const local of localChars) {
        const remote = remoteMap.get(local.id);
        if (!remote || new Date(local.updatedAt) > new Date(remote.updatedAt)) {
          toWriteRemote.push(local);
        }
      }

      if (toWriteLocal.length > 0) {
        await this.db.characters.bulkPut(toWriteLocal);
        console.log(`[SupabaseSync] ${toWriteLocal.length} personnage(s) mis à jour depuis Supabase`);
      }

      if (toWriteRemote.length > 0) {
        await Promise.all(
          toWriteRemote.map(c => this.supabase.upsertCharacter(c, userId)),
        );
        console.log(`[SupabaseSync] ${toWriteRemote.length} personnage(s) poussés vers Supabase`);
      }
    } catch (err) {
      console.warn('[SupabaseSync] Erreur sync personnages:', err);
    }
  }

  // ============================================================
  // CHARACTER — Push en arrière-plan après chaque sauvegarde
  // ============================================================

  pushCharacterBackground(character: Character, userId?: string): void {
    if (!this.supabase.isConfigured) return;
    this.supabase.upsertCharacter(character, userId).catch(err => {
      console.warn('[SupabaseSync] Erreur push personnage:', err);
    });
  }

  deleteCharacterBackground(id: string): void {
    if (!this.supabase.isConfigured) return;
    this.supabase.deleteCharacter(id).catch(err => {
      console.warn('[SupabaseSync] Erreur suppression personnage:', err);
    });
  }

  // ============================================================
  // HOMEBREW — Sync bidirectionnel au démarrage
  // ============================================================

  async syncHomebrewOnStartup(userId?: string): Promise<void> {
    if (!this.supabase.isConfigured) return;

    try {
      const [localPacks, remotePacks] = await Promise.all([
        this.db.homebrewPacks.toArray(),
        this.supabase.fetchHomebrewPacks(userId),
      ]);

      const localMap = new Map(localPacks.map(p => [p.id, p]));
      const toWriteLocal: HomebrewPack[] = [];
      const toWriteRemote: HomebrewPack[] = [];

      for (const remote of remotePacks) {
        const local = localMap.get(remote.id);
        if (!local || new Date(remote.updatedAt) > new Date(local.updatedAt)) {
          toWriteLocal.push(remote);
        }
      }

      const remoteMap = new Map(remotePacks.map(p => [p.id, p]));
      for (const local of localPacks) {
        const remote = remoteMap.get(local.id);
        if (!remote || new Date(local.updatedAt) > new Date(remote.updatedAt)) {
          toWriteRemote.push(local);
        }
      }

      if (toWriteLocal.length > 0) await this.db.homebrewPacks.bulkPut(toWriteLocal);
      if (toWriteRemote.length > 0) {
        await Promise.all(toWriteRemote.map(p => this.supabase.upsertHomebrewPack(p, userId)));
      }
    } catch (err) {
      console.warn('[SupabaseSync] Erreur sync homebrew:', err);
    }
  }

  pushHomebrewBackground(pack: HomebrewPack, userId?: string): void {
    if (!this.supabase.isConfigured) return;
    this.supabase.upsertHomebrewPack(pack, userId).catch(err => {
      console.warn('[SupabaseSync] Erreur push homebrew:', err);
    });
  }

  deleteHomebrewBackground(id: string): void {
    if (!this.supabase.isConfigured) return;
    this.supabase.deleteHomebrewPack(id).catch(err => {
      console.warn('[SupabaseSync] Erreur suppression homebrew:', err);
    });
  }
}
