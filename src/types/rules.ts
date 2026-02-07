// Système de modificateurs flexible pour les règles maison

// Cible possible pour un modificateur
export type ModifierTarget =
  | `ability.${string}`           // ability.strength, ability.dexterity...
  | `skill.${string}`             // skill.athletics, skill.stealth...
  | `save.${string}`              // save.strength, save.wisdom...
  | `stat.${string}`              // stat.armorClass, stat.speed, stat.hitPointsMax...
  | `resource.${string}`          // resource.spellSlots, resource.ki...
  | `combat.${string}`            // combat.attackBonus, combat.damageBonus...
  | `proficiency.${string}`       // proficiency.armor.heavy, proficiency.weapon.martial...
  | string;                       // Custom targets pour extensibilité

// Opérations possibles sur les valeurs
export type ModifierOperation =
  | 'add'           // Ajoute une valeur fixe
  | 'subtract'      // Soustrait une valeur fixe
  | 'multiply'      // Multiplie la valeur
  | 'set'           // Remplace la valeur
  | 'min'           // Définit un minimum
  | 'max'           // Définit un maximum
  | 'formula';      // Utilise une formule dynamique

// Condition pour appliquer un modificateur
export interface ModifierCondition {
  type: 'hasFeature' | 'hasItem' | 'levelMin' | 'levelMax' | 'abilityMin' | 'custom';
  value: string | number;
  customCheck?: string; // Expression pour conditions custom
}

// Modificateur générique - cœur du système
export interface Modifier {
  id: string;
  name: string;
  description?: string;
  source: ModifierSource;
  sourceId: string;           // ID de la race/classe/don/item source
  target: ModifierTarget;
  operation: ModifierOperation;
  value: number | string;     // Nombre ou formule (ex: "level * 2", "proficiencyBonus")
  priority?: number;          // Ordre d'application (défaut: 0)
  conditions?: ModifierCondition[];
  isHomebrew: boolean;
}

export type ModifierSource =
  | 'race'
  | 'subrace'
  | 'class'
  | 'subclass'
  | 'background'
  | 'feat'
  | 'item'
  | 'spell'
  | 'condition'
  | 'homebrew'
  | 'manual';     // Ajusté manuellement par le joueur

// Pack de règles maison (importable/exportable)
export interface HomebrewPack {
  id: string;
  name: string;
  author: string;
  version: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  content: {
    races?: HomebrewRace[];
    classes?: HomebrewClass[];
    feats?: HomebrewFeat[];
    spells?: HomebrewSpell[];
    items?: HomebrewItem[];
    rules?: HomebrewRule[];
    modifiers?: Modifier[];
  };
}

// Règle maison générique (pour les mécaniques alternatives)
export interface HomebrewRule {
  id: string;
  name: string;
  description: string;
  category: 'rest' | 'combat' | 'magic' | 'exploration' | 'social' | 'encumbrance' | 'other';
  replaces?: string;        // ID de la règle officielle remplacée
  modifiers: Modifier[];
  enabled: boolean;
}

// Types de contenu homebrew (simplifiés, seront étendus)
export interface HomebrewRace {
  id: string;
  name: string;
  description: string;
  traits: string[];
  modifiers: Modifier[];
}

export interface HomebrewClass {
  id: string;
  name: string;
  description: string;
  hitDie: number;
  primaryAbility: string[];
  savingThrows: string[];
  modifiers: Modifier[];
}

export interface HomebrewFeat {
  id: string;
  name: string;
  description: string;
  prerequisites?: string;
  modifiers: Modifier[];
}

export interface HomebrewSpell {
  id: string;
  name: string;
  level: number;
  school: string;
  castingTime: string;
  range: string;
  components: string;
  duration: string;
  description: string;
  higherLevels?: string;
}

export interface HomebrewItem {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'gear' | 'magic' | 'consumable';
  rarity?: 'common' | 'uncommon' | 'rare' | 'veryRare' | 'legendary';
  description: string;
  weight?: number;
  cost?: string;
  modifiers: Modifier[];
}

// Variables disponibles dans les formules
export interface FormulaContext {
  level: number;
  proficiencyBonus: number;
  strMod: number;
  dexMod: number;
  conMod: number;
  intMod: number;
  wisMod: number;
  chaMod: number;
  [key: string]: number; // Extensible pour d'autres variables
}
