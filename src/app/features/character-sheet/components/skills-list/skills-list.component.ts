import { Component, input, output, computed, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ModifierFormatPipe } from '../../../../shared/pipes/modifier-format.pipe';
import { SKILL_LABELS, ABILITY_LABELS } from '../../../../data/labels.data';
import { SKILL_ABILITY_MAP } from '../../../../models/stats.model';
import type { SkillName, AbilityName, AbilityScores } from '../../../../models/stats.model';
import type { SkillProficiencies } from '../../../../models/stats.model';

type ProficiencyLevel = 'none' | 'proficient' | 'expert';

const ABILITY_ORDER: AbilityName[] = [
  'strength', 'dexterity', 'constitution',
  'intelligence', 'wisdom', 'charisma',
];

@Component({
  selector: 'app-skills-list',
  imports: [MatIconModule, MatTooltipModule, ModifierFormatPipe],
  template: `
    <div class="skills-header">
      <h3>Compétences</h3>
    </div>

    @for (group of skillGroups(); track group.ability) {
      @if (group.skills.length > 0) {
        <div class="skill-group">
          <button class="group-header" (click)="toggleGroup(group.ability)">
            <span class="group-ability">{{ group.abilityLabel }}</span>
            <span class="group-modifier">{{ getAbilityModifier(group.ability) }}</span>
            <mat-icon class="group-chevron" [class.open]="isOpen(group.ability)">
              expand_more
            </mat-icon>
          </button>

          @if (isOpen(group.ability)) {
            <div class="group-skills">
              @for (skill of group.skills; track skill) {
                <button
                  class="skill-row"
                  (click)="onToggle(skill)"
                  [matTooltip]="getProficiencyTooltip(skill)"
                >
                  <span class="proficiency-indicator">{{ getProficiencyIcon(skill) }}</span>
                  <span class="skill-bonus">{{ getBonus(skill) | modifierFormat }}</span>
                  <span class="skill-name">{{ getLabel(skill) }}</span>
                </button>
              }
            </div>
          }
        </div>
      }
    }
  `,
  styles: `
    :host { display: block; }

    .skills-header h3 {
      font-size: 14px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--ink-secondary);
      margin-bottom: 8px;
    }

    .skill-group {
      margin-bottom: 2px;
    }

    .group-header {
      display: flex;
      align-items: center;
      gap: 6px;
      width: 100%;
      padding: 5px 8px;
      border: none;
      background: var(--parchment-input);
      color: var(--ink-secondary);
      font: inherit;
      cursor: pointer;
      border-radius: 4px;
      border-left: 2px solid var(--border-strong);
      transition: background 0.12s;
      text-align: left;

      &:hover {
        background: var(--parchment-hover);
        border-left-color: var(--crimson);
      }
    }

    .group-ability {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.4px;
      flex: 1;
    }

    .group-modifier {
      font-size: 12px;
      font-weight: 700;
      font-family: 'Roboto Mono', monospace;
      color: var(--ink-muted);
      min-width: 28px;
      text-align: right;
    }

    .group-chevron {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: var(--ink-muted);
      transition: transform 0.2s;
      transform: rotate(-90deg);

      &.open {
        transform: rotate(0deg);
      }
    }

    .group-skills {
      display: flex;
      flex-direction: column;
      gap: 1px;
      padding: 2px 0 4px 8px;
    }

    .skill-row {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 3px 8px;
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
        background: var(--parchment-hover);
      }
    }

    .proficiency-indicator {
      font-size: 13px;
      width: 16px;
      text-align: center;
      flex-shrink: 0;
    }

    .skill-bonus {
      font-weight: 600;
      font-size: 13px;
      width: 28px;
      text-align: right;
      flex-shrink: 0;
      font-family: 'Roboto Mono', monospace;
    }

    .skill-name {
      flex: 1;
      font-size: 13px;
    }
  `,
})
export class SkillsListComponent {
  proficiencies = input.required<SkillProficiencies>();
  bonuses = input.required<{ [skill: string]: number }>();
  abilityModifiers = input<Partial<AbilityScores>>({});
  proficiencyChange = output<{ skill: SkillName; level: ProficiencyLevel }>();

  private readonly openGroups = signal<Set<AbilityName>>(
    new Set(ABILITY_ORDER),
  );

  skillGroups = computed(() =>
    ABILITY_ORDER.map(ability => ({
      ability,
      abilityLabel: ABILITY_LABELS[ability],
      skills: (Object.keys(SKILL_ABILITY_MAP) as SkillName[])
        .filter(s => SKILL_ABILITY_MAP[s] === ability)
        .sort((a, b) => SKILL_LABELS[a].localeCompare(SKILL_LABELS[b], 'fr')),
    })),
  );

  isOpen(ability: AbilityName): boolean {
    return this.openGroups().has(ability);
  }

  toggleGroup(ability: AbilityName): void {
    this.openGroups.update(set => {
      const next = new Set(set);
      next.has(ability) ? next.delete(ability) : next.add(ability);
      return next;
    });
  }

  getLabel(skill: SkillName): string {
    return SKILL_LABELS[skill];
  }

  getBonus(skill: SkillName): number {
    return this.bonuses()[skill] ?? 0;
  }

  getAbilityModifier(ability: AbilityName): string {
    const mod = this.abilityModifiers()[ability] ?? 0;
    return mod >= 0 ? `+${mod}` : `${mod}`;
  }

  getProficiencyLevel(skill: SkillName): ProficiencyLevel {
    return this.proficiencies()[skill] ?? 'none';
  }

  getProficiencyIcon(skill: SkillName): string {
    const level = this.getProficiencyLevel(skill);
    switch (level) {
      case 'proficient': return '\u25CF';
      case 'expert': return '\u25C6';
      default: return '\u25CB';
    }
  }

  getProficiencyTooltip(skill: SkillName): string {
    const level = this.getProficiencyLevel(skill);
    switch (level) {
      case 'proficient': return 'Maîtrise';
      case 'expert': return 'Expertise';
      default: return 'Non maîtrisé';
    }
  }

  onToggle(skill: SkillName): void {
    const current = this.getProficiencyLevel(skill);
    let next: ProficiencyLevel;
    switch (current) {
      case 'none': next = 'proficient'; break;
      case 'proficient': next = 'expert'; break;
      case 'expert': next = 'none'; break;
    }
    this.proficiencyChange.emit({ skill, level: next });
  }
}
