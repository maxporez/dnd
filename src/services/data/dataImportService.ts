// Service d'import des données D&D depuis l'API SRD (dnd5eapi.co)

import { db } from '../storage/database';
import type { GameRace, GameClass, GameSpell, GameItem, DataImportStatus } from '../storage/database';

const API_BASE = 'https://www.dnd5eapi.co/api/2014';

// Types pour les réponses de l'API
interface ApiListResponse {
  count: number;
  results: { index: string; name: string; url: string }[];
}

interface ApiRaceResponse {
  index: string;
  name: string;
  speed: number;
  size: string;
  ability_bonuses: { ability_score: { index: string }; bonus: number }[];
  traits: { index: string; name: string }[];
  languages: { index: string; name: string }[];
  subraces: { index: string; name: string }[];
  starting_proficiencies: { index: string; name: string }[];
  language_desc: string;
  age: string;
  alignment: string;
  size_description: string;
}

interface ApiClassResponse {
  index: string;
  name: string;
  hit_die: number;
  proficiency_choices: { choose: number; from: { options: { item: { index: string } }[] } }[];
  proficiencies: { index: string; name: string }[];
  saving_throws: { index: string; name: string }[];
  spellcasting?: { spellcasting_ability: { index: string } };
}

interface ApiSpellResponse {
  index: string;
  name: string;
  level: number;
  school: { index: string; name: string };
  casting_time: string;
  range: string;
  components: string[];
  material?: string;
  duration: string;
  desc: string[];
  higher_level?: string[];
  classes: { index: string; name: string }[];
}

interface ApiEquipmentResponse {
  index: string;
  name: string;
  equipment_category: { index: string; name: string };
  cost?: { quantity: number; unit: string };
  weight?: number;
  desc?: string[];
  // Armes
  damage?: { damage_dice: string; damage_type: { index: string; name: string } };
  weapon_category?: string;
  weapon_range?: string;
  properties?: { index: string; name: string }[];
  // Armures
  armor_category?: string;
  armor_class?: { base: number; dex_bonus: boolean; max_bonus?: number };
  str_minimum?: number;
  stealth_disadvantage?: boolean;
}

interface ApiMagicItemResponse {
  index: string;
  name: string;
  equipment_category: { index: string; name: string };
  rarity: { name: string };
  desc: string[];
  requires_attunement?: boolean;
}

// Callback pour le progrès
export type ProgressCallback = (message: string, progress: number) => void;

// Fetcher avec retry
async function fetchWithRetry<T>(url: string, retries = 3): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
    }
  }
  throw new Error('Fetch failed after retries');
}

// Importer les races
async function importRaces(onProgress: ProgressCallback): Promise<GameRace[]> {
  onProgress('Récupération de la liste des races...', 0);

  const list = await fetchWithRetry<ApiListResponse>(`${API_BASE}/races`);
  const races: GameRace[] = [];

  for (let i = 0; i < list.results.length; i++) {
    const item = list.results[i];
    onProgress(`Import race: ${item.name}`, ((i + 1) / list.results.length) * 100);

    const data = await fetchWithRetry<ApiRaceResponse>(`${API_BASE}/races/${item.index}`);

    races.push({
      id: data.index,
      name: data.name,
      source: 'SRD',
      speed: data.speed,
      size: data.size,
      abilityBonuses: data.ability_bonuses.map((ab) => ({
        ability: ab.ability_score.index,
        bonus: ab.bonus,
      })),
      traits: data.traits.map((t) => t.name),
      languages: data.languages.map((l) => l.name),
      subraces: data.subraces.map((s) => s.index),
      description: data.age,
    });

    // Petit délai pour ne pas surcharger l'API
    await new Promise((r) => setTimeout(r, 100));
  }

  return races;
}

// Importer les classes
async function importClasses(onProgress: ProgressCallback): Promise<GameClass[]> {
  onProgress('Récupération de la liste des classes...', 0);

  const list = await fetchWithRetry<ApiListResponse>(`${API_BASE}/classes`);
  const classes: GameClass[] = [];

  for (let i = 0; i < list.results.length; i++) {
    const item = list.results[i];
    onProgress(`Import classe: ${item.name}`, ((i + 1) / list.results.length) * 100);

    const data = await fetchWithRetry<ApiClassResponse>(`${API_BASE}/classes/${item.index}`);

    // Extraire les skills des proficiency choices
    const skillChoice = data.proficiency_choices.find((pc) =>
      pc.from.options.some((o) => o.item?.index?.startsWith('skill-'))
    );

    const skillOptions = skillChoice?.from.options
      .filter((o) => o.item?.index?.startsWith('skill-'))
      .map((o) => o.item.index.replace('skill-', '')) || [];

    // Extraire les proficiencies d'armure et d'armes
    const armorProfs = data.proficiencies
      .filter((p) => p.index.includes('armor') || p.index.includes('shield'))
      .map((p) => p.name);

    const weaponProfs = data.proficiencies
      .filter((p) => p.index.includes('weapon') || p.index.includes('sword') || p.index.includes('martial') || p.index.includes('simple'))
      .map((p) => p.name);

    classes.push({
      id: data.index,
      name: data.name,
      source: 'SRD',
      hitDie: data.hit_die,
      primaryAbility: [], // Non fourni directement par l'API
      savingThrows: data.saving_throws.map((st) => st.index),
      skillChoices: {
        count: skillChoice?.choose || 2,
        from: skillOptions,
      },
      armorProficiencies: armorProfs,
      weaponProficiencies: weaponProfs,
      spellcasting: data.spellcasting
        ? { ability: data.spellcasting.spellcasting_ability.index, type: 'full' }
        : undefined,
    });

    await new Promise((r) => setTimeout(r, 100));
  }

  return classes;
}

// Importer les sorts
async function importSpells(onProgress: ProgressCallback): Promise<GameSpell[]> {
  onProgress('Récupération de la liste des sorts...', 0);

  const list = await fetchWithRetry<ApiListResponse>(`${API_BASE}/spells`);
  const spells: GameSpell[] = [];

  // Les sorts sont nombreux, on traite par lots
  const batchSize = 20;

  for (let i = 0; i < list.results.length; i += batchSize) {
    const batch = list.results.slice(i, i + batchSize);
    onProgress(
      `Import sorts: ${i + 1}-${Math.min(i + batchSize, list.results.length)} / ${list.results.length}`,
      ((i + batchSize) / list.results.length) * 100
    );

    const batchPromises = batch.map(async (item) => {
      const data = await fetchWithRetry<ApiSpellResponse>(`${API_BASE}/spells/${item.index}`);

      return {
        id: data.index,
        name: data.name,
        level: data.level,
        school: data.school.index,
        castingTime: data.casting_time,
        range: data.range,
        components: {
          verbal: data.components.includes('V'),
          somatic: data.components.includes('S'),
          material: data.material,
        },
        duration: data.duration,
        description: data.desc.join('\n\n'),
        higherLevels: data.higher_level?.join('\n\n'),
        classes: data.classes.map((c) => c.index),
        source: 'SRD',
      };
    });

    const batchResults = await Promise.all(batchPromises);
    spells.push(...batchResults);

    await new Promise((r) => setTimeout(r, 200));
  }

  return spells;
}

// Importer les objets (équipement + objets magiques)
async function importItems(onProgress: ProgressCallback): Promise<GameItem[]> {
  onProgress('Récupération de la liste des équipements...', 0);

  const items: GameItem[] = [];

  // Importer l'équipement standard
  const equipmentList = await fetchWithRetry<ApiListResponse>(`${API_BASE}/equipment`);
  const batchSize = 20;

  for (let i = 0; i < equipmentList.results.length; i += batchSize) {
    const batch = equipmentList.results.slice(i, i + batchSize);
    onProgress(
      `Import équipement: ${i + 1}-${Math.min(i + batchSize, equipmentList.results.length)} / ${equipmentList.results.length}`,
      ((i + batchSize) / equipmentList.results.length) * 50
    );

    const batchPromises = batch.map(async (item) => {
      try {
        const data = await fetchWithRetry<ApiEquipmentResponse>(`${API_BASE}/equipment/${item.index}`);

        const gameItem: GameItem = {
          id: data.index,
          name: data.name,
          source: 'SRD',
          category: data.equipment_category.index,
          cost: data.cost,
          weight: data.weight,
          description: data.desc?.join('\n\n') || '',
        };

        // Données spécifiques aux armes
        if (data.damage) {
          gameItem.damage = {
            dice: data.damage.damage_dice,
            type: data.damage.damage_type.name,
          };
          gameItem.weaponCategory = data.weapon_category;
          gameItem.weaponRange = data.weapon_range;
          gameItem.properties = data.properties?.map((p) => p.name);
        }

        // Données spécifiques aux armures
        if (data.armor_category) {
          gameItem.armorCategory = data.armor_category;
          if (data.armor_class) {
            gameItem.armorClass = {
              base: data.armor_class.base,
              dexBonus: data.armor_class.dex_bonus,
              maxBonus: data.armor_class.max_bonus,
            };
          }
          gameItem.strengthRequirement = data.str_minimum;
          gameItem.stealthDisadvantage = data.stealth_disadvantage;
        }

        return gameItem;
      } catch {
        return null;
      }
    });

    const batchResults = (await Promise.all(batchPromises)).filter((item): item is GameItem => item !== null);
    items.push(...batchResults);

    await new Promise((r) => setTimeout(r, 200));
  }

  // Importer les objets magiques
  onProgress('Récupération des objets magiques...', 50);
  const magicItemsList = await fetchWithRetry<ApiListResponse>(`${API_BASE}/magic-items`);

  for (let i = 0; i < magicItemsList.results.length; i += batchSize) {
    const batch = magicItemsList.results.slice(i, i + batchSize);
    onProgress(
      `Import objets magiques: ${i + 1}-${Math.min(i + batchSize, magicItemsList.results.length)} / ${magicItemsList.results.length}`,
      50 + ((i + batchSize) / magicItemsList.results.length) * 50
    );

    const batchPromises = batch.map(async (item): Promise<GameItem | null> => {
      try {
        const data = await fetchWithRetry<ApiMagicItemResponse>(`${API_BASE}/magic-items/${item.index}`);

        return {
          id: data.index,
          name: data.name,
          source: 'SRD',
          category: 'magic-item',
          description: data.desc.join('\n\n'),
          rarity: data.rarity.name,
          requiresAttunement: data.requires_attunement,
        };
      } catch {
        return null;
      }
    });

    const batchResults = (await Promise.all(batchPromises)).filter((item): item is GameItem => item !== null);
    items.push(...batchResults);

    await new Promise((r) => setTimeout(r, 200));
  }

  return items;
}

// Import complet de toutes les données
export async function importAllData(onProgress: ProgressCallback): Promise<DataImportStatus> {
  try {
    // Étape 1: Races (5%)
    onProgress('Import des races...', 2);
    const races = await importRaces((msg, p) => onProgress(msg, 2 + p * 0.05));

    // Étape 2: Classes (10%)
    onProgress('Import des classes...', 7);
    const classes = await importClasses((msg, p) => onProgress(msg, 7 + p * 0.05));

    // Étape 3: Sorts (40%)
    onProgress('Import des sorts...', 12);
    const spells = await importSpells((msg, p) => onProgress(msg, 12 + p * 0.35));

    // Étape 4: Items (40%)
    onProgress('Import des équipements...', 50);
    const items = await importItems((msg, p) => onProgress(msg, 50 + p * 0.4));

    // Étape 5: Sauvegarde en base (5%)
    onProgress('Sauvegarde en base de données...', 92);

    // Clear existing data
    await db.races.clear();
    await db.classes.clear();
    await db.spells.clear();
    await db.items.clear();

    // Bulk insert
    await db.races.bulkAdd(races);
    await db.classes.bulkAdd(classes);
    await db.spells.bulkAdd(spells);
    await db.items.bulkAdd(items);

    // Update status
    const status: DataImportStatus = {
      id: 'status',
      version: '1.1',
      lastImport: new Date().toISOString(),
      racesCount: races.length,
      classesCount: classes.length,
      spellsCount: spells.length,
      itemsCount: items.length,
      backgroundsCount: 0,
      featsCount: 0,
    };

    await db.dataStatus.put(status);

    onProgress('Import terminé !', 100);

    return status;
  } catch (error) {
    console.error('Erreur lors de l\'import:', error);
    throw error;
  }
}

// Récupérer les races depuis la base locale
export async function getLocalRaces(): Promise<GameRace[]> {
  return db.races.orderBy('name').toArray();
}

// Récupérer les classes depuis la base locale
export async function getLocalClasses(): Promise<GameClass[]> {
  return db.classes.orderBy('name').toArray();
}

// Récupérer les sorts depuis la base locale
export async function getLocalSpells(): Promise<GameSpell[]> {
  return db.spells.orderBy('name').toArray();
}

// Récupérer les sorts par classe
export async function getSpellsByClass(classId: string): Promise<GameSpell[]> {
  const allSpells = await db.spells.toArray();
  return allSpells.filter((s) => s.classes.includes(classId));
}

// Récupérer les sorts par niveau
export async function getSpellsByLevel(level: number): Promise<GameSpell[]> {
  return db.spells.where('level').equals(level).toArray();
}

// Récupérer les items depuis la base locale
export async function getLocalItems(): Promise<GameItem[]> {
  return db.items.orderBy('name').toArray();
}

// Récupérer les items par catégorie
export async function getItemsByCategory(category: string): Promise<GameItem[]> {
  return db.items.where('category').equals(category).toArray();
}
