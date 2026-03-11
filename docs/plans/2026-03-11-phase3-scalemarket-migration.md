# ScaleMarket Migration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Migrate ScaleMarket landing page to a fully self-contained local structure (Inline CSS/JS) based on the SkillForge "Gold Standard" to ensure PageSpeed 100 and zero FOUC.

**Architecture:** We will use a dedicated Node.js extraction script to download the heavy assets (CSS/JS) from the CDN and inline them into a single `index.html`. Following the performance standard, CSS goes to the top and JS (including canvas/animation logic) goes to the bottom.

**Tech Stack:** Node.js (fs, path, https), Vanilla HTML/CSS/JS.

---

### Task 1: Setup Workspace

**Files:**
- Create: `pages/scalemarket/index.html`
- Create: `pages/scalemarket/scalemarket.css` (Mirror)
- Create: `pages/scalemarket/scalemarket-app.js` (Mirror)

**Step 1: Create directory**
Run: `mkdir pages/scalemarket`

**Step 2: Initialize index.html**
Paste the raw HTML structure provided by the user into `pages/scalemarket/index.html`.

**Step 3: Commit**
`git add pages/scalemarket && git commit -m "chore: setup scalemarket workspace"`

---

### Task 2: Extraction Script

**Files:**
- Create: `scripts/extract-scalemarket.js`

**Step 1: Write the script**
Create a script that:
1. Downloads `https://cdn.detama.id/ScaleMarket.css`
2. Downloads `https://cdn.detama.id/ScaleMarket.js`
3. Reads the provided inline styles and HTML.
4. Merges everything into a single `index.html`.
5. Ensures `<style>` is at top and `<script>` is at bottom.
6. Synchronizes content to mirror files.

**Step 2: Run the script**
Run: `node scripts/extract-scalemarket.js`

**Step 3: Commit**
`git add scripts/extract-scalemarket.js pages/scalemarket/ && git commit -m "feat: implement scalemarket asset extraction"`

---

### Task 3: Verification

**Files:**
- Verify: `pages/scalemarket/index.html`

**Step 1: Check structure**
Verify that the `index.html` does NOT have external CDN links for ScaleMarket assets and that fonts are not duplicated.

**Step 2: Visual & Animation Test**
(Manual step for user): Verify Canvas Plexus and Nebula animations in local preview or Scalev Builder.

**Step 3: Commit**
`git commit --allow-empty -m "vibe: scalemarket migration verified"`
