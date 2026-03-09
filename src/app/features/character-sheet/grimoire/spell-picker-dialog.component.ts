import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { GameDataState } from '../../../core/state/game-data.state';
import { SCHOOL_LABELS } from '../../../data/labels.data';
import type { SpellEntry } from '../../../models/character.model';

export interface SpellPickerDialogData {
  alreadyAddedIds: string[];
}

@Component({
  selector: 'app-spell-picker-dialog',
  imports: [
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
  ],
  template: `
    <h2 mat-dialog-title>Ajouter un sort</h2>

    <mat-dialog-content>
      <div class="picker-controls">
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Rechercher...</mat-label>
          <mat-icon matPrefix>search</mat-icon>
          <input
            matInput
            [value]="searchQuery()"
            (input)="onSearch($any($event.target).value)"
            placeholder="Nom, école, classe..."
            autofocus
          />
          @if (searchQuery()) {
            <button matSuffix mat-icon-button (click)="onSearch('')">
              <mat-icon>close</mat-icon>
            </button>
          }
        </mat-form-field>

        <div class="level-chips">
          <button
            class="lvl-chip"
            [class.active]="levelFilter() === null"
            (click)="levelFilter.set(null)"
          >Tous</button>
          @for (n of [0,1,2,3,4,5,6,7,8,9]; track n) {
            <button
              class="lvl-chip"
              [class.active]="levelFilter() === n"
              (click)="levelFilter.set(n)"
            >{{ n === 0 ? 'Tour' : n }}</button>
          }
        </div>
      </div>

      <mat-list class="results-list">
        @for (spell of filteredSpells(); track spell.id) {
          <mat-list-item
            class="result-item"
            [class.already-added]="isAdded(spell.id)"
            (click)="selectSpell(spell)"
          >
            <mat-icon matListItemIcon>auto_fix_high</mat-icon>
            <span matListItemTitle>{{ spell.name }}</span>
            <span matListItemLine class="spell-meta">
              {{ getLevelLabel(spell.level) }} · {{ getSchoolLabel(spell.school) }} · {{ spell.classes.join(', ') }}
            </span>
            @if (isAdded(spell.id)) {
              <mat-icon matListItemMeta class="added-icon">check_circle</mat-icon>
            }
          </mat-list-item>
        }

        @if (filteredSpells().length === 0 && gameDataState.spells().length > 0) {
          <div class="no-results">
            <p>Aucun sort trouvé</p>
          </div>
        }

        @if (gameDataState.spells().length === 0) {
          <div class="no-results">
            <mat-icon>info_outline</mat-icon>
            <p>Aucun sort disponible. Importez des données depuis la page Sorts.</p>
          </div>
        }
      </mat-list>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close(null)">Fermer</button>
    </mat-dialog-actions>
  `,
  styles: `
    .picker-controls {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 4px;
    }

    .search-field {
      width: 100%;
    }

    .level-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
    }

    .lvl-chip {
      font-size: 12px;
      padding: 2px 10px;
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.12);
      background: transparent;
      color: rgba(255, 255, 255, 0.55);
      cursor: pointer;
      font-family: inherit;
      transition: all 0.12s;

      &:hover { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.85); }
      &.active { background: rgba(0,188,212,0.15); border-color: #4dd0e1; color: #4dd0e1; }
    }

    .results-list {
      max-height: 340px;
      overflow-y: auto;
    }

    .result-item {
      cursor: pointer;
      border-radius: 6px;
      transition: background 0.1s;

      &:hover:not(.already-added) { background: rgba(255,255,255,0.06); }
      &.already-added { opacity: 0.5; cursor: default; }
    }

    .spell-meta {
      font-size: 12px;
      color: rgba(255,255,255,0.4);
    }

    .added-icon { color: #81c784; font-size: 18px; }

    .no-results {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 24px 16px;
      color: rgba(255,255,255,0.4);
      text-align: center;

      mat-icon { font-size: 28px; width: 28px; height: 28px; }
    }
  `,
})
export class SpellPickerDialogComponent {
  readonly dialogRef = inject(MatDialogRef<SpellPickerDialogComponent>);
  readonly data = inject<SpellPickerDialogData>(MAT_DIALOG_DATA);
  readonly gameDataState = inject(GameDataState);

  readonly searchQuery = signal('');
  readonly levelFilter = signal<number | null>(null);
  readonly addedIds = new Set(this.data.alreadyAddedIds);

  readonly filteredSpells = computed(() => {
    const q = this.searchQuery().toLowerCase();
    const level = this.levelFilter();
    return this.gameDataState.spells().filter(s => {
      if (level !== null && s.level !== level) return false;
      if (q && !(
        s.name.toLowerCase().includes(q) ||
        s.school.toLowerCase().includes(q) ||
        s.classes.some(c => c.toLowerCase().includes(q))
      )) return false;
      return true;
    });
  });

  onSearch(value: string): void {
    this.searchQuery.set(value);
  }

  isAdded(spellId: string): boolean {
    return this.addedIds.has(spellId);
  }

  getLevelLabel(level: number): string {
    return level === 0 ? 'Tour de magie' : `Niv. ${level}`;
  }

  getSchoolLabel(school: string): string {
    return SCHOOL_LABELS[school] ?? school;
  }

  selectSpell(spell: { id: string; name: string; level: number; source: string }): void {
    if (this.isAdded(spell.id)) return;
    const entry: SpellEntry = {
      spellId: spell.id,
      name: spell.name,
      level: spell.level,
      prepared: spell.level === 0,
      alwaysPrepared: spell.level === 0,
      source: spell.source,
      isHomebrew: false,
    };
    this.dialogRef.close(entry);
  }
}
