// Races de base D&D 5.5 (données simplifiées pour Sprint 1)
// Sera remplacé par les données 5e-tools au Sprint 2

import type { Modifier } from '../../types';

export interface RaceData {
  id: string;
  name: string;
  source: string;
  speed: number;
  size: 'Small' | 'Medium' | 'Large';
  darkvision?: number;
  traits: string[];
  modifiers: Modifier[];
  subraces?: SubraceData[];
}

export interface SubraceData {
  id: string;
  name: string;
  traits: string[];
  modifiers: Modifier[];
}

export const RACES: RaceData[] = [
  {
    id: 'human',
    name: 'Humain',
    source: 'PHB',
    speed: 30,
    size: 'Medium',
    traits: ['Versatile', 'Resourceful'],
    modifiers: [
      // En 5.5, les humains ont +1 à deux stats au choix ou un don
      // Simplifié ici
    ],
  },
  {
    id: 'elf',
    name: 'Elfe',
    source: 'PHB',
    speed: 30,
    size: 'Medium',
    darkvision: 60,
    traits: ['Fey Ancestry', 'Keen Senses', 'Trance'],
    modifiers: [
      { id: 'elf-dex', name: 'Dextérité elfique', source: 'race', sourceId: 'elf', target: 'ability.dexterity', operation: 'add', value: 2, isHomebrew: false },
    ],
    subraces: [
      {
        id: 'high-elf',
        name: 'Haut Elfe',
        traits: ['Cantrip', 'Extra Language'],
        modifiers: [
          { id: 'high-elf-int', name: 'Intelligence haut elfe', source: 'subrace', sourceId: 'high-elf', target: 'ability.intelligence', operation: 'add', value: 1, isHomebrew: false },
        ],
      },
      {
        id: 'wood-elf',
        name: 'Elfe des bois',
        traits: ['Fleet of Foot', 'Mask of the Wild'],
        modifiers: [
          { id: 'wood-elf-wis', name: 'Sagesse elfe des bois', source: 'subrace', sourceId: 'wood-elf', target: 'ability.wisdom', operation: 'add', value: 1, isHomebrew: false },
          { id: 'wood-elf-speed', name: 'Vitesse elfe des bois', source: 'subrace', sourceId: 'wood-elf', target: 'stat.speed', operation: 'set', value: 35, isHomebrew: false },
        ],
      },
      {
        id: 'dark-elf',
        name: 'Drow',
        traits: ['Superior Darkvision', 'Sunlight Sensitivity', 'Drow Magic'],
        modifiers: [
          { id: 'drow-cha', name: 'Charisme drow', source: 'subrace', sourceId: 'dark-elf', target: 'ability.charisma', operation: 'add', value: 1, isHomebrew: false },
        ],
      },
    ],
  },
  {
    id: 'dwarf',
    name: 'Nain',
    source: 'PHB',
    speed: 25,
    size: 'Medium',
    darkvision: 60,
    traits: ['Dwarven Resilience', 'Stonecunning', 'Tool Proficiency'],
    modifiers: [
      { id: 'dwarf-con', name: 'Constitution naine', source: 'race', sourceId: 'dwarf', target: 'ability.constitution', operation: 'add', value: 2, isHomebrew: false },
    ],
    subraces: [
      {
        id: 'hill-dwarf',
        name: 'Nain des collines',
        traits: ['Dwarven Toughness'],
        modifiers: [
          { id: 'hill-dwarf-wis', name: 'Sagesse nain des collines', source: 'subrace', sourceId: 'hill-dwarf', target: 'ability.wisdom', operation: 'add', value: 1, isHomebrew: false },
          { id: 'hill-dwarf-hp', name: 'Robustesse naine', source: 'subrace', sourceId: 'hill-dwarf', target: 'stat.hitPointsMax', operation: 'formula', value: 'level', isHomebrew: false },
        ],
      },
      {
        id: 'mountain-dwarf',
        name: 'Nain des montagnes',
        traits: ['Dwarven Armor Training'],
        modifiers: [
          { id: 'mountain-dwarf-str', name: 'Force nain des montagnes', source: 'subrace', sourceId: 'mountain-dwarf', target: 'ability.strength', operation: 'add', value: 2, isHomebrew: false },
        ],
      },
    ],
  },
  {
    id: 'halfling',
    name: 'Halfelin',
    source: 'PHB',
    speed: 25,
    size: 'Small',
    traits: ['Lucky', 'Brave', 'Halfling Nimbleness'],
    modifiers: [
      { id: 'halfling-dex', name: 'Dextérité halfeline', source: 'race', sourceId: 'halfling', target: 'ability.dexterity', operation: 'add', value: 2, isHomebrew: false },
    ],
    subraces: [
      {
        id: 'lightfoot',
        name: 'Pied-léger',
        traits: ['Naturally Stealthy'],
        modifiers: [
          { id: 'lightfoot-cha', name: 'Charisme pied-léger', source: 'subrace', sourceId: 'lightfoot', target: 'ability.charisma', operation: 'add', value: 1, isHomebrew: false },
        ],
      },
      {
        id: 'stout',
        name: 'Robuste',
        traits: ['Stout Resilience'],
        modifiers: [
          { id: 'stout-con', name: 'Constitution robuste', source: 'subrace', sourceId: 'stout', target: 'ability.constitution', operation: 'add', value: 1, isHomebrew: false },
        ],
      },
    ],
  },
  {
    id: 'dragonborn',
    name: 'Drakéide',
    source: 'PHB',
    speed: 30,
    size: 'Medium',
    traits: ['Draconic Ancestry', 'Breath Weapon', 'Damage Resistance'],
    modifiers: [
      { id: 'dragonborn-str', name: 'Force drakéide', source: 'race', sourceId: 'dragonborn', target: 'ability.strength', operation: 'add', value: 2, isHomebrew: false },
      { id: 'dragonborn-cha', name: 'Charisme drakéide', source: 'race', sourceId: 'dragonborn', target: 'ability.charisma', operation: 'add', value: 1, isHomebrew: false },
    ],
  },
  {
    id: 'gnome',
    name: 'Gnome',
    source: 'PHB',
    speed: 25,
    size: 'Small',
    darkvision: 60,
    traits: ['Gnome Cunning'],
    modifiers: [
      { id: 'gnome-int', name: 'Intelligence gnome', source: 'race', sourceId: 'gnome', target: 'ability.intelligence', operation: 'add', value: 2, isHomebrew: false },
    ],
    subraces: [
      {
        id: 'forest-gnome',
        name: 'Gnome des forêts',
        traits: ['Natural Illusionist', 'Speak with Small Beasts'],
        modifiers: [
          { id: 'forest-gnome-dex', name: 'Dextérité gnome des forêts', source: 'subrace', sourceId: 'forest-gnome', target: 'ability.dexterity', operation: 'add', value: 1, isHomebrew: false },
        ],
      },
      {
        id: 'rock-gnome',
        name: 'Gnome des roches',
        traits: ["Artificer's Lore", 'Tinker'],
        modifiers: [
          { id: 'rock-gnome-con', name: 'Constitution gnome des roches', source: 'subrace', sourceId: 'rock-gnome', target: 'ability.constitution', operation: 'add', value: 1, isHomebrew: false },
        ],
      },
    ],
  },
  {
    id: 'half-elf',
    name: 'Demi-elfe',
    source: 'PHB',
    speed: 30,
    size: 'Medium',
    darkvision: 60,
    traits: ['Fey Ancestry', 'Skill Versatility'],
    modifiers: [
      { id: 'half-elf-cha', name: 'Charisme demi-elfe', source: 'race', sourceId: 'half-elf', target: 'ability.charisma', operation: 'add', value: 2, isHomebrew: false },
      // +1 à deux autres stats au choix - simplifié
    ],
  },
  {
    id: 'half-orc',
    name: 'Demi-orque',
    source: 'PHB',
    speed: 30,
    size: 'Medium',
    darkvision: 60,
    traits: ['Menacing', 'Relentless Endurance', 'Savage Attacks'],
    modifiers: [
      { id: 'half-orc-str', name: 'Force demi-orque', source: 'race', sourceId: 'half-orc', target: 'ability.strength', operation: 'add', value: 2, isHomebrew: false },
      { id: 'half-orc-con', name: 'Constitution demi-orque', source: 'race', sourceId: 'half-orc', target: 'ability.constitution', operation: 'add', value: 1, isHomebrew: false },
    ],
  },
  {
    id: 'tiefling',
    name: 'Tieffelin',
    source: 'PHB',
    speed: 30,
    size: 'Medium',
    darkvision: 60,
    traits: ['Hellish Resistance', 'Infernal Legacy'],
    modifiers: [
      { id: 'tiefling-cha', name: 'Charisme tieffelin', source: 'race', sourceId: 'tiefling', target: 'ability.charisma', operation: 'add', value: 2, isHomebrew: false },
      { id: 'tiefling-int', name: 'Intelligence tieffelin', source: 'race', sourceId: 'tiefling', target: 'ability.intelligence', operation: 'add', value: 1, isHomebrew: false },
    ],
  },
];

// Helper pour trouver une race
export function getRaceById(id: string): RaceData | undefined {
  return RACES.find((r) => r.id === id);
}

// Helper pour trouver une sous-race
export function getSubraceById(raceId: string, subraceId: string): SubraceData | undefined {
  const race = getRaceById(raceId);
  return race?.subraces?.find((s) => s.id === subraceId);
}
