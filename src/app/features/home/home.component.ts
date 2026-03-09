import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { CharacterState } from '../../core/state/character.state';
import { GameDataState } from '../../core/state/game-data.state';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { ConfirmDialogComponent, type ConfirmDialogData } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { DataImportDialogComponent } from './dialogs/data-import-dialog/data-import-dialog.component';
import type { Character } from '../../models/character.model';

@Component({
  selector: 'app-home',
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    LoadingSpinnerComponent,
  ],
  template: `
    <div class="home-page">
      <header class="home-header">
        <h1 class="home-title">D&D Grimoire</h1>
        <p class="home-subtitle">Gestionnaire de fiches 5.5</p>
      </header>

      @if (!gameDataState.hasData() && !gameDataState.isLoading()) {
        <div class="data-alert" (click)="openDataImportDialog()">
          <mat-icon>warning</mat-icon>
          <div class="data-alert-text">
            <strong>Aucune donnee SRD importee</strong>
            <span>Cliquez ici pour importer les races, classes, sorts et objets de base.</span>
          </div>
          <mat-icon>chevron_right</mat-icon>
        </div>
      }

      @if (gameDataState.hasData()) {
        <div class="data-status" (click)="openDataImportDialog()">
          <mat-icon>check_circle</mat-icon>
          <span>
            Donnees SRD :
            {{ gameDataState.dataCounts().races }} races,
            {{ gameDataState.dataCounts().classes }} classes,
            {{ gameDataState.dataCounts().spells }} sorts,
            {{ gameDataState.dataCounts().items }} objets
          </span>
          <mat-icon class="data-status-action">settings</mat-icon>
        </div>
      }

      <div class="actions-bar">
        <button mat-flat-button color="primary" (click)="createCharacter()">
          <mat-icon>add</mat-icon>
          Nouveau personnage
        </button>
      </div>

      @if (characterState.loading()) {
        <app-loading-spinner message="Chargement des personnages..." />
      } @else if (characterState.error()) {
        <div class="error-message">
          <mat-icon>error</mat-icon>
          <span>{{ characterState.error() }}</span>
        </div>
      } @else if (!characterState.hasCharacters()) {
        <div class="empty-state">
          <mat-icon class="empty-icon">person_off</mat-icon>
          <h3>Aucun personnage</h3>
          <p>Creez votre premier personnage pour commencer l'aventure !</p>
        </div>
      } @else {
        <div class="character-grid">
          @for (character of characterState.characters(); track character.id) {
            <mat-card
              class="character-card"
              appearance="outlined"
              (click)="navigateToCharacter(character.id)"
            >
              <mat-card-header>
                <mat-icon mat-card-avatar class="card-avatar-icon">person</mat-icon>
                <mat-card-title>{{ character.name || 'Sans nom' }}</mat-card-title>
                <mat-card-subtitle>
                  {{ character.race.raceName || 'Race inconnue' }}
                </mat-card-subtitle>
              </mat-card-header>

              <mat-card-content>
                <div class="character-info">
                  @if (character.classes.length > 0) {
                    <div class="class-list">
                      @for (cls of character.classes; track cls.classId) {
                        <span class="class-badge">
                          {{ cls.className }} {{ cls.level }}
                        </span>
                      }
                    </div>
                  } @else {
                    <span class="no-class">Aucune classe</span>
                  }

                  <div class="character-level">
                    Niveau {{ getTotalLevel(character) }}
                  </div>
                </div>
              </mat-card-content>

              <mat-card-actions align="end">
                <button
                  mat-icon-button
                  color="warn"
                  (click)="deleteCharacter($event, character)"
                  aria-label="Supprimer le personnage"
                >
                  <mat-icon>delete</mat-icon>
                </button>
              </mat-card-actions>
            </mat-card>
          }
        </div>
      }
    </div>
  `,
  styles: `
    .home-page {
      max-width: 800px;
      margin: 0 auto;
      padding: 24px 16px;
    }

    .home-header {
      text-align: center;
      margin-bottom: 24px;
    }

    .home-title {
      font-size: 2rem;
      font-weight: 700;
      color: var(--ink);
      margin-bottom: 4px;
    }

    .home-subtitle {
      font-size: 1rem;
      color: var(--ink-secondary);
    }

    /* Data alert banner */
    .data-alert {
      display: flex;
      align-items: center;
      gap: 12px;
      background: var(--gold-light);
      border: 1px solid var(--border-strong);
      border-radius: 12px;
      padding: 12px 16px;
      margin-bottom: 20px;
      cursor: pointer;
      transition: background 0.2s;

      &:hover {
        background: var(--parchment-hover);
      }

      mat-icon:first-child {
        color: var(--gold);
        flex-shrink: 0;
      }

      mat-icon:last-child {
        color: var(--ink-muted);
        flex-shrink: 0;
      }
    }

    .data-alert-text {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;

      strong {
        color: var(--gold);
        font-size: 14px;
      }

      span {
        color: var(--ink-secondary);
        font-size: 13px;
      }
    }

    /* Data status (when data exists) */
    .data-status {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(76, 175, 80, 0.1);
      border: 1px solid rgba(76, 175, 80, 0.3);
      border-radius: 12px;
      padding: 10px 16px;
      margin-bottom: 20px;
      cursor: pointer;
      font-size: 13px;
      color: var(--ink-secondary);
      transition: background 0.2s;

      &:hover {
        background: rgba(76, 175, 80, 0.2);
      }

      mat-icon:first-child {
        color: #66bb6a;
        font-size: 20px;
        width: 20px;
        height: 20px;
        flex-shrink: 0;
      }

      span {
        flex: 1;
      }
    }

    .data-status-action {
      color: var(--ink-ghost) !important;
      font-size: 18px !important;
      width: 18px !important;
      height: 18px !important;
    }

    /* Actions bar */
    .actions-bar {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 20px;

      button {
        display: flex;
        align-items: center;
        gap: 6px;
      }
    }

    /* Error message */
    .error-message {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #ef5350;
      padding: 16px;
      text-align: center;
      justify-content: center;

      mat-icon {
        flex-shrink: 0;
      }
    }

    /* Empty state */
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 48px 16px;
      text-align: center;

      .empty-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        color: var(--ink-ghost);
      }

      h3 {
        color: var(--ink-muted);
        font-weight: 500;
      }

      p {
        color: var(--ink-faint);
        font-size: 14px;
      }
    }

    /* Character grid */
    .character-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
    }

    .character-card {
      cursor: pointer;
      transition: transform 0.15s ease, box-shadow 0.15s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 20px var(--shadow);
      }
    }

    .card-avatar-icon {
      background: var(--crimson-light);
      color: var(--crimson);
      border-radius: 50%;
      padding: 4px;
      font-size: 32px;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .character-info {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-top: 8px;
    }

    .class-list {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .class-badge {
      display: inline-block;
      background: var(--crimson-light);
      color: var(--crimson);
      border-radius: 12px;
      padding: 2px 10px;
      font-size: 12px;
      font-weight: 500;
    }

    .no-class {
      color: var(--ink-faint);
      font-size: 13px;
      font-style: italic;
    }

    .character-level {
      font-size: 13px;
      color: var(--ink-muted);
      font-weight: 500;
    }

    /* Responsive */
    @media (max-width: 600px) {
      .home-page {
        padding: 16px 12px;
      }

      .home-title {
        font-size: 1.5rem;
      }

      .character-grid {
        grid-template-columns: 1fr;
      }
    }
  `,
})
export class HomeComponent implements OnInit {
  readonly characterState = inject(CharacterState);
  readonly gameDataState = inject(GameDataState);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  ngOnInit(): void {
    this.characterState.loadAll();
    this.gameDataState.loadAll();
  }

  getTotalLevel(character: Character): number {
    return character.classes.reduce((sum, cls) => sum + cls.level, 0) || 1;
  }

  navigateToCharacter(id: string): void {
    this.router.navigate(['/character', id]);
  }

  async createCharacter(): Promise<void> {
    const character = await this.characterState.create();
    if (character) {
      this.router.navigate(['/character', character.id]);
    }
  }

  deleteCharacter(event: MouseEvent, character: Character): void {
    event.stopPropagation();

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Supprimer le personnage',
        message: `Voulez-vous vraiment supprimer "${character.name || 'Sans nom'}" ? Cette action est irreversible.`,
        confirmText: 'Supprimer',
        cancelText: 'Annuler',
        warn: true,
      } satisfies ConfirmDialogData,
      width: '400px',
    });

    dialogRef.afterClosed().subscribe(async (confirmed) => {
      if (confirmed) {
        const success = await this.characterState.remove(character.id);
        if (success) {
          this.snackBar.open('Personnage supprime', 'OK', { duration: 3000 });
        }
      }
    });
  }

  openDataImportDialog(): void {
    this.dialog.open(DataImportDialogComponent, {
      width: '500px',
    });
  }
}
