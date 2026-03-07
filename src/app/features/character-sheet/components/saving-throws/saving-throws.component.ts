import { Component, input, output } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ModifierFormatPipe } from '../../../../shared/pipes/modifier-format.pipe';
import { ABILITY_LABELS } from '../../../../data/labels.data';
import type { AbilityName, SavingThrowProficiencies } from '../../../../models/stats.model';

@Component({
  selector: 'app-saving-throws',
  imports: [MatTooltipModule, ModifierFormatPipe],
  template: `
    <div class="saves-header">
      <h3>Jets de sauvegarde</h3>
    </div>
    <div class="saves-list">
      @for (ability of abilities; track ability) {
        <button
          class="save-row"
          (click)="onToggle(ability)"
          [matTooltip]="isProficient(ability) ? 'Maîtrise' : 'Non maîtrisé'"
        >
          <span class="proficiency-indicator">{{ isProficient(ability) ? '\u25CF' : '\u25CB' }}</span>
          <span class="save-bonus">{{ getBonus(ability) | modifierFormat }}</span>
          <span class="save-name">{{ getLabel(ability) }}</span>
        </button>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    .saves-header h3 {
      font-size: 14px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: rgba(255, 255, 255, 0.7);
      margin-bottom: 8px;
    }

    .saves-list {
      display: flex;
      flex-direction: column;
      gap: 1px;
    }

    .save-row {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px 8px;
      border: none;
      background: transparent;
      color: inherit;
      font: inherit;
      cursor: pointer;
      border-radius: 4px;
      transition: background-color 0.15s;
      text-align: left;
      width: 100%;

      &:hover {
        background: rgba(255, 255, 255, 0.05);
      }
    }

    .proficiency-indicator {
      font-size: 14px;
      width: 18px;
      text-align: center;
      flex-shrink: 0;
    }

    .save-bonus {
      font-weight: 600;
      font-size: 14px;
      width: 32px;
      text-align: right;
      flex-shrink: 0;
      font-family: 'Roboto Mono', monospace;
    }

    .save-name {
      flex: 1;
      font-size: 13px;
    }
  `,
})
export class SavingThrowsComponent {
  proficiencies = input.required<SavingThrowProficiencies>();
  bonuses = input.required<{ [ability: string]: number }>();
  proficiencyChange = output<{ ability: AbilityName; proficient: boolean }>();

  readonly abilities: AbilityName[] = [
    'strength', 'dexterity', 'constitution',
    'intelligence', 'wisdom', 'charisma',
  ];

  getLabel(ability: AbilityName): string {
    return ABILITY_LABELS[ability];
  }

  isProficient(ability: AbilityName): boolean {
    return this.proficiencies()[ability];
  }

  getBonus(ability: AbilityName): number {
    return this.bonuses()[ability] ?? 0;
  }

  onToggle(ability: AbilityName): void {
    this.proficiencyChange.emit({
      ability,
      proficient: !this.isProficient(ability),
    });
  }
}
