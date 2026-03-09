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
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/homebrew/homebrew.component').then((m) => m.HomebrewComponent),
      },
      {
        path: 'races-classes',
        loadComponent: () =>
          import('./features/homebrew/pages/races-classes/races-classes.component').then(
            (m) => m.RacesClassesComponent,
          ),
      },
      {
        path: 'sorts',
        loadComponent: () =>
          import('./features/homebrew/pages/sorts/sorts.component').then(
            (m) => m.SortsComponent,
          ),
      },
      {
        path: 'objets',
        loadComponent: () =>
          import('./features/homebrew/pages/objets/objets.component').then(
            (m) => m.ObjetsComponent,
          ),
      },
    ],
  },
  // Dev sandbox (no auth guard — dev/testing only)
  {
    path: 'dev',
    loadComponent: () =>
      import('./features/dev-sandbox/dev-sandbox.component').then(m => m.DevSandboxComponent),
  },

  { path: '**', redirectTo: '' },
];
