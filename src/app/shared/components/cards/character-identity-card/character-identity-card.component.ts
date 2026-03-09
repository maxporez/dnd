import { Component, computed, input, output } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import type { ComputedCharacter } from '../../../../models/character.model';

// XP needed to reach each level (D&D 5e 2024)
const XP_THRESHOLDS: Record<number, number> = {
  1: 300,
  2: 900,
  3: 2700,
  4: 6500,
  5: 14000,
  6: 23000,
  7: 34000,
  8: 48000,
  9: 64000,
  10: 85000,
  11: 100000,
  12: 120000,
  13: 140000,
  14: 165000,
  15: 195000,
  16: 225000,
  17: 265000,
  18: 305000,
  19: 355000,
};

@Component({
  selector: 'app-character-identity-card',
  standalone: true,
  imports: [DecimalPipe, MatCardModule, MatIconModule],
  template: `
    <mat-card class="identity-card">
      <div class="identity-body">
        <!-- Portrait -->
        <div class="portrait-col">
          @if (character().appearance.portrait) {
            <img class="portrait" [src]="character().appearance.portrait" alt="Portrait" />
          } @else {
            <div class="portrait-placeholder">
              <mat-icon>person</mat-icon>
            </div>
          }
          @if (character().currentState.inspiration) {
            <div class="inspiration-badge" title="Inspiration">★</div>
          }
        </div>

        <!-- Infos principales -->
        <div class="info-col">
          <div class="char-name" (click)="nameClick.emit()" title="Cliquer pour modifier">{{ character().name || 'Sans nom' }}</div>
          <div class="divider-line"></div>

          <div class="race-line">
            {{ raceLine() }}
          </div>

          <div class="classes-line">
            <span class="class-label">{{ classLabel() }}</span>
            <span class="level-badge">Niv. {{ totalLevel() }}</span>
          </div>

          <div class="meta-line">
            @if (character().background.backgroundName) {
              <span class="meta-item">{{ character().background.backgroundName }}</span>
            }
            @if (character().alignment) {
              <span class="meta-sep">·</span>
              <span class="meta-item">{{ character().alignment }}</span>
            }
          </div>
        </div>
      </div>

      <!-- Barre XP -->
      <div class="xp-section">
        <div class="xp-label">
          <span>XP</span>
          <span class="xp-values">{{ (character().experience ?? 0) | number }} / {{ xpForNext() | number }}</span>
        </div>
        <div class="xp-bar">
          <div class="xp-fill" [style.width.%]="xpPercent()"></div>
        </div>
      </div>
    </mat-card>
  `,
  styleUrl: './character-identity-card.component.scss',
})
export class CharacterIdentityCardComponent {
  character = input.required<ComputedCharacter>();
  nameClick = output<void>();

  totalLevel = computed(() =>
    this.character().classes.reduce((sum, c) => sum + c.level, 0)
  );

  classLabel = computed(() =>
    this.character().classes
      .map(c => `${c.className} ${c.level}`)
      .join(' / ')
  );

  raceLine = computed(() => {
    const r = this.character().race;
    return r.subraceName ? `${r.subraceName}` : r.raceName;
  });

  xpForNext = computed(() => XP_THRESHOLDS[this.totalLevel()] ?? null);

  xpPercent = computed(() => {
    const next = this.xpForNext();
    if (!next) return 100;
    const xp = this.character().experience ?? 0;
    return Math.min(100, Math.round((xp / next) * 100));
  });
}
