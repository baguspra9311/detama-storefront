# DeTama Storefront

## Project Snapshot
Hybrid architecture for Scalev landing pages. Combines raw HTML/CSS for the visual frontend with TypeScript/Vite for client-side interactive logic and a Cloudflare Worker for backend APIs.

## Root Setup Commands
- Install: `npm install`
- Run Worker: `npm run dev:worker`
- Typecheck: `npm run typecheck`
- Build Scripts & Worker: `npm run build`

## Universal Conventions
- **No JS Frameworks for UI**: Landing pages must use pure HTML and CSS (no React/Vue/Astro).
- **Full Inline Standard**: Scalev landing pages must use **Inline CSS & JS** in the final HTML component to guarantee 99+ PageSpeed scores and zero FOUC.
- **Full Inline Standard**: Scalev pages must be **fully self-contained (Inline CSS + JS)** in the `index.html`.
  - The separate `.css` and `.js` files in the directory are **mirrors** for version control and IDE support.
  - The extraction script must maintain this synchronization.
- **Global Scripts**: Scripts used across multiple pages (e.g., anti-debug, viewport overrides) should be isolated in `pages/globals/` to be deployed to Scalev's Custom Head Script.roduction.
- **Client Scripts**: Complex logic is compiled via Vite into IIFE bundles. These bundles are mirrored in the pages' HTML for production.
- **Backend API**: Cloudflare Worker handles sensitive logic (payments, sync, database).

## JIT Index
### Package Structure
- Pages (HTML/CSS): `pages/` -> [see pages/AGENTS.md](pages/AGENTS.md)
- Client Scripts (TS/Vite): `scripts/` -> [see scripts/AGENTS.md](scripts/AGENTS.md)
- API Worker (Backend): `api-worker/` -> [see api-worker/AGENTS.md](api-worker/AGENTS.md)

### Quick Find Commands
- Find page HTML: `rg -n "id=" pages/`
- Find client scripts: `rg -n "export" scripts/`
- Find API routes: `rg -n "app\.(get|post)" api-worker/src/`

## Definition of Done
- TypeScript must compile cleanly (`npm run typecheck`).
- Client scripts must build without errors (`npm run build:scripts`).
- HTML/CSS assets must perfectly match the visual requirements of the Scalev live page.
