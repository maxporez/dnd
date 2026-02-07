import { v4 as uuidv4 } from 'uuid';
import { db } from './database';
import type { HomebrewPack, HomebrewRule, Modifier } from '../../types';

// Service de gestion des règles maison

// === HOMEBREW PACKS ===

// Créer un nouveau pack homebrew
export async function createHomebrewPack(
  data: Omit<HomebrewPack, 'id' | 'createdAt' | 'updatedAt'>
): Promise<HomebrewPack> {
  const now = new Date().toISOString();
  const pack: HomebrewPack = {
    ...data,
    id: uuidv4(),
    createdAt: now,
    updatedAt: now,
  };

  await db.homebrewPacks.add(pack);
  return pack;
}

// Récupérer tous les packs
export async function getAllHomebrewPacks(): Promise<HomebrewPack[]> {
  return db.homebrewPacks.orderBy('name').toArray();
}

// Récupérer un pack par ID
export async function getHomebrewPack(id: string): Promise<HomebrewPack | undefined> {
  return db.homebrewPacks.get(id);
}

// Mettre à jour un pack
export async function updateHomebrewPack(
  id: string,
  updates: Partial<Omit<HomebrewPack, 'id' | 'createdAt'>>
): Promise<HomebrewPack | undefined> {
  const pack = await db.homebrewPacks.get(id);
  if (!pack) return undefined;

  const updated: HomebrewPack = {
    ...pack,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  await db.homebrewPacks.put(updated);
  return updated;
}

// Supprimer un pack
export async function deleteHomebrewPack(id: string): Promise<boolean> {
  const pack = await db.homebrewPacks.get(id);
  if (!pack) return false;

  await db.homebrewPacks.delete(id);
  return true;
}

// Exporter un pack en JSON
export function exportHomebrewPackToJson(pack: HomebrewPack): string {
  return JSON.stringify(pack, null, 2);
}

// Importer un pack depuis JSON
export async function importHomebrewPackFromJson(json: string): Promise<HomebrewPack> {
  const data = JSON.parse(json) as HomebrewPack;
  const now = new Date().toISOString();

  const pack: HomebrewPack = {
    ...data,
    id: uuidv4(),
    createdAt: now,
    updatedAt: now,
  };

  await db.homebrewPacks.add(pack);
  return pack;
}

// === HOMEBREW RULES ===

// Créer une nouvelle règle
export async function createHomebrewRule(
  data: Omit<HomebrewRule, 'id'>
): Promise<HomebrewRule> {
  const rule: HomebrewRule = {
    ...data,
    id: uuidv4(),
  };

  await db.homebrewRules.add(rule);
  return rule;
}

// Récupérer toutes les règles
export async function getAllHomebrewRules(): Promise<HomebrewRule[]> {
  return db.homebrewRules.orderBy('name').toArray();
}

// Récupérer les règles activées
export async function getEnabledHomebrewRules(): Promise<HomebrewRule[]> {
  return db.homebrewRules.where('enabled').equals(1).toArray();
}

// Récupérer une règle par ID
export async function getHomebrewRule(id: string): Promise<HomebrewRule | undefined> {
  return db.homebrewRules.get(id);
}

// Activer/désactiver une règle
export async function toggleHomebrewRule(id: string, enabled: boolean): Promise<boolean> {
  const rule = await db.homebrewRules.get(id);
  if (!rule) return false;

  await db.homebrewRules.update(id, { enabled });
  return true;
}

// Supprimer une règle
export async function deleteHomebrewRule(id: string): Promise<boolean> {
  const rule = await db.homebrewRules.get(id);
  if (!rule) return false;

  await db.homebrewRules.delete(id);
  return true;
}

// === UTILITAIRES ===

// Extraire tous les modificateurs d'un pack
export function extractModifiersFromPack(pack: HomebrewPack): Modifier[] {
  const modifiers: Modifier[] = [];

  if (pack.content.modifiers) {
    modifiers.push(...pack.content.modifiers);
  }

  if (pack.content.races) {
    pack.content.races.forEach((race) => modifiers.push(...race.modifiers));
  }

  if (pack.content.classes) {
    pack.content.classes.forEach((cls) => modifiers.push(...cls.modifiers));
  }

  if (pack.content.feats) {
    pack.content.feats.forEach((feat) => modifiers.push(...feat.modifiers));
  }

  if (pack.content.items) {
    pack.content.items.forEach((item) => modifiers.push(...item.modifiers));
  }

  if (pack.content.rules) {
    pack.content.rules.forEach((rule) => modifiers.push(...rule.modifiers));
  }

  return modifiers;
}
