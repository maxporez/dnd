// Service d'import des herbes depuis le fichier JSON local

import { db } from '../storage/database';
import type { GameItem } from '../storage/database';
import herbsData from '../../data/herbs.json';

// Types pour les herbes du JSON
interface HerbData {
  id: string;
  name: string;
  type: string;
  preparation: string;
  price: number;
  part: string;
  habitat: string;
  seasons: string[];
  description: string;
  effect: string;
}

// Labels français pour les types d'herbes
const TYPE_LABELS: Record<string, string> = {
  curatif: 'Curatif',
  fortifiant: 'Fortifiant',
  dopant: 'Dopant',
  antipoison: 'Antipoison',
  alterant: 'Altérant',
};

// Labels français pour les préparations
const PREPARATION_LABELS: Record<string, string> = {
  infusion: 'Infusion',
  decoction: 'Décoction',
  maceration: 'Macération',
  absorption_directe: 'Absorption directe',
};

// Labels français pour les parties de plante
const PART_LABELS: Record<string, string> = {
  plante: 'Plante entière',
  racines: 'Racines',
  ecorce: 'Écorce',
  champignon: 'Champignon',
};

// Labels français pour les habitats
const HABITAT_LABELS: Record<string, string> = {
  foret: 'Forêt',
  plaine: 'Plaine',
  montagne: 'Montagne',
  marais: 'Marais',
  desert: 'Désert',
  arctique: 'Arctique',
  littoral: 'Littoral',
  outreterre: 'Outreterre',
};

// Labels français pour les saisons
const SEASON_LABELS: Record<string, string> = {
  printemps: 'Printemps',
  ete: 'Été',
  automne: 'Automne',
};

// Convertir une herbe du JSON en GameItem
function herbToGameItem(herb: HerbData): GameItem {
  const typeLabel = TYPE_LABELS[herb.type] || herb.type;
  const prepLabel = PREPARATION_LABELS[herb.preparation] || herb.preparation;
  const partLabel = PART_LABELS[herb.part] || herb.part;
  const habitatLabel = HABITAT_LABELS[herb.habitat] || herb.habitat;
  const seasonsLabels = herb.seasons.map(s => SEASON_LABELS[s] || s).join(', ');

  // Construire la description complète
  const fullDescription = `**Type:** ${typeLabel}
**Préparation:** ${prepLabel}
**Partie utilisée:** ${partLabel}
**Habitat:** ${habitatLabel}
**Saison:** ${seasonsLabels || 'Toute l\'année'}

${herb.description}

**Effet:** ${herb.effect}`;

  return {
    id: herb.id,
    name: herb.name,
    source: 'AideDD',
    category: 'herb',
    cost: {
      quantity: herb.price,
      unit: 'po',
    },
    description: fullDescription,
    // Propriétés personnalisées stockées dans les propriétés
    properties: [
      `Type: ${typeLabel}`,
      `Préparation: ${prepLabel}`,
      `Partie: ${partLabel}`,
      `Habitat: ${habitatLabel}`,
    ],
  };
}

// Importer toutes les herbes dans la base de données
export async function importHerbs(): Promise<number> {
  const herbs = herbsData.herbs as HerbData[];
  const gameItems = herbs.map(herbToGameItem);

  // Supprimer les herbes existantes (source AideDD, catégorie herb)
  const existingHerbs = await db.items
    .filter(item => item.source === 'AideDD' && item.category === 'herb')
    .toArray();

  for (const herb of existingHerbs) {
    await db.items.delete(herb.id);
  }

  // Ajouter les nouvelles herbes
  await db.items.bulkAdd(gameItems);

  return gameItems.length;
}

// Récupérer toutes les herbes
export async function getHerbs(): Promise<GameItem[]> {
  return db.items
    .filter(item => item.category === 'herb')
    .toArray();
}

// Récupérer les herbes par type
export async function getHerbsByType(type: string): Promise<GameItem[]> {
  return db.items
    .filter(item => item.category === 'herb' && (item.properties?.some(p => p.includes(type)) ?? false))
    .toArray();
}

// Récupérer le nombre d'herbes
export async function getHerbsCount(): Promise<number> {
  return db.items
    .filter(item => item.category === 'herb')
    .count();
}

// Exporter les labels pour l'UI
export const HERB_TYPES = Object.entries(TYPE_LABELS).map(([id, name]) => ({ id, name }));
export const HERB_PREPARATIONS = Object.entries(PREPARATION_LABELS).map(([id, name]) => ({ id, name }));
export const HERB_PARTS = Object.entries(PART_LABELS).map(([id, name]) => ({ id, name }));
export const HERB_HABITATS = Object.entries(HABITAT_LABELS).map(([id, name]) => ({ id, name }));
export const HERB_SEASONS = Object.entries(SEASON_LABELS).map(([id, name]) => ({ id, name }));
