import { Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ModifierFormatPipe } from '../../../../shared/pipes/modifier-format.pipe';

@Component({
  selector: 'app-combat-stats',
  imports: [MatCardModule, MatIconModule, ModifierFormatPipe],
  template: `
    <div class="combat-grid">
      <mat-card class="combat-card">
        <mat-icon class="combat-icon">shield</mat-icon>
        <div class="combat-value">{{ armorClass() }}</div>
        <div class="combat-label">CA</div>
      </mat-card>

      <mat-card class="combat-card">
        <mat-icon class="combat-icon">flash_on</mat-icon>
        <div class="combat-value">{{ initiative() | modifierFormat }}</div>
        <div class="combat-label">Initiative</div>
      </mat-card>

      <mat-card class="combat-card">
        <mat-icon class="combat-icon">directions_run</mat-icon>
        <div class="combat-value">{{ speed() }}</div>
        <div class="combat-label">Vitesse</div>
        <div class="combat-unit">ft</div>
      </mat-card>
    </div>
  `,
  styles: `
    .combat-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
    }

    .combat-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 16px 12px;
      text-align: center;
    }

    .combat-icon {
      color: var(--ink-muted);
      margin-bottom: 4px;
    }

    .combat-value {
      font-size: 28px;
      font-weight: 700;
      line-height: 1.2;
    }

    .combat-label {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--ink-secondary);
      margin-top: 2px;
    }

    .combat-unit {
      font-size: 10px;
      color: var(--ink-muted);
    }
  `,
})
export class CombatStatsComponent {
  armorClass = input.required<number>();
  initiative = input.required<number>();
  speed = input.required<number>();
}
