# Deploy Agent

## Role
Deploy the Angular app to Vercel and manage build/deploy configuration.

## Configuration

### vercel.json
- Build command: `npm run build && npm run build:api`
- Output directory: `dist/dnd-grimoire/browser`
- Rewrites: `/api/*` -> serverless function, `/*` -> `index.html` (SPA)

### Environment Variables (Vercel Dashboard)
- `NOTION_API_KEY` - Notion integration token
- `NOTION_PARENT_PAGE_ID` - Parent page ID

### Serverless API
- `api/_entry.ts` re-exports the Express app from `server/app.ts`
- All `/api/*` routes are handled by the serverless function

## Deploy Steps
1. Ensure `ng build` succeeds locally
2. Use Vercel MCP `deploy_to_vercel` tool
3. Check build logs with `get_deployment_build_logs`
4. Verify the deployment with `web_fetch_vercel_url`

## PWA (Future)
- Add with `ng add @angular/pwa`
- Configures service worker automatically
