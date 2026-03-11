# Pages (HTML/CSS Frontend)

## Package Identity
Raw HTML, CSS, and vanilla JS assets designed to be copy-pasted directly into Scalev Builder components.

## Setup & Run
There is no local dev server for pages. We fetch source HTML from production CDN or live pages, extract it locally for version control, and deploy back to Scalev by copy-pasting.

## Patterns & Conventions
- **DO NOT Use UI Frameworks**: No React, Vue, Svelte, or Astro. Use pure HTML/CSS.
- **Full Inline Standard**: Scalev landing pages must use **Inline CSS & JS** in the final HTML component to guarantee 99+ PageSpeed scores and zero FOUC.
  - **Performance Placement**: Styles must be at the **Top**, and Scripts must be at the **Bottom** of the HTML fragment.
  - **Modular Extraction**: Recommended for pages with complex animations or logic (e.g., ScaleMarket). Use separate source components (`.html`, `.css`, `.js`) and a script to compile them into the final `index.html`.
  - The separate `.css` and `.js` files in the directory are **mirrors** for version control and IDE support.
- **Global Scripts**: Scripts used across multiple pages should be isolated in `pages/globals/`.

## Key Files
- `pages/globals/head-scripts.html` (Global viewport & anti-debug)
- `pages/skillforge/index.html` (Example page body)
- `pages/scalemarket/index.html` (Complex page with canvas/animations)
- `pages/scalemarket/DEPLOY.md` (Standard deployment guide)

## JIT Index Hints
- Find specific CSS class: `rg -n "\.className" pages/`
- Find inline script: `rg -n "<script" pages/`

## Pre-PR Checks
- Ensure HTML layout contains no `<html>`, `<head>`, or `<body>` wrappers (must be a fragment ready for Scalev).
