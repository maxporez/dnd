import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Page de connexion (accessible uniquement si non connecté)
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/login.component').then((m) => m.LoginComponent),
  },

  // Routes protégées (redirige vers /login si non connecté)
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'character/:id',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/character-sheet/character-sheet.component').then(
            (m) => m.CharacterSheetComponent,
          ),
      },
      {
        path: 'inventaire',
        loadComponent: () =>
          import('./features/character-sheet/inventaire/inventaire.component').then(
            (m) => m.InventaireComponent,
          ),
      },
      {
        path: 'grimoire',
        loadComponent: () =>
          import('./features/character-sheet/grimoire/grimoire.component').then(
            (m) => m.GrimoireComponent,
          ),
      },
    ],
  },
  {
    path: 'homebrew',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/homebrew/homebrew.component').then((m) => m.HomebrewComponent),
  },
  {
    path: 'notion',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/notion-sync/notion-sync.component').then(
        (m) => m.NotionSyncComponent,
      ),
  },

  { path: '**', redirectTo: '' },
];
