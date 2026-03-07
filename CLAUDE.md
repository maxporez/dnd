# D&D Grimoire - Angular 21

## Project Overview
D&D 5.5 character management app with French UI. Built with Angular 21 standalone components, Angular Material, and Angular Signals for state management. Express backend proxies to Notion API. IndexedDB (Dexie) for local storage.

## Architecture
- `src/app/core/` - Singleton services, state management (signals), interceptors
- `src/app/shared/` - Reusable components, pipes, directives
- `src/app/features/` - Feature folders: home, character-sheet, homebrew, notion-sync
- `src/app/models/` - TypeScript interfaces (Character, rules, stats, game data)
- `src/app/data/` - Static data (base races, classes, herbs, French labels)
- `server/` - Express backend with Notion API integration
- `api/` - Vercel serverless entry point

## Tech Stack
- Angular 21 with standalone components (NO NgModules)
- Angular Material for all UI components
- Angular Signals for state management (NOT RxJS BehaviorSubjects)
- Dexie.js for IndexedDB storage
- mathjs for modifier formula evaluation
- Express 5 backend with @notionhq/client
- Deployed on Vercel

## Conventions
- All components are standalone (standalone: true is the default in Angular 21)
- Use new control flow: @if, @for, @switch (NOT *ngIf, *ngFor)
- Use Angular Signals: signal(), computed(), effect() for reactivity
- File naming: kebab-case. Components: `name.component.ts`. Angular 21 short names: `name.ts` for `app.ts`
- Service naming: PascalCase class, camelCase methods
- Component selector prefix: `app-`
- French UI labels defined in `data/labels.data.ts`
- SCSS for styles
- One component per file (no inline templates for complex components)
- Use `inject()` function instead of constructor injection

## Commands
- `npm run dev` - Start Angular dev server (port 4200) + Express backend (port 3001)
- `npm run dev:front` - Angular dev server only
- `npm run dev:server` - Express server only
- `npm run build` - Production build
- `npm run test` - Run unit tests
- `npm run server` - Express server only (production)

## State Management Pattern
State is managed via signal-based state services in `core/state/`:
- `CharacterState` - character list and current character signals
- `GameDataState` - races, classes, spells, items signals

Components inject state services and read signals in templates.
Mutations go through state service methods that update signals.

## Express Backend
The backend in `server/` is a proxy to Notion API. It is framework-agnostic.
- Routes are under `/api/notion/` prefix
- CORS allows `localhost:4200` (Angular dev) and `*.vercel.app`
- Vercel deployment uses `api/_entry.ts` as serverless entry point

## Sub-Agent Delegation
For complex tasks, use specialized sub-agents:
- UI component work -> read `.claude/skills/ui-component.md` first
- Backend/API work -> read `.claude/skills/backend-api.md` first
- Data model changes -> read `.claude/skills/data-models.md` first
- Writing tests -> read `.claude/skills/testing.md` first
- Deployment -> read `.claude/skills/deploy.md` first
