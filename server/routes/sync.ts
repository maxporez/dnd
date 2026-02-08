// Sync and setup routes
// Handles database creation, configuration, and status checks

import { Router } from 'express';
import { getNotionClient } from '../notion/client';
import {
  setupAllDatabases,
  getDatabaseIds,
  setDatabaseIds,
  type NotionDatabaseIds,
} from '../notion/databases';

export const syncRouter = Router();

// Check connection status and database config
syncRouter.get('/status', async (_req, res) => {
  try {
    const notion = getNotionClient();

    // Test the connection
    const user = await notion.users.me({});
    const dbIds = getDatabaseIds();
    const configured = !!(dbIds.characters && dbIds.races && dbIds.classes && dbIds.spells && dbIds.items);

    res.json({
      connected: true,
      user: user.name || 'Unknown',
      databases: dbIds,
      configured,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.json({
      connected: false,
      error: message,
      databases: getDatabaseIds(),
      configured: false,
    });
  }
});

// Setup: create all Notion databases
syncRouter.post('/setup', async (_req, res) => {
  try {
    const dbIds = await setupAllDatabases();
    res.json({
      success: true,
      databases: dbIds,
    });
  } catch (error) {
    console.error('Error setting up databases:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: `Failed to setup databases: ${message}` });
  }
});

// Configure existing database IDs (if databases already exist)
syncRouter.post('/configure', async (req, res) => {
  try {
    const dbIds = req.body as NotionDatabaseIds;
    setDatabaseIds(dbIds);

    // Validate that the databases exist
    const notion = getNotionClient();
    const validations: Record<string, boolean> = {};

    for (const [key, id] of Object.entries(dbIds)) {
      if (id) {
        try {
          await notion.databases.retrieve({ database_id: id });
          validations[key] = true;
        } catch {
          validations[key] = false;
        }
      }
    }

    res.json({
      success: true,
      databases: getDatabaseIds(),
      validations,
    });
  } catch (error) {
    console.error('Error configuring databases:', error);
    res.status(500).json({ error: 'Failed to configure databases' });
  }
});

// Search across all databases
syncRouter.get('/search', async (req, res) => {
  try {
    const query = req.query.q as string;
    if (!query) return res.status(400).json({ error: 'Query parameter "q" is required' });

    const notion = getNotionClient();
    const response = await notion.search({
      query,
      page_size: 20,
    });

    const results = response.results
      .filter((r): r is Extract<typeof r, { object: 'page' }> => r.object === 'page')
      .map(page => {
        if (!('properties' in page)) return null;
        const titleProp = Object.values(page.properties).find(p => p.type === 'title');
        const title = titleProp?.type === 'title'
          ? titleProp.title.map(t => t.plain_text).join('')
          : 'Unknown';

        return {
          id: page.id,
          title,
          url: page.url,
        };
      })
      .filter(Boolean);

    res.json(results);
  } catch (error) {
    console.error('Error searching:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});
