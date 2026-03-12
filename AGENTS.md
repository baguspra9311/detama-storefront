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
  - **Performance Placement**: Styles must be at the **Top**, and Scripts must be at the **Bottom** of the HTML fragment.
  - **Mirroring**: Separate `.css` and `.js` files are **mirrors** for version control and IDE support.
  - **Modular Extraction**: For complex pages (e.g., ScaleMarket with Canvas/Nebula), use modular extraction scripts (`scripts/extract-*.js`) to read components from separate source files and generate the final inlined `index.html`.
  - **Synchronization**: The extraction script must maintain this synchronization.
- **Global Scripts**: Global functionalities like anti-debug (Anti-Inspect) and viewport overrides are strictly separated from individual page components. They reside in `pages/globals/head-scripts.html`. This file acts as the single source of truth for the **Scalev Custom Head Script** applied across all landing pages. Individual page extrators should **never** include these global scripts inline.
- **Client Scripts**: Complex logic is compiled via Vite into IIFE bundles. These bundles are mirrored in the pages' HTML for production.
- **Backend API**: Cloudflare Worker handles sensitive logic (payments, sync, database).

## JIT Index
### Package Structure
- Pages (HTML/CSS): `pages/` -> [see pages/AGENTS.md](pages/AGENTS.md)
- Client Scripts (TS/Vite): `scripts/` -> [see scripts/AGENTS.md](scripts/AGENTS.md)
- Data (CDN Mirrors): `data/` -> [see data/AGENTS.md](data/AGENTS.md)
- API Worker (Backend): `api-worker/` -> [see api-worker/AGENTS.md](api-worker/AGENTS.md)

### Quick Find Commands
- Find page HTML: `rg -n "id=" pages/`
- Find client scripts: `rg -n "export" scripts/`
- Find API routes: `rg -n "app\.(get|post)" api-worker/src/`

## Definition of Done
- TypeScript must compile cleanly (`npm run typecheck`).
- Client scripts must build without errors (`npm run build:scripts`).
- HTML/CSS assets must perfectly match the visual requirements of the Scalev live page.
