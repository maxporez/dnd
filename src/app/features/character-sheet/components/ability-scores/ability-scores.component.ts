import { Component, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ModifierFormatPipe } from '../../../../shared/pipes/modifier-format.pipe';
import { ABILITY_LABELS, SKILL_LABELS } from '../../../../data/labels.data';
import { SKILL_ABILITY_MAP } from '../../../../models/stats.model';
import type { AbilityScores, AbilityName, SkillName, SkillProficiencies, SavingThrowProficiencies } from '../../../../models/stats.model';

type ProficiencyLevel = 'none' | 'proficient' | 'expert';

@Component({
  selector: 'app-ability-scores',
  imports: [FormsModule, MatCardModule, MatInputModule, MatFormFieldModule, MatIconModule, MatTooltipModule, ModifierFormatPipe],
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

          <button class="skills-toggle" (click)="toggle(ability)">
            <mat-icon class="chevron" [class.open]="isOpen(ability)">expand_more</mat-icon>
          </button>

          @if (isOpen(ability)) {
            <div class="skills-section">
              <!-- Jet de sauvegarde -->
              <button
                class="skill-row save-row-inline"
                (click)="onSaveToggle(ability)"
                [matTooltip]="isSaveProficient(ability) ? 'Maîtrise JS' : ''"
              >
                <span class="prof-dot">{{ isSaveProficient(ability) ? '\u25CF' : '\u25CB' }}</span>
                <span class="skill-bonus">{{ getSaveBonus(ability) | modifierFormat }}</span>
                <span class="skill-name save-name">Jet de sauvegarde</span>
              </button>

              @for (skill of getSkills(ability); track skill) {
                <button
                  class="skill-row"
                  (click)="onSkillToggle(skill)"
                  [matTooltip]="getProfTooltip(skill)"
                >
                  <span class="prof-dot">{{ getProfIcon(skill) }}</span>
                  <span class="skill-bonus">{{ getSkillBonus(skill) | modifierFormat }}</span>
                  <span class="skill-name">{{ getSkillLabel(skill) }}</span>
                </button>
              }
            </div>
          }
        </mat-card>
      }
    </div>
  `,
  styleUrl: './ability-scores.component.scss',
})
export class AbilityScoresComponent {
  baseScores = input.required<AbilityScores>();
  computedScores = input.required<AbilityScores>();
  modifiers = input.required<AbilityScores>();
  skillProficiencies = input<SkillProficiencies>({});
  skillBonuses = input<{ [skill: string]: number }>({});
  saveProficiencies = input<SavingThrowProficiencies>({} as SavingThrowProficiencies);
  saveBonuses = input<{ [ability: string]: number }>({});
  scoreChange = output<{ ability: AbilityName; value: number }>();
  skillProficiencyChange = output<{ skill: SkillName; level: ProficiencyLevel }>();
  saveChange = output<{ ability: AbilityName; proficient: boolean }>();

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

  getSkills(ability: AbilityName): SkillName[] {
    return (Object.keys(SKILL_ABILITY_MAP) as SkillName[])
      .filter(s => SKILL_ABILITY_MAP[s] === ability)
      .sort((a, b) => SKILL_LABELS[a].localeCompare(SKILL_LABELS[b], 'fr'));
  }

  getSkillLabel(skill: SkillName): string {
    return SKILL_LABELS[skill];
  }

  getSkillBonus(skill: SkillName): number {
    return this.skillBonuses()[skill] ?? 0;
  }

  getProfLevel(skill: SkillName): ProficiencyLevel {
    return (this.skillProficiencies()[skill] ?? 'none') as ProficiencyLevel;
  }

  getProfIcon(skill: SkillName): string {
    switch (this.getProfLevel(skill)) {
      case 'proficient': return '\u25CF';
      case 'expert': return '\u25C6';
      default: return '\u25CB';
    }
  }

  getProfTooltip(skill: SkillName): string {
    switch (this.getProfLevel(skill)) {
      case 'proficient': return 'Maitrise';
      case 'expert': return 'Expertise';
      default: return '';
    }
  }

  isSaveProficient(ability: AbilityName): boolean {
    return this.saveProficiencies()[ability] ?? false;
  }

  getSaveBonus(ability: AbilityName): number {
    return this.saveBonuses()[ability] ?? 0;
  }

  onSaveToggle(ability: AbilityName): void {
    this.saveChange.emit({ ability, proficient: !this.isSaveProficient(ability) });
  }

  onSkillToggle(skill: SkillName): void {
    const current = this.getProfLevel(skill);
    let next: ProficiencyLevel;
    switch (current) {
      case 'none': next = 'proficient'; break;
      case 'proficient': next = 'expert'; break;
      default: next = 'none';
    }
    this.skillProficiencyChange.emit({ skill, level: next });
  }
}
