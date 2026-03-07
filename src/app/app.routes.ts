import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'character/:id',
    loadComponent: () =>
      import('./features/character-sheet/character-sheet.component').then(
        (m) => m.CharacterSheetComponent,
      ),
  },
  {
    path: 'homebrew',
    loadComponent: () =>
      import('./features/homebrew/homebrew.component').then((m) => m.HomebrewComponent),
  },
  {
    path: 'notion',
    loadComponent: () =>
      import('./features/notion-sync/notion-sync.component').then(
        (m) => m.NotionSyncComponent,
      ),
  },
  { path: '**', redirectTo: '' },
];
