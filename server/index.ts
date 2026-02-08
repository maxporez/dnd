import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { gameDataRouter } from './routes/gameData';
import { charactersRouter } from './routes/characters';
import { syncRouter } from './routes/sync';

dotenv.config();

const app = express();
const port = process.env.SERVER_PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:4173'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/notion/game', gameDataRouter);
app.use('/api/notion/characters', charactersRouter);
app.use('/api/notion/sync', syncRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    notion: !!process.env.NOTION_API_KEY,
    parentPage: !!process.env.NOTION_PARENT_PAGE_ID,
  });
});

app.listen(port, () => {
  console.log(`D&D Grimoire API server running on http://localhost:${port}`);
  console.log(`Notion API key: ${process.env.NOTION_API_KEY ? 'configured' : 'NOT SET'}`);
  console.log(`Parent page ID: ${process.env.NOTION_PARENT_PAGE_ID ? 'configured' : 'NOT SET'}`);
});
