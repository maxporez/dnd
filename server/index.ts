import dotenv from 'dotenv';
dotenv.config();

import app from './app';

const port = process.env.SERVER_PORT || 3001;

app.listen(port, () => {
  console.log(`D&D Grimoire API server running on http://localhost:${port}`);
  console.log(`Notion API key: ${process.env.NOTION_API_KEY ? 'configured' : 'NOT SET'}`);
  console.log(`Parent page ID: ${process.env.NOTION_PARENT_PAGE_ID ? 'configured' : 'NOT SET'}`);
});
