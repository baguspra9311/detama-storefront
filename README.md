# DeTama Storefront — Monorepo

> Landing Pages, Headless Checkout, and Utility Microservice for Scalev-powered stores.

## Architecture

| Workspace     | Stack                         | Purpose                                         |
| ------------- | ----------------------------- | ----------------------------------------------- |
| `frontend/`   | Astro + TypeScript + Tailwind | SSG → HTML fragments & CDN assets               |
| `api-worker/` | Hono.js + Cloudflare Workers  | Validation APIs, webhooks, purchase feed        |
| `shared/`     | TypeScript                    | Shared type definitions (postMessage protocols) |

## Quick Start

```bash
# Install all workspace dependencies
npm install

# Start the Astro dev server
npm run dev:frontend

# Start the Cloudflare Worker dev server
npm run dev:worker

# Build everything
npm run build

# Type-check all workspaces
npm run typecheck
```

## Project Structure

```
detama-storefront/
├── frontend/          → Astro SSG (landing pages + checkout)
├── api-worker/        → Cloudflare Worker (Hono.js API)
├── shared/            → Shared TypeScript types
├── package.json       → npm workspaces root
└── tsconfig.base.json → Shared strict TS config
```

## API Routes

| Route                   | Method | Purpose                         |
| ----------------------- | ------ | ------------------------------- |
| `/health`               | GET    | Health check                    |
| `/webhook/purchase`     | POST   | Scalev purchase webhook         |
| `/api/latest-purchases` | GET    | Last 5 purchases (social proof) |
| `/api/validate/email`   | POST   | Email format validation         |
| `/api/validate/wa`      | POST   | WhatsApp number validation      |

## Environment Variables (API Worker)

Set via `wrangler secret put`:

| Variable          | Description                           |
| ----------------- | ------------------------------------- |
| `WEBHOOK_SECRET`  | Shared secret for Scalev webhook auth |
| `WA_API_KEY`      | WhatsApp Gateway API key              |
| `WA_API_ENDPOINT` | WhatsApp Gateway base URL             |

## License

Private — All rights reserved.
