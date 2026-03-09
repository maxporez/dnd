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
        [routerLinkActiveOptions]="{ exact: true }">
        <mat-icon>person</mat-icon>
        <span>Fiche</span>
      </a>
      <a mat-button
        [routerLink]="['/character', characterId(), 'inventaire']"
        routerLinkActive="active">
        <mat-icon>backpack</mat-icon>
        <span>Inventaire</span>
      </a>
      <a mat-button
        [routerLink]="['/character', characterId(), 'grimoire']"
        routerLinkActive="active">
        <mat-icon>auto_stories</mat-icon>
        <span>Grimoire</span>
      </a>
    </nav>
  `,
  styles: `
    .char-nav {
      display: flex;
      gap: 4px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      margin-bottom: 20px;
      padding-bottom: 4px;
    }

    .char-nav a {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 14px;
      color: rgba(255, 255, 255, 0.55);
      border-radius: 6px 6px 0 0;
      padding: 6px 14px;

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
        background: rgba(255, 255, 255, 0.05);
        color: rgba(255, 255, 255, 0.85);
      }
    }
  `,
})
export class CharacterNavComponent {
  characterId = input.required<string>();
}
