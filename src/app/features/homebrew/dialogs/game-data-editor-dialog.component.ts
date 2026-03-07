import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import type { GameRace, GameClass, GameSpell, GameItem } from '../../../models/game-data.model';

export type EditorType = 'race' | 'class' | 'spell' | 'item';

export interface GameDataEditorDialogData {
  type: EditorType;
  item: GameRace | GameClass | GameSpell | GameItem;
  isNew: boolean;
}

@Component({
  selector: 'app-game-data-editor-dialog',
  imports: [
    FormsModule,
    MatDialogModule, MatButtonModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatCheckboxModule,
    MatChipsModule, MatIconModule, MatTabsModule,
  ],
  template: `
    <h2 mat-dialog-title>
      {{ data.isNew ? 'Créer' : 'Éditer' }} {{ typeLabel() }}
    </h2>

    <mat-dialog-content>

      <!-- === RACE === -->
      @if (data.type === 'race') {
        @let race = $any(item());
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nom</mat-label>
          <input matInput [(ngModel)]="race.name" placeholder="Ex: Elfe" />
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Source</mat-label>
          <input matInput [(ngModel)]="race.source" placeholder="Ex: SRD, Homebrew" />
        </mat-form-field>

        <div class="field-row">
          <mat-form-field appearance="outline" class="flex-1">
            <mat-label>Vitesse (m)</mat-label>
            <input matInput type="number" [(ngModel)]="race.speed" />
          </mat-form-field>
          <mat-form-field appearance="outline" class="flex-1">
            <mat-label>Taille</mat-label>
            <mat-select [(ngModel)]="race.size">
              <mat-option value="Small">Petite</mat-option>
              <mat-option value="Medium">Moyenne</mat-option>
              <mat-option value="Large">Grande</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Description</mat-label>
          <textarea matInput [(ngModel)]="race.description" rows="4"></textarea>
        </mat-form-field>
      }

      <!-- === CLASS === -->
      @if (data.type === 'class') {
        @let cls = $any(item());
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nom</mat-label>
          <input matInput [(ngModel)]="cls.name" placeholder="Ex: Guerrier" />
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Source</mat-label>
          <input matInput [(ngModel)]="cls.source" placeholder="Ex: SRD, Homebrew" />
        </mat-form-field>

        <div class="field-row">
          <mat-form-field appearance="outline" class="flex-1">
            <mat-label>Dé de vie</mat-label>
            <mat-select [(ngModel)]="cls.hitDie">
              <mat-option [value]="6">d6</mat-option>
              <mat-option [value]="8">d8</mat-option>
              <mat-option [value]="10">d10</mat-option>
              <mat-option [value]="12">d12</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Description</mat-label>
          <textarea matInput [(ngModel)]="cls.description" rows="4"></textarea>
        </mat-form-field>
      }

      <!-- === SPELL === -->
      @if (data.type === 'spell') {
        @let spell = $any(item());
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nom</mat-label>
          <input matInput [(ngModel)]="spell.name" placeholder="Ex: Boule de feu" />
        </mat-form-field>

        <div class="field-row">
          <mat-form-field appearance="outline" class="flex-1">
            <mat-label>Niveau</mat-label>
            <mat-select [(ngModel)]="spell.level">
              <mat-option [value]="0">Tour de magie</mat-option>
              @for (lvl of [1,2,3,4,5,6,7,8,9]; track lvl) {
                <mat-option [value]="lvl">Niveau {{ lvl }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline" class="flex-1">
            <mat-label>École</mat-label>
            <mat-select [(ngModel)]="spell.school">
              @for (school of spellSchools; track school.id) {
                <mat-option [value]="school.id">{{ school.label }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
        </div>

        <div class="field-row">
          <mat-form-field appearance="outline" class="flex-1">
            <mat-label>Temps d'incantation</mat-label>
            <input matInput [(ngModel)]="spell.castingTime" placeholder="1 action" />
          </mat-form-field>
          <mat-form-field appearance="outline" class="flex-1">
            <mat-label>Portée</mat-label>
            <input matInput [(ngModel)]="spell.range" placeholder="18 mètres" />
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Durée</mat-label>
          <input matInput [(ngModel)]="spell.duration" placeholder="Instantanée" />
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Source</mat-label>
          <input matInput [(ngModel)]="spell.source" placeholder="SRD, Homebrew" />
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Description</mat-label>
          <textarea matInput [(ngModel)]="spell.description" rows="5"></textarea>
        </mat-form-field>
      }

      <!-- === ITEM === -->
      @if (data.type === 'item') {
        @let itm = $any(item());
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nom</mat-label>
          <input matInput [(ngModel)]="itm.name" placeholder="Ex: Épée longue" />
        </mat-form-field>

        <div class="field-row">
          <mat-form-field appearance="outline" class="flex-1">
            <mat-label>Catégorie</mat-label>
            <mat-select [(ngModel)]="itm.category">
              @for (cat of itemCategories; track cat.id) {
                <mat-option [value]="cat.id">{{ cat.label }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline" class="flex-1">
            <mat-label>Rareté</mat-label>
            <mat-select [(ngModel)]="itm.rarity">
              <mat-option value="">Commun</mat-option>
              <mat-option value="Uncommon">Peu commun</mat-option>
              <mat-option value="Rare">Rare</mat-option>
              <mat-option value="Very Rare">Très rare</mat-option>
              <mat-option value="Legendary">Légendaire</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Source</mat-label>
          <input matInput [(ngModel)]="itm.source" placeholder="SRD, Homebrew" />
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Description</mat-label>
          <textarea matInput [(ngModel)]="itm.description" rows="5"></textarea>
        </mat-form-field>
      }

    </mat-dialog-content>

    <mat-dialog-actions align="end">
      @if (!data.isNew) {
        <button mat-button color="warn" (click)="delete()">
          <mat-icon>delete</mat-icon> Supprimer
        </button>
      }
      <button mat-button (click)="dialogRef.close()">Annuler</button>
      <button mat-flat-button color="primary" (click)="save()">
        <mat-icon>save</mat-icon> Sauvegarder
      </button>
    </mat-dialog-actions>
  `,
  styles: `
    mat-dialog-content {
      display: flex;
      flex-direction: column;
      gap: 8px;
      min-width: 400px;
      max-height: 60vh;
      overflow-y: auto;
      padding: 16px 0;
    }

    .full-width { width: 100%; }

    .field-row {
      display: flex;
      gap: 12px;
    }

    .flex-1 { flex: 1; }
  `,
})
export class GameDataEditorDialogComponent {
  data = inject<GameDataEditorDialogData>(MAT_DIALOG_DATA);
  dialogRef = inject(MatDialogRef<GameDataEditorDialogComponent>);

  // Deep clone to avoid mutating original
  readonly item = signal(JSON.parse(JSON.stringify(this.data.item)));

  readonly spellSchools = [
    { id: 'abjuration', label: 'Abjuration' },
    { id: 'conjuration', label: 'Conjuration' },
    { id: 'divination', label: 'Divination' },
    { id: 'enchantment', label: 'Enchantement' },
    { id: 'evocation', label: 'Évocation' },
    { id: 'illusion', label: 'Illusion' },
    { id: 'necromancy', label: 'Nécromancie' },
    { id: 'transmutation', label: 'Transmutation' },
  ];

  readonly itemCategories = [
    { id: 'weapon', label: 'Arme' },
    { id: 'armor', label: 'Armure' },
    { id: 'adventuring-gear', label: 'Équipement' },
    { id: 'tool', label: 'Outil' },
    { id: 'magic-item', label: 'Objet magique' },
    { id: 'consumable', label: 'Consommable' },
    { id: 'herb', label: 'Herbe' },
  ];

  typeLabel(): string {
    const labels: Record<string, string> = {
      race: 'une race',
      class: 'une classe',
      spell: 'un sort',
      item: 'un objet',
    };
    return labels[this.data.type] || this.data.type;
  }

  save(): void {
    this.dialogRef.close({ action: 'save', item: this.item() });
  }

  delete(): void {
    this.dialogRef.close({ action: 'delete', item: this.item() });
  }
}
