import { Component, input, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CharacterState } from '../../../../core/state/character.state';

@Component({
  selector: 'app-character-nav',
  imports: [RouterLink, RouterLinkActive, MatButtonModule, MatIconModule, MatTooltipModule, MatSnackBarModule],
  template: `
    <div class="char-nav-wrapper">
      <nav class="char-nav">
        <a mat-button
          [routerLink]="['/character', characterId()]"
          routerLinkActive="active"
          [routerLinkActiveOptions]="{ exact: true }"
          class="char-nav-item">
          <mat-icon>person</mat-icon>
          <span>Fiche</span>
        </a>
        <a mat-button
          [routerLink]="['/character', characterId(), 'inventaire']"
          routerLinkActive="active"
          class="char-nav-item">
          <mat-icon>backpack</mat-icon>
          <span>Inventaire</span>
        </a>
        <a mat-button
          [routerLink]="['/character', characterId(), 'grimoire']"
          routerLinkActive="active"
          class="char-nav-item">
          <mat-icon>auto_stories</mat-icon>
          <span>Grimoire</span>
        </a>
      </nav>
      <button
        mat-stroked-button
        class="long-rest-btn"
        (click)="onLongRest()"
        matTooltip="Récupère tous les emplacements de sorts"
      >
        <mat-icon>bedtime</mat-icon>
        <span>Long repos</span>
      </button>
    </div>
  `,
  styles: `
    .char-nav-wrapper {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
    }

    .long-rest-btn {
      flex-shrink: 0;
      font-size: 13px;
      color: var(--ink-muted);
      border-color: var(--border);
      height: 36px;
      white-space: nowrap;

      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
        margin-right: 4px;
      }

      &:hover {
        color: var(--arcane);
        border-color: var(--arcane);
        background: var(--arcane-light);
      }
    }

    /* Desktop : tabs inline au-dessus du contenu */
    .char-nav {
      display: flex;
      gap: 4px;
      border-bottom: 1px solid var(--border);
      padding-bottom: 4px;
      flex: 1;
    }

    .char-nav-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 14px;
      color: var(--ink-muted);

      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }

      &.active {
        color: var(--crimson);
        background: var(--crimson-light);
        border-bottom: 2px solid var(--crimson);
        margin-bottom: -5px;
      }

      &:hover:not(.active) {
        color: var(--ink-secondary);
      }
    }

    /* Mobile : barre fixe en bas */
    @media (max-width: 768px) {
      .char-nav-wrapper {
        margin-bottom: 0;
      }

      .long-rest-btn {
        position: fixed;
        top: 12px;
        right: 12px;
        z-index: 200;
        font-size: 12px;
        height: 32px;
        padding: 0 10px;
        background: #3d2b1f;
        border-color: var(--arcane);
        color: var(--arcane);

        mat-icon { display: none; }
      }

      .char-nav {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 100;
        background: #3d2b1f;
        border-top: 1px solid var(--border-strong);
        border-bottom: none;
        margin-bottom: 0;
        padding-bottom: env(safe-area-inset-bottom);
        height: 64px;
      }

      .char-nav-item {
        flex: 1;
        height: 100%;
        border-radius: 0;
        color: rgba(244, 228, 193, 0.55);
        font-size: 11px;

        /* Forcer le contenu mat-button en colonne centrée */
        ::ng-deep .mdc-button__label {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          width: 100%;
        }

        mat-icon {
          font-size: 24px;
          width: 24px;
          height: 24px;
        }

        &.active {
          color: #f4e4c1;
          background: transparent;
          border-bottom: none;
          margin-bottom: 0;
          border-top: 2px solid #f4e4c1;
        }
      }
    }
  `,
})
export class CharacterNavComponent {
  characterId = input.required<string>();

  private characterState = inject(CharacterState);
  private snackBar = inject(MatSnackBar);

  onLongRest(): void {
    const char = this.characterState.currentCharacter();
    if (!char) return;

    const resetSlots: Record<number, { max: number; used: number }> = {};
    for (const [lvl, slot] of Object.entries(char.spellSlots ?? {})) {
      resetSlots[Number(lvl)] = { max: slot.max, used: 0 };
    }

    this.characterState.save(char.id, { spellSlots: resetSlots });
    this.snackBar.open('Long repos — emplacements récupérés', 'OK', { duration: 2500 });
  }
}
