import { Injectable, inject } from '@angular/core';
import { DatabaseService } from './database.service';
import { NotionApiService, type NotionRaceData, type NotionClassData, type NotionSpellData, type NotionItemData } from './notion-api.service';
import { CharacterService } from './character.service';
import type { GameRace, GameClass, GameSpell, GameItem } from '../../models/game-data.model';
import type { Character } from '../../models/character.model';

// === Progress Callback ===

export type SyncProgressCallback = (message: string, progress: number) => void;

// === Notion -> Local Mappers ===

function notionRaceToLocal(race: NotionRaceData): GameRace {
  const abilityBonuses: { ability: string; bonus: number }[] = [];
  const bonusMatches = race.abilityBonuses.matchAll(/(\w+)\s*\+(\d+)/g);
  for (const match of bonusMatches) {
    const abilityMap: Record<string, string> = {
      'FOR': 'str', 'STR': 'str',
      'DEX': 'dex',
      'CON': 'con',
      'INT': 'int',
      'SAG': 'wis', 'WIS': 'wis',
      'CHA': 'cha',
    };
    const ability = abilityMap[match[1].toUpperCase()] || match[1].toLowerCase();
    abilityBonuses.push({ ability, bonus: parseInt(match[2]) });
  }

  return {
    id: race.id.replace(/-/g, ''),
    name: race.name,
    source: race.source || 'Notion',
    speed: race.speed,
    size: race.size === 'Petite' ? 'Small' : race.size === 'Grande' ? 'Large' : 'Medium',
    abilityBonuses,
    traits: race.traits,
    languages: race.languages,
    darkvision: race.darkvision || undefined,
    subraces: race.subraces ? race.subraces.split(',').map(s => s.trim()) : [],
    description: race.description,
  };
}

function notionClassToLocal(cls: NotionClassData): GameClass {
  const hitDieMap: Record<string, number> = { 'd6': 6, 'd8': 8, 'd10': 10, 'd12': 12 };

  return {
    id: cls.id.replace(/-/g, ''),
    name: cls.name,
    source: cls.source || 'Notion',
    hitDie: hitDieMap[cls.hitDie] || 8,
    primaryAbility: cls.primaryAbility.map(a => a.toLowerCase()),
    savingThrows: cls.savingThrows.map(s => s.toLowerCase()),
    skillChoices: { count: 2, from: [] },
    armorProficiencies: cls.armorProficiencies,
    weaponProficiencies: cls.weaponProficiencies,
    spellcasting: cls.spellcasting && cls.spellcastingAbility
      ? { ability: cls.spellcastingAbility.toLowerCase(), type: 'full' }
      : undefined,
    description: cls.description,
  };
}

function notionSpellToLocal(spell: NotionSpellData): GameSpell {
  return {
    id: spell.id.replace(/-/g, ''),
    name: spell.name,
    level: spell.level,
    school: spell.school || 'evocation',
    castingTime: spell.castingTime,
    range: spell.range,
    components: {
      verbal: spell.components.includes('V'),
      somatic: spell.components.includes('S'),
      material: spell.components.includes('M') ? spell.material : undefined,
    },
    duration: spell.duration,
    description: spell.description,
    higherLevels: spell.higherLevels || undefined,
    classes: spell.classes.map(c => c.toLowerCase()),
    source: spell.source || 'Notion',
  };
}

function notionItemToLocal(item: NotionItemData): GameItem {
  const categoryMap: Record<string, string> = {
    'Arme': 'weapon',
    'Armure': 'armor',
    'Équipement': 'adventuring-gear',
    'Outil': 'tool',
    'Objet magique': 'magic-item',
    'Consommable': 'consumable',
    'Herbe': 'herb',
  };

  const gameItem: GameItem = {
    id: item.id.replace(/-/g, ''),
    name: item.name,
    source: item.source || 'Notion',
    category: categoryMap[item.category || ''] || item.category || 'adventuring-gear',
    description: item.description,
    weight: item.weight || undefined,
    rarity: item.rarity || undefined,
    requiresAttunement: item.attunement || undefined,
    properties: item.properties.length > 0 ? item.properties : undefined,
  };

  if (item.damage) {
    gameItem.damage = { dice: item.damage, type: item.damageType };
  }

  if (item.armorClass) {
    const acMatch = item.armorClass.match(/(\d+)/);
    if (acMatch) {
      gameItem.armorClass = {
        base: parseInt(acMatch[1]),
        dexBonus: item.armorClass.toLowerCase().includes('dex'),
      };
    }
  }

  if (item.cost) {
    const costMatch = item.cost.match(/(\d+)\s*(\w+)/);
    if (costMatch) {
      gameItem.cost = { quantity: parseInt(costMatch[1]), unit: costMatch[2] };
    }
  }

  return gameItem;
}

// === Service ===

@Injectable({ providedIn: 'root' })
export class NotionSyncService {
  private db = inject(DatabaseService);
  private notionApi = inject(NotionApiService);
  private characterService = inject(CharacterService);

  // --- Sync Game Data ---

  async syncRacesFromNotion(onProgress?: SyncProgressCallback): Promise<number> {
    onProgress?.('Récupération des races depuis Notion...', 0);
    const notionRaces = await this.notionApi.fetchRaces();
    const localRaces = notionRaces.map(notionRaceToLocal);

    onProgress?.(`${localRaces.length} races trouvées, sauvegarde...`, 50);
    await this.db.races.clear();
    if (localRaces.length > 0) {
      await this.db.races.bulkAdd(localRaces);
    }

    onProgress?.(`${localRaces.length} races synchronisées`, 100);
    return localRaces.length;
  }

  async syncClassesFromNotion(onProgress?: SyncProgressCallback): Promise<number> {
    onProgress?.('Récupération des classes depuis Notion...', 0);
    const notionClasses = await this.notionApi.fetchClasses();
    const localClasses = notionClasses.map(notionClassToLocal);

    onProgress?.(`${localClasses.length} classes trouvées, sauvegarde...`, 50);
    await this.db.classes.clear();
    if (localClasses.length > 0) {
      await this.db.classes.bulkAdd(localClasses);
    }

    onProgress?.(`${localClasses.length} classes synchronisées`, 100);
    return localClasses.length;
  }

  async syncSpellsFromNotion(onProgress?: SyncProgressCallback): Promise<number> {
    onProgress?.('Récupération des sorts depuis Notion...', 0);
    const notionSpells = await this.notionApi.fetchSpells();
    const localSpells = notionSpells.map(notionSpellToLocal);

    onProgress?.(`${localSpells.length} sorts trouvés, sauvegarde...`, 50);
    await this.db.spells.clear();
    if (localSpells.length > 0) {
      await this.db.spells.bulkAdd(localSpells);
    }

    onProgress?.(`${localSpells.length} sorts synchronisés`, 100);
    return localSpells.length;
  }

  async syncItemsFromNotion(onProgress?: SyncProgressCallback): Promise<number> {
    onProgress?.('Récupération des objets depuis Notion...', 0);
    const notionItems = await this.notionApi.fetchItems();
    const localItems = notionItems.map(notionItemToLocal);

    onProgress?.(`${localItems.length} objets trouvés, sauvegarde...`, 50);
    await this.db.items.clear();
    if (localItems.length > 0) {
      await this.db.items.bulkAdd(localItems);
    }

    onProgress?.(`${localItems.length} objets synchronisés`, 100);
    return localItems.length;
  }

  async syncAllFromNotion(onProgress?: SyncProgressCallback): Promise<{
    races: number; classes: number; spells: number; items: number;
  }> {
    const results = { races: 0, classes: 0, spells: 0, items: 0 };

    onProgress?.('Synchronisation des races...', 5);
    results.races = await this.syncRacesFromNotion((msg, p) => onProgress?.(msg, 5 + p * 0.2));

    onProgress?.('Synchronisation des classes...', 25);
    results.classes = await this.syncClassesFromNotion((msg, p) => onProgress?.(msg, 25 + p * 0.2));

    onProgress?.('Synchronisation des sorts...', 50);
    results.spells = await this.syncSpellsFromNotion((msg, p) => onProgress?.(msg, 50 + p * 0.25));

    onProgress?.('Synchronisation des objets...', 75);
    results.items = await this.syncItemsFromNotion((msg, p) => onProgress?.(msg, 75 + p * 0.25));

    await this.db.dataStatus.put({
      id: 'status',
      version: '2.0-notion',
      lastImport: new Date().toISOString(),
      racesCount: results.races,
      classesCount: results.classes,
      spellsCount: results.spells,
      itemsCount: results.items,
      backgroundsCount: 0,
      featsCount: 0,
    });

    onProgress?.('Synchronisation terminée !', 100);
    return results;
  }

  // --- Character Sync ---

  async pushCharacterToNotion(character: Character): Promise<string> {
    const existing = await this.notionApi.findCharacterByAppId(character.id);

    const totalLevel = character.classes.reduce((sum, c) => sum + c.level, 0) || 1;
    const classString = character.classes.map(c => `${c.className} ${c.level}`).join(' / ');

    const notionData = {
      name: character.name || 'Sans nom',
      playerName: character.playerName || '',
      race: character.race.raceName || undefined,
      classes: classString,
      level: totalLevel,
      alignment: character.alignment || undefined,
      hpMax: character.currentState.hitPoints || undefined,
      ac: undefined as number | undefined,
      str: character.baseAbilityScores.strength,
      dex: character.baseAbilityScores.dexterity,
      con: character.baseAbilityScores.constitution,
      int: character.baseAbilityScores.intelligence,
      wis: character.baseAbilityScores.wisdom,
      cha: character.baseAbilityScores.charisma,
      status: 'Actif',
      appId: character.id,
    };

    const result = await this.notionApi.backupCharacter(
      notionData,
      character,
      existing?.id,
    );

    return result.id;
  }

  async pushAllCharactersToNotion(onProgress?: SyncProgressCallback): Promise<number> {
    const characters = await this.characterService.getAllCharacters();
    let synced = 0;

    for (let i = 0; i < characters.length; i++) {
      const char = characters[i];
      onProgress?.(`Sync: ${char.name || 'Sans nom'}...`, ((i + 1) / characters.length) * 100);

      try {
        await this.pushCharacterToNotion(char);
        synced++;
      } catch (error) {
        console.error(`Failed to sync character ${char.name}:`, error);
      }

      // Rate limiting
      await new Promise(r => setTimeout(r, 500));
    }

    onProgress?.(`${synced}/${characters.length} personnages synchronisés`, 100);
    return synced;
  }
}
