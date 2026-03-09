import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { GameDataState } from '../../../../core/state/game-data.state';
import { GameDataService } from '../../../../core/services/game-data.service';
import { CATEGORY_LABELS } from '../../../../data/labels.data';
import { GameDataEditorDialogComponent, type GameDataEditorDialogData } from '../../dialogs/game-data-editor-dialog.component';
import { ConfirmDialogComponent, type ConfirmDialogData } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import type { GameItem } from '../../../../models/game-data.model';
import { BackButtonComponent } from '../../../../shared/components/back-button/back-button.component';

@Component({
  selector: 'app-objets',
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDialogModule,
    MatSnackBarModule,
    BackButtonComponent,
  ],
  templateUrl: './objets.component.html',
  styleUrl: './objets.component.scss',
})
export class ObjetsComponent implements OnInit {
  private gameDataState = inject(GameDataState);
  private gameDataService = inject(GameDataService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  readonly searchQuery = signal('');
  readonly categoryFilter = signal('');
  readonly rarityFilter = signal<string | null>(null);
  readonly isImportingHerbs = signal(false);
  readonly isLoading = this.gameDataState.isLoading;

  readonly categoryLabels = CATEGORY_LABELS;

  readonly itemCategories = [
    { id: 'weapon', label: 'Arme' },
    { id: 'armor', label: 'Armure' },
    { id: 'adventuring-gear', label: 'Équipement' },
    { id: 'tool', label: 'Outil' },
    { id: 'magic-item', label: 'Objet magique' },
    { id: 'consumable', label: 'Consommable' },
    { id: 'herb', label: 'Herbe' },
  ] as const;

  readonly itemRarities = [
    { id: '', label: 'Commun' },
    { id: 'Uncommon', label: 'Peu commun' },
    { id: 'Rare', label: 'Rare' },
    { id: 'Very Rare', label: 'Très rare' },
    { id: 'Legendary', label: 'Légendaire' },
  ] as const;

  readonly filteredItems = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const category = this.categoryFilter();
    const rarity = this.rarityFilter();

    return this.gameDataState.items().filter(i => {
      if (query && !(
        i.name.toLowerCase().includes(query) ||
        i.source.toLowerCase().includes(query) ||
        i.category.toLowerCase().includes(query)
      )) return false;
      if (category && i.category !== category) return false;
      if (rarity !== null && (i.rarity ?? '') !== rarity) return false;
      return true;
    });
  });

  ngOnInit(): void {
    this.gameDataState.loadAll();
  }

  onSearchChange(value: string): void {
    this.searchQuery.set(value);
  }

  toggleCategory(categoryId: string): void {
    this.categoryFilter.set(this.categoryFilter() === categoryId ? '' : categoryId);
  }

  toggleRarity(rarityId: string): void {
    this.rarityFilter.set(this.rarityFilter() === rarityId ? null : rarityId);
  }

  getCategoryLabel(category: string): string {
    return this.categoryLabels[category] ?? category;
  }

  async importHerbs(): Promise<void> {
    this.isImportingHerbs.set(true);
    try {
      const count = await this.gameDataState.importHerbs();
      this.snackBar.open(`${count} herbes importées depuis AideDD`, 'OK', { duration: 3000 });
    } catch {
      this.snackBar.open('Erreur lors de l\'import des herbes', 'OK', { duration: 3000 });
    } finally {
      this.isImportingHerbs.set(false);
    }
  }

  openItemDetail(item: GameItem): void {
    this.openEditor({
      type: 'item',
      item: item,
      isNew: false,
    });
  }

  openItemEditor(item?: GameItem): void {
    this.openEditor({
      type: 'item',
      item: item ?? this.createDefaultItem(),
      isNew: !item,
    });
  }

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
          await this.handleDelete(result.item.id);
        } else if (result.action === 'save') {
          await this.gameDataService.saveItem(result.item);
          this.snackBar.open(`Objet "${result.item.name}" sauvegardé`, 'OK', { duration: 2000 });
        }
        await this.gameDataState.loadAll();
      } catch {
        this.snackBar.open('Erreur lors de la sauvegarde', 'OK', { duration: 3000 });
      }
    });
  }

  private async handleDelete(id: string): Promise<void> {
    const confirmRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Supprimer',
        message: 'Voulez-vous vraiment supprimer cet objet ?',
        confirmText: 'Supprimer',
        warn: true,
      } as ConfirmDialogData,
    });

    const confirmed = await new Promise<boolean>(resolve => {
      confirmRef.afterClosed().subscribe(result => resolve(!!result));
    });

    if (!confirmed) return;
    await this.gameDataService.deleteItem(id);
    this.snackBar.open('Objet supprimé', 'OK', { duration: 2000 });
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
