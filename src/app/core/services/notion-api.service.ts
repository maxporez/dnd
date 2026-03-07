import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

const API_BASE = '/api/notion';

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
  envHints?: {
    apiKey?: string;
    pageId?: string;
  };
}

export interface NotionRaceData {
  id: string; name: string; source: string; speed: number; size: string;
  abilityBonuses: string; traits: string[]; languages: string[];
  darkvision: number | null; subraces: string; description: string;
}

export interface NotionClassData {
  id: string; name: string; source: string; hitDie: string;
  primaryAbility: string[]; savingThrows: string[];
  armorProficiencies: string[]; weaponProficiencies: string[];
  spellcasting: boolean; spellcastingAbility: string | null; description: string;
}

export interface NotionSpellData {
  id: string; name: string; level: number; school: string | null;
  castingTime: string; range: string; components: string[];
  material: string; duration: string; classes: string[];
  source: string; description: string; higherLevels: string;
}

export interface NotionItemData {
  id: string; name: string; source: string; category: string | null;
  rarity: string | null; cost: string; weight: number | null;
  damage: string; damageType: string; armorClass: string;
  properties: string[]; attunement: boolean; description: string;
}

export interface NotionCharacterData {
  id: string; name: string; playerName: string; race: string;
  classes: string; level: number; alignment: string | null;
  hpMax: number | null; ac: number | null;
  str: number | null; dex: number | null; con: number | null;
  int: number | null; wis: number | null; cha: number | null;
  status: string | null; appId: string; lastSync: string | null;
}

@Injectable({ providedIn: 'root' })
export class NotionApiService {
  private http = inject(HttpClient);

  async getStatus(): Promise<NotionStatus> {
    return firstValueFrom(this.http.get<NotionStatus>(`${API_BASE}/sync/status`));
  }

  async setupDatabases(): Promise<{ success: boolean; databases: NotionStatus['databases'] }> {
    return firstValueFrom(this.http.post<{ success: boolean; databases: NotionStatus['databases'] }>(`${API_BASE}/sync/setup`, {}));
  }

  async configureDatabases(ids: NotionStatus['databases']): Promise<{ success: boolean; databases: NotionStatus['databases']; validations: Record<string, boolean> }> {
    return firstValueFrom(this.http.post<{ success: boolean; databases: NotionStatus['databases']; validations: Record<string, boolean> }>(`${API_BASE}/sync/configure`, ids));
  }

  async fetchRaces(): Promise<NotionRaceData[]> {
    return firstValueFrom(this.http.get<NotionRaceData[]>(`${API_BASE}/game/races`));
  }

  async fetchClasses(): Promise<NotionClassData[]> {
    return firstValueFrom(this.http.get<NotionClassData[]>(`${API_BASE}/game/classes`));
  }

  async fetchSpells(): Promise<NotionSpellData[]> {
    return firstValueFrom(this.http.get<NotionSpellData[]>(`${API_BASE}/game/spells`));
  }

  async fetchItems(): Promise<NotionItemData[]> {
    return firstValueFrom(this.http.get<NotionItemData[]>(`${API_BASE}/game/items`));
  }

  async fetchCharacters(): Promise<NotionCharacterData[]> {
    return firstValueFrom(this.http.get<NotionCharacterData[]>(`${API_BASE}/characters`));
  }

  async backupCharacter(character: Record<string, unknown>, characterJson: unknown, notionPageId?: string): Promise<{ id: string; action: string }> {
    return firstValueFrom(this.http.post<{ id: string; action: string }>(`${API_BASE}/characters/backup`, { character, characterJson, notionPageId }));
  }

  async findCharacterByAppId(appId: string): Promise<NotionCharacterData | null> {
    try {
      return await firstValueFrom(this.http.get<NotionCharacterData>(`${API_BASE}/characters/by-app-id/${encodeURIComponent(appId)}`));
    } catch {
      return null;
    }
  }

  async connect(apiKey: string, pageId: string): Promise<{ connected: boolean; user: string }> {
    return firstValueFrom(this.http.post<{ connected: boolean; user: string }>(`${API_BASE}/sync/connect`, { apiKey, pageId }));
  }

  async disconnect(): Promise<{ success: boolean }> {
    return firstValueFrom(this.http.post<{ success: boolean }>(`${API_BASE}/sync/disconnect`, {}));
  }
}
