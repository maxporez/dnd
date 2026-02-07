import { v4 as uuidv4 } from 'uuid';
import { db } from './database';
import { createEmptyCharacter } from '../../types';
import type { Character } from '../../types';

// Service de gestion des personnages

// Créer un nouveau personnage
export async function createCharacter(
  data: Partial<Omit<Character, 'id' | 'createdAt' | 'updatedAt' | 'version'>>
): Promise<Character> {
  const now = new Date().toISOString();
  const character: Character = {
    ...createEmptyCharacter(),
    ...data,
    id: uuidv4(),
    createdAt: now,
    updatedAt: now,
    version: 1,
  };

  await db.characters.add(character);
  return character;
}

// Récupérer tous les personnages
export async function getAllCharacters(): Promise<Character[]> {
  return db.characters.orderBy('updatedAt').reverse().toArray();
}

// Récupérer un personnage par ID
export async function getCharacter(id: string): Promise<Character | undefined> {
  return db.characters.get(id);
}

// Mettre à jour un personnage
export async function updateCharacter(
  id: string,
  updates: Partial<Omit<Character, 'id' | 'createdAt'>>
): Promise<Character | undefined> {
  const character = await db.characters.get(id);
  if (!character) return undefined;

  const updatedCharacter: Character = {
    ...character,
    ...updates,
    updatedAt: new Date().toISOString(),
    version: character.version + 1,
  };

  await db.characters.put(updatedCharacter);
  return updatedCharacter;
}

// Supprimer un personnage
export async function deleteCharacter(id: string): Promise<boolean> {
  const character = await db.characters.get(id);
  if (!character) return false;

  await db.characters.delete(id);
  return true;
}

// Dupliquer un personnage
export async function duplicateCharacter(id: string): Promise<Character | undefined> {
  const original = await db.characters.get(id);
  if (!original) return undefined;

  const now = new Date().toISOString();
  const duplicate: Character = {
    ...original,
    id: uuidv4(),
    name: `${original.name} (copie)`,
    createdAt: now,
    updatedAt: now,
    version: 1,
  };

  await db.characters.add(duplicate);
  return duplicate;
}

// Exporter un personnage en JSON
export function exportCharacterToJson(character: Character): string {
  return JSON.stringify(character, null, 2);
}

// Importer un personnage depuis JSON
export async function importCharacterFromJson(json: string): Promise<Character> {
  const data = JSON.parse(json) as Character;

  // Générer un nouvel ID pour éviter les conflits
  const now = new Date().toISOString();
  const character: Character = {
    ...data,
    id: uuidv4(),
    createdAt: now,
    updatedAt: now,
    version: 1,
  };

  await db.characters.add(character);
  return character;
}

// Rechercher des personnages
export async function searchCharacters(query: string): Promise<Character[]> {
  const lowerQuery = query.toLowerCase();
  const all = await db.characters.toArray();

  return all.filter(
    (c) =>
      c.name.toLowerCase().includes(lowerQuery) ||
      c.race.raceName.toLowerCase().includes(lowerQuery) ||
      c.classes.some((cl) => cl.className.toLowerCase().includes(lowerQuery))
  );
}
