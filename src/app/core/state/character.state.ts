import { Injectable, inject, signal, computed } from '@angular/core';
import { CharacterService } from '../services/character.service';
import { SupabaseSyncService } from '../services/supabase-sync.service';
import { ModifierEngineService } from '../services/modifier-engine.service';
import { AuthService } from '../services/auth.service';
import type { Character, ComputedCharacter } from '../../models/character.model';

@Injectable({ providedIn: 'root' })
export class CharacterState {
  private characterService = inject(CharacterService);
  private modifierEngine = inject(ModifierEngineService);
  private supabaseSync = inject(SupabaseSyncService);
  private auth = inject(AuthService);

  // --- Signals ---

  readonly characters = signal<Character[]>([]);
  readonly currentCharacter = signal<ComputedCharacter | null>(null);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  // --- Computed ---

  readonly characterCount = computed(() => this.characters().length);
  readonly hasCharacters = computed(() => this.characters().length > 0);

  // --- Actions ---

  async loadAll(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      // Sync bidirectionnel avec Supabase en arrière-plan au démarrage
      const userId = this.auth.currentUser()?.id;
      this.supabaseSync.syncCharactersOnStartup(userId).then(async () => {
        const chars = await this.characterService.getAllCharacters();
        this.characters.set(chars);
      }).catch(console.warn);

      const chars = await this.characterService.getAllCharacters();
      this.characters.set(chars);
    } catch (e) {
      this.error.set('Erreur lors du chargement des personnages');
      console.error(e);
    } finally {
      this.loading.set(false);
    }
  }

  async loadOne(id: string): Promise<ComputedCharacter | null> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const character = await this.characterService.getCharacter(id);
      if (!character) {
        this.currentCharacter.set(null);
        this.error.set('Personnage introuvable');
        return null;
      }

      const computed = await this.computeCharacter(character);
      this.currentCharacter.set(computed);
      return computed;
    } catch (e) {
      this.error.set('Erreur lors du chargement du personnage');
      console.error(e);
      return null;
    } finally {
      this.loading.set(false);
    }
  }

  async save(id: string, updates: Partial<Character>): Promise<ComputedCharacter | null> {
    this.saving.set(true);
    this.error.set(null);
    try {
      const updated = await this.characterService.updateCharacter(id, updates);
      if (!updated) {
        this.error.set('Personnage introuvable pour la sauvegarde');
        return null;
      }

      const computed = await this.computeCharacter(updated);
      this.currentCharacter.set(computed);

      // Update the character in the list too
      this.characters.update(list =>
        list.map(c => c.id === id ? updated : c),
      );

      return computed;
    } catch (e) {
      this.error.set('Erreur lors de la sauvegarde');
      console.error(e);
      return null;
    } finally {
      this.saving.set(false);
    }
  }

  async create(data?: Partial<Character>): Promise<Character | null> {
    this.error.set(null);
    try {
      const character = await this.characterService.createCharacter(data);
      this.characters.update(list => [character, ...list]);
      return character;
    } catch (e) {
      this.error.set('Erreur lors de la création du personnage');
      console.error(e);
      return null;
    }
  }

  async remove(id: string): Promise<boolean> {
    this.error.set(null);
    try {
      const success = await this.characterService.deleteCharacter(id);
      if (success) {
        this.characters.update(list => list.filter(c => c.id !== id));
        if (this.currentCharacter()?.id === id) {
          this.currentCharacter.set(null);
        }
      }
      return success;
    } catch (e) {
      this.error.set('Erreur lors de la suppression');
      console.error(e);
      return false;
    }
  }

  async duplicate(id: string): Promise<Character | null> {
    this.error.set(null);
    try {
      const copy = await this.characterService.duplicateCharacter(id);
      if (copy) {
        this.characters.update(list => [copy, ...list]);
      }
      return copy ?? null;
    } catch (e) {
      this.error.set('Erreur lors de la duplication');
      console.error(e);
      return null;
    }
  }

  async importFromJson(json: string): Promise<Character | null> {
    this.error.set(null);
    try {
      const character = await this.characterService.importCharacterFromJson(json);
      this.characters.update(list => [character, ...list]);
      return character;
    } catch (e) {
      this.error.set('Erreur lors de l\'import du personnage');
      console.error(e);
      return null;
    }
  }

  clearCurrent(): void {
    this.currentCharacter.set(null);
  }

  // --- Internal ---

  private async computeCharacter(character: Character): Promise<ComputedCharacter> {
    return this.modifierEngine.computeCharacterStats(character);
  }
}
