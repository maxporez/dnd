// Setup script: creates Notion databases and optionally populates with sample data
// Usage: npx tsx server/scripts/setup.ts [--with-sample-data]

import dotenv from 'dotenv';
dotenv.config();

import { setupAllDatabases } from '../notion/databases';
import { getNotionClient } from '../notion/client';
import {
  raceToNotionProperties,
  classToNotionProperties,
  characterToNotionProperties,
} from '../notion/mappers';

const SAMPLE_RACES = [
  {
    name: 'Humain',
    source: 'SRD',
    speed: 30,
    size: 'Moyenne',
    abilityBonuses: '+1 à toutes les caractéristiques',
    traits: ['Polyvalent'],
    languages: ['Commun'],
    description: 'Les humains sont les plus adaptables et les plus ambitieux des races communes.',
  },
  {
    name: 'Elfe',
    source: 'SRD',
    speed: 30,
    size: 'Moyenne',
    abilityBonuses: 'DEX +2',
    traits: ['Vision dans le noir', 'Sens aiguisés', 'Ascendance féerique', 'Transe'],
    languages: ['Commun', 'Elfique'],
    darkvision: 60,
    subraces: 'Haut-Elfe, Elfe des Bois, Drow',
    description: 'Les elfes sont un peuple magique, intimement lié à la nature et au monde féerique.',
  },
  {
    name: 'Nain',
    source: 'SRD',
    speed: 25,
    size: 'Moyenne',
    abilityBonuses: 'CON +2',
    traits: ['Vision dans le noir', 'Résistance naine', 'Entraînement nain aux armes', 'Maîtrise des outils'],
    languages: ['Commun', 'Nain'],
    darkvision: 60,
    subraces: 'Nain des collines, Nain des montagnes',
    description: 'Audacieux et endurants, les nains sont connus comme des guerriers habiles et des mineurs infatigables.',
  },
];

const SAMPLE_CLASSES = [
  {
    name: 'Guerrier',
    source: 'SRD',
    hitDie: 'd10',
    primaryAbility: ['Force', 'Dextérité'],
    savingThrows: ['Force', 'Constitution'],
    armorProficiencies: ['Toutes les armures', 'Boucliers'],
    weaponProficiencies: ['Armes courantes', 'Armes de guerre'],
    spellcasting: false,
    description: 'Un maître du combat martial, spécialisé dans les armes et les armures.',
  },
  {
    name: 'Magicien',
    source: 'SRD',
    hitDie: 'd6',
    primaryAbility: ['Intelligence'],
    savingThrows: ['Intelligence', 'Sagesse'],
    armorProficiencies: [],
    weaponProficiencies: ['Dagues', 'Fléchettes', 'Frondes', 'Bâtons', 'Arbalètes légères'],
    spellcasting: true,
    spellcastingAbility: 'Intelligence',
    description: 'Un utilisateur de magie érudit, capable de manipuler les structures de la réalité.',
  },
  {
    name: 'Roublard',
    source: 'SRD',
    hitDie: 'd8',
    primaryAbility: ['Dextérité'],
    savingThrows: ['Dextérité', 'Intelligence'],
    armorProficiencies: ['Armures légères'],
    weaponProficiencies: ['Armes courantes', 'Arbalètes de poing', 'Épées longues', 'Rapières', 'Épées courtes'],
    spellcasting: false,
    description: 'Un filou qui utilise la furtivité et la ruse pour surmonter les obstacles.',
  },
];

const SAMPLE_CHARACTER = {
  name: 'Thalion Lunargent',
  playerName: 'Joueur Template',
  race: 'Elfe',
  classes: 'Magicien 5 / Guerrier 2',
  level: 7,
  alignment: 'Neutre Bon',
  hpMax: 42,
  ac: 15,
  str: 10,
  dex: 16,
  con: 14,
  int: 18,
  wis: 12,
  cha: 11,
  status: 'Actif',
  appId: 'template-thalion',
};

async function main() {
  const withSampleData = process.argv.includes('--with-sample-data');

  console.log('=== D&D Grimoire - Notion Setup ===\n');

  // Test connection
  console.log('Testing Notion connection...');
  try {
    const notion = getNotionClient();
    const user = await notion.users.me({});
    console.log(`  Connected as: ${user.name}\n`);
  } catch (error) {
    console.error('Failed to connect to Notion. Check your NOTION_API_KEY.');
    console.error(error);
    process.exit(1);
  }

  // Create databases
  console.log('Creating databases...');
  const dbIds = await setupAllDatabases();
  console.log('\nDatabase IDs (save these for configuration):');
  console.log(JSON.stringify(dbIds, null, 2));

  if (withSampleData) {
    console.log('\n--- Populating with sample data ---\n');

    const notion = getNotionClient();

    // Add sample races
    console.log('Adding sample races...');
    for (const race of SAMPLE_RACES) {
      const properties = raceToNotionProperties(race);
      await notion.pages.create({
        parent: { database_id: dbIds.races! },
        properties: properties as Parameters<typeof notion.pages.create>[0]['properties'],
      });
      console.log(`  + ${race.name}`);
      await new Promise(r => setTimeout(r, 350));
    }

    // Add sample classes
    console.log('Adding sample classes...');
    for (const cls of SAMPLE_CLASSES) {
      const properties = classToNotionProperties(cls);
      await notion.pages.create({
        parent: { database_id: dbIds.classes! },
        properties: properties as Parameters<typeof notion.pages.create>[0]['properties'],
      });
      console.log(`  + ${cls.name}`);
      await new Promise(r => setTimeout(r, 350));
    }

    // Add sample character template
    console.log('Adding sample character template...');
    const charProps = characterToNotionProperties(SAMPLE_CHARACTER);
    const charPage = await notion.pages.create({
      parent: { database_id: dbIds.characters! },
      properties: charProps as Parameters<typeof notion.pages.create>[0]['properties'],
      children: [
        {
          object: 'block',
          type: 'heading_2',
          heading_2: {
            rich_text: [{ type: 'text', text: { content: 'Thalion Lunargent' } }],
          },
        },
        {
          object: 'block',
          type: 'callout',
          callout: {
            icon: { type: 'emoji', emoji: '🧝' },
            rich_text: [{ type: 'text', text: { content: 'Elfe - Magicien 5 / Guerrier 2 - Niveau 7' } }],
          },
        },
        {
          object: 'block',
          type: 'heading_3',
          heading_3: {
            rich_text: [{ type: 'text', text: { content: 'Backstory' } }],
          },
        },
        {
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [{
              type: 'text',
              text: {
                content: 'Thalion Lunargent est un elfe érudit originaire de la tour d\'ivoire de Mythalanir. Passionné par les arts arcaniques depuis son plus jeune âge, il a quitté sa forêt natale pour explorer les bibliothèques anciennes du monde. Son séjour parmi les gardes royaux lui a appris le maniement des armes, faisant de lui un guerrier-mage redoutable.',
              },
            }],
          },
        },
        {
          object: 'block',
          type: 'heading_3',
          heading_3: {
            rich_text: [{ type: 'text', text: { content: 'Traits de personnalité' } }],
          },
        },
        {
          object: 'block',
          type: 'bulleted_list_item',
          bulleted_list_item: {
            rich_text: [{ type: 'text', text: { content: 'Curieux et méthodique - ne peut résister à un vieux livre ou une inscription ancienne' } }],
          },
        },
        {
          object: 'block',
          type: 'bulleted_list_item',
          bulleted_list_item: {
            rich_text: [{ type: 'text', text: { content: 'Protecteur de ses compagnons, mais parfois distant et perdu dans ses pensées' } }],
          },
        },
        {
          object: 'block',
          type: 'heading_3',
          heading_3: {
            rich_text: [{ type: 'text', text: { content: 'Équipement notable' } }],
          },
        },
        {
          object: 'block',
          type: 'bulleted_list_item',
          bulleted_list_item: {
            rich_text: [{ type: 'text', text: { content: 'Bâton de mage +1' } }],
          },
        },
        {
          object: 'block',
          type: 'bulleted_list_item',
          bulleted_list_item: {
            rich_text: [{ type: 'text', text: { content: 'Armure de mage (CA 13 + DEX)' } }],
          },
        },
        {
          object: 'block',
          type: 'bulleted_list_item',
          bulleted_list_item: {
            rich_text: [{ type: 'text', text: { content: 'Grimoire relié en cuir de dragon' } }],
          },
        },
      ] as Parameters<typeof notion.pages.create>[0]['children'],
    });
    console.log(`  + ${SAMPLE_CHARACTER.name} (${charPage.id})`);

    console.log('\nSample data created successfully!');
  }

  console.log('\n=== Setup Complete ===');
  console.log('\nNext steps:');
  console.log('1. Save the database IDs above');
  console.log('2. Start the server with: npm run server');
  console.log('3. Configure the database IDs in the app settings');
  console.log('4. Open Notion to see and edit your D&D data!');
}

main().catch(console.error);
