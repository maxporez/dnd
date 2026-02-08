import express from 'express';
import cors from 'cors';
import { gameDataRouter } from './routes/gameData.js';
import { charactersRouter } from './routes/characters.js';
import { syncRouter } from './routes/sync.js';

const app = express();

// CORS - on Vercel, frontend and API share the same origin so CORS
// headers aren't checked by the browser for same-origin requests.
// We keep localhost origins for local dev and allow *.vercel.app for
// preview deployments.
const allowedOrigins: string[] = [
  'http://localhost:5173',
  'http://localhost:4173',
];

if (process.env.VERCEL_URL) {
  allowedOrigins.push(`https://${process.env.VERCEL_URL}`);
}

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (same-origin, server-to-server, curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // Allow any Vercel preview deployment
    if (origin.endsWith('.vercel.app')) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
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

export default app;
