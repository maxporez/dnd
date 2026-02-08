// Notion database schema definitions for D&D data
// Each function creates a database with the appropriate properties

import type { CreateDatabaseParameters } from '@notionhq/client/build/src/api-endpoints';
import { getNotionClient, getParentPageId } from './client.js';

// Store database IDs after creation
export interface NotionDatabaseIds {
  characters?: string;
  races?: string;
  classes?: string;
  spells?: string;
  items?: string;
}

let databaseIds: NotionDatabaseIds = {};

export function getDatabaseIds(): NotionDatabaseIds {
  return databaseIds;
}

export function setDatabaseIds(ids: NotionDatabaseIds): void {
  databaseIds = { ...databaseIds, ...ids };
}

// Helper to create a database
async function createDatabase(params: Omit<CreateDatabaseParameters, 'parent'> & { parent?: CreateDatabaseParameters['parent'] }): Promise<string> {
  const notion = getNotionClient();
  const parentPageId = getParentPageId();

  const response = await notion.databases.create({
    ...params,
    parent: { type: 'page_id', page_id: parentPageId },
  } as CreateDatabaseParameters);

  return response.id;
}

// === Characters Database ===
export async function createCharactersDatabase(): Promise<string> {
  const id = await createDatabase({
    title: [{ type: 'text', text: { content: 'Personnages D&D' } }],
    icon: { type: 'emoji', emoji: '🧙' },
    properties: {
      'Nom': { title: {} },
      'Joueur': { rich_text: {} },
      'Race': { select: { options: [] } },
      'Classes': { rich_text: {} },
      'Niveau': { number: { format: 'number' } },
      'Alignement': {
        select: {
          options: [
            { name: 'Loyal Bon', color: 'blue' },
            { name: 'Neutre Bon', color: 'green' },
            { name: 'Chaotique Bon', color: 'purple' },
            { name: 'Loyal Neutre', color: 'blue' },
            { name: 'Neutre', color: 'gray' },
            { name: 'Chaotique Neutre', color: 'purple' },
            { name: 'Loyal Mauvais', color: 'red' },
            { name: 'Neutre Mauvais', color: 'orange' },
            { name: 'Chaotique Mauvais', color: 'red' },
          ],
        },
      },
      'PV Max': { number: { format: 'number' } },
      'CA': { number: { format: 'number' } },
      'FOR': { number: { format: 'number' } },
      'DEX': { number: { format: 'number' } },
      'CON': { number: { format: 'number' } },
      'INT': { number: { format: 'number' } },
      'SAG': { number: { format: 'number' } },
      'CHA': { number: { format: 'number' } },
      'Statut': {
        select: {
          options: [
            { name: 'Actif', color: 'green' },
            { name: 'Retiré', color: 'yellow' },
            { name: 'Mort', color: 'red' },
          ],
        },
      },
      'App ID': { rich_text: {} },
      'Dernière sync': { date: {} },
    },
  });

  databaseIds.characters = id;
  return id;
}

// === Races Database ===
export async function createRacesDatabase(): Promise<string> {
  const id = await createDatabase({
    title: [{ type: 'text', text: { content: 'Races D&D' } }],
    icon: { type: 'emoji', emoji: '🧝' },
    properties: {
      'Nom': { title: {} },
      'Source': {
        select: {
          options: [
            { name: 'SRD', color: 'blue' },
            { name: 'Homebrew', color: 'purple' },
          ],
        },
      },
      'Vitesse': { number: { format: 'number' } },
      'Taille': {
        select: {
          options: [
            { name: 'Petite', color: 'green' },
            { name: 'Moyenne', color: 'blue' },
            { name: 'Grande', color: 'orange' },
          ],
        },
      },
      'Bonus Carac.': { rich_text: {} },
      'Traits': { multi_select: { options: [] } },
      'Langues': { multi_select: { options: [] } },
      'Vision dans le noir': { number: { format: 'number' } },
      'Sous-races': { rich_text: {} },
      'Description': { rich_text: {} },
    },
  });

  databaseIds.races = id;
  return id;
}

// === Classes Database ===
export async function createClassesDatabase(): Promise<string> {
  const id = await createDatabase({
    title: [{ type: 'text', text: { content: 'Classes D&D' } }],
    icon: { type: 'emoji', emoji: '⚔️' },
    properties: {
      'Nom': { title: {} },
      'Source': {
        select: {
          options: [
            { name: 'SRD', color: 'blue' },
            { name: 'Homebrew', color: 'purple' },
          ],
        },
      },
      'Dé de vie': {
        select: {
          options: [
            { name: 'd6', color: 'red' },
            { name: 'd8', color: 'orange' },
            { name: 'd10', color: 'yellow' },
            { name: 'd12', color: 'green' },
          ],
        },
      },
      'Carac. principale': { multi_select: { options: [] } },
      'Jets de sauvegarde': { multi_select: { options: [] } },
      'Maîtrises armures': { multi_select: { options: [] } },
      'Maîtrises armes': { multi_select: { options: [] } },
      'Incantation': { checkbox: {} },
      'Carac. incantation': {
        select: {
          options: [
            { name: 'Intelligence', color: 'blue' },
            { name: 'Sagesse', color: 'green' },
            { name: 'Charisme', color: 'purple' },
          ],
        },
      },
      'Description': { rich_text: {} },
    },
  });

  databaseIds.classes = id;
  return id;
}

// === Spells Database ===
export async function createSpellsDatabase(): Promise<string> {
  const id = await createDatabase({
    title: [{ type: 'text', text: { content: 'Sorts D&D' } }],
    icon: { type: 'emoji', emoji: '✨' },
    properties: {
      'Nom': { title: {} },
      'Niveau': { number: { format: 'number' } },
      'École': {
        select: {
          options: [
            { name: 'Abjuration', color: 'blue' },
            { name: 'Divination', color: 'purple' },
            { name: 'Enchantement', color: 'pink' },
            { name: 'Évocation', color: 'red' },
            { name: 'Illusion', color: 'yellow' },
            { name: 'Invocation', color: 'orange' },
            { name: 'Nécromancie', color: 'gray' },
            { name: 'Transmutation', color: 'green' },
          ],
        },
      },
      'Temps incantation': { rich_text: {} },
      'Portée': { rich_text: {} },
      'Composantes': {
        multi_select: {
          options: [
            { name: 'V', color: 'blue' },
            { name: 'S', color: 'green' },
            { name: 'M', color: 'orange' },
          ],
        },
      },
      'Matériel': { rich_text: {} },
      'Durée': { rich_text: {} },
      'Classes': { multi_select: { options: [] } },
      'Source': {
        select: {
          options: [
            { name: 'SRD', color: 'blue' },
            { name: 'Homebrew', color: 'purple' },
          ],
        },
      },
      'Description': { rich_text: {} },
      'Niveaux supérieurs': { rich_text: {} },
    },
  });

  databaseIds.spells = id;
  return id;
}

// === Items Database ===
export async function createItemsDatabase(): Promise<string> {
  const id = await createDatabase({
    title: [{ type: 'text', text: { content: 'Objets D&D' } }],
    icon: { type: 'emoji', emoji: '🎒' },
    properties: {
      'Nom': { title: {} },
      'Source': {
        select: {
          options: [
            { name: 'SRD', color: 'blue' },
            { name: 'Homebrew', color: 'purple' },
          ],
        },
      },
      'Catégorie': {
        select: {
          options: [
            { name: 'Arme', color: 'red' },
            { name: 'Armure', color: 'blue' },
            { name: 'Équipement', color: 'green' },
            { name: 'Outil', color: 'orange' },
            { name: 'Objet magique', color: 'purple' },
            { name: 'Consommable', color: 'yellow' },
            { name: 'Herbe', color: 'green' },
          ],
        },
      },
      'Rareté': {
        select: {
          options: [
            { name: 'Commun', color: 'gray' },
            { name: 'Peu commun', color: 'green' },
            { name: 'Rare', color: 'blue' },
            { name: 'Très rare', color: 'purple' },
            { name: 'Légendaire', color: 'orange' },
            { name: 'Artéfact', color: 'red' },
          ],
        },
      },
      'Prix': { rich_text: {} },
      'Poids': { number: { format: 'number' } },
      'Dégâts': { rich_text: {} },
      'Type dégâts': { rich_text: {} },
      'CA': { rich_text: {} },
      'Propriétés': { multi_select: { options: [] } },
      'Harmonisation': { checkbox: {} },
      'Description': { rich_text: {} },
    },
  });

  databaseIds.items = id;
  return id;
}

// Create all databases
export async function setupAllDatabases(): Promise<NotionDatabaseIds> {
  console.log('Creating Notion databases...');

  const characters = await createCharactersDatabase();
  console.log(`  Characters DB: ${characters}`);

  const races = await createRacesDatabase();
  console.log(`  Races DB: ${races}`);

  const classes = await createClassesDatabase();
  console.log(`  Classes DB: ${classes}`);

  const spells = await createSpellsDatabase();
  console.log(`  Spells DB: ${spells}`);

  const items = await createItemsDatabase();
  console.log(`  Items DB: ${items}`);

  console.log('All databases created successfully!');
  return databaseIds;
}
