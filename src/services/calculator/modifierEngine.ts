import { evaluate } from 'mathjs';
import {
  getAbilityModifier,
  getProficiencyBonus,
  SKILL_ABILITY_MAP,
} from '../../types';
import type {
  Character,
  ComputedCharacter,
  Modifier,
  FormulaContext,
  AbilityScores,
  DerivedStats,
  SkillName,
  AbilityName,
} from '../../types';

// Moteur de calcul des modificateurs

// Créer le contexte pour les formules
function createFormulaContext(character: Character, abilityMods: AbilityScores): FormulaContext {
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

// Évaluer une valeur (nombre ou formule)
function evaluateValue(value: number | string, context: FormulaContext): number {
  if (typeof value === 'number') {
    return value;
  }

  try {
    const result = evaluate(value, context);
    return typeof result === 'number' ? Math.floor(result) : 0;
  } catch (error) {
    console.error(`Erreur lors de l'évaluation de la formule: ${value}`, error);
    return 0;
  }
}

// Appliquer un modificateur à une valeur
function applyModifier(
  currentValue: number,
  modifier: Modifier,
  context: FormulaContext
): number {
  const modValue = evaluateValue(modifier.value, context);

  switch (modifier.operation) {
    case 'add':
      return currentValue + modValue;
    case 'subtract':
      return currentValue - modValue;
    case 'multiply':
      return Math.floor(currentValue * modValue);
    case 'set':
      return modValue;
    case 'min':
      return Math.max(currentValue, modValue);
    case 'max':
      return Math.min(currentValue, modValue);
    case 'formula':
      return evaluateValue(modifier.value, context);
    default:
      return currentValue;
  }
}

// Calculer toutes les stats d'un personnage
export function computeCharacterStats(character: Character): ComputedCharacter {
  // 1. Calculer les scores de caractéristiques de base
  const computedAbilityScores: AbilityScores = { ...character.baseAbilityScores };

  // Collecter les modificateurs groupés par cible
  const modifiersByTarget = new Map<string, Modifier[]>();

  for (const mod of character.activeModifiers) {
    const existing = modifiersByTarget.get(mod.target) || [];
    existing.push(mod);
    modifiersByTarget.set(mod.target, existing);
  }

  // Trier les modificateurs par priorité
  modifiersByTarget.forEach((mods) => {
    mods.sort((a, b) => (a.priority || 0) - (b.priority || 0));
  });

  // 2. Appliquer les modificateurs aux caractéristiques
  const abilityTargets = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];

  for (const ability of abilityTargets) {
    const mods = modifiersByTarget.get(`ability.${ability}`) || [];
    const tempContext = createFormulaContext(character, {
      strength: getAbilityModifier(computedAbilityScores.strength),
      dexterity: getAbilityModifier(computedAbilityScores.dexterity),
      constitution: getAbilityModifier(computedAbilityScores.constitution),
      intelligence: getAbilityModifier(computedAbilityScores.intelligence),
      wisdom: getAbilityModifier(computedAbilityScores.wisdom),
      charisma: getAbilityModifier(computedAbilityScores.charisma),
    });

    for (const mod of mods) {
      computedAbilityScores[ability as AbilityName] = applyModifier(
        computedAbilityScores[ability as AbilityName],
        mod,
        tempContext
      );
    }
  }

  // 3. Calculer les modificateurs de caractéristiques
  const abilityModifiers: AbilityScores = {
    strength: getAbilityModifier(computedAbilityScores.strength),
    dexterity: getAbilityModifier(computedAbilityScores.dexterity),
    constitution: getAbilityModifier(computedAbilityScores.constitution),
    intelligence: getAbilityModifier(computedAbilityScores.intelligence),
    wisdom: getAbilityModifier(computedAbilityScores.wisdom),
    charisma: getAbilityModifier(computedAbilityScores.charisma),
  };

  // Contexte final pour les formules
  const context = createFormulaContext(character, abilityModifiers);

  // 4. Calculer les bonus de compétences
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

    // Appliquer les modificateurs de compétence
    const skillMods = modifiersByTarget.get(`skill.${skill}`) || [];
    for (const mod of skillMods) {
      bonus = applyModifier(bonus, mod, context);
    }

    computedSkillBonuses[skill] = bonus;
  }

  // 5. Calculer les bonus de jets de sauvegarde
  const computedSaveBonuses: Record<string, number> = {};

  for (const ability of abilityTargets) {
    let bonus = abilityModifiers[ability as AbilityName];
    if (character.savingThrowProficiencies[ability as AbilityName]) {
      bonus += context.proficiencyBonus;
    }

    // Appliquer les modificateurs de sauvegarde
    const saveMods = modifiersByTarget.get(`save.${ability}`) || [];
    for (const mod of saveMods) {
      bonus = applyModifier(bonus, mod, context);
    }

    computedSaveBonuses[ability] = bonus;
  }

  // 6. Calculer les stats dérivées
  const totalLevel = character.classes.reduce((sum, c) => sum + c.level, 0);

  let armorClass = 10 + abilityModifiers.dexterity; // Base sans armure
  let speed = 30; // Vitesse de base
  let hitPointsMax = 0;

  // HP de base (simplifié - à améliorer avec les dés de vie par classe)
  if (character.classes.length > 0) {
    hitPointsMax = 10 + abilityModifiers.constitution * totalLevel;
  }

  // Appliquer les modificateurs de stats dérivées
  const acMods = modifiersByTarget.get('stat.armorClass') || [];
  for (const mod of acMods) {
    armorClass = applyModifier(armorClass, mod, context);
  }

  const speedMods = modifiersByTarget.get('stat.speed') || [];
  for (const mod of speedMods) {
    speed = applyModifier(speed, mod, context);
  }

  const hpMods = modifiersByTarget.get('stat.hitPointsMax') || [];
  for (const mod of hpMods) {
    hitPointsMax = applyModifier(hitPointsMax, mod, context);
  }

  const derivedStats: DerivedStats = {
    proficiencyBonus: context.proficiencyBonus,
    initiative: abilityModifiers.dexterity,
    armorClass,
    speed,
    hitPointsMax,
    hitPointsCurrent: character.currentState.hitPoints,
    hitPointsTemp: character.currentState.tempHitPoints,
    hitDice: character.classes.map((c) => `${c.level}d${getHitDie(c.classId)}`).join(' + '),
    hitDiceRemaining: Object.values(character.currentState.hitDiceRemaining).reduce((a, b) => a + b, 0),
    passivePerception: 10 + computedSkillBonuses.perception,
    passiveInvestigation: 10 + computedSkillBonuses.investigation,
    passiveInsight: 10 + computedSkillBonuses.insight,
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

// Dé de vie par classe (simplifié)
function getHitDie(classId: string): number {
  const hitDice: Record<string, number> = {
    barbarian: 12,
    fighter: 10,
    paladin: 10,
    ranger: 10,
    bard: 8,
    cleric: 8,
    druid: 8,
    monk: 8,
    rogue: 8,
    warlock: 8,
    sorcerer: 6,
    wizard: 6,
  };

  return hitDice[classId.toLowerCase()] || 8;
}
