import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatToolbarModule, MatButtonModule, MatIconModule],
  template: `
    <mat-toolbar color="primary" class="app-toolbar">
      <a routerLink="/" class="app-title">
        <mat-icon>auto_stories</mat-icon>
        <span>D&D Grimoire</span>
      </a>

      <span class="spacer"></span>

      <nav class="nav-links">
        <a mat-button routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">
          <mat-icon>people</mat-icon>
          <span class="nav-label">Personnages</span>
        </a>
        <a mat-button routerLink="/homebrew" routerLinkActive="active">
          <mat-icon>build</mat-icon>
          <span class="nav-label">Homebrew</span>
        </a>
        <a mat-button routerLink="/notion" routerLinkActive="active">
          <mat-icon>sync</mat-icon>
          <span class="nav-label">Notion</span>
        </a>
      </nav>
    </mat-toolbar>

    <main class="app-content">
      <router-outlet />
    </main>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    .app-toolbar {
      position: sticky;
      top: 0;
      z-index: 100;
      gap: 8px;
    }

    .app-title {
      display: flex;
      align-items: center;
      gap: 8px;
      color: inherit;
      text-decoration: none;
      font-size: 18px;
      font-weight: 500;
    }

    .spacer {
      flex: 1;
    }

    .nav-links {
      display: flex;
      gap: 4px;
    }

    .nav-links a {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .nav-links a.active {
      background: rgba(255, 255, 255, 0.1);
    }

    .app-content {
      flex: 1;
    }

    @media (max-width: 600px) {
      .nav-label {
        display: none;
      }
    }
  `,
})
export class App {}
