// Sync and setup routes
// Handles database creation, configuration, and status checks

import { Router } from 'express';
import { getNotionClient, hasCredentials, setCredentials, clearCredentials } from '../notion/client.js';
import {
  setupAllDatabases,
  getDatabaseIds,
  setDatabaseIds,
  type NotionDatabaseIds,
} from '../notion/databases.js';

export const syncRouter = Router();

// Check connection status and database config
syncRouter.get('/status', async (_req, res) => {
  try {
    if (!hasCredentials()) {
      return res.json({
        connected: false,
        error: 'Aucune clé API configurée',
        databases: getDatabaseIds(),
        configured: false,
      });
    }

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

// Connect with API key and page ID
syncRouter.post('/connect', async (req, res) => {
  try {
    const { apiKey, pageId } = req.body as { apiKey: string; pageId: string };

    if (!apiKey || !pageId) {
      return res.status(400).json({ error: 'API key et Page ID requis' });
    }

    // Set the credentials
    setCredentials(apiKey, pageId);

    // Test the connection
    const notion = getNotionClient();
    const user = await notion.users.me({});

    res.json({
      connected: true,
      user: user.name || 'Unknown',
    });
  } catch (error) {
    // Clear bad credentials
    clearCredentials();
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(401).json({ error: `Connexion échouée : ${message}` });
  }
});

// Disconnect
syncRouter.post('/disconnect', (_req, res) => {
  clearCredentials();
  res.json({ success: true });
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
