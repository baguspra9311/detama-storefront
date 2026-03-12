# Client Scripts (TS/Vite)

## Package Identity
TypeScript logic for complex interactive components (e.g., Checkout, Analytics) built with Vite into standalone IIFE bundles.

## Setup & Run
- Install: `npm install` (at project root)
- Build: `npm run build:scripts`
- Output: `dist/` directory (these are uploaded to `assets.detama.id` CDN)

## Patterns & Conventions
- **Interactivity logic**: Built with TypeScript + Vite into IIFE bundles.
- **Extraction logic**: Node.js scripts (`extract-*.js`) used to assembling HTML fragments from modular sources.
- **Types**: Use strict TypeScript. Define interfaces for all API payloads and external data structures.
- **DO**: Architect modular code. e.g., `src/checkout/validators.ts`.

## Key Files
- `scripts/build.js` (Multi-entry Vite build configuration)
- `scripts/extract-skillforge.js` (SkillForge assembly)
- `scripts/extract-scalemarket.js` (ScaleMarket assembly)

## JIT Index Hints
- Find class/function: `rg -n "export (class|function) \w+" scripts/`
- Find build output: `ls dist/`

## Pre-PR Checks
Execute `npm run build:scripts` and ensure `dist/` contains the correctly compiled `.js` files without errors.
