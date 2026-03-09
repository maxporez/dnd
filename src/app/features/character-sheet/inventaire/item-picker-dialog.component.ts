import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { GameDataState } from '../../../core/state/game-data.state';
import { CATEGORY_LABELS } from '../../../data/labels.data';
import type { InventoryItem } from '../../../models/character.model';

export interface ItemPickerDialogData {
  alreadyAddedIds: string[];
}

@Component({
  selector: 'app-item-picker-dialog',
  imports: [
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatDividerModule,
  ],
  template: `
    <h2 mat-dialog-title>Ajouter un objet</h2>

    <mat-dialog-content>
      <mat-form-field appearance="outline" class="search-field">
        <mat-label>Rechercher...</mat-label>
        <mat-icon matPrefix>search</mat-icon>
        <input
          matInput
          [value]="searchQuery()"
          (input)="onSearch($any($event.target).value)"
          placeholder="Nom, catégorie..."
          autofocus
        />
        @if (searchQuery()) {
          <button matSuffix mat-icon-button (click)="onSearch('')">
            <mat-icon>close</mat-icon>
          </button>
        }
      </mat-form-field>

      @if (searchQuery().length >= 1) {
        <mat-list class="results-list">
          @for (item of filteredItems(); track item.id) {
            <mat-list-item
              class="result-item"
              [class.already-added]="isAdded(item.id)"
              (click)="selectItem(item)"
            >
              <mat-icon matListItemIcon>inventory_2</mat-icon>
              <span matListItemTitle>{{ item.name }}</span>
              <span matListItemLine class="item-meta">
                {{ getCategoryLabel(item.category) }}
                @if (item.rarity) { · {{ item.rarity }} }
              </span>
              @if (isAdded(item.id)) {
                <mat-icon matListItemMeta class="added-icon">check_circle</mat-icon>
              }
            </mat-list-item>
          }

          @if (filteredItems().length === 0) {
            <div class="no-results">
              <p>Aucun objet trouvé pour "{{ searchQuery() }}"</p>
              <button mat-flat-button color="primary" (click)="addCustomItem()">
                <mat-icon>add</mat-icon>
                Ajouter "{{ searchQuery() }}" comme objet personnalisé
              </button>
            </div>
          }
        </mat-list>
      } @else {
        <div class="search-hint">
          <mat-icon>search</mat-icon>
          <p>Tapez pour rechercher parmi les objets disponibles</p>
          <p class="hint-sub">ou laissez vide et cliquez sur "Objet personnalisé"</p>
        </div>
      }
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close(null)">Annuler</button>
      <button mat-stroked-button (click)="addCustomItem()">
        <mat-icon>edit</mat-icon>
        Objet personnalisé
      </button>
    </mat-dialog-actions>
  `,
  styles: `
    .search-field {
      width: 100%;
    }

    .results-list {
      max-height: 380px;
      overflow-y: auto;
    }

    .result-item {
      cursor: pointer;
      border-radius: 6px;
      transition: background 0.1s;

      &:hover:not(.already-added) {
        background: var(--parchment-input);
      }

      &.already-added {
        opacity: 0.5;
        cursor: default;
      }
    }

    .item-meta {
      font-size: 12px;
      color: var(--ink-muted);
    }

    .added-icon {
      color: #81c784;
      font-size: 18px;
    }

    .no-results {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      padding: 24px 16px;
      color: var(--ink-muted);
      text-align: center;
    }

    .search-hint {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 32px 16px;
      color: var(--ink-faint);
      text-align: center;

      mat-icon {
        font-size: 36px;
        width: 36px;
        height: 36px;
      }

      .hint-sub {
        font-size: 12px;
      }
    }
  `,
})
export class ItemPickerDialogComponent {
  readonly dialogRef = inject(MatDialogRef<ItemPickerDialogComponent>);
  readonly data = inject<ItemPickerDialogData>(MAT_DIALOG_DATA);
  private gameDataState = inject(GameDataState);

  readonly searchQuery = signal('');
  readonly addedIds = new Set(this.data.alreadyAddedIds);

  readonly filteredItems = computed(() => {
    const q = this.searchQuery().toLowerCase();
    if (!q) return this.gameDataState.items();
    return this.gameDataState.items().filter(i =>
      i.name.toLowerCase().includes(q) ||
      i.category.toLowerCase().includes(q) ||
      (i.description?.toLowerCase().includes(q) ?? false),
    );
  });

  onSearch(value: string): void {
    this.searchQuery.set(value);
  }

  isAdded(itemId: string): boolean {
    return this.addedIds.has(itemId);
  }

  getCategoryLabel(category: string): string {
    return CATEGORY_LABELS[category] ?? category;
  }

  selectItem(item: { id: string; name: string }): void {
    if (this.isAdded(item.id)) return;
    const newItem: InventoryItem = {
      id: crypto.randomUUID().replace(/-/g, ''),
      itemId: item.id,
      name: item.name,
      quantity: 1,
      equipped: false,
      attuned: false,
      isHomebrew: false,
    };
    this.dialogRef.close(newItem);
  }

  addCustomItem(): void {
    const name = this.searchQuery().trim() || 'Objet';
    const newItem: InventoryItem = {
      id: crypto.randomUUID().replace(/-/g, ''),
      itemId: '',
      name,
      quantity: 1,
      equipped: false,
      attuned: false,
      isHomebrew: true,
    };
    this.dialogRef.close(newItem);
  }
}
