# Pages (HTML/CSS Frontend)

## Package Identity
Raw HTML, CSS, and vanilla JS assets designed to be copy-pasted directly into Scalev Builder components.

## Setup & Run
There is no local dev server for pages. We fetch source HTML from production CDN or live pages, extract it locally for version control, and deploy back to Scalev by copy-pasting.

## Patterns & Conventions
- **DO NOT Use UI Frameworks**: No React, Vue, Svelte, or Astro. Use pure HTML/CSS.
- **Full Inline & Mirroring Pattern**: 
  - Scalev pages must be **fully self-contained** in `index.html` (Inline CSS + JS).
  - We maintain separate `[page].css` and `[page]-app.js` as **mirrors**.
  - This allows for proper syntax highlighting and version control while keeping production performance at 99%.
- **Global Scripts**: Scripts used across multiple pages should be isolated in `pages/globals/`.

## Key Files
- `pages/globals/head-scripts.html` (Global viewport & anti-debug)
- `pages/skillforge/index.html` (Example page body)
- `pages/skillforge/skillforge.css` (Example page styles)

## JIT Index Hints
- Find specific CSS class: `rg -n "\.className" pages/`
- Find inline script: `rg -n "<script" pages/`

## Pre-PR Checks
- Ensure HTML layout contains no `<html>`, `<head>`, or `<body>` wrappers (must be a fragment ready for Scalev).
