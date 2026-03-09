# Plan : Card Components + Dev Sandbox

## Objectif
Créer une page sandbox de développement à `/dev` (sans authGuard) pour tester visuellement des composants card D&D. Implémenter les deux premières cards : `CharacterIdentityCardComponent` et `AbilityScoresCardComponent`.

---

## Étape 1 — DevSandboxComponent

**Fichier** : `src/app/features/dev-sandbox/dev-sandbox.component.ts`

```typescript
@Component({
  selector: 'app-dev-sandbox',
  standalone: true,
  imports: [CharacterIdentityCardComponent, AbilityScoresCardComponent, MatTabsModule],
  template: `
    <div class="sandbox-container">
      <div class="sandbox-header">
        <h1>Dev Sandbox</h1>
        <span class="badge">DEV ONLY</span>
      </div>
      <mat-tab-group>
        <mat-tab label="Identity Card">
          <div class="card-preview">
            <app-character-identity-card [character]="mockCharacter" />
          </div>
        </mat-tab>
        <mat-tab label="Ability Scores Card">
          <div class="card-preview">
            <app-ability-scores-card [character]="mockCharacter" />
          </div>
        </mat-tab>
        <mat-tab label="Both Cards">
          <div class="card-preview two-col">
            <app-character-identity-card [character]="mockCharacter" />
            <app-ability-scores-card [character]="mockCharacter" />
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `
})
export class DevSandboxComponent {
  readonly mockCharacter: ComputedCharacter = MOCK_COMPUTED_CHARACTER;
}
```

**Mock data** (fichier séparé `dev-sandbox/mock-character.data.ts`) :
```typescript
export const MOCK_COMPUTED_CHARACTER: ComputedCharacter = {
  id: 'mock-1',
  name: 'Theron Valspar',
  playerName: 'Maxime',
  race: { raceId: 'elf', raceName: 'Elfe', subraceId: 'high-elf', subraceName: 'Haut-Elfe', isHomebrew: false },
  classes: [
    { classId: 'wizard', className: 'Magicien', subclassId: 'evocation', subclassName: 'Évocation', level: 7, isHomebrew: false },
    { classId: 'fighter', className: 'Guerrier', level: 3, isHomebrew: false },
  ],
  background: { backgroundId: 'sage', backgroundName: 'Sage', isHomebrew: false },
  alignment: 'Neutre Bon',
  experience: 64000,
  appearance: { age: '127', height: '1m80', eyes: 'Argent', hair: 'Blanc', skin: 'Pâle' },
  baseAbilityScores: { strength: 10, dexterity: 16, constitution: 14, intelligence: 20, wisdom: 14, charisma: 12 },
  computedAbilityScores: { strength: 10, dexterity: 16, constitution: 14, intelligence: 22, wisdom: 14, charisma: 12 },
  abilityModifiers: { strength: 0, dexterity: 3, constitution: 2, intelligence: 6, wisdom: 2, charisma: 1 },
  skillProficiencies: { arcana: 'expert', history: 'proficient', investigation: 'proficient', perception: 'proficient' },
  computedSkillBonuses: { arcana: 10, history: 7, investigation: 7, perception: 5, ... },
  savingThrowProficiencies: { strength: false, dexterity: false, constitution: false, intelligence: true, wisdom: true, charisma: false },
  computedSaveBonuses: { strength: 0, dexterity: 3, constitution: 2, intelligence: 10, wisdom: 6, charisma: 1 },
  derivedStats: { proficiencyBonus: 4, initiative: 3, armorClass: 14, speed: 30, hitPointsMax: 82, ... },
  // ... reste des champs vides/défaut
};
```

**Route** dans `app.routes.ts` (SANS authGuard) :
```typescript
{
  path: 'dev',
  loadComponent: () =>
    import('./features/dev-sandbox/dev-sandbox.component').then(m => m.DevSandboxComponent),
},
```
→ Placer AVANT la wildcard `**`.

---

## Étape 2 — CharacterIdentityCardComponent

**Fichier** : `src/app/shared/components/cards/character-identity-card/character-identity-card.component.ts`

**Input** : `character = input.required<ComputedCharacter>()`

**Sections affichées** :

```
┌─────────────────────────────────────────┐
│  [Portrait 60px]   THERON VALSPAR       │
│                    ────────────────     │
│                    Haut-Elfe            │
│                    Magicien 7 / Guerrier 3  (Niv. 10 total) │
│                    Sage · Neutre Bon    │
├─────────────────────────────────────────┤
│  XP : 64 000 / 85 000  [barre progress]│
└─────────────────────────────────────────┘
```

**Pseudo-code logique** :
```typescript
totalLevel = computed(() => character().classes.reduce((s, c) => s + c.level, 0))
classLabel = computed(() =>
  character().classes.map(c => `${c.className} ${c.level}`).join(' / ')
)
xpForNextLevel = computed(() => XP_THRESHOLDS[totalLevel()] ?? null)
xpProgress = computed(() => xpForNextLevel()
  ? (character().experience ?? 0) / xpForNextLevel()! * 100
  : 100
)
```

**Style** :
- Card avec `mat-card` + fond `--parchment-card`
- Nom en 20px bold `--ink`, all-caps avec `letter-spacing`
- Race/sous-race en italique `--ink-secondary`
- Classes en `--crimson` 13px
- Barre XP : fond `--border`, remplie en `--gold`
- Header ornemental : fine ligne `--border-strong` sous le nom

---

## Étape 3 — AbilityScoresCardComponent (lecture seule)

**Fichier** : `src/app/shared/components/cards/ability-scores-card/ability-scores-card.component.ts`

**Input** : `character = input.required<ComputedCharacter>()`

> Note : Distincte du composant éditable existant (`AbilityScoresComponent`). Cette version est **read-only** et orientée affichage.

**Layout** : grille 3×2 identique à l'existant, mais chaque cellule affiche :

```
┌──────────────┐
│  FORCE       │  ← label 10px uppercase
│  +0          │  ← modificateur grand (24px bold)
│  [  10  ]    │  ← score en lecture seule (badge, pas d'input)
│  ▼           │  ← toggle expand
├──────────────┤
│ ○ +0  JS     │  ← jet sauvegarde
│ ○ +0  Athlé. │  ← compétence
└──────────────┘
```

**Différences vs AbilityScoresComponent** :
| Aspect | AbilityScoresComponent (existant) | AbilityScoresCardComponent (nouveau) |
|--------|-----------------------------------|--------------------------------------|
| Score | `<input type="number">` éditable | Badge `<span>` lecture seule |
| Skills | Toggle proficiency on click | Affichage seulement |
| En-tête | Pas de titre global | Card avec titre "Caractéristiques" |
| Données | 5 inputs séparés | 1 input `character: ComputedCharacter` |

**Pseudo-code** :
```typescript
abilities: AbilityName[] = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma']
// Pas d'output events (read-only)
// Expand/collapse conservé pour la lisibilité
```

**Style** :
- Score dans un hexagone ou octogone SVG (optionnel, fallback: badge rond)
- Modificateur en 24px, couleur `--crimson` si négatif, `--ink` sinon
- Expand chevron identique à l'existant
- En-tête card : titre "Caractéristiques" + séparateur `--crimson`

---

## Structure fichiers

```
src/app/
├── features/
│   └── dev-sandbox/
│       ├── dev-sandbox.component.ts    ← NEW
│       └── mock-character.data.ts      ← NEW (mock data)
└── shared/
    └── components/
        └── cards/
            ├── character-identity-card/
            │   ├── character-identity-card.component.ts   ← NEW
            │   └── character-identity-card.component.scss ← NEW
            └── ability-scores-card/
                ├── ability-scores-card.component.ts        ← NEW
                └── ability-scores-card.component.scss      ← NEW
```

---

## Fichiers modifiés

| Fichier | Opération | Description |
|---------|-----------|-------------|
| `src/app/app.routes.ts` | Modifier | Ajouter route `/dev` sans authGuard |
| `src/app/features/dev-sandbox/dev-sandbox.component.ts` | Créer | Page sandbox |
| `src/app/features/dev-sandbox/mock-character.data.ts` | Créer | Mock ComputedCharacter |
| `src/app/shared/components/cards/character-identity-card/character-identity-card.component.ts` | Créer | Card identité |
| `src/app/shared/components/cards/character-identity-card/character-identity-card.component.scss` | Créer | Styles |
| `src/app/shared/components/cards/ability-scores-card/ability-scores-card.component.ts` | Créer | Card caractéristiques (read-only) |
| `src/app/shared/components/cards/ability-scores-card/ability-scores-card.component.scss` | Créer | Styles |

---

## Risques et mitigations

| Risque | Mitigation |
|--------|------------|
| Route `/dev` accessible en prod | Acceptable pour l'instant (app non publique), ou ajouter guard `isDevMode()` |
| `ComputedCharacter` mock incomplet (types stricts) | Créer helper `createMockComputedCharacter()` qui utilise `createEmptyCharacter()` et override les valeurs clés |
| XP thresholds manquants | Créer tableau statique local `XP_THRESHOLDS: number[]` dans le composant identity |

---

## SESSION_ID
- CODEX_SESSION: N/A (pas de modèles externes utilisés)
- GEMINI_SESSION: N/A
