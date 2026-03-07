import { Injectable } from '@angular/core';
import { evaluate } from 'mathjs';
import {
  getAbilityModifier,
  getProficiencyBonus,
  SKILL_ABILITY_MAP,
} from '../../models/stats.model';
import type {
  Character, ComputedCharacter,
} from '../../models/character.model';
import type {
  Modifier, FormulaContext,
} from '../../models/rules.model';
import type {
  AbilityScores, DerivedStats, SkillName, AbilityName,
} from '../../models/stats.model';

@Injectable({ providedIn: 'root' })
export class ModifierEngineService {

  computeCharacterStats(character: Character): ComputedCharacter {
    const computedAbilityScores: AbilityScores = { ...character.baseAbilityScores };

    const modifiersByTarget = new Map<string, Modifier[]>();
    for (const mod of character.activeModifiers) {
      const existing = modifiersByTarget.get(mod.target) || [];
      existing.push(mod);
      modifiersByTarget.set(mod.target, existing);
    }

    modifiersByTarget.forEach((mods) => {
      mods.sort((a, b) => (a.priority || 0) - (b.priority || 0));
    });

    const abilityTargets = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];

    for (const ability of abilityTargets) {
      const mods = modifiersByTarget.get(`ability.${ability}`) || [];
      const tempContext = this.createFormulaContext(character, {
        strength: getAbilityModifier(computedAbilityScores.strength),
        dexterity: getAbilityModifier(computedAbilityScores.dexterity),
        constitution: getAbilityModifier(computedAbilityScores.constitution),
        intelligence: getAbilityModifier(computedAbilityScores.intelligence),
        wisdom: getAbilityModifier(computedAbilityScores.wisdom),
        charisma: getAbilityModifier(computedAbilityScores.charisma),
      });

      for (const mod of mods) {
        computedAbilityScores[ability as AbilityName] = this.applyModifier(
          computedAbilityScores[ability as AbilityName], mod, tempContext,
        );
      }
    }

    const abilityModifiers: AbilityScores = {
      strength: getAbilityModifier(computedAbilityScores.strength),
      dexterity: getAbilityModifier(computedAbilityScores.dexterity),
      constitution: getAbilityModifier(computedAbilityScores.constitution),
      intelligence: getAbilityModifier(computedAbilityScores.intelligence),
      wisdom: getAbilityModifier(computedAbilityScores.wisdom),
      charisma: getAbilityModifier(computedAbilityScores.charisma),
    };

    const context = this.createFormulaContext(character, abilityModifiers);

    const computedSkillBonuses: Record<string, number> = {};
    const skills = Object.keys(SKILL_ABILITY_MAP) as SkillName[];

    for (const skill of skills) {
      const ability = SKILL_ABILITY_MAP[skill];
      const abilityMod = abilityModifiers[ability];
      const proficiency = character.skillProficiencies[skill] || 'none';

      let bonus = abilityMod;
      if (proficiency === 'proficient') {
        bonus += context.proficiencyBonus;
      } else if (proficiency === 'expert') {
        bonus += context.proficiencyBonus * 2;
      }

      const skillMods = modifiersByTarget.get(`skill.${skill}`) || [];
      for (const mod of skillMods) {
        bonus = this.applyModifier(bonus, mod, context);
      }

      computedSkillBonuses[skill] = bonus;
    }

    const computedSaveBonuses: Record<string, number> = {};
    for (const ability of abilityTargets) {
      let bonus = abilityModifiers[ability as AbilityName];
      if (character.savingThrowProficiencies[ability as AbilityName]) {
        bonus += context.proficiencyBonus;
      }

      const saveMods = modifiersByTarget.get(`save.${ability}`) || [];
      for (const mod of saveMods) {
        bonus = this.applyModifier(bonus, mod, context);
      }

      computedSaveBonuses[ability] = bonus;
    }

    const totalLevel = character.classes.reduce((sum, c) => sum + c.level, 0);

    let armorClass = 10 + abilityModifiers.dexterity;
    let speed = 30;
    let hitPointsMax = 0;

    if (character.classes.length > 0) {
      hitPointsMax = 10 + abilityModifiers.constitution * totalLevel;
    }

    const acMods = modifiersByTarget.get('stat.armorClass') || [];
    for (const mod of acMods) {
      armorClass = this.applyModifier(armorClass, mod, context);
    }

    const speedMods = modifiersByTarget.get('stat.speed') || [];
    for (const mod of speedMods) {
      speed = this.applyModifier(speed, mod, context);
    }

    const hpMods = modifiersByTarget.get('stat.hitPointsMax') || [];
    for (const mod of hpMods) {
      hitPointsMax = this.applyModifier(hitPointsMax, mod, context);
    }

    const derivedStats: DerivedStats = {
      proficiencyBonus: context.proficiencyBonus,
      initiative: abilityModifiers.dexterity,
      armorClass,
      speed,
      hitPointsMax,
      hitPointsCurrent: character.currentState.hitPoints,
      hitPointsTemp: character.currentState.tempHitPoints,
      hitDice: character.classes.map((c) => `${c.level}d${this.getHitDie(c.classId)}`).join(' + '),
      hitDiceRemaining: Object.values(character.currentState.hitDiceRemaining).reduce((a, b) => a + b, 0),
      passivePerception: 10 + computedSkillBonuses['perception'],
      passiveInvestigation: 10 + computedSkillBonuses['investigation'],
      passiveInsight: 10 + computedSkillBonuses['insight'],
    };

    return {
      ...character,
      computedAbilityScores,
      abilityModifiers,
      derivedStats,
      computedSkillBonuses,
      computedSaveBonuses,
    };
  }

  private createFormulaContext(character: Character, abilityMods: AbilityScores): FormulaContext {
    const totalLevel = character.classes.reduce((sum, c) => sum + c.level, 0);
    return {
      level: totalLevel,
      proficiencyBonus: getProficiencyBonus(totalLevel),
      strMod: abilityMods.strength,
      dexMod: abilityMods.dexterity,
      conMod: abilityMods.constitution,
      intMod: abilityMods.intelligence,
      wisMod: abilityMods.wisdom,
      chaMod: abilityMods.charisma,
      str: character.baseAbilityScores.strength,
      dex: character.baseAbilityScores.dexterity,
      con: character.baseAbilityScores.constitution,
      int: character.baseAbilityScores.intelligence,
      wis: character.baseAbilityScores.wisdom,
      cha: character.baseAbilityScores.charisma,
    };
  }

  private evaluateValue(value: number | string, context: FormulaContext): number {
    if (typeof value === 'number') return value;
    try {
      const result = evaluate(value, context);
      return typeof result === 'number' ? Math.floor(result) : 0;
    } catch (error) {
      console.error(`Erreur lors de l'évaluation de la formule: ${value}`, error);
      return 0;
    }
  }

  private applyModifier(currentValue: number, modifier: Modifier, context: FormulaContext): number {
    const modValue = this.evaluateValue(modifier.value, context);
    switch (modifier.operation) {
      case 'add': return currentValue + modValue;
      case 'subtract': return currentValue - modValue;
      case 'multiply': return Math.floor(currentValue * modValue);
      case 'set': return modValue;
      case 'min': return Math.max(currentValue, modValue);
      case 'max': return Math.min(currentValue, modValue);
      case 'formula': return this.evaluateValue(modifier.value, context);
      default: return currentValue;
    }
  }

  private getHitDie(classId: string): number {
    const hitDice: Record<string, number> = {
      barbarian: 12, fighter: 10, paladin: 10, ranger: 10,
      bard: 8, cleric: 8, druid: 8, monk: 8, rogue: 8, warlock: 8,
      sorcerer: 6, wizard: 6,
    };
    return hitDice[classId.toLowerCase()] || 8;
  }
}
