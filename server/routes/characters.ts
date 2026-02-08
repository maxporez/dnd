// API routes for character sync with Notion
// Characters can be pushed to Notion for backup/viewing and pulled back

import { Router } from 'express';
import { getNotionClient } from '../notion/client';
import { getDatabaseIds } from '../notion/databases';
import {
  notionPageToCharacter,
  characterToNotionProperties,
} from '../notion/mappers';
import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';

export const charactersRouter = Router();

// List all characters from Notion
charactersRouter.get('/', async (_req, res) => {
  try {
    const dbId = getDatabaseIds().characters;
    if (!dbId) return res.status(503).json({ error: 'Characters database not configured' });

    const notion = getNotionClient();
    const pages: PageObjectResponse[] = [];
    let cursor: string | undefined;

    do {
      const response = await notion.databases.query({
        database_id: dbId,
        start_cursor: cursor,
        page_size: 100,
        sorts: [{ property: 'Dernière sync', direction: 'descending' }],
      });

      for (const page of response.results) {
        if ('properties' in page) {
          pages.push(page as PageObjectResponse);
        }
      }

      cursor = response.has_more ? response.next_cursor as string : undefined;
    } while (cursor);

    const characters = pages.map(notionPageToCharacter);
    res.json(characters);
  } catch (error) {
    console.error('Error fetching characters:', error);
    res.status(500).json({ error: 'Failed to fetch characters' });
  }
});

// Push a character to Notion (create or update)
charactersRouter.post('/sync', async (req, res) => {
  try {
    const dbId = getDatabaseIds().characters;
    if (!dbId) return res.status(503).json({ error: 'Characters database not configured' });

    const { character, notionPageId } = req.body;
    const notion = getNotionClient();
    const properties = characterToNotionProperties(character);

    if (notionPageId) {
      // Update existing page
      await notion.pages.update({
        page_id: notionPageId,
        properties: properties as Parameters<typeof notion.pages.update>[0]['properties'],
      });
      res.json({ id: notionPageId, action: 'updated' });
    } else {
      // Create new page
      const page = await notion.pages.create({
        parent: { database_id: dbId },
        properties: properties as Parameters<typeof notion.pages.create>[0]['properties'],
      });
      res.json({ id: page.id, action: 'created' });
    }
  } catch (error) {
    console.error('Error syncing character:', error);
    res.status(500).json({ error: 'Failed to sync character' });
  }
});

// Push a full character JSON as page content (for complete backup)
charactersRouter.post('/backup', async (req, res) => {
  try {
    const dbId = getDatabaseIds().characters;
    if (!dbId) return res.status(503).json({ error: 'Characters database not configured' });

    const { character, characterJson, notionPageId } = req.body;
    const notion = getNotionClient();
    const properties = characterToNotionProperties(character);

    // Split JSON into 2000-char blocks for Notion content
    const jsonStr = typeof characterJson === 'string' ? characterJson : JSON.stringify(characterJson, null, 2);
    const blocks = [];

    // Add a divider and JSON code block
    blocks.push({
      object: 'block' as const,
      type: 'divider' as const,
      divider: {},
    });
    blocks.push({
      object: 'block' as const,
      type: 'heading_3' as const,
      heading_3: {
        rich_text: [{ type: 'text' as const, text: { content: 'Données complètes (JSON)' } }],
      },
    });

    // Split JSON into chunks for code block (2000 char limit per rich_text)
    const chunks = [];
    for (let i = 0; i < jsonStr.length; i += 2000) {
      chunks.push({ type: 'text' as const, text: { content: jsonStr.slice(i, i + 2000) } });
    }

    blocks.push({
      object: 'block' as const,
      type: 'code' as const,
      code: {
        rich_text: chunks,
        language: 'json',
      },
    });

    if (notionPageId) {
      await notion.pages.update({
        page_id: notionPageId,
        properties: properties as Parameters<typeof notion.pages.update>[0]['properties'],
      });
      // Note: updating block children requires deleting existing blocks first
      // For simplicity, we just update properties on existing pages
      res.json({ id: notionPageId, action: 'updated' });
    } else {
      const page = await notion.pages.create({
        parent: { database_id: dbId },
        properties: properties as Parameters<typeof notion.pages.create>[0]['properties'],
        children: blocks as Parameters<typeof notion.pages.create>[0]['children'],
      });
      res.json({ id: page.id, action: 'created' });
    }
  } catch (error) {
    console.error('Error backing up character:', error);
    res.status(500).json({ error: 'Failed to backup character' });
  }
});

// Find a character by app ID
charactersRouter.get('/by-app-id/:appId', async (req, res) => {
  try {
    const dbId = getDatabaseIds().characters;
    if (!dbId) return res.status(503).json({ error: 'Characters database not configured' });

    const notion = getNotionClient();
    const response = await notion.databases.query({
      database_id: dbId,
      filter: {
        property: 'App ID',
        rich_text: { equals: req.params.appId },
      },
    });

    if (response.results.length === 0) {
      return res.status(404).json({ error: 'Character not found' });
    }

    const page = response.results[0] as PageObjectResponse;
    const character = notionPageToCharacter(page);
    res.json(character);
  } catch (error) {
    console.error('Error finding character:', error);
    res.status(500).json({ error: 'Failed to find character' });
  }
});
