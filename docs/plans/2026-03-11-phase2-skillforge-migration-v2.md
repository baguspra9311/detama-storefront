# Phase 2: SkillForge Migration (v2) — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Cleanly extract the HTML, CSS, and JS for the SkillForge landing page directly from the CDN source, separate global anti-debug scripts, and provide deployment guidelines. 

**Architecture:** Use a Node.js automation script (`scripts/extract-skillforge.js`) to parse `https://cdn.detama.id/SkillForgeHomepage.html` into independent DOM, style, and logic files within `pages/skillforge/`. The requested anti-debug and viewport meta scripts will be stored as an isolated reusable snippet in `pages/globals/head-scripts.html`.

**Tech Stack:** Node.js (for extraction automation), Vanity HTML/CSS/JS.

---

### Task 1: Create Global Head Scripts

**Files:**
- Create: `pages/globals/head-scripts.html`

**Step 1: Write the global scripts file**
This handles the required anti-debug and viewport logic, completely isolated from page-specific code so it can be reused.

```html
<!-- Viewport Override -->
<script>!function(){var e=document.querySelector("meta[name=viewport]");e&&e.remove();var a=document.createElement("meta");a.name="viewport",a.content="width=device-width, initial-scale=1.0, maximum-scale=2, user-scalable=yes",document.head.appendChild(a)}();</script>

<!-- Security / Anti-Debug -->
<script>
    document.addEventListener('contextmenu', event => event.preventDefault());
    document.onkeydown = function (e) {
        if(e.keyCode == 123) { // F12
             return false; 
        } 
        if(e.ctrlKey && e.shiftKey && e.keyCode == 'I'.charCodeAt(0)){ // Ctrl+Shift+I
             return false; 
        } 
        if(e.ctrlKey && e.shiftKey && e.keyCode == 'C'.charCodeAt(0)){ // Ctrl+Shift+C
             return false; 
        } 
        if(e.ctrlKey && e.shiftKey && e.keyCode == 'J'.charCodeAt(0)){ // Ctrl+Shift+J
             return false; 
        } 
        if(e.ctrlKey && e.keyCode == 'U'.charCodeAt(0)){ // Ctrl+U
             return false; 
        }
    };
</script>
```

**Step 2: Commit**
```bash
git add pages/globals/head-scripts.html
git commit -m "feat: add reusable global head scripts for scalev"
```

---

### Task 2: Create Source Extraction Script

**Files:**
- Create: `scripts/extract-skillforge.js`

**Step 1: Write the script**
This will download the `SkillForgeHomepage.html` from the provided CDN URL, regex-parse the `<style>` and `<script>` blocks into corresponding CSS/JS files, wrap the JS in an IIFE to pollute the global scope, and dump the cleaned raw HTML into `index.html`. 

*(The script code will be implemented executing standard Node.js HTTPS and RegEx)*

**Step 2: Commit**
```bash
git add scripts/extract-skillforge.js
git commit -m "chore: add extraction script for skillforge cdn source"
```

---

### Task 3: Execute Extraction

**Files:**
- Generated: `pages/skillforge/index.html`
- Generated: `pages/skillforge/skillforge.css`
- Generated: `pages/skillforge/skillforge-app.js`

**Step 1: Run Script**
```bash
node scripts/extract-skillforge.js
```

**Step 2: Verify & Format**
Optionally format the extracted HTML to verify closing tags. Confirm JavaScript is functional and CSS is complete.

**Step 3: Commit**
```bash
git add pages/skillforge/
git commit -m "feat(skillforge): extract clean HTML/CSS/JS components via script"
```

---

### Task 4: Deployment Definition

**Files:**
- Create: `pages/skillforge/DEPLOY-v2.md`

**Step 1: Write Deployment Guide**
Detailed instructions on pushing assets to production and updating Scalev Builder configurations (combining the global scripts code and the external asset loaders). Target URL to verify: `https://detama.id/skillforge2`.

**Step 2: Commit**
```bash
git add pages/skillforge/DEPLOY-v2.md
git commit -m "docs(skillforge): deployment instructions including global scripts"
```

---

## Verification Plan

### Automated
Execute the Node script and verify extraction using Node.js filesystem assertions. Check output file sizes via shell commands (`Get-ChildItem`).

### Manual
The ultimate verification involves the user physically pasting the snippets into the Scalev Builder at the `skillforge2` slug and confirming:
1. No F12/Right-click access (working anti-debug).
2. Page displays exactly as original.
3. Cart & Interactive components function completely independently.
