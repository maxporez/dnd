import { db } from './database';
import type { GameRace, GameClass, GameSpell, GameItem } from './database';

// === RACES ===

export async function getAllRaces(): Promise<GameRace[]> {
  return db.races.orderBy('name').toArray();
}

export async function getRace(id: string): Promise<GameRace | undefined> {
  return db.races.get(id);
}

export async function saveRace(race: GameRace): Promise<void> {
  await db.races.put(race);
}

export async function deleteRace(id: string): Promise<void> {
  await db.races.delete(id);
}

export async function deleteAllRaces(): Promise<void> {
  await db.races.clear();
}

// === CLASSES ===

export async function getAllClasses(): Promise<GameClass[]> {
  return db.classes.orderBy('name').toArray();
}

export async function getClass(id: string): Promise<GameClass | undefined> {
  return db.classes.get(id);
}

export async function saveClass(gameClass: GameClass): Promise<void> {
  await db.classes.put(gameClass);
}

export async function deleteClass(id: string): Promise<void> {
  await db.classes.delete(id);
}

export async function deleteAllClasses(): Promise<void> {
  await db.classes.clear();
}

// === SPELLS ===

export async function getAllSpells(): Promise<GameSpell[]> {
  return db.spells.orderBy('name').toArray();
}

export async function getSpellsByClass(className: string): Promise<GameSpell[]> {
  return db.spells.filter((spell) =>
    spell.classes.some((c) => c.toLowerCase() === className.toLowerCase())
  ).toArray();
}

export async function getSpellsByLevel(level: number): Promise<GameSpell[]> {
  return db.spells.where('level').equals(level).toArray();
}

export async function getSpell(id: string): Promise<GameSpell | undefined> {
  return db.spells.get(id);
}

export async function saveSpell(spell: GameSpell): Promise<void> {
  await db.spells.put(spell);
}

export async function deleteSpell(id: string): Promise<void> {
  await db.spells.delete(id);
}

export async function deleteAllSpells(): Promise<void> {
  await db.spells.clear();
}

// === ITEMS ===

export async function getAllItems(): Promise<GameItem[]> {
  return db.items.orderBy('name').toArray();
}

export async function getItemsByCategory(category: string): Promise<GameItem[]> {
  return db.items.where('category').equals(category).toArray();
}

export async function getItemsByRarity(rarity: string): Promise<GameItem[]> {
  return db.items.filter((item) => item.rarity === rarity).toArray();
}

export async function getItem(id: string): Promise<GameItem | undefined> {
  return db.items.get(id);
}

export async function saveItem(item: GameItem): Promise<void> {
  await db.items.put(item);
}

export async function deleteItem(id: string): Promise<void> {
  await db.items.delete(id);
}

export async function deleteAllItems(): Promise<void> {
  await db.items.clear();
}

// === UTILITY ===

export async function getDataCounts(): Promise<{ races: number; classes: number; spells: number; items: number }> {
  const [races, classes, spells, items] = await Promise.all([
    db.races.count(),
    db.classes.count(),
    db.spells.count(),
    db.items.count(),
  ]);
  return { races, classes, spells, items };
}

export async function clearAllGameData(): Promise<void> {
  await Promise.all([
    db.races.clear(),
    db.classes.clear(),
    db.spells.clear(),
    db.items.clear(),
    db.backgrounds.clear(),
    db.feats.clear(),
    db.dataStatus.clear(),
  ]);
}
