import { Injectable, inject } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
import { DatabaseService } from './database.service';
import type { HomebrewPack, HomebrewRule, Modifier } from '../../models/rules.model';

@Injectable({ providedIn: 'root' })
export class HomebrewService {
  private db = inject(DatabaseService);

  // Packs
  async createPack(data: Omit<HomebrewPack, 'id' | 'createdAt' | 'updatedAt'>): Promise<HomebrewPack> {
    const now = new Date().toISOString();
    const pack: HomebrewPack = { ...data, id: uuidv4(), createdAt: now, updatedAt: now };
    await this.db.homebrewPacks.add(pack);
    return pack;
  }

  async getAllPacks(): Promise<HomebrewPack[]> {
    return this.db.homebrewPacks.orderBy('name').toArray();
  }

  async getPack(id: string): Promise<HomebrewPack | undefined> {
    return this.db.homebrewPacks.get(id);
  }

  async updatePack(id: string, updates: Partial<Omit<HomebrewPack, 'id' | 'createdAt'>>): Promise<HomebrewPack | undefined> {
    const pack = await this.db.homebrewPacks.get(id);
    if (!pack) return undefined;
    const updated: HomebrewPack = { ...pack, ...updates, updatedAt: new Date().toISOString() };
    await this.db.homebrewPacks.put(updated);
    return updated;
  }

  async deletePack(id: string): Promise<boolean> {
    const pack = await this.db.homebrewPacks.get(id);
    if (!pack) return false;
    await this.db.homebrewPacks.delete(id);
    return true;
  }

  // Rules
  async createRule(data: Omit<HomebrewRule, 'id'>): Promise<HomebrewRule> {
    const rule: HomebrewRule = { ...data, id: uuidv4() };
    await this.db.homebrewRules.add(rule);
    return rule;
  }

  async getAllRules(): Promise<HomebrewRule[]> {
    return this.db.homebrewRules.orderBy('name').toArray();
  }

  async getEnabledRules(): Promise<HomebrewRule[]> {
    return this.db.homebrewRules.where('enabled').equals(1).toArray();
  }

  async toggleRule(id: string, enabled: boolean): Promise<boolean> {
    const rule = await this.db.homebrewRules.get(id);
    if (!rule) return false;
    await this.db.homebrewRules.update(id, { enabled });
    return true;
  }

  async deleteRule(id: string): Promise<boolean> {
    const rule = await this.db.homebrewRules.get(id);
    if (!rule) return false;
    await this.db.homebrewRules.delete(rule.id);
    return true;
  }

  // Utility
  extractModifiersFromPack(pack: HomebrewPack): Modifier[] {
    const modifiers: Modifier[] = [];
    if (pack.content.modifiers) modifiers.push(...pack.content.modifiers);
    if (pack.content.races) pack.content.races.forEach((r) => modifiers.push(...r.modifiers));
    if (pack.content.classes) pack.content.classes.forEach((c) => modifiers.push(...c.modifiers));
    if (pack.content.feats) pack.content.feats.forEach((f) => modifiers.push(...f.modifiers));
    if (pack.content.items) pack.content.items.forEach((i) => modifiers.push(...i.modifiers));
    if (pack.content.rules) pack.content.rules.forEach((r) => modifiers.push(...r.modifiers));
    return modifiers;
  }

  exportPackToJson(pack: HomebrewPack): string {
    return JSON.stringify(pack, null, 2);
  }

  async importPackFromJson(json: string): Promise<HomebrewPack> {
    const data = JSON.parse(json) as HomebrewPack;
    const now = new Date().toISOString();
    const pack: HomebrewPack = { ...data, id: uuidv4(), createdAt: now, updatedAt: now };
    await this.db.homebrewPacks.add(pack);
    return pack;
  }
}
