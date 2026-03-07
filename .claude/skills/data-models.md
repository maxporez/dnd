# Data Models Agent

## Role
Manage TypeScript interfaces, Dexie database schema, and signal-based state.

## Model Files
- `src/app/models/character.model.ts` - Character, ComputedCharacter, ClassLevel, etc.
- `src/app/models/rules.model.ts` - Modifier, HomebrewPack, HomebrewRule, FormulaContext
- `src/app/models/stats.model.ts` - AbilityScores, SkillProficiencies, DerivedStats
- `src/app/models/game-data.model.ts` - GameRace, GameClass, GameSpell, GameItem, etc.

## Key Concepts

### Character / ComputedCharacter
- `Character` stores raw data (base ability scores, proficiencies, etc.)
- `ComputedCharacter` extends Character with computed values (after modifiers)
- Computation happens in `ModifierEngineService.computeCharacterStats()`

### Modifier System
- `Modifier` has: target (e.g. `ability.strength`), operation (add/set/formula), value
- Modifiers come from races, classes, items, homebrew rules
- Evaluated using `mathjs` with a `FormulaContext`

### Dexie Database
- DB name: `DnDCharacterSheet` (MUST keep for data continuity)
- 3 schema versions (MUST keep all for migration)
- Tables: characters, homebrewPacks, homebrewRules, settings, races, classes, spells, items, backgrounds, feats, dataStatus

### Signal State Pattern
```typescript
@Injectable({ providedIn: 'root' })
export class CharacterState {
  private characterService = inject(CharacterService);
  private modifierEngine = inject(ModifierEngineService);

  characters = signal<Character[]>([]);
  currentCharacter = signal<ComputedCharacter | null>(null);
  loading = signal(false);

  async loadOne(id: string): Promise<void> {
    this.loading.set(true);
    const data = await this.characterService.getCharacter(id);
    if (data) {
      this.currentCharacter.set(this.modifierEngine.computeCharacterStats(data));
    }
    this.loading.set(false);
  }
}
```
