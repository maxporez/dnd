// API routes for game data (races, classes, spells, items)
// Reads from and writes to Notion databases

import { Router } from 'express';
import { getNotionClient } from '../notion/client.js';
import { getDatabaseIds } from '../notion/databases.js';
import {
  notionPageToRace, raceToNotionProperties,
  notionPageToClass, classToNotionProperties,
  notionPageToSpell, spellToNotionProperties,
  notionPageToItem, itemToNotionProperties,
} from '../notion/mappers.js';
import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';

export const gameDataRouter = Router();

// Helper: query all pages from a database (handles pagination)
async function queryAllPages(databaseId: string): Promise<PageObjectResponse[]> {
  const notion = getNotionClient();
  const pages: PageObjectResponse[] = [];
  let cursor: string | undefined;

  do {
    const response = await notion.databases.query({
      database_id: databaseId,
      start_cursor: cursor,
      page_size: 100,
    });

    for (const page of response.results) {
      if ('properties' in page) {
        pages.push(page as PageObjectResponse);
      }
    }

    cursor = response.has_more ? response.next_cursor as string : undefined;
  } while (cursor);

  return pages;
}

// Helper: create a page in a database
async function createPage(databaseId: string, properties: Record<string, unknown>) {
  const notion = getNotionClient();
  return notion.pages.create({
    parent: { database_id: databaseId },
    properties: properties as Parameters<typeof notion.pages.create>[0]['properties'],
  });
}

// Helper: update a page
async function updatePage(pageId: string, properties: Record<string, unknown>) {
  const notion = getNotionClient();
  return notion.pages.update({
    page_id: pageId,
    properties: properties as Parameters<typeof notion.pages.update>[0]['properties'],
  });
}

// === RACES ===

gameDataRouter.get('/races', async (_req, res) => {
  try {
    const dbId = getDatabaseIds().races;
    if (!dbId) return res.status(503).json({ error: 'Races database not configured' });

    const pages = await queryAllPages(dbId);
    const races = pages.map(notionPageToRace);
    res.json(races);
  } catch (error) {
    console.error('Error fetching races:', error);
    res.status(500).json({ error: 'Failed to fetch races' });
  }
});

gameDataRouter.post('/races', async (req, res) => {
  try {
    const dbId = getDatabaseIds().races;
    if (!dbId) return res.status(503).json({ error: 'Races database not configured' });

    const properties = raceToNotionProperties(req.body);
    const page = await createPage(dbId, properties);
    res.json({ id: page.id, ...req.body });
  } catch (error) {
    console.error('Error creating race:', error);
    res.status(500).json({ error: 'Failed to create race' });
  }
});

// Bulk create races
gameDataRouter.post('/races/bulk', async (req, res) => {
  try {
    const dbId = getDatabaseIds().races;
    if (!dbId) return res.status(503).json({ error: 'Races database not configured' });

    const races = req.body as Array<Record<string, unknown>>;
    const results = [];

    for (const race of races) {
      const properties = raceToNotionProperties(race as Parameters<typeof raceToNotionProperties>[0]);
      const page = await createPage(dbId, properties);
      results.push({ id: page.id });
      // Rate limiting - Notion API allows 3 requests/second
      await new Promise(r => setTimeout(r, 350));
    }

    res.json({ created: results.length, results });
  } catch (error) {
    console.error('Error bulk creating races:', error);
    res.status(500).json({ error: 'Failed to bulk create races' });
  }
});

// === CLASSES ===

gameDataRouter.get('/classes', async (_req, res) => {
  try {
    const dbId = getDatabaseIds().classes;
    if (!dbId) return res.status(503).json({ error: 'Classes database not configured' });

    const pages = await queryAllPages(dbId);
    const classes = pages.map(notionPageToClass);
    res.json(classes);
  } catch (error) {
    console.error('Error fetching classes:', error);
    res.status(500).json({ error: 'Failed to fetch classes' });
  }
});

gameDataRouter.post('/classes', async (req, res) => {
  try {
    const dbId = getDatabaseIds().classes;
    if (!dbId) return res.status(503).json({ error: 'Classes database not configured' });

    const properties = classToNotionProperties(req.body);
    const page = await createPage(dbId, properties);
    res.json({ id: page.id, ...req.body });
  } catch (error) {
    console.error('Error creating class:', error);
    res.status(500).json({ error: 'Failed to create class' });
  }
});

gameDataRouter.post('/classes/bulk', async (req, res) => {
  try {
    const dbId = getDatabaseIds().classes;
    if (!dbId) return res.status(503).json({ error: 'Classes database not configured' });

    const classes = req.body as Array<Record<string, unknown>>;
    const results = [];

    for (const cls of classes) {
      const properties = classToNotionProperties(cls as Parameters<typeof classToNotionProperties>[0]);
      const page = await createPage(dbId, properties);
      results.push({ id: page.id });
      await new Promise(r => setTimeout(r, 350));
    }

    res.json({ created: results.length, results });
  } catch (error) {
    console.error('Error bulk creating classes:', error);
    res.status(500).json({ error: 'Failed to bulk create classes' });
  }
});

// === SPELLS ===

gameDataRouter.get('/spells', async (_req, res) => {
  try {
    const dbId = getDatabaseIds().spells;
    if (!dbId) return res.status(503).json({ error: 'Spells database not configured' });

    const pages = await queryAllPages(dbId);
    const spells = pages.map(notionPageToSpell);
    res.json(spells);
  } catch (error) {
    console.error('Error fetching spells:', error);
    res.status(500).json({ error: 'Failed to fetch spells' });
  }
});

gameDataRouter.post('/spells', async (req, res) => {
  try {
    const dbId = getDatabaseIds().spells;
    if (!dbId) return res.status(503).json({ error: 'Spells database not configured' });

    const properties = spellToNotionProperties(req.body);
    const page = await createPage(dbId, properties);
    res.json({ id: page.id, ...req.body });
  } catch (error) {
    console.error('Error creating spell:', error);
    res.status(500).json({ error: 'Failed to create spell' });
  }
});

gameDataRouter.post('/spells/bulk', async (req, res) => {
  try {
    const dbId = getDatabaseIds().spells;
    if (!dbId) return res.status(503).json({ error: 'Spells database not configured' });

    const spells = req.body as Array<Record<string, unknown>>;
    const results = [];

    for (const spell of spells) {
      const properties = spellToNotionProperties(spell as Parameters<typeof spellToNotionProperties>[0]);
      const page = await createPage(dbId, properties);
      results.push({ id: page.id });
      await new Promise(r => setTimeout(r, 350));
    }

    res.json({ created: results.length, results });
  } catch (error) {
    console.error('Error bulk creating spells:', error);
    res.status(500).json({ error: 'Failed to bulk create spells' });
  }
});

// === ITEMS ===

gameDataRouter.get('/items', async (_req, res) => {
  try {
    const dbId = getDatabaseIds().items;
    if (!dbId) return res.status(503).json({ error: 'Items database not configured' });

    const pages = await queryAllPages(dbId);
    const items = pages.map(notionPageToItem);
    res.json(items);
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

gameDataRouter.post('/items', async (req, res) => {
  try {
    const dbId = getDatabaseIds().items;
    if (!dbId) return res.status(503).json({ error: 'Items database not configured' });

    const properties = itemToNotionProperties(req.body);
    const page = await createPage(dbId, properties);
    res.json({ id: page.id, ...req.body });
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({ error: 'Failed to create item' });
  }
});

gameDataRouter.post('/items/bulk', async (req, res) => {
  try {
    const dbId = getDatabaseIds().items;
    if (!dbId) return res.status(503).json({ error: 'Items database not configured' });

    const items = req.body as Array<Record<string, unknown>>;
    const results = [];

    for (const item of items) {
      const properties = itemToNotionProperties(item as Parameters<typeof itemToNotionProperties>[0]);
      const page = await createPage(dbId, properties);
      results.push({ id: page.id });
      await new Promise(r => setTimeout(r, 350));
    }

    res.json({ created: results.length, results });
  } catch (error) {
    console.error('Error bulk creating items:', error);
    res.status(500).json({ error: 'Failed to bulk create items' });
  }
});

// === UPDATE (generic for all types) ===

gameDataRouter.patch('/page/:pageId', async (req, res) => {
  try {
    const { pageId } = req.params;
    const { type, ...data } = req.body;

    let properties;
    switch (type) {
      case 'race': properties = raceToNotionProperties(data); break;
      case 'class': properties = classToNotionProperties(data); break;
      case 'spell': properties = spellToNotionProperties(data); break;
      case 'item': properties = itemToNotionProperties(data); break;
      default: return res.status(400).json({ error: 'Unknown type' });
    }

    await updatePage(pageId, properties);
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating page:', error);
    res.status(500).json({ error: 'Failed to update page' });
  }
});
