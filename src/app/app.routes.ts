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
    loadComponent: () =>
      import('./features/character-sheet/character-sheet.component').then(
        (m) => m.CharacterSheetComponent,
      ),
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
