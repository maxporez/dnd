import { Injectable, inject } from '@angular/core';
import { DatabaseService } from './database.service';
import type { GameRace, GameClass, GameSpell, GameItem, DataImportStatus } from '../../models/game-data.model';

const API_BASE = 'https://www.dnd5eapi.co/api/2014';

// === API Response Types ===

interface ApiListResponse {
  count: number;
  results: { index: string; name: string; url: string }[];
}

interface ApiRaceResponse {
  index: string; name: string; speed: number; size: string;
  ability_bonuses: { ability_score: { index: string }; bonus: number }[];
  traits: { index: string; name: string }[];
  languages: { index: string; name: string }[];
  subraces: { index: string; name: string }[];
  starting_proficiencies: { index: string; name: string }[];
  language_desc: string; age: string; alignment: string; size_description: string;
}

interface ApiClassResponse {
  index: string; name: string; hit_die: number;
  proficiency_choices: { choose: number; from: { options: { item: { index: string } }[] } }[];
  proficiencies: { index: string; name: string }[];
  saving_throws: { index: string; name: string }[];
  spellcasting?: { spellcasting_ability: { index: string } };
}

interface ApiSpellResponse {
  index: string; name: string; level: number;
  school: { index: string; name: string };
  casting_time: string; range: string; components: string[];
  material?: string; duration: string; desc: string[];
  higher_level?: string[];
  classes: { index: string; name: string }[];
}

interface ApiEquipmentResponse {
  index: string; name: string;
  equipment_category: { index: string; name: string };
  cost?: { quantity: number; unit: string }; weight?: number; desc?: string[];
  damage?: { damage_dice: string; damage_type: { index: string; name: string } };
  weapon_category?: string; weapon_range?: string;
  properties?: { index: string; name: string }[];
  armor_category?: string;
  armor_class?: { base: number; dex_bonus: boolean; max_bonus?: number };
  str_minimum?: number; stealth_disadvantage?: boolean;
}

interface ApiMagicItemResponse {
  index: string; name: string;
  equipment_category: { index: string; name: string };
  rarity: { name: string }; desc: string[];
  requires_attunement?: boolean;
}

// === Herb Types ===

interface HerbData {
  id: string; name: string; type: string; preparation: string;
  price: number; part: string; habitat: string; seasons: string[];
  description: string; effect: string;
}

// === Progress Callback ===

export type ProgressCallback = (message: string, progress: number) => void;

// === Herb Label Maps ===

const HERB_TYPE_LABELS: Record<string, string> = {
  curatif: 'Curatif', fortifiant: 'Fortifiant', dopant: 'Dopant',
  antipoison: 'Antipoison', alterant: 'Altérant',
};

const HERB_PREPARATION_LABELS: Record<string, string> = {
  infusion: 'Infusion', decoction: 'Décoction',
  maceration: 'Macération', absorption_directe: 'Absorption directe',
};

const HERB_PART_LABELS: Record<string, string> = {
  plante: 'Plante entière', racines: 'Racines',
  ecorce: 'Écorce', champignon: 'Champignon',
};

const HERB_HABITAT_LABELS: Record<string, string> = {
  foret: 'Forêt', plaine: 'Plaine', montagne: 'Montagne',
  marais: 'Marais', desert: 'Désert', arctique: 'Arctique',
  littoral: 'Littoral', outreterre: 'Outreterre',
};

const HERB_SEASON_LABELS: Record<string, string> = {
  printemps: 'Printemps', ete: 'Été', automne: 'Automne',
};

// Exported label collections for UI
export const HERB_TYPES = Object.entries(HERB_TYPE_LABELS).map(([id, name]) => ({ id, name }));
export const HERB_PREPARATIONS = Object.entries(HERB_PREPARATION_LABELS).map(([id, name]) => ({ id, name }));
export const HERB_PARTS = Object.entries(HERB_PART_LABELS).map(([id, name]) => ({ id, name }));
export const HERB_HABITATS = Object.entries(HERB_HABITAT_LABELS).map(([id, name]) => ({ id, name }));
export const HERB_SEASONS = Object.entries(HERB_SEASON_LABELS).map(([id, name]) => ({ id, name }));

// === Service ===

@Injectable({ providedIn: 'root' })
export class DataImportService {
  private db = inject(DatabaseService);

  // --- Fetch with retry ---

  private async fetchWithRetry<T>(url: string, retries = 3): Promise<T> {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
      } catch (error) {
        if (i === retries - 1) throw error;
        await new Promise(r => setTimeout(r, 1000 * (i + 1)));
      }
    }
    throw new Error('Fetch failed after retries');
  }

  // --- Import Races ---

  private async importRaces(onProgress: ProgressCallback): Promise<GameRace[]> {
    onProgress('Récupération de la liste des races...', 0);
    const list = await this.fetchWithRetry<ApiListResponse>(`${API_BASE}/races`);
    const races: GameRace[] = [];

    for (let i = 0; i < list.results.length; i++) {
      const item = list.results[i];
      onProgress(`Import race: ${item.name}`, ((i + 1) / list.results.length) * 100);

      const data = await this.fetchWithRetry<ApiRaceResponse>(`${API_BASE}/races/${item.index}`);
      races.push({
        id: data.index,
        name: data.name,
        source: 'SRD',
        speed: data.speed,
        size: data.size,
        abilityBonuses: data.ability_bonuses.map(ab => ({
          ability: ab.ability_score.index, bonus: ab.bonus,
        })),
        traits: data.traits.map(t => t.name),
        languages: data.languages.map(l => l.name),
        subraces: data.subraces.map(s => s.index),
        description: data.age,
      });

      await new Promise(r => setTimeout(r, 100));
    }
    return races;
  }

  // --- Import Classes ---

  private async importClasses(onProgress: ProgressCallback): Promise<GameClass[]> {
    onProgress('Récupération de la liste des classes...', 0);
    const list = await this.fetchWithRetry<ApiListResponse>(`${API_BASE}/classes`);
    const classes: GameClass[] = [];

    for (let i = 0; i < list.results.length; i++) {
      const item = list.results[i];
      onProgress(`Import classe: ${item.name}`, ((i + 1) / list.results.length) * 100);

      const data = await this.fetchWithRetry<ApiClassResponse>(`${API_BASE}/classes/${item.index}`);

      const skillChoice = data.proficiency_choices.find(pc =>
        pc.from.options.some(o => o.item?.index?.startsWith('skill-')),
      );
      const skillOptions = skillChoice?.from.options
        .filter(o => o.item?.index?.startsWith('skill-'))
        .map(o => o.item.index.replace('skill-', '')) || [];

      const armorProfs = data.proficiencies
        .filter(p => p.index.includes('armor') || p.index.includes('shield'))
        .map(p => p.name);

      const weaponProfs = data.proficiencies
        .filter(p => p.index.includes('weapon') || p.index.includes('sword') || p.index.includes('martial') || p.index.includes('simple'))
        .map(p => p.name);

      classes.push({
        id: data.index,
        name: data.name,
        source: 'SRD',
        hitDie: data.hit_die,
        primaryAbility: [],
        savingThrows: data.saving_throws.map(st => st.index),
        skillChoices: { count: skillChoice?.choose || 2, from: skillOptions },
        armorProficiencies: armorProfs,
        weaponProficiencies: weaponProfs,
        spellcasting: data.spellcasting
          ? { ability: data.spellcasting.spellcasting_ability.index, type: 'full' }
          : undefined,
      });

      await new Promise(r => setTimeout(r, 100));
    }
    return classes;
  }

  // --- Import Spells ---

  private async importSpells(onProgress: ProgressCallback): Promise<GameSpell[]> {
    onProgress('Récupération de la liste des sorts...', 0);
    const list = await this.fetchWithRetry<ApiListResponse>(`${API_BASE}/spells`);
    const spells: GameSpell[] = [];
    const batchSize = 20;

    for (let i = 0; i < list.results.length; i += batchSize) {
      const batch = list.results.slice(i, i + batchSize);
      onProgress(
        `Import sorts: ${i + 1}-${Math.min(i + batchSize, list.results.length)} / ${list.results.length}`,
        ((i + batchSize) / list.results.length) * 100,
      );

      const batchResults = await Promise.all(batch.map(async item => {
        const data = await this.fetchWithRetry<ApiSpellResponse>(`${API_BASE}/spells/${item.index}`);
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
          classes: data.classes.map(c => c.index),
          source: 'SRD',
        } as GameSpell;
      }));

      spells.push(...batchResults);
      await new Promise(r => setTimeout(r, 200));
    }
    return spells;
  }

  // --- Import Items ---

  private async importItems(onProgress: ProgressCallback): Promise<GameItem[]> {
    onProgress('Récupération de la liste des équipements...', 0);
    const items: GameItem[] = [];
    const batchSize = 20;

    // Standard equipment
    const equipmentList = await this.fetchWithRetry<ApiListResponse>(`${API_BASE}/equipment`);

    for (let i = 0; i < equipmentList.results.length; i += batchSize) {
      const batch = equipmentList.results.slice(i, i + batchSize);
      onProgress(
        `Import équipement: ${i + 1}-${Math.min(i + batchSize, equipmentList.results.length)} / ${equipmentList.results.length}`,
        ((i + batchSize) / equipmentList.results.length) * 50,
      );

      const batchResults = (await Promise.all(batch.map(async (item): Promise<GameItem | null> => {
        try {
          const data = await this.fetchWithRetry<ApiEquipmentResponse>(`${API_BASE}/equipment/${item.index}`);
          const gameItem: GameItem = {
            id: data.index, name: data.name, source: 'SRD',
            category: data.equipment_category.index,
            cost: data.cost, weight: data.weight,
            description: data.desc?.join('\n\n') || '',
          };

          if (data.damage) {
            gameItem.damage = { dice: data.damage.damage_dice, type: data.damage.damage_type.name };
            gameItem.weaponCategory = data.weapon_category;
            gameItem.weaponRange = data.weapon_range;
            gameItem.properties = data.properties?.map(p => p.name);
          }

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
      }))).filter((item): item is GameItem => item !== null);

      items.push(...batchResults);
      await new Promise(r => setTimeout(r, 200));
    }

    // Magic items
    onProgress('Récupération des objets magiques...', 50);
    const magicItemsList = await this.fetchWithRetry<ApiListResponse>(`${API_BASE}/magic-items`);

    for (let i = 0; i < magicItemsList.results.length; i += batchSize) {
      const batch = magicItemsList.results.slice(i, i + batchSize);
      onProgress(
        `Import objets magiques: ${i + 1}-${Math.min(i + batchSize, magicItemsList.results.length)} / ${magicItemsList.results.length}`,
        50 + ((i + batchSize) / magicItemsList.results.length) * 50,
      );

      const batchResults = (await Promise.all(batch.map(async (item): Promise<GameItem | null> => {
        try {
          const data = await this.fetchWithRetry<ApiMagicItemResponse>(`${API_BASE}/magic-items/${item.index}`);
          return {
            id: data.index, name: data.name, source: 'SRD',
            category: 'magic-item', description: data.desc.join('\n\n'),
            rarity: data.rarity.name, requiresAttunement: data.requires_attunement,
          };
        } catch {
          return null;
        }
      }))).filter((item): item is GameItem => item !== null);

      items.push(...batchResults);
      await new Promise(r => setTimeout(r, 200));
    }

    return items;
  }

  // --- Import All Data from SRD API ---

  async importAllData(onProgress: ProgressCallback): Promise<DataImportStatus> {
    onProgress('Import des races...', 2);
    const races = await this.importRaces((msg, p) => onProgress(msg, 2 + p * 0.05));

    onProgress('Import des classes...', 7);
    const classes = await this.importClasses((msg, p) => onProgress(msg, 7 + p * 0.05));

    onProgress('Import des sorts...', 12);
    const spells = await this.importSpells((msg, p) => onProgress(msg, 12 + p * 0.35));

    onProgress('Import des équipements...', 50);
    const items = await this.importItems((msg, p) => onProgress(msg, 50 + p * 0.4));

    onProgress('Sauvegarde en base de données...', 92);

    await this.db.races.clear();
    await this.db.classes.clear();
    await this.db.spells.clear();
    await this.db.items.clear();

    await this.db.races.bulkAdd(races);
    await this.db.classes.bulkAdd(classes);
    await this.db.spells.bulkAdd(spells);
    await this.db.items.bulkAdd(items);

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

    await this.db.dataStatus.put(status);
    onProgress('Import terminé !', 100);
    return status;
  }

  // --- Import Herbs from local JSON ---

  async importHerbs(): Promise<number> {
    const herbsModule = await import('../../data/herbs.json');
    const raw = herbsModule.default;
    const herbs = (Array.isArray(raw) ? raw : (raw as any)?.herbs ?? []) as HerbData[];
    if (herbs.length === 0) return 0;

    const gameItems = herbs.map(herb => this.herbToGameItem(herb));

    // Remove existing herbs
    const existingHerbs = await this.db.items
      .filter(item => item.source === 'AideDD' && item.category === 'herb')
      .toArray();
    for (const herb of existingHerbs) {
      await this.db.items.delete(herb.id);
    }

    await this.db.items.bulkAdd(gameItems);
    return gameItems.length;
  }

  private herbToGameItem(herb: HerbData): GameItem {
    const typeLabel = HERB_TYPE_LABELS[herb.type] || herb.type;
    const prepLabel = HERB_PREPARATION_LABELS[herb.preparation] || herb.preparation;
    const partLabel = HERB_PART_LABELS[herb.part] || herb.part;
    const habitatLabel = HERB_HABITAT_LABELS[herb.habitat] || herb.habitat;
    const seasonsLabels = herb.seasons.map(s => HERB_SEASON_LABELS[s] || s).join(', ');

    const fullDescription = `**Type:** ${typeLabel}
**Préparation:** ${prepLabel}
**Partie utilisée:** ${partLabel}
**Habitat:** ${habitatLabel}
**Saison:** ${seasonsLabels || "Toute l'année"}

${herb.description}

**Effet:** ${herb.effect}`;

    return {
      id: herb.id,
      name: herb.name,
      source: 'AideDD',
      category: 'herb',
      cost: { quantity: herb.price, unit: 'po' },
      description: fullDescription,
      properties: [
        `Type: ${typeLabel}`,
        `Préparation: ${prepLabel}`,
        `Partie: ${partLabel}`,
        `Habitat: ${habitatLabel}`,
      ],
    };
  }

  // --- Query Helpers ---

  async getHerbs(): Promise<GameItem[]> {
    return this.db.items.filter(item => item.category === 'herb').toArray();
  }

  async getHerbsByType(type: string): Promise<GameItem[]> {
    return this.db.items
      .filter(item => item.category === 'herb' && (item.properties?.some(p => p.includes(type)) ?? false))
      .toArray();
  }

  async getHerbsCount(): Promise<number> {
    return this.db.items.filter(item => item.category === 'herb').count();
  }

  async getDataStatus(): Promise<DataImportStatus | undefined> {
    return this.db.dataStatus.get('status');
  }
}
