# Client Scripts (TS/Vite)

## Package Identity
TypeScript logic for complex interactive components (e.g., Checkout, Analytics) built with Vite into standalone IIFE bundles.

## Setup & Run
- Install: `npm install` (at project root)
- Build: `npm run build:scripts`
- Output: `dist/` directory (these are uploaded to `assets.detama.id` CDN)

## Patterns & Conventions
- **No UI Frameworks**: Use Vanilla DOM manipulation.
- **Global Variables**: Scripts often expose APIs globally via IIFE, e.g., `window.DetamaCheckout`.
- **Types**: Use strict TypeScript. Define interfaces for all API payloads and external data structures.
- **DO**: Architect modular code. e.g., `src/checkout/validators.ts`.

## Key Files
- `scripts/build.js` (Multi-entry Vite build configuration)
- `scripts/checkout/CheckoutPage.ts` (Example entry point)

## JIT Index Hints
- Find class/function: `rg -n "export (class|function) \w+" scripts/`
- Find build output: `ls dist/`

## Pre-PR Checks
Execute `npm run build:scripts` and ensure `dist/` contains the correctly compiled `.js` files without errors.
