import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { GameDataState } from '../../core/state/game-data.state';
import { GameDataService } from '../../core/services/game-data.service';
import { SCHOOL_LABELS, CATEGORY_LABELS } from '../../data/labels.data';
import { GameDataEditorDialogComponent, type GameDataEditorDialogData } from './dialogs/game-data-editor-dialog.component';
import { ConfirmDialogComponent, type ConfirmDialogData } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import type { GameRace, GameClass, GameSpell, GameItem } from '../../models/game-data.model';
import { BackButtonComponent } from '../../shared/components/back-button/back-button.component';

@Component({
  selector: 'app-homebrew',
  imports: [
    FormsModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatBadgeModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule,
    BackButtonComponent,
  ],
  templateUrl: './homebrew.component.html',
  styleUrl: './homebrew.component.scss',
})
export class HomebrewComponent implements OnInit {
  private gameDataState = inject(GameDataState);
  private gameDataService = inject(GameDataService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  // Local state
  readonly searchQuery = signal('');
  readonly isImportingHerbs = signal(false);

  // Proxied signals from state
  readonly races = this.gameDataState.races;
  readonly classes = this.gameDataState.classes;
  readonly spells = this.gameDataState.spells;
  readonly items = this.gameDataState.items;
  readonly isLoading = this.gameDataState.isLoading;

  // Labels
  readonly schoolLabels = SCHOOL_LABELS;
  readonly categoryLabels = CATEGORY_LABELS;

  // Filtered computed signals
  readonly filteredRaces = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.races();
    return this.races().filter(r =>
      r.name.toLowerCase().includes(query) ||
      r.source.toLowerCase().includes(query),
    );
  });

  readonly filteredClasses = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.classes();
    return this.classes().filter(c =>
      c.name.toLowerCase().includes(query) ||
      c.source.toLowerCase().includes(query),
    );
  });

  readonly filteredSpells = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.spells();
    return this.spells().filter(s =>
      s.name.toLowerCase().includes(query) ||
      s.source.toLowerCase().includes(query) ||
      s.school.toLowerCase().includes(query),
    );
  });

  readonly filteredItems = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.items();
    return this.items().filter(i =>
      i.name.toLowerCase().includes(query) ||
      i.source.toLowerCase().includes(query) ||
      i.category.toLowerCase().includes(query),
    );
  });

  ngOnInit(): void {
    this.gameDataState.loadAll();
  }

  onSearchChange(value: string): void {
    this.searchQuery.set(value);
  }

  // --- Race actions ---

  openRaceEditor(race?: GameRace): void {
    const data: GameDataEditorDialogData = {
      type: 'race',
      item: race ?? this.createDefaultRace(),
      isNew: !race,
    };
    this.openEditor(data);
  }

  // --- Class actions ---

  openClassEditor(gameClass?: GameClass): void {
    const data: GameDataEditorDialogData = {
      type: 'class',
      item: gameClass ?? this.createDefaultClass(),
      isNew: !gameClass,
    };
    this.openEditor(data);
  }

  // --- Spell actions ---

  openSpellEditor(spell?: GameSpell): void {
    const data: GameDataEditorDialogData = {
      type: 'spell',
      item: spell ?? this.createDefaultSpell(),
      isNew: !spell,
    };
    this.openEditor(data);
  }

  // --- Item actions ---

  openItemEditor(item?: GameItem): void {
    const data: GameDataEditorDialogData = {
      type: 'item',
      item: item ?? this.createDefaultItem(),
      isNew: !item,
    };
    this.openEditor(data);
  }

  async importHerbs(): Promise<void> {
    this.isImportingHerbs.set(true);
    try {
      const count = await this.gameDataState.importHerbs();
      this.snackBar.open(`${count} herbes importees depuis AideDD`, 'OK', { duration: 3000 });
    } catch {
      this.snackBar.open('Erreur lors de l\'import des herbes', 'OK', { duration: 3000 });
    } finally {
      this.isImportingHerbs.set(false);
    }
  }

  // --- Helpers ---

  getSchoolLabel(school: string): string {
    return this.schoolLabels[school] ?? school;
  }

  getCategoryLabel(category: string): string {
    return this.categoryLabels[category] ?? category;
  }

  getSpellLevelLabel(level: number): string {
    return level === 0 ? 'Tour de magie' : `Niveau ${level}`;
  }

  getAbilityBonusSummary(bonuses: { ability: string; bonus: number }[]): string {
    return bonuses.map(b => `${b.ability.toUpperCase()} +${b.bonus}`).join(', ');
  }

  // --- Private ---

  private openEditor(data: GameDataEditorDialogData): void {
    const dialogRef = this.dialog.open(GameDataEditorDialogComponent, {
      data,
      width: '600px',
      maxWidth: '95vw',
      maxHeight: '90vh',
    });

    dialogRef.afterClosed().subscribe(async (result: { action: 'save' | 'delete'; item: any } | undefined) => {
      if (!result) return;

      try {
        if (result.action === 'delete') {
          await this.handleDelete(data.type, result.item.id);
        } else if (result.action === 'save') {
          await this.handleSave(data.type, result.item);
        }
        await this.gameDataState.loadAll();
      } catch {
        this.snackBar.open('Erreur lors de la sauvegarde', 'OK', { duration: 3000 });
      }
    });
  }

  private async handleSave(type: string, item: any): Promise<void> {
    switch (type) {
      case 'race':
        await this.gameDataService.saveRace(item);
        this.snackBar.open(`Race "${item.name}" sauvegardee`, 'OK', { duration: 2000 });
        break;
      case 'class':
        await this.gameDataService.saveClass(item);
        this.snackBar.open(`Classe "${item.name}" sauvegardee`, 'OK', { duration: 2000 });
        break;
      case 'spell':
        await this.gameDataService.saveSpell(item);
        this.snackBar.open(`Sort "${item.name}" sauvegarde`, 'OK', { duration: 2000 });
        break;
      case 'item':
        await this.gameDataService.saveItem(item);
        this.snackBar.open(`Objet "${item.name}" sauvegarde`, 'OK', { duration: 2000 });
        break;
    }
  }

  private async handleDelete(type: string, id: string): Promise<void> {
    const confirmRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Supprimer',
        message: 'Voulez-vous vraiment supprimer cet element ?',
        confirmText: 'Supprimer',
        warn: true,
      } as ConfirmDialogData,
    });

    const confirmed = await new Promise<boolean>(resolve => {
      confirmRef.afterClosed().subscribe(result => resolve(!!result));
    });

    if (!confirmed) return;

    switch (type) {
      case 'race':
        await this.gameDataService.deleteRace(id);
        this.snackBar.open('Race supprimee', 'OK', { duration: 2000 });
        break;
      case 'class':
        await this.gameDataService.deleteClass(id);
        this.snackBar.open('Classe supprimee', 'OK', { duration: 2000 });
        break;
      case 'spell':
        await this.gameDataService.deleteSpell(id);
        this.snackBar.open('Sort supprime', 'OK', { duration: 2000 });
        break;
      case 'item':
        await this.gameDataService.deleteItem(id);
        this.snackBar.open('Objet supprime', 'OK', { duration: 2000 });
        break;
    }
  }

  private createDefaultRace(): GameRace {
    return {
      id: crypto.randomUUID().replace(/-/g, ''),
      name: '',
      source: 'Homebrew',
      speed: 30,
      size: 'Medium',
      abilityBonuses: [],
      traits: [],
      languages: ['Commun'],
      description: '',
    };
  }

  private createDefaultClass(): GameClass {
    return {
      id: crypto.randomUUID().replace(/-/g, ''),
      name: '',
      source: 'Homebrew',
      hitDie: 8,
      primaryAbility: [],
      savingThrows: [],
      skillChoices: { count: 2, from: [] },
      armorProficiencies: [],
      weaponProficiencies: [],
      description: '',
    };
  }

  private createDefaultSpell(): GameSpell {
    return {
      id: crypto.randomUUID().replace(/-/g, ''),
      name: '',
      level: 0,
      school: 'evocation',
      castingTime: '1 action',
      range: '18 metres',
      components: { verbal: true, somatic: false },
      duration: 'Instantanee',
      description: '',
      classes: [],
      source: 'Homebrew',
    };
  }

  private createDefaultItem(): GameItem {
    return {
      id: crypto.randomUUID().replace(/-/g, ''),
      name: '',
      source: 'Homebrew',
      category: 'adventuring-gear',
      description: '',
    };
  }
}
