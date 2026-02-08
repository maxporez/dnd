import { Client } from '@notionhq/client';
import dotenv from 'dotenv';

dotenv.config();

let notionClient: Client | null = null;

export function getNotionClient(): Client {
  if (!notionClient) {
    const apiKey = process.env.NOTION_API_KEY;
    if (!apiKey) {
      throw new Error('NOTION_API_KEY is not set in environment variables');
    }
    notionClient = new Client({ auth: apiKey });
  }
  return notionClient;
}

export function getParentPageId(): string {
  const pageId = process.env.NOTION_PARENT_PAGE_ID;
  if (!pageId) {
    throw new Error('NOTION_PARENT_PAGE_ID is not set in environment variables');
  }
  return pageId;
}
