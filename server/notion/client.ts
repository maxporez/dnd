import { Client } from '@notionhq/client';
import dotenv from 'dotenv';

dotenv.config();

let notionClient: Client | null = null;
let currentApiKey: string | null = null;
let currentParentPageId: string | null = null;

export function getNotionClient(): Client {
  if (!notionClient) {
    const apiKey = currentApiKey || process.env.NOTION_API_KEY;
    if (!apiKey) {
      throw new Error('NOTION_API_KEY is not set. Please connect with your API key.');
    }
    notionClient = new Client({ auth: apiKey });
  }
  return notionClient;
}

export function getParentPageId(): string {
  const pageId = currentParentPageId || process.env.NOTION_PARENT_PAGE_ID;
  if (!pageId) {
    throw new Error('NOTION_PARENT_PAGE_ID is not set. Please connect with your Page ID.');
  }
  return pageId;
}

export function setCredentials(apiKey: string, parentPageId: string): void {
  currentApiKey = apiKey;
  currentParentPageId = parentPageId;
  // Reset client so it gets recreated with new key
  notionClient = null;
}

export function hasCredentials(): boolean {
  return !!(currentApiKey || process.env.NOTION_API_KEY);
}

export function clearCredentials(): void {
  currentApiKey = null;
  currentParentPageId = null;
  notionClient = null;
}
