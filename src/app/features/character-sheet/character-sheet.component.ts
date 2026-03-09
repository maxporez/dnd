import { Component, inject, computed, signal, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { CharacterState } from '../../core/state/character.state';
import { GameDataState } from '../../core/state/game-data.state';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { BackButtonComponent } from '../../shared/components/back-button/back-button.component';
import { AbilityScoresComponent } from './components/ability-scores/ability-scores.component';
import { CombatStatsComponent } from './components/combat-stats/combat-stats.component';
import { HitPointsComponent } from './components/hit-points/hit-points.component';
import { CharacterNavComponent } from './components/character-nav/character-nav.component';
import { CharacterIdentityCardComponent } from '../../shared/components/cards/character-identity-card/character-identity-card.component';
import { CombatStatsCardComponent } from '../../shared/components/cards/combat-stats-card/combat-stats-card.component';
import { RACES } from '../../data/base-races.data';
import { CLASSES } from '../../data/base-classes.data';
import type { AbilityName, SkillName } from '../../models/stats.model';
import type { Character } from '../../models/character.model';

@Component({
  selector: 'app-character-sheet',
  imports: [
    FormsModule,
    MatCardModule, MatInputModule, MatFormFieldModule, MatSelectModule,
    MatIconModule, MatButtonModule,
    LoadingSpinnerComponent, BackButtonComponent,
    AbilityScoresComponent, CharacterNavComponent,
    CharacterIdentityCardComponent, CombatStatsCardComponent,
  ],
  template: `
    @if (characterState.loading()) {
      <div class="page-container">
        <app-loading-spinner message="Chargement du personnage..." />
      </div>
    } @else if (characterState.error() && !character()) {
      <div class="page-container">
        <div class="error-container">
          <app-back-button />
          <mat-icon class="error-icon">error_outline</mat-icon>
          <p class="error-message">{{ characterState.error() }}</p>
        </div>
      </div>
    } @else if (character(); as char) {
      <div class="page-container sheet-container">
        <!-- Top bar : retour + saving indicator -->
        <div class="sheet-topbar">
          <app-back-button />
          @if (characterState.saving()) {
            <mat-icon class="saving-indicator">sync</mat-icon>
          }
        </div>

        <!-- Identity card : nom, race, classe, niveau, XP -->
        <section class="sheet-section">
          <app-character-identity-card
            [character]="char"
            (nameClick)="editingName.set(true)"
          />
          @if (editingName()) {
            <div class="name-edit-row">
              <input
                class="name-edit"
                [ngModel]="char.name"
                (ngModelChange)="onNameChange($event)"
                (blur)="editingName.set(false)"
                (keydown.enter)="editingName.set(false)"
                placeholder="Nom du personnage"
                autofocus
              />
            </div>
          }
        </section>

        <!-- Selectors race / classe / niveau -->
        <div class="selectors-row">
          <mat-form-field appearance="outline" class="selector-field">
            <mat-label>Race</mat-label>
            <mat-select
              [ngModel]="char.race.raceId"
              (ngModelChange)="onRaceChange($event)"
            >
              @for (race of baseRaces; track race.id) {
                <mat-option [value]="race.id">{{ race.name }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="selector-field">
            <mat-label>Classe</mat-label>
            <mat-select
              [ngModel]="primaryClassId()"
              (ngModelChange)="onClassChange($event)"
            >
              @for (cls of baseClasses; track cls.id) {
                <mat-option [value]="cls.id">{{ cls.name }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="selector-field level-field">
            <mat-label>Niveau</mat-label>
            <input
              matInput
              type="number"
              [ngModel]="primaryClassLevel()"
              (ngModelChange)="onLevelChange($event)"
              min="1"
              max="20"
            />
          </mat-form-field>
        </div>

        <!-- Navigation Fiche / Inventaire / Grimoire -->
        <app-character-nav [characterId]="char.id" />

        <!-- Combat Stats + PV -->
        <section class="sheet-section">
          <app-combat-stats-card
            [character]="char"
            (hpChange)="onHpChange($event)"
          />
        </section>

        <!-- Ability Scores + Save + Skills -->
        <section class="sheet-section">
          <app-ability-scores
            [baseScores]="char.baseAbilityScores"
            [computedScores]="char.computedAbilityScores"
            [modifiers]="char.abilityModifiers"
            [skillProficiencies]="char.skillProficiencies"
            [skillBonuses]="char.computedSkillBonuses"
            [saveProficiencies]="char.savingThrowProficiencies"
            [saveBonuses]="char.computedSaveBonuses"
            (scoreChange)="onAbilityScoreChange($event)"
            (skillProficiencyChange)="onSkillToggle($event)"
            (saveChange)="onSaveToggle($event)"
          />
        </section>
      </div>
    }
  `,
  styles: `
    .sheet-container {
      max-width: 900px;
      padding-bottom: 48px;
    }

    .sheet-topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 10px;
    }

    .name-edit-row {
      margin-top: 6px;
    }

    .name-edit {
      background: transparent;
      border: none;
      border-bottom: 2px solid var(--crimson);
      outline: none;
      color: var(--ink);
      font-family: 'Cinzel', serif;
      font-size: 16px;
      font-weight: 700;
      padding: 2px 0;
      width: 100%;
    }

    .saving-indicator {
      animation: spin 1s linear infinite;
      color: var(--ink-muted);
      flex-shrink: 0;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .selectors-row {
      display: flex;
      gap: 12px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }

    .selector-field {
      flex: 1;
      min-width: 140px;
    }

    .level-field {
      max-width: 100px;
      flex: 0 0 100px;
    }

    .sheet-section {
      margin-bottom: 20px;
    }


    .error-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      padding-top: 48px;
    }

    .error-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #f44336;
    }

    .error-message {
      color: var(--ink-secondary);
      font-size: 16px;
    }
  `,
})
export class CharacterSheetComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  characterState = inject(CharacterState);
  private gameDataState = inject(GameDataState);

  readonly character = this.characterState.currentCharacter;
  readonly baseRaces = RACES;
  readonly baseClasses = CLASSES;
  readonly editingName = signal(false);

  private saveTimeout: ReturnType<typeof setTimeout> | null = null;

  readonly primaryClassId = computed(() => {
    const char = this.character();
    return char?.classes?.[0]?.classId ?? '';
  });

  readonly primaryClassLevel = computed(() => {
    const char = this.character();
    return char?.classes?.[0]?.level ?? 1;
  });

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.characterState.loadOne(id);
        this.gameDataState.loadAll();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.characterState.clearCurrent();
  }

  // --- Auto-save with debounce ---

  private autoSave(updates: Partial<Character>): void {
    const char = this.character();
    if (!char) return;

    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.saveTimeout = setTimeout(() => {
      this.characterState.save(char.id, updates);
    }, 500);
  }

  // --- Event handlers ---

  onNameChange(name: string): void {
    this.autoSave({ name });
  }

  onRaceChange(raceId: string): void {
    const race = RACES.find(r => r.id === raceId);
    if (race) {
      this.autoSave({
        race: { raceId: race.id, raceName: race.name, isHomebrew: false },
      });
    }
  }

  onClassChange(classId: string): void {
    const cls = CLASSES.find(c => c.id === classId);
    if (!cls) return;
    const char = this.character();
    const currentLevel = char?.classes?.[0]?.level ?? 1;
    this.autoSave({
      classes: [{
        classId: cls.id,
        className: cls.name,
        level: currentLevel,
        isHomebrew: false,
      }],
    });
  }

  onLevelChange(level: number): void {
    if (level == null || level < 1 || level > 20) return;
    const char = this.character();
    const currentClass = char?.classes?.[0];
    this.autoSave({
      classes: [{
        classId: currentClass?.classId ?? '',
        className: currentClass?.className ?? '',
        level,
        isHomebrew: currentClass?.isHomebrew ?? false,
      }],
    });
  }

  onAbilityScoreChange(event: { ability: AbilityName; value: number }): void {
    const char = this.character();
    if (!char) return;
    this.autoSave({
      baseAbilityScores: {
        ...char.baseAbilityScores,
        [event.ability]: event.value,
      },
    });
  }

  onSkillToggle(event: { skill: SkillName; level: 'none' | 'proficient' | 'expert' }): void {
    const char = this.character();
    if (!char) return;
    this.autoSave({
      skillProficiencies: {
        ...char.skillProficiencies,
        [event.skill]: event.level,
      },
    });
  }

  onSaveToggle(event: { ability: AbilityName; proficient: boolean }): void {
    const char = this.character();
    if (!char) return;
    this.autoSave({
      savingThrowProficiencies: {
        ...char.savingThrowProficiencies,
        [event.ability]: event.proficient,
      },
    });
  }

  onHpChange(hp: number): void {
    const char = this.character();
    if (!char) return;
    this.autoSave({
      currentState: {
        ...char.currentState,
        hitPoints: hp,
      },
    });
  }
}
