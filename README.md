# DeTama Storefront

Landing page & headless checkout system untuk produk digital DeTama.id.

## Arsitektur

| Layer          | Tech Stack                   | Folder        |
| -------------- | ---------------------------- | ------------- |
| Landing Pages  | Raw HTML + CSS + Vanilla JS  | `pages/`      |
| Checkout Logic | TypeScript + Vite → IIFE     | `scripts/`    |
| API Backend    | Hono.js + Cloudflare Workers | `api-worker/` |
| Shared Types   | TypeScript                   | `shared/`     |

## Struktur Folder

```
detama-storefront/
├── pages/          # HTML+CSS identik dari halaman eksisting (paste ke Scalev)
├── scripts/        # TypeScript checkout logic (build via Vite → IIFE)
├── api-worker/     # Cloudflare Worker (Hono.js)
├── shared/         # Shared TypeScript types
├── dist/           # Build output (gitignored)
├── vite.config.ts  # Vite bundler config
└── docs/plans/     # PRD & implementation plans
```

## Scripts

| Command                 | Keterangan                      |
| ----------------------- | ------------------------------- |
| `npm run build:scripts` | Build TypeScript → IIFE bundles |
| `npm run build:worker`  | Build Cloudflare Worker         |
| `npm run build`         | Build semua                     |
| `npm run dev:worker`    | Dev server Cloudflare Worker    |
| `npm run typecheck`     | TypeScript type checking        |
| `npm run test`          | Run tests (api-worker)          |

## Workflow

1. Edit file di `pages/` → langsung paste ke Scalev Builder
2. Edit file di `scripts/` → `npm run build:scripts` → upload `dist/` ke `assets.detama.id`
3. Edit file di `api-worker/` → `wrangler deploy`

## Dokumentasi

- [PRD v4.0](docs/plans/2026-03-10-prd-v4-hybrid-architecture.md) — Single source of truth
