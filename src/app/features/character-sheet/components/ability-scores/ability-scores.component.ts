import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ModifierFormatPipe } from '../../../../shared/pipes/modifier-format.pipe';
import { ABILITY_LABELS } from '../../../../data/labels.data';
import type { AbilityScores, AbilityName } from '../../../../models/stats.model';

@Component({
  selector: 'app-ability-scores',
  imports: [FormsModule, MatCardModule, MatInputModule, MatFormFieldModule, ModifierFormatPipe],
  template: `
    <div class="ability-grid">
      @for (ability of abilities; track ability) {
        <mat-card class="ability-card">
          <div class="ability-label">{{ getLabel(ability) }}</div>
          <div class="ability-modifier">{{ getModifier(ability) | modifierFormat }}</div>
          <mat-form-field class="ability-input" appearance="outline">
            <input
              matInput
              type="number"
              [ngModel]="getBaseScore(ability)"
              (ngModelChange)="onScoreChange(ability, $event)"
              min="1"
              max="30"
            />
          </mat-form-field>
          @if (getBaseScore(ability) !== getComputedScore(ability)) {
            <div class="ability-computed">{{ getComputedScore(ability) }}</div>
          }
        </mat-card>
      }
    </div>
  `,
  styles: `
    .ability-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
    }

    @media (min-width: 900px) {
      .ability-grid {
        grid-template-columns: repeat(6, 1fr);
      }
    }

    .ability-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 12px 8px;
      text-align: center;
    }

    .ability-label {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: rgba(255, 255, 255, 0.7);
      margin-bottom: 4px;
    }

    .ability-modifier {
      font-size: 24px;
      font-weight: 700;
      margin-bottom: 4px;
    }

    .ability-input {
      width: 64px;

      ::ng-deep .mat-mdc-text-field-wrapper {
        padding: 0 4px;
      }

      ::ng-deep input {
        text-align: center;
        font-size: 16px;
        font-weight: 500;
      }
    }

    .ability-computed {
      font-size: 11px;
      color: #bb86fc;
      margin-top: 2px;
    }
  `,
})
export class AbilityScoresComponent {
  baseScores = input.required<AbilityScores>();
  computedScores = input.required<AbilityScores>();
  modifiers = input.required<AbilityScores>();
  scoreChange = output<{ ability: AbilityName; value: number }>();

  readonly abilities: AbilityName[] = [
    'strength', 'dexterity', 'constitution',
    'intelligence', 'wisdom', 'charisma',
  ];

  getLabel(ability: AbilityName): string {
    return ABILITY_LABELS[ability];
  }

  getBaseScore(ability: AbilityName): number {
    return this.baseScores()[ability];
  }

  getComputedScore(ability: AbilityName): number {
    return this.computedScores()[ability];
  }

  getModifier(ability: AbilityName): number {
    return this.modifiers()[ability];
  }

  onScoreChange(ability: AbilityName, value: number): void {
    if (value != null && value >= 1 && value <= 30) {
      this.scoreChange.emit({ ability, value });
    }
  }
}
