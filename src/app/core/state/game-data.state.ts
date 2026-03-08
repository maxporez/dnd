import { Injectable, inject, signal, computed } from '@angular/core';
import { GameDataService } from '../services/game-data.service';
import { DataImportService } from '../services/data-import.service';
import { DatabaseService } from '../services/database.service';
import { SupabaseSyncService } from '../services/supabase-sync.service';
import type { GameRace, GameClass, GameSpell, GameItem, DataImportStatus } from '../../models/game-data.model';

@Injectable({ providedIn: 'root' })
export class GameDataState {
  private gameDataService = inject(GameDataService);
  private dataImportService = inject(DataImportService);
  private supabaseSync = inject(SupabaseSyncService);
  private db = inject(DatabaseService);

  // --- Signals ---

  readonly races = signal<GameRace[]>([]);
  readonly classes = signal<GameClass[]>([]);
  readonly spells = signal<GameSpell[]>([]);
  readonly items = signal<GameItem[]>([]);
  readonly isLoading = signal(false);
  readonly isImporting = signal(false);
  readonly importProgress = signal(0);
  readonly importMessage = signal('');
  readonly importStatus = signal<DataImportStatus | null>(null);
  readonly error = signal<string | null>(null);

  // --- Computed ---

  readonly hasData = computed(() =>
    this.races().length > 0 || this.classes().length > 0 ||
    this.spells().length > 0 || this.items().length > 0,
  );

  readonly dataCounts = computed(() => ({
    races: this.races().length,
    classes: this.classes().length,
    spells: this.spells().length,
    items: this.items().length,
  }));

  readonly herbs = computed(() =>
    this.items().filter(item => item.category === 'herb'),
  );

  // --- Actions ---

  async loadAll(): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);
    try {
      // Si l'IDB local est vide, tente de charger depuis Supabase
      await this.supabaseSync.loadGameDataIfEmpty();

      const [races, classes, spells, items, status] = await Promise.all([
        this.gameDataService.getAllRaces(),
        this.gameDataService.getAllClasses(),
        this.gameDataService.getAllSpells(),
        this.gameDataService.getAllItems(),
        this.db.getDataStatus(),
      ]);

      this.races.set(races);
      this.classes.set(classes);
      this.spells.set(spells);
      this.items.set(items);
      this.importStatus.set(status ?? null);
    } catch (e) {
      this.error.set('Erreur lors du chargement des données de jeu');
      console.error(e);
    } finally {
      this.isLoading.set(false);
    }
  }

  async importSrdData(): Promise<DataImportStatus | null> {
    this.isImporting.set(true);
    this.importProgress.set(0);
    this.importMessage.set('Démarrage de l\'import...');
    this.error.set(null);

    try {
      const status = await this.dataImportService.importAllData((msg, progress) => {
        this.importMessage.set(msg);
        this.importProgress.set(progress);
      });

      this.importStatus.set(status);

      // Reload data after import
      await this.loadAll();
      return status;
    } catch (e) {
      this.error.set('Erreur lors de l\'import des données SRD');
      console.error(e);
      return null;
    } finally {
      this.isImporting.set(false);
    }
  }

  async importHerbs(): Promise<number> {
    this.error.set(null);
    try {
      const count = await this.dataImportService.importHerbs();
      // Reload items to include herbs
      const items = await this.gameDataService.getAllItems();
      this.items.set(items);
      return count;
    } catch (e) {
      this.error.set('Erreur lors de l\'import des herbes');
      console.error(e);
      return 0;
    }
  }

  async clearAllData(): Promise<void> {
    this.error.set(null);
    try {
      await this.gameDataService.clearAllGameData();
      this.races.set([]);
      this.classes.set([]);
      this.spells.set([]);
      this.items.set([]);
      this.importStatus.set(null);
    } catch (e) {
      this.error.set('Erreur lors de la suppression des données');
      console.error(e);
    }
  }

  // --- Getters ---

  getSpellsByClass(className: string): GameSpell[] {
    return this.spells().filter(s =>
      s.classes.some(c => c.toLowerCase() === className.toLowerCase()),
    );
  }

  getSpellsByLevel(level: number): GameSpell[] {
    return this.spells().filter(s => s.level === level);
  }

  getItemsByCategory(category: string): GameItem[] {
    return this.items().filter(i => i.category === category);
  }
}
