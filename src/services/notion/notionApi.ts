// Frontend API client for the Notion backend
// All calls go through the Express server which proxies to Notion API

const API_BASE = '/api/notion';

async function apiCall<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || `API error: ${response.status}`);
  }

  return response.json();
}

// === Connection Status ===

export interface NotionStatus {
  connected: boolean;
  user?: string;
  error?: string;
  databases: {
    characters?: string;
    races?: string;
    classes?: string;
    spells?: string;
    items?: string;
  };
  configured: boolean;
}

export async function getNotionStatus(): Promise<NotionStatus> {
  return apiCall<NotionStatus>('/sync/status');
}

export async function setupDatabases(): Promise<{ success: boolean; databases: NotionStatus['databases'] }> {
  return apiCall('/sync/setup', { method: 'POST' });
}

export async function configureDatabases(ids: NotionStatus['databases']): Promise<{
  success: boolean;
  databases: NotionStatus['databases'];
  validations: Record<string, boolean>;
}> {
  return apiCall('/sync/configure', {
    method: 'POST',
    body: JSON.stringify(ids),
  });
}

// === Game Data ===

export interface NotionRaceData {
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

export async function fetchRaces(): Promise<NotionRaceData[]> {
  return apiCall<NotionRaceData[]>('/game/races');
}

export async function createRace(race: Omit<NotionRaceData, 'id'>): Promise<NotionRaceData> {
  return apiCall<NotionRaceData>('/game/races', {
    method: 'POST',
    body: JSON.stringify(race),
  });
}

export interface NotionClassData {
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

export async function fetchClasses(): Promise<NotionClassData[]> {
  return apiCall<NotionClassData[]>('/game/classes');
}

export async function createClass(cls: Omit<NotionClassData, 'id'>): Promise<NotionClassData> {
  return apiCall<NotionClassData>('/game/classes', {
    method: 'POST',
    body: JSON.stringify(cls),
  });
}

export interface NotionSpellData {
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

export async function fetchSpells(): Promise<NotionSpellData[]> {
  return apiCall<NotionSpellData[]>('/game/spells');
}

export interface NotionItemData {
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

export async function fetchItems(): Promise<NotionItemData[]> {
  return apiCall<NotionItemData[]>('/game/items');
}

// === Characters ===

export interface NotionCharacterData {
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

export async function fetchCharacters(): Promise<NotionCharacterData[]> {
  return apiCall<NotionCharacterData[]>('/characters');
}

export async function syncCharacter(character: Record<string, unknown>, notionPageId?: string): Promise<{ id: string; action: string }> {
  return apiCall('/characters/sync', {
    method: 'POST',
    body: JSON.stringify({ character, notionPageId }),
  });
}

export async function backupCharacter(
  character: Record<string, unknown>,
  characterJson: unknown,
  notionPageId?: string,
): Promise<{ id: string; action: string }> {
  return apiCall('/characters/backup', {
    method: 'POST',
    body: JSON.stringify({ character, characterJson, notionPageId }),
  });
}

export async function findCharacterByAppId(appId: string): Promise<NotionCharacterData | null> {
  try {
    return await apiCall<NotionCharacterData>(`/characters/by-app-id/${encodeURIComponent(appId)}`);
  } catch {
    return null;
  }
}

// === Search ===

export async function searchNotion(query: string): Promise<Array<{ id: string; title: string; url: string }>> {
  return apiCall(`/sync/search?q=${encodeURIComponent(query)}`);
}
