import { Component, inject, computed } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatToolbarModule, MatButtonModule, MatIconModule, MatTooltipModule],
  template: `
    <mat-toolbar color="primary" class="app-toolbar">
      <a routerLink="/" class="app-title">
        <mat-icon>auto_stories</mat-icon>
        <span>D&D Grimoire</span>
      </a>

      <span class="spacer"></span>

      @if (auth.isAuthenticated()) {
        <!-- Nav desktop (cachée sur mobile) -->
        <nav class="top-nav">
          <a mat-button routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">
            <mat-icon>people</mat-icon>
            Personnages
          </a>
          <a mat-button routerLink="/homebrew" routerLinkActive="active">
            <mat-icon>build</mat-icon>
            Homebrew
          </a>
        </nav>

        <button mat-icon-button (click)="auth.signOut()" matTooltip="Se déconnecter">
          <mat-icon>logout</mat-icon>
        </button>
      }
    </mat-toolbar>

    <main class="app-content">
      <router-outlet />
    </main>

    <!-- Nav bottom (mobile uniquement, cachée sur desktop et sur les pages perso) -->
    @if (auth.isAuthenticated() && !isCharacterPage()) {
      <nav class="bottom-nav">
        <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" class="bottom-nav-item">
          <mat-icon>people</mat-icon>
          <span>Personnages</span>
        </a>
        <a routerLink="/homebrew" routerLinkActive="active" class="bottom-nav-item">
          <mat-icon>build</mat-icon>
          <span>Homebrew</span>
        </a>
      </nav>
    }
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

    /* Nav desktop */
    .top-nav {
      display: flex;
      gap: 4px;
      margin-right: 8px;
    }

    .top-nav a {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .top-nav a.active {
      background: rgba(255, 255, 255, 0.1);
    }

    /* Contenu principal */
    .app-content {
      flex: 1;
    }

    /* Bottom navigation (mobile) */
    .bottom-nav {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 100;
      display: none; /* cachée par défaut, affichée sur mobile */
      background: #1e1e3a;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      height: 64px;
      padding-bottom: env(safe-area-inset-bottom);
    }

    .bottom-nav-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 4px;
      color: rgba(255, 255, 255, 0.55);
      text-decoration: none;
      font-size: 11px;
      font-family: Roboto, sans-serif;
      transition: color 0.2s;
      min-height: 48px;
    }

    .bottom-nav-item mat-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
      transition: color 0.2s;
    }

    .bottom-nav-item.active {
      color: #d5baff;
    }

    .bottom-nav-item:hover {
      color: rgba(255, 255, 255, 0.85);
    }

    @media (max-width: 768px) {
      .top-nav {
        display: none;
      }

      .bottom-nav {
        display: flex;
      }

      .app-content {
        padding-bottom: 72px;
      }
    }
  `,
})
export class App {
  readonly auth = inject(AuthService);

  private readonly router = inject(Router);
  private readonly url = toSignal(
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map(e => (e as NavigationEnd).urlAfterRedirects),
      startWith(this.router.url),
    )
  );
  readonly isCharacterPage = computed(() => this.url()?.startsWith('/character/') ?? false);
}
