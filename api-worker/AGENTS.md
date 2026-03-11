# API Worker (Cloudflare / Hono.js)

## Package Identity
Cloudflare Worker backend using Hono.js. Handles server-side logic like webhooks, database interactions (Supabase), and secure API endpoints.

## Setup & Run
- Dev Server: `npm run dev:worker` (runs Wrangler dev)
- Deploy: `npm run deploy` (requires Wrangler login/auth)

## Patterns & Conventions
- **Routing**: Minimal route definitions in `src/index.ts` connecting to controller functions.
- **Environment/Secrets**: Do not hardcode secrets. Use Cloudflare `env` bindings defined in `wrangler.toml` (or `.dev.vars` locally).
- **Lightweight**: Avoid heavy Node.js dependencies that aren't compatible with Cloudflare Workers (edge compute).

## Key Files
- `api-worker/src/index.ts` (App entry / Router)
- `api-worker/wrangler.toml` (Cloudflare config & bindings)

## JIT Index Hints
- Find route handler: `rg -n "app\.(get|post|put|delete)" api-worker/src/`
- Find env usage: `rg -n "env\." api-worker/src/`

## Pre-PR Checks
- Ensure `npm run build:worker` completes without TypeScript errors.
