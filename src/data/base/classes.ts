// Classes de base D&D 5.5 (données simplifiées pour Sprint 1)
// Sera remplacé par les données 5e-tools au Sprint 2

import type { AbilityName, SkillName } from '../../types';

export interface ClassData {
  id: string;
  name: string;
  source: string;
  hitDie: number;
  primaryAbility: AbilityName[];
  savingThrows: AbilityName[];
  armorProficiencies: string[];
  weaponProficiencies: string[];
  toolProficiencies?: string[];
  skillChoices: {
    count: number;
    from: SkillName[];
  };
  spellcasting?: {
    ability: AbilityName;
    type: 'full' | 'half' | 'third' | 'pact';
  };
}

export const CLASSES: ClassData[] = [
  {
    id: 'barbarian',
    name: 'Barbare',
    source: 'PHB',
    hitDie: 12,
    primaryAbility: ['strength'],
    savingThrows: ['strength', 'constitution'],
    armorProficiencies: ['Light', 'Medium', 'Shields'],
    weaponProficiencies: ['Simple', 'Martial'],
    skillChoices: {
      count: 2,
      from: ['animalHandling', 'athletics', 'intimidation', 'nature', 'perception', 'survival'],
    },
  },
  {
    id: 'bard',
    name: 'Barde',
    source: 'PHB',
    hitDie: 8,
    primaryAbility: ['charisma'],
    savingThrows: ['dexterity', 'charisma'],
    armorProficiencies: ['Light'],
    weaponProficiencies: ['Simple', 'Hand crossbows', 'Longswords', 'Rapiers', 'Shortswords'],
    toolProficiencies: ['Three musical instruments'],
    skillChoices: {
      count: 3,
      from: ['acrobatics', 'animalHandling', 'arcana', 'athletics', 'deception', 'history', 'insight', 'intimidation', 'investigation', 'medicine', 'nature', 'perception', 'performance', 'persuasion', 'religion', 'sleightOfHand', 'stealth', 'survival'],
    },
    spellcasting: {
      ability: 'charisma',
      type: 'full',
    },
  },
  {
    id: 'cleric',
    name: 'Clerc',
    source: 'PHB',
    hitDie: 8,
    primaryAbility: ['wisdom'],
    savingThrows: ['wisdom', 'charisma'],
    armorProficiencies: ['Light', 'Medium', 'Shields'],
    weaponProficiencies: ['Simple'],
    skillChoices: {
      count: 2,
      from: ['history', 'insight', 'medicine', 'persuasion', 'religion'],
    },
    spellcasting: {
      ability: 'wisdom',
      type: 'full',
    },
  },
  {
    id: 'druid',
    name: 'Druide',
    source: 'PHB',
    hitDie: 8,
    primaryAbility: ['wisdom'],
    savingThrows: ['intelligence', 'wisdom'],
    armorProficiencies: ['Light', 'Medium', 'Shields (non-metal)'],
    weaponProficiencies: ['Clubs', 'Daggers', 'Darts', 'Javelins', 'Maces', 'Quarterstaffs', 'Scimitars', 'Sickles', 'Slings', 'Spears'],
    toolProficiencies: ['Herbalism kit'],
    skillChoices: {
      count: 2,
      from: ['arcana', 'animalHandling', 'insight', 'medicine', 'nature', 'perception', 'religion', 'survival'],
    },
    spellcasting: {
      ability: 'wisdom',
      type: 'full',
    },
  },
  {
    id: 'fighter',
    name: 'Guerrier',
    source: 'PHB',
    hitDie: 10,
    primaryAbility: ['strength', 'dexterity'],
    savingThrows: ['strength', 'constitution'],
    armorProficiencies: ['All armor', 'Shields'],
    weaponProficiencies: ['Simple', 'Martial'],
    skillChoices: {
      count: 2,
      from: ['acrobatics', 'animalHandling', 'athletics', 'history', 'insight', 'intimidation', 'perception', 'survival'],
    },
  },
  {
    id: 'monk',
    name: 'Moine',
    source: 'PHB',
    hitDie: 8,
    primaryAbility: ['dexterity', 'wisdom'],
    savingThrows: ['strength', 'dexterity'],
    armorProficiencies: [],
    weaponProficiencies: ['Simple', 'Shortswords'],
    toolProficiencies: ["One artisan's tools or musical instrument"],
    skillChoices: {
      count: 2,
      from: ['acrobatics', 'athletics', 'history', 'insight', 'religion', 'stealth'],
    },
  },
  {
    id: 'paladin',
    name: 'Paladin',
    source: 'PHB',
    hitDie: 10,
    primaryAbility: ['strength', 'charisma'],
    savingThrows: ['wisdom', 'charisma'],
    armorProficiencies: ['All armor', 'Shields'],
    weaponProficiencies: ['Simple', 'Martial'],
    skillChoices: {
      count: 2,
      from: ['athletics', 'insight', 'intimidation', 'medicine', 'persuasion', 'religion'],
    },
    spellcasting: {
      ability: 'charisma',
      type: 'half',
    },
  },
  {
    id: 'ranger',
    name: 'Rôdeur',
    source: 'PHB',
    hitDie: 10,
    primaryAbility: ['dexterity', 'wisdom'],
    savingThrows: ['strength', 'dexterity'],
    armorProficiencies: ['Light', 'Medium', 'Shields'],
    weaponProficiencies: ['Simple', 'Martial'],
    skillChoices: {
      count: 3,
      from: ['animalHandling', 'athletics', 'insight', 'investigation', 'nature', 'perception', 'stealth', 'survival'],
    },
    spellcasting: {
      ability: 'wisdom',
      type: 'half',
    },
  },
  {
    id: 'rogue',
    name: 'Roublard',
    source: 'PHB',
    hitDie: 8,
    primaryAbility: ['dexterity'],
    savingThrows: ['dexterity', 'intelligence'],
    armorProficiencies: ['Light'],
    weaponProficiencies: ['Simple', 'Hand crossbows', 'Longswords', 'Rapiers', 'Shortswords'],
    toolProficiencies: ["Thieves' tools"],
    skillChoices: {
      count: 4,
      from: ['acrobatics', 'athletics', 'deception', 'insight', 'intimidation', 'investigation', 'perception', 'performance', 'persuasion', 'sleightOfHand', 'stealth'],
    },
  },
  {
    id: 'sorcerer',
    name: 'Ensorceleur',
    source: 'PHB',
    hitDie: 6,
    primaryAbility: ['charisma'],
    savingThrows: ['constitution', 'charisma'],
    armorProficiencies: [],
    weaponProficiencies: ['Daggers', 'Darts', 'Slings', 'Quarterstaffs', 'Light crossbows'],
    skillChoices: {
      count: 2,
      from: ['arcana', 'deception', 'insight', 'intimidation', 'persuasion', 'religion'],
    },
    spellcasting: {
      ability: 'charisma',
      type: 'full',
    },
  },
  {
    id: 'warlock',
    name: 'Occultiste',
    source: 'PHB',
    hitDie: 8,
    primaryAbility: ['charisma'],
    savingThrows: ['wisdom', 'charisma'],
    armorProficiencies: ['Light'],
    weaponProficiencies: ['Simple'],
    skillChoices: {
      count: 2,
      from: ['arcana', 'deception', 'history', 'intimidation', 'investigation', 'nature', 'religion'],
    },
    spellcasting: {
      ability: 'charisma',
      type: 'pact',
    },
  },
  {
    id: 'wizard',
    name: 'Magicien',
    source: 'PHB',
    hitDie: 6,
    primaryAbility: ['intelligence'],
    savingThrows: ['intelligence', 'wisdom'],
    armorProficiencies: [],
    weaponProficiencies: ['Daggers', 'Darts', 'Slings', 'Quarterstaffs', 'Light crossbows'],
    skillChoices: {
      count: 2,
      from: ['arcana', 'history', 'insight', 'investigation', 'medicine', 'religion'],
    },
    spellcasting: {
      ability: 'intelligence',
      type: 'full',
    },
  },
];

// Helper pour trouver une classe
export function getClassById(id: string): ClassData | undefined {
  return CLASSES.find((c) => c.id === id);
}

// Calcul des HP max selon la classe et le niveau
export function calculateHitPoints(
  classId: string,
  level: number,
  constitutionModifier: number,
  isFirstLevel: boolean = true
): number {
  const classData = getClassById(classId);
  if (!classData) return 0;

  const hitDie = classData.hitDie;

  if (level === 1 || isFirstLevel) {
    // Niveau 1 : max du dé de vie + CON
    return hitDie + constitutionModifier;
  } else {
    // Niveaux suivants : moyenne du dé + 1 + CON
    // Ex: d10 → 6, d8 → 5, d12 → 7, d6 → 4
    const averageRoll = Math.floor(hitDie / 2) + 1;
    return averageRoll + constitutionModifier;
  }
}

// Calcul des HP totaux pour tous les niveaux
export function calculateTotalHitPoints(
  classLevels: { classId: string; level: number }[],
  constitutionModifier: number
): number {
  let total = 0;
  let isFirst = true;

  for (const cl of classLevels) {
    for (let lvl = 1; lvl <= cl.level; lvl++) {
      total += calculateHitPoints(cl.classId, lvl, constitutionModifier, isFirst);
      isFirst = false;
    }
  }

  return total;
}
