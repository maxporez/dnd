import { Component, input, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ModifierFormatPipe } from '../../../pipes/modifier-format.pipe';
import { ABILITY_LABELS, SKILL_LABELS } from '../../../../data/labels.data';
import { SKILL_ABILITY_MAP } from '../../../../models/stats.model';
import type { AbilityName, SkillName } from '../../../../models/stats.model';
import type { ComputedCharacter } from '../../../../models/character.model';

@Component({
  selector: 'app-ability-scores-card',
  standalone: true,
  imports: [MatCardModule, MatTooltipModule, ModifierFormatPipe],
  template: `
    <div class="ability-scores-wrapper">

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
        <span class="section-title">Caractéristiques</span>
        <svg class="ornament-line" viewBox="0 0 160 12" xmlns="http://www.w3.org/2000/svg">
          <line x1="0" y1="6" x2="52" y2="6" stroke="currentColor" stroke-width="0.8"/>
          <path d="M56,6 L62,1 L68,6 L62,11 Z" fill="none" stroke="currentColor" stroke-width="0.8"/>
          <line x1="72" y1="6" x2="88" y2="6" stroke="currentColor" stroke-width="0.8"/>
          <circle cx="80" cy="6" r="1.5" fill="currentColor"/>
          <path d="M92,6 L98,1 L104,6 L98,11 Z" fill="none" stroke="currentColor" stroke-width="0.8"/>
          <line x1="108" y1="6" x2="160" y2="6" stroke="currentColor" stroke-width="0.8"/>
        </svg>
      </div>

      <!-- ── Grille des 6 caractéristiques ─────────────── -->
      <div class="ability-grid">
        @for (ability of abilities; track ability) {
          <div class="ability-box" [class.is-open]="isOpen(ability)">

            <!-- Titre ability -->
            <div class="ability-title">
              <span>{{ getLabel(ability) }}</span>
            </div>

            <!-- Corps : cercle score + bloc modificateur -->
            <div class="ability-body">
              <div class="score-circle-wrap">
                <div class="score-circle">
                  <span class="score-value">{{ getScore(ability) }}</span>
                </div>
                <div class="score-label">valeur</div>
              </div>

              <div class="modifier-block">
                <div class="modifier-value" [class.negative]="getModifier(ability) < 0">
                  {{ getModifier(ability) | modifierFormat }}
                </div>
                <div class="modifier-label">modificateur</div>
              </div>
            </div>

            <!-- Séparateur -->
            <div class="ability-separator">
              <svg viewBox="0 0 100 6" xmlns="http://www.w3.org/2000/svg">
                <line x1="0" y1="3" x2="42" y2="3" stroke="currentColor" stroke-width="0.6"/>
                <path d="M46,3 L50,0 L54,3 L50,6 Z" fill="currentColor"/>
                <line x1="58" y1="3" x2="100" y2="3" stroke="currentColor" stroke-width="0.6"/>
              </svg>
            </div>

            <!-- Sauvegarde + compétences (toujours visibles depuis le clic bouton) -->
            <div class="skills-list">
              <!-- Sauvegarde -->
              <div class="skill-row save-row" [matTooltip]="isSaveProficient(ability) ? 'Maîtrise JS' : ''">
                <span class="prof-diamond">{{ isSaveProficient(ability) ? '◆' : '◇' }}</span>
                <span class="skill-bonus">{{ getSaveBonus(ability) | modifierFormat }}</span>
                <span class="skill-name save-name">Sauvegarde</span>
              </div>

              <!-- Compétences (dépliables) -->
              @if (isOpen(ability)) {
                @for (skill of getSkills(ability); track skill) {
                  <div class="skill-row" [matTooltip]="getProfTooltip(skill)">
                    <span class="prof-diamond">{{ getProfIcon(skill) }}</span>
                    <span class="skill-bonus">{{ getSkillBonus(skill) | modifierFormat }}</span>
                    <span class="skill-name">{{ getSkillLabel(skill) }}</span>
                  </div>
                }
              }

              <!-- Bouton expand si compétences existent -->
              @if (getSkills(ability).length > 0) {
                <button class="expand-btn" (click)="toggle(ability)">
                  <svg viewBox="0 0 20 8" xmlns="http://www.w3.org/2000/svg" class="expand-svg" [class.flipped]="isOpen(ability)">
                    <polyline points="2,2 10,6 18,2" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
                  </svg>
                </button>
              }
            </div>

          </div>
        }
      </div>

      <!-- ── Pied ornemental ────────────────────────────── -->
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
  styleUrl: './ability-scores-card.component.scss',
})
export class AbilityScoresCardComponent {
  character = input.required<ComputedCharacter>();

  readonly abilities: AbilityName[] = [
    'strength', 'dexterity', 'constitution',
    'intelligence', 'wisdom', 'charisma',
  ];

  private readonly expanded = signal<Set<AbilityName>>(new Set());

  isOpen(ability: AbilityName): boolean {
    return this.expanded().has(ability);
  }

  toggle(ability: AbilityName): void {
    this.expanded.update(set => {
      const next = new Set(set);
      next.has(ability) ? next.delete(ability) : next.add(ability);
      return next;
    });
  }

  getLabel(ability: AbilityName): string {
    return ABILITY_LABELS[ability];
  }

  getScore(ability: AbilityName): number {
    return this.character().computedAbilityScores[ability];
  }

  getModifier(ability: AbilityName): number {
    return this.character().abilityModifiers[ability];
  }

  isSaveProficient(ability: AbilityName): boolean {
    return this.character().savingThrowProficiencies[ability] ?? false;
  }

  getSaveBonus(ability: AbilityName): number {
    return this.character().computedSaveBonuses[ability] ?? 0;
  }

  getSkills(ability: AbilityName): SkillName[] {
    return (Object.keys(SKILL_ABILITY_MAP) as SkillName[])
      .filter(s => SKILL_ABILITY_MAP[s] === ability)
      .sort((a, b) => SKILL_LABELS[a].localeCompare(SKILL_LABELS[b], 'fr'));
  }

  getSkillLabel(skill: SkillName): string {
    return SKILL_LABELS[skill];
  }

  getSkillBonus(skill: SkillName): number {
    return this.character().computedSkillBonuses[skill] ?? 0;
  }

  getProfLevel(skill: SkillName): string {
    return this.character().skillProficiencies[skill] ?? 'none';
  }

  getProfIcon(skill: SkillName): string {
    switch (this.getProfLevel(skill)) {
      case 'proficient': return '◆';
      case 'expert': return '◈';
      default: return '◇';
    }
  }

  getProfTooltip(skill: SkillName): string {
    switch (this.getProfLevel(skill)) {
      case 'proficient': return 'Maîtrise';
      case 'expert': return 'Expertise';
      default: return '';
    }
  }
}
