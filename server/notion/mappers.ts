// Mappers between Notion page properties and app types
// Handles the conversion between Notion's property format and our TypeScript interfaces

import type {
  PageObjectResponse,
  CreatePageParameters,
} from '@notionhq/client/build/src/api-endpoints';

// Helper types for Notion properties
type NotionProperties = PageObjectResponse['properties'];
type NotionProperty = NotionProperties[string];

// === Property Extractors ===

function getTitle(prop: NotionProperty): string {
  if (prop.type === 'title') {
    return prop.title.map(t => t.plain_text).join('');
  }
  return '';
}

function getRichText(prop: NotionProperty): string {
  if (prop.type === 'rich_text') {
    return prop.rich_text.map(t => t.plain_text).join('');
  }
  return '';
}

function getNumber(prop: NotionProperty): number | null {
  if (prop.type === 'number') {
    return prop.number;
  }
  return null;
}

function getSelect(prop: NotionProperty): string | null {
  if (prop.type === 'select' && prop.select) {
    return prop.select.name;
  }
  return null;
}

function getMultiSelect(prop: NotionProperty): string[] {
  if (prop.type === 'multi_select') {
    return prop.multi_select.map(s => s.name);
  }
  return [];
}

function getCheckbox(prop: NotionProperty): boolean {
  if (prop.type === 'checkbox') {
    return prop.checkbox;
  }
  return false;
}

// === Property Builders ===

function titleProp(text: string): CreatePageParameters['properties'][string] {
  return { title: [{ text: { content: text } }] };
}

function richTextProp(text: string): CreatePageParameters['properties'][string] {
  // Notion rich_text has a 2000 char limit per block, split if needed
  if (text.length <= 2000) {
    return { rich_text: [{ text: { content: text } }] };
  }
  const chunks: { text: { content: string } }[] = [];
  for (let i = 0; i < text.length; i += 2000) {
    chunks.push({ text: { content: text.slice(i, i + 2000) } });
  }
  return { rich_text: chunks };
}

function numberProp(value: number | null | undefined): CreatePageParameters['properties'][string] {
  return { number: value ?? null };
}

function selectProp(name: string | null | undefined): CreatePageParameters['properties'][string] {
  return name ? { select: { name } } : { select: null };
}

function multiSelectProp(names: string[]): CreatePageParameters['properties'][string] {
  return { multi_select: names.map(name => ({ name })) };
}

function checkboxProp(value: boolean): CreatePageParameters['properties'][string] {
  return { checkbox: value };
}

function dateProp(date: string): CreatePageParameters['properties'][string] {
  return { date: { start: date } };
}

// === Game Data Mappers ===

export interface NotionRace {
  id: string;
  name: string;
  source: string;
  speed: number;
  size: string;
  abilityBonuses: string;
  traits: string[];
  languages: string[];
  darkvision: number | null;
  subraces: string;
  description: string;
}

export function notionPageToRace(page: PageObjectResponse): NotionRace {
  const p = page.properties;
  return {
    id: page.id,
    name: getTitle(p['Nom']),
    source: getSelect(p['Source']) || 'SRD',
    speed: getNumber(p['Vitesse']) || 30,
    size: getSelect(p['Taille']) || 'Moyenne',
    abilityBonuses: getRichText(p['Bonus Carac.']),
    traits: getMultiSelect(p['Traits']),
    languages: getMultiSelect(p['Langues']),
    darkvision: getNumber(p['Vision dans le noir']),
    subraces: getRichText(p['Sous-races']),
    description: getRichText(p['Description']),
  };
}

export function raceToNotionProperties(race: {
  name: string;
  source?: string;
  speed?: number;
  size?: string;
  abilityBonuses?: string;
  traits?: string[];
  languages?: string[];
  darkvision?: number;
  subraces?: string;
  description?: string;
}): CreatePageParameters['properties'] {
  return {
    'Nom': titleProp(race.name),
    'Source': selectProp(race.source || 'SRD'),
    'Vitesse': numberProp(race.speed || 30),
    'Taille': selectProp(race.size || 'Moyenne'),
    'Bonus Carac.': richTextProp(race.abilityBonuses || ''),
    'Traits': multiSelectProp(race.traits || []),
    'Langues': multiSelectProp(race.languages || []),
    'Vision dans le noir': numberProp(race.darkvision),
    'Sous-races': richTextProp(race.subraces || ''),
    'Description': richTextProp(race.description || ''),
  };
}

export interface NotionClass {
  id: string;
  name: string;
  source: string;
  hitDie: string;
  primaryAbility: string[];
  savingThrows: string[];
  armorProficiencies: string[];
  weaponProficiencies: string[];
  spellcasting: boolean;
  spellcastingAbility: string | null;
  description: string;
}

export function notionPageToClass(page: PageObjectResponse): NotionClass {
  const p = page.properties;
  return {
    id: page.id,
    name: getTitle(p['Nom']),
    source: getSelect(p['Source']) || 'SRD',
    hitDie: getSelect(p['Dé de vie']) || 'd8',
    primaryAbility: getMultiSelect(p['Carac. principale']),
    savingThrows: getMultiSelect(p['Jets de sauvegarde']),
    armorProficiencies: getMultiSelect(p['Maîtrises armures']),
    weaponProficiencies: getMultiSelect(p['Maîtrises armes']),
    spellcasting: getCheckbox(p['Incantation']),
    spellcastingAbility: getSelect(p['Carac. incantation']),
    description: getRichText(p['Description']),
  };
}

export function classToNotionProperties(cls: {
  name: string;
  source?: string;
  hitDie?: string;
  primaryAbility?: string[];
  savingThrows?: string[];
  armorProficiencies?: string[];
  weaponProficiencies?: string[];
  spellcasting?: boolean;
  spellcastingAbility?: string;
  description?: string;
}): CreatePageParameters['properties'] {
  return {
    'Nom': titleProp(cls.name),
    'Source': selectProp(cls.source || 'SRD'),
    'Dé de vie': selectProp(cls.hitDie || 'd8'),
    'Carac. principale': multiSelectProp(cls.primaryAbility || []),
    'Jets de sauvegarde': multiSelectProp(cls.savingThrows || []),
    'Maîtrises armures': multiSelectProp(cls.armorProficiencies || []),
    'Maîtrises armes': multiSelectProp(cls.weaponProficiencies || []),
    'Incantation': checkboxProp(cls.spellcasting || false),
    'Carac. incantation': selectProp(cls.spellcastingAbility),
    'Description': richTextProp(cls.description || ''),
  };
}

export interface NotionSpell {
  id: string;
  name: string;
  level: number;
  school: string | null;
  castingTime: string;
  range: string;
  components: string[];
  material: string;
  duration: string;
  classes: string[];
  source: string;
  description: string;
  higherLevels: string;
}

export function notionPageToSpell(page: PageObjectResponse): NotionSpell {
  const p = page.properties;
  return {
    id: page.id,
    name: getTitle(p['Nom']),
    level: getNumber(p['Niveau']) || 0,
    school: getSelect(p['École']),
    castingTime: getRichText(p['Temps incantation']),
    range: getRichText(p['Portée']),
    components: getMultiSelect(p['Composantes']),
    material: getRichText(p['Matériel']),
    duration: getRichText(p['Durée']),
    classes: getMultiSelect(p['Classes']),
    source: getSelect(p['Source']) || 'SRD',
    description: getRichText(p['Description']),
    higherLevels: getRichText(p['Niveaux supérieurs']),
  };
}

export function spellToNotionProperties(spell: {
  name: string;
  level?: number;
  school?: string;
  castingTime?: string;
  range?: string;
  components?: string[];
  material?: string;
  duration?: string;
  classes?: string[];
  source?: string;
  description?: string;
  higherLevels?: string;
}): CreatePageParameters['properties'] {
  return {
    'Nom': titleProp(spell.name),
    'Niveau': numberProp(spell.level ?? 0),
    'École': selectProp(spell.school),
    'Temps incantation': richTextProp(spell.castingTime || ''),
    'Portée': richTextProp(spell.range || ''),
    'Composantes': multiSelectProp(spell.components || []),
    'Matériel': richTextProp(spell.material || ''),
    'Durée': richTextProp(spell.duration || ''),
    'Classes': multiSelectProp(spell.classes || []),
    'Source': selectProp(spell.source || 'SRD'),
    'Description': richTextProp(spell.description || ''),
    'Niveaux supérieurs': richTextProp(spell.higherLevels || ''),
  };
}

export interface NotionItem {
  id: string;
  name: string;
  source: string;
  category: string | null;
  rarity: string | null;
  cost: string;
  weight: number | null;
  damage: string;
  damageType: string;
  armorClass: string;
  properties: string[];
  attunement: boolean;
  description: string;
}

export function notionPageToItem(page: PageObjectResponse): NotionItem {
  const p = page.properties;
  return {
    id: page.id,
    name: getTitle(p['Nom']),
    source: getSelect(p['Source']) || 'SRD',
    category: getSelect(p['Catégorie']),
    rarity: getSelect(p['Rareté']),
    cost: getRichText(p['Prix']),
    weight: getNumber(p['Poids']),
    damage: getRichText(p['Dégâts']),
    damageType: getRichText(p['Type dégâts']),
    armorClass: getRichText(p['CA']),
    properties: getMultiSelect(p['Propriétés']),
    attunement: getCheckbox(p['Harmonisation']),
    description: getRichText(p['Description']),
  };
}

export function itemToNotionProperties(item: {
  name: string;
  source?: string;
  category?: string;
  rarity?: string;
  cost?: string;
  weight?: number;
  damage?: string;
  damageType?: string;
  armorClass?: string;
  properties?: string[];
  attunement?: boolean;
  description?: string;
}): CreatePageParameters['properties'] {
  return {
    'Nom': titleProp(item.name),
    'Source': selectProp(item.source || 'SRD'),
    'Catégorie': selectProp(item.category),
    'Rareté': selectProp(item.rarity),
    'Prix': richTextProp(item.cost || ''),
    'Poids': numberProp(item.weight),
    'Dégâts': richTextProp(item.damage || ''),
    'Type dégâts': richTextProp(item.damageType || ''),
    'CA': richTextProp(item.armorClass || ''),
    'Propriétés': multiSelectProp(item.properties || []),
    'Harmonisation': checkboxProp(item.attunement || false),
    'Description': richTextProp(item.description || ''),
  };
}

export interface NotionCharacter {
  id: string;
  name: string;
  playerName: string;
  race: string;
  classes: string;
  level: number;
  alignment: string | null;
  hpMax: number | null;
  ac: number | null;
  str: number | null;
  dex: number | null;
  con: number | null;
  int: number | null;
  wis: number | null;
  cha: number | null;
  status: string | null;
  appId: string;
  lastSync: string | null;
}

export function notionPageToCharacter(page: PageObjectResponse): NotionCharacter {
  const p = page.properties;
  return {
    id: page.id,
    name: getTitle(p['Nom']),
    playerName: getRichText(p['Joueur']),
    race: getSelect(p['Race']) || '',
    classes: getRichText(p['Classes']),
    level: getNumber(p['Niveau']) || 1,
    alignment: getSelect(p['Alignement']),
    hpMax: getNumber(p['PV Max']),
    ac: getNumber(p['CA']),
    str: getNumber(p['FOR']),
    dex: getNumber(p['DEX']),
    con: getNumber(p['CON']),
    int: getNumber(p['INT']),
    wis: getNumber(p['SAG']),
    cha: getNumber(p['CHA']),
    status: getSelect(p['Statut']),
    appId: getRichText(p['App ID']),
    lastSync: p['Dernière sync']?.type === 'date' ? p['Dernière sync'].date?.start || null : null,
  };
}

export function characterToNotionProperties(char: {
  name: string;
  playerName?: string;
  race?: string;
  classes?: string;
  level?: number;
  alignment?: string;
  hpMax?: number;
  ac?: number;
  str?: number;
  dex?: number;
  con?: number;
  int?: number;
  wis?: number;
  cha?: number;
  status?: string;
  appId?: string;
}): CreatePageParameters['properties'] {
  return {
    'Nom': titleProp(char.name),
    'Joueur': richTextProp(char.playerName || ''),
    'Race': selectProp(char.race),
    'Classes': richTextProp(char.classes || ''),
    'Niveau': numberProp(char.level || 1),
    'Alignement': selectProp(char.alignment),
    'PV Max': numberProp(char.hpMax),
    'CA': numberProp(char.ac),
    'FOR': numberProp(char.str),
    'DEX': numberProp(char.dex),
    'CON': numberProp(char.con),
    'INT': numberProp(char.int),
    'SAG': numberProp(char.wis),
    'CHA': numberProp(char.cha),
    'Statut': selectProp(char.status || 'Actif'),
    'App ID': richTextProp(char.appId || ''),
    'Dernière sync': dateProp(new Date().toISOString()),
  };
}
