import { Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-character-nav',
  imports: [RouterLink, RouterLinkActive, MatButtonModule, MatIconModule],
  template: `
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
  `,
  styles: `
    /* Desktop : tabs inline au-dessus du contenu */
    .char-nav {
      display: flex;
      gap: 4px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      margin-bottom: 20px;
      padding-bottom: 4px;
    }

    .char-nav-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 14px;
      color: rgba(255, 255, 255, 0.55);

      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }

      &.active {
        color: #bb86fc;
        background: rgba(187, 134, 252, 0.08);
        border-bottom: 2px solid #bb86fc;
        margin-bottom: -5px;
      }

      &:hover:not(.active) {
        color: rgba(255, 255, 255, 0.85);
      }
    }

    /* Mobile : barre fixe en bas */
    @media (max-width: 768px) {
      .char-nav {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 100;
        background: #1e1e3a;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        border-bottom: none;
        margin-bottom: 0;
        padding-bottom: env(safe-area-inset-bottom);
        height: 64px;
      }

      .char-nav-item {
        flex: 1;
        height: 100%;
        border-radius: 0;
        color: rgba(255, 255, 255, 0.55);
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
          color: #d5baff;
          background: transparent;
          border-bottom: none;
          margin-bottom: 0;
          border-top: 2px solid #d5baff;
        }
      }
    }
  `,
})
export class CharacterNavComponent {
  characterId = input.required<string>();
}
