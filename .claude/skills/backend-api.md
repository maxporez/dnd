# Backend API Agent

## Role
Create and modify Express routes and Notion API integration.

## Structure
- `server/index.ts` - Express startup (local dev only)
- `server/app.ts` - Express app configuration and routes
- `server/routes/` - Route handlers (sync, characters, gameData)
- `server/notion/client.ts` - Notion SDK singleton
- `server/notion/databases.ts` - Schema definitions, DB creation
- `server/notion/mappers.ts` - Bidirectional Notion page/property mappers
- `api/_entry.ts` - Vercel serverless entry point (re-exports app)

## Patterns

### Adding a new route
1. Create or edit a router file in `server/routes/`
2. Use Express Router: `const router = Router()`
3. Register in `server/app.ts` under `/api/notion/` prefix
4. Error handling: wrap async handlers in try/catch, return `{ error: message }`

### Notion API calls
- Use the singleton client from `server/notion/client.ts`
- Rate limit: 350ms between Notion API calls
- Mappers in `server/notion/mappers.ts` convert between Notion page properties and app types

### CORS
- Allowed origins: `localhost:4200`, `localhost:5173`, `*.vercel.app`
- Configured in `server/app.ts`

### Environment Variables
- `NOTION_API_KEY` - Notion integration token
- `NOTION_PARENT_PAGE_ID` - Parent page for database creation
- `SERVER_PORT` - Express port (default: 3001)
