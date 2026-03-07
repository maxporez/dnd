import { Component, input, output, computed } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ModifierFormatPipe } from '../../../../shared/pipes/modifier-format.pipe';
import { SKILL_LABELS, ABILITY_LABELS } from '../../../../data/labels.data';
import { SKILL_ABILITY_MAP } from '../../../../models/stats.model';
import type { SkillName } from '../../../../models/stats.model';
import type { SkillProficiencies } from '../../../../models/stats.model';

type ProficiencyLevel = 'none' | 'proficient' | 'expert';

@Component({
  selector: 'app-skills-list',
  imports: [MatIconModule, MatTooltipModule, ModifierFormatPipe],
  template: `
    <div class="skills-header">
      <h3>Compétences</h3>
    </div>
    <div class="skills-list">
      @for (skill of sortedSkills(); track skill) {
        <button
          class="skill-row"
          (click)="onToggle(skill)"
          [matTooltip]="getProficiencyTooltip(skill)"
        >
          <span class="proficiency-indicator">{{ getProficiencyIcon(skill) }}</span>
          <span class="skill-bonus">{{ getBonus(skill) | modifierFormat }}</span>
          <span class="skill-name">{{ getLabel(skill) }}</span>
          <span class="skill-ability">{{ getAbilityShort(skill) }}</span>
        </button>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    .skills-header h3 {
      font-size: 14px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: rgba(255, 255, 255, 0.7);
      margin-bottom: 8px;
    }

    .skills-list {
      display: flex;
      flex-direction: column;
      gap: 1px;
    }

    .skill-row {
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

    .skill-bonus {
      font-weight: 600;
      font-size: 14px;
      width: 32px;
      text-align: right;
      flex-shrink: 0;
      font-family: 'Roboto Mono', monospace;
    }

    .skill-name {
      flex: 1;
      font-size: 13px;
    }

    .skill-ability {
      font-size: 11px;
      color: rgba(255, 255, 255, 0.4);
      text-transform: uppercase;
      flex-shrink: 0;
    }
  `,
})
export class SkillsListComponent {
  proficiencies = input.required<SkillProficiencies>();
  bonuses = input.required<{ [skill: string]: number }>();
  proficiencyChange = output<{ skill: SkillName; level: ProficiencyLevel }>();

  private readonly skillNames: SkillName[] = Object.keys(SKILL_LABELS) as SkillName[];

  sortedSkills = computed<SkillName[]>(() => {
    return [...this.skillNames].sort((a, b) =>
      SKILL_LABELS[a].localeCompare(SKILL_LABELS[b], 'fr'),
    );
  });

  getLabel(skill: SkillName): string {
    return SKILL_LABELS[skill];
  }

  getBonus(skill: SkillName): number {
    return this.bonuses()[skill] ?? 0;
  }

  getProficiencyLevel(skill: SkillName): ProficiencyLevel {
    return this.proficiencies()[skill] ?? 'none';
  }

  getProficiencyIcon(skill: SkillName): string {
    const level = this.getProficiencyLevel(skill);
    switch (level) {
      case 'proficient': return '\u25CF'; // filled circle
      case 'expert': return '\u25C6'; // diamond
      default: return '\u25CB'; // empty circle
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

  getAbilityShort(skill: SkillName): string {
    const ability = SKILL_ABILITY_MAP[skill];
    return ABILITY_LABELS[ability].substring(0, 3);
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
