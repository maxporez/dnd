import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ModifierFormatPipe } from '../../../pipes/modifier-format.pipe';
import type { ComputedCharacter } from '../../../../models/character.model';

@Component({
  selector: 'app-combat-stats-card',
  standalone: true,
  imports: [FormsModule, MatInputModule, MatFormFieldModule, MatTooltipModule, ModifierFormatPipe],
  template: `
    <div class="combat-wrapper">

      <!-- ── En-tête ornemental ────────────────────────── -->
      <div class="section-header">
        <svg class="ornament-line" viewBox="0 0 160 12" xmlns="http://www.w3.org/2000/svg">
          <line x1="0" y1="6" x2="52" y2="6" stroke="currentColor" stroke-width="0.8"/>
          <path d="M56,6 L62,1 L68,6 L62,11 Z" fill="none" stroke="currentColor" stroke-width="0.8"/>
          <line x1="72" y1="6" x2="88" y2="6" stroke="currentColor" stroke-width="0.8"/>
          <circle cx="80" cy="6" r="1.5" fill="currentColor"/>
          <path d="M92,6 L98,1 L104,6 L98,11 Z" fill="none" stroke="currentColor" stroke-width="0.8"/>
          <line x1="108" y1="6" x2="160" y2="6" stroke="currentColor" stroke-width="0.8"/>
        </svg>
        <span class="section-title">Combat</span>
        <svg class="ornament-line" viewBox="0 0 160 12" xmlns="http://www.w3.org/2000/svg">
          <line x1="0" y1="6" x2="52" y2="6" stroke="currentColor" stroke-width="0.8"/>
          <path d="M56,6 L62,1 L68,6 L62,11 Z" fill="none" stroke="currentColor" stroke-width="0.8"/>
          <line x1="72" y1="6" x2="88" y2="6" stroke="currentColor" stroke-width="0.8"/>
          <circle cx="80" cy="6" r="1.5" fill="currentColor"/>
          <path d="M92,6 L98,1 L104,6 L98,11 Z" fill="none" stroke="currentColor" stroke-width="0.8"/>
          <line x1="108" y1="6" x2="160" y2="6" stroke="currentColor" stroke-width="0.8"/>
        </svg>
      </div>

      <!-- ── Grille des stats de combat ──────────────── -->
      <div class="stats-grid">

        <div class="stat-cell" matTooltip="Classe d'Armure">
          <div class="stat-value">{{ character().derivedStats.armorClass }}</div>
          <div class="stat-label">Classe d'Armure</div>
        </div>

        <div class="stat-cell" matTooltip="Initiative">
          <div class="stat-value">{{ character().derivedStats.initiative | modifierFormat }}</div>
          <div class="stat-label">Initiative</div>
        </div>

        <div class="stat-cell" matTooltip="Vitesse de déplacement">
          <div class="stat-value">
            {{ character().derivedStats.speed }}
            <span class="stat-unit">m</span>
          </div>
          <div class="stat-label">Vitesse</div>
        </div>

        <div class="stat-cell" matTooltip="Bonus de Maîtrise">
          <div class="stat-value">+{{ character().derivedStats.proficiencyBonus }}</div>
          <div class="stat-label">Bonus Maîtrise</div>
        </div>

        <div class="stat-cell" matTooltip="Perception Passive">
          <div class="stat-value">{{ character().derivedStats.passivePerception }}</div>
          <div class="stat-label">Percep. Passive</div>
        </div>

        <div class="stat-cell" matTooltip="Dés de Vie disponibles">
          <div class="stat-value dice">{{ hitDice() }}</div>
          <div class="stat-label">Dés de Vie</div>
        </div>

      </div>

      <!-- ── Séparateur ─────────────────────────────── -->
      <div class="inner-separator">
        <svg viewBox="0 0 100 6" xmlns="http://www.w3.org/2000/svg">
          <line x1="0" y1="3" x2="42" y2="3" stroke="currentColor" stroke-width="0.6"/>
          <path d="M46,3 L50,0 L54,3 L50,6 Z" fill="currentColor"/>
          <line x1="58" y1="3" x2="100" y2="3" stroke="currentColor" stroke-width="0.6"/>
        </svg>
      </div>

      <!-- ── Points de Vie ──────────────────────────── -->
      <div class="hp-section">
        <div class="hp-header">
          <svg class="heart-icon" viewBox="0 0 20 18" xmlns="http://www.w3.org/2000/svg">
            <path d="M10,16 C10,16 1,10 1,5 C1,2.8 2.8,1 5,1 C7,1 9,2.5 10,4 C11,2.5 13,1 15,1 C17.2,1 19,2.8 19,5 C19,10 10,16 10,16 Z"
              fill="none" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/>
          </svg>
          <span class="hp-title">Points de Vie</span>
          <span class="hp-ratio">{{ character().currentState.hitPoints }} / {{ character().derivedStats.hitPointsMax }}</span>
        </div>

        <div class="hp-edit-row">
          <mat-form-field class="hp-input" appearance="outline">
            <mat-label>PV actuels</mat-label>
            <input
              matInput
              type="number"
              [ngModel]="character().currentState.hitPoints"
              (ngModelChange)="onHpChange($event)"
              min="0"
              [max]="character().derivedStats.hitPointsMax"
            />
          </mat-form-field>

          @if (character().currentState.tempHitPoints > 0) {
            <div class="temp-hp" matTooltip="Points de Vie Temporaires">
              +{{ character().currentState.tempHitPoints }} temp
            </div>
          }
        </div>

        <div class="hp-bar-wrap">
          <div class="hp-bar" [style.width.%]="hpPercent()" [class.low]="hpPercent() < 25" [class.mid]="hpPercent() >= 25 && hpPercent() < 50"></div>
        </div>
      </div>

      <!-- ── Pied ornemental ────────────────────────── -->
      <div class="section-footer">
        <svg viewBox="0 0 200 10" xmlns="http://www.w3.org/2000/svg" class="footer-ornament">
          <line x1="0" y1="5" x2="78" y2="5" stroke="currentColor" stroke-width="0.6"/>
          <path d="M82,5 L88,1 L94,5 L88,9 Z" fill="none" stroke="currentColor" stroke-width="0.8"/>
          <circle cx="100" cy="5" r="1.8" fill="currentColor"/>
          <path d="M106,5 L112,1 L118,5 L112,9 Z" fill="none" stroke="currentColor" stroke-width="0.8"/>
          <line x1="122" y1="5" x2="200" y2="5" stroke="currentColor" stroke-width="0.6"/>
        </svg>
      </div>

    </div>
  `,
  styleUrl: './combat-stats-card.component.scss',
})
export class CombatStatsCardComponent {
  character = input.required<ComputedCharacter>();
  hpChange = output<number>();

  hitDice = () => {
    const remaining = this.character().currentState.hitDiceRemaining;
    const entries = Object.entries(remaining);
    if (!entries.length) return this.character().derivedStats.hitDice || '—';
    return entries.map(([die, count]) => `${count}${die}`).join('+');
  };

  hpPercent = () => {
    const max = this.character().derivedStats.hitPointsMax;
    if (!max) return 100;
    return Math.min(100, Math.round((this.character().currentState.hitPoints / max) * 100));
  };

  onHpChange(value: number): void {
    if (value != null && value >= 0) {
      this.hpChange.emit(value);
    }
  }
}
