import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-hit-points',
  imports: [FormsModule, MatCardModule, MatInputModule, MatFormFieldModule, MatIconModule],
  template: `
    <div class="hp-grid">
      <mat-card class="hp-card hp-main">
        <div class="hp-header">
          <mat-icon>favorite</mat-icon>
          <span>Points de vie</span>
        </div>
        <div class="hp-values">
          <mat-form-field class="hp-input" appearance="outline">
            <input
              matInput
              type="number"
              [ngModel]="currentHp()"
              (ngModelChange)="onHpChange($event)"
              min="0"
              [max]="maxHp()"
            />
          </mat-form-field>
          <span class="hp-separator">/</span>
          <span class="hp-max">{{ maxHp() }}</span>
        </div>
        @if (currentHp() < maxHp()) {
          <div class="hp-bar-container">
            <div
              class="hp-bar"
              [style.width.%]="hpPercentage"
              [class.hp-low]="hpPercentage < 25"
              [class.hp-mid]="hpPercentage >= 25 && hpPercentage < 50"
            ></div>
          </div>
        }
      </mat-card>

      <mat-card class="hp-card hp-proficiency">
        <div class="hp-header">
          <mat-icon>stars</mat-icon>
          <span>Bonus de maîtrise</span>
        </div>
        <div class="proficiency-value">+{{ proficiencyBonus() }}</div>
      </mat-card>
    </div>
  `,
  styles: `
    .hp-grid {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 12px;
      align-items: stretch;
    }

    .hp-card {
      padding: 16px;
    }

    .hp-header {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--ink-secondary);
      margin-bottom: 8px;

      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }
    }

    .hp-values {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .hp-input {
      width: 72px;

      ::ng-deep .mat-mdc-text-field-wrapper {
        padding: 0 4px;
      }

      ::ng-deep input {
        text-align: center;
        font-size: 20px;
        font-weight: 700;
      }
    }

    .hp-separator {
      font-size: 20px;
      color: var(--ink-muted);
    }

    .hp-max {
      font-size: 20px;
      font-weight: 700;
    }

    .hp-bar-container {
      height: 4px;
      background: var(--border-subtle);
      border-radius: 2px;
      margin-top: 8px;
      overflow: hidden;
    }

    .hp-bar {
      height: 100%;
      background: #4caf50;
      border-radius: 2px;
      transition: width 0.3s ease;

      &.hp-mid {
        background: #ff9800;
      }

      &.hp-low {
        background: #f44336;
      }
    }

    .hp-proficiency {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-width: 100px;
    }

    .proficiency-value {
      font-size: 32px;
      font-weight: 700;
    }
  `,
})
export class HitPointsComponent {
  currentHp = input.required<number>();
  maxHp = input.required<number>();
  proficiencyBonus = input.required<number>();
  hpChange = output<number>();

  get hpPercentage(): number {
    const max = this.maxHp();
    if (max <= 0) return 100;
    return Math.round((this.currentHp() / max) * 100);
  }

  onHpChange(value: number): void {
    if (value != null && value >= 0) {
      this.hpChange.emit(value);
    }
  }
}
