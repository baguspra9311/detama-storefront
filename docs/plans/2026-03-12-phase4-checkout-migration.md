# Phase 4: Checkout Migration — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Cleanly extract the HTML, CSS, and JS for the Parent Checkout page from the CDN source. Rename the checkout iframe scripts from `CheckoutPage.ts/.css` to `checkout-child.ts/.css` to fit the parent/child naming convention, and configure Vite to build the child logic.

**Architecture:** We will use a Node.js extraction script (`scripts/extract-checkout.js`) to parse the parent checkout HTML (`CheckoutParent.html` or similar) into independent DOM, style, and logic files (`pages/checkout/`). For the iframe child logic, we rename the existing `CheckoutPage.ts` and `CheckoutPage.css` files to `checkout-child.ts` and `checkout-child.css` to ensure they are paired correctly and named sensibly next to the parent checkout logic.

**Tech Stack:** Node.js (for extraction automation), TS/Vite (for child iframe and parent logic), Vanilla HTML/CSS/JS (for raw UI representation).

---

### Task 1: Create Extraction Script for Checkout Parent

**Files:**
- Create: `scripts/extract-checkout.js`

**Step 1: Write the script**
This will download `CheckoutParent.html` from `https://cdn.detama.id/CheckoutParent.html` (or the actual CDN URL for the parent page), parse the inline `<style>` and `<script>` blocks into corresponding `checkout.css` and `checkout-app.js` files, wrap the JS in an IIFE to avoid global scope pollution, and dump the cleaned raw HTML into `index.html`. 

*(The script code will be implemented utilizing standard Node.js HTTPS and RegEx, identical to how skillforge was extracted).*

**Step 2: Commit**
```bash
git add scripts/extract-checkout.js
git commit -m "chore: add extraction script for checkout parent cdn source"
```

---

### Task 2: Execute Extraction for Checkout Parent

**Files:**
- Generated: `pages/checkout/index.html`
- Generated: `pages/checkout/checkout.css`
- Generated: `pages/checkout/checkout-app.js`

**Step 1: Run Script**
```bash
node scripts/extract-checkout.js
```

**Step 2: Verify & Format**
Verify the extracted HTML to ensure styles and scripts are properly removed from the HTML body and injected into the target files. Confirm `checkout.css` and `checkout-app.js` are populated correctly with the parent's logic.

**Step 3: Commit**
```bash
git add pages/checkout/
git commit -m "feat(checkout): extract clean HTML/CSS/JS components for checkout parent via script"
```

---

### Task 3: Rename and Refactor Checkout Child (Iframe) Files

**Files:**
- Rename: `scripts/checkout/CheckoutPage.ts` -> `scripts/checkout/checkout-child.ts`
- Rename: `scripts/checkout/CheckoutPage.css` -> `scripts/checkout/checkout-child.css`
- Update: `vite.config.ts`

**Step 1: File Renames**
```bash
# Rename the TS payload
git mv scripts/checkout/CheckoutPage.ts scripts/checkout/checkout-child.ts

# Rename the CSS payload
# If CheckoutPage.css exists:
# git mv scripts/checkout/CheckoutPage.css scripts/checkout/checkout-child.css
```
*(If `CheckoutPage.css` doesn't exist yet, simply create an empty `scripts/checkout/checkout-child.css` to act as the mirror for the iframe styles).*

**Step 2: Update Vite Config**
Update `vite.config.ts` so the build cleanly outputs:
- `checkout-parent` (from `scripts/parent/CheckoutParent.ts` or `checkout-parent.ts`)
- `checkout-child` (from `scripts/checkout/checkout-child.ts`)

```typescript
// vite.config.ts snippet
entry: {
  'checkout-child': resolve(__dirname, 'scripts/checkout/checkout-child.ts'),
  'checkout-parent': resolve(__dirname, 'scripts/parent/CheckoutParent.ts'), 
}
```

**Step 3: Update Imports/References**
Search the workspace for any imports referring to `CheckoutPage` and update them to use `checkout-child`. In `docs/plans/2026-03-10-prd-v4-hybrid-architecture.md`, we also update references from `checkout-page.js` to `checkout-child.js` and `checkout-page.css` to `checkout-child.css`.

**Step 4: Commit**
```bash
git add scripts/checkout/ vite.config.ts
git commit -m "refactor(checkout): rename CheckoutPage scripts and CSS to checkout-child"
```

---

### Task 4: Deployment Definition

**Files:**
- Create: `pages/checkout/DEPLOY-v4.md`

**Step 1: Write Deployment Guide**
Detailed instructions on pushing assets to production and updating Scalev Builder configurations.
Specifically:
- Parent JS/CSS goes to `assets.detama.id/checkout.css` and `assets.detama.id/checkout-app.js`
- Child JS/CSS goes to `assets.detama.id/checkout-child.js` and `assets.detama.id/checkout-child.css`
- Scalev Custom Head Script configuration for the Parent (`detama.id/checkout`).
- Scalev Custom Head Script configuration for the Child/Iframe (`kelasnyatama.com/checkout`).

**Step 2: Commit**
```bash
git add pages/checkout/DEPLOY-v4.md
git commit -m "docs(checkout): deployment instructions for hybrid parent/child architecture"
```

---

## Verification Plan

### Automated
- Execute the Node script and verify extraction using Node.js filesystem assertions. Check output file sizes via shell commands.
- Run `npm run typecheck` and `npm run build` to verify the Vite config correctly bundles `checkout-child.js` and `checkout-parent.js` alongside any styles output.

### Manual
The ultimate verification involves the user physically pasting the snippets into the Scalev Builder and confirming:
1. The parent checkout page loads cleanly without FOUC, and correctly renders the cart summary.
2. The child iframe correctly loads `checkout-child.ts` and `checkout-child.css`.
3. The postMessage protocol communicates flawlessly between parent and child.
