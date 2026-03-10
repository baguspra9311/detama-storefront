# Phase 1: Setup Struktur Baru — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Restrukturisasi project dari Astro monorepo ke hybrid architecture (raw HTML+CSS + TypeScript/Vite), dengan mempertahankan `api-worker/` dan `shared/` yang sudah ada.

**Architecture:** Hapus folder `frontend/` (Astro), buat folder `pages/` (raw HTML) dan `scripts/` (TypeScript). Setup Vite sebagai bundler TypeScript saja (bukan framework). Root `package.json` diperbarui untuk menghapus workspace `frontend` dan menambahkan scripts baru.

**Tech Stack:** Vite 6, TypeScript 5.7, Vanilla HTML/CSS/JS

---

## Pra-kondisi

- Git working directory harus bersih (commit atau stash pending changes)
- PRD v4.0 sudah ditulis di `docs/plans/2026-03-10-prd-v4-hybrid-architecture.md`

---

### Task 1: Commit Current State

**Tujuan:** Pastikan semua perubahan saat ini sudah di-commit sebelum melakukan restrukturisasi besar.

**Step 1: Check git status**

```powershell
cd C:\Users\Bagus Pratama\OneDrive\Documents\detama-storefront
git status
```

Expected: Lihat apakah ada untracked/modified files.

**Step 2: Commit semua perubahan yang ada**

```powershell
git add -A
git commit -m "chore: save current state before phase 1 restructuring"
```

---

### Task 2: Hapus PRD Lama

**Files:**

- Delete: `docs/plans/2026-03-07-checkout-migration-design.md`

**Step 1: Hapus file PRD v3.1**

```powershell
Remove-Item "docs/plans/2026-03-07-checkout-migration-design.md" -Force
```

**Step 2: Commit**

```powershell
git add -A
git commit -m "chore: remove deprecated PRD v3.1 (replaced by v4.0)"
```

---

### Task 3: Buat Folder Structure Baru

**Tujuan:** Buat folder `pages/` dan `scripts/` dengan placeholder files.

**Files:**

- Create: `pages/skillforge/.gitkeep`
- Create: `pages/scalemarket/.gitkeep`
- Create: `pages/checkout/.gitkeep`
- Create: `scripts/checkout/.gitkeep`
- Create: `scripts/parent/.gitkeep`
- Create: `scripts/shared/.gitkeep`

**Step 1: Buat semua direktori**

```powershell
# Pages directories
New-Item -ItemType Directory -Path "pages/skillforge" -Force
New-Item -ItemType Directory -Path "pages/scalemarket" -Force
New-Item -ItemType Directory -Path "pages/checkout" -Force

# Scripts directories
New-Item -ItemType Directory -Path "scripts/checkout/scrapers" -Force
New-Item -ItemType Directory -Path "scripts/checkout/actions" -Force
New-Item -ItemType Directory -Path "scripts/checkout/validators" -Force
New-Item -ItemType Directory -Path "scripts/checkout/bridge" -Force
New-Item -ItemType Directory -Path "scripts/parent/bridge" -Force
New-Item -ItemType Directory -Path "scripts/parent/managers" -Force
New-Item -ItemType Directory -Path "scripts/parent/ui" -Force
New-Item -ItemType Directory -Path "scripts/shared" -Force
```

**Step 2: Buat .gitkeep untuk direktori kosong**

```powershell
# Hanya perlu .gitkeep di leaf directories yang masih kosong
@("pages/skillforge", "pages/scalemarket", "pages/checkout") | ForEach-Object { New-Item -ItemType File -Path "$_/.gitkeep" -Force }
```

**Step 3: Commit**

```powershell
git add -A
git commit -m "chore: create pages/ and scripts/ folder structure (PRD v4.0)"
```

---

### Task 4: Setup tsconfig.json di Root

**Tujuan:** Buat tsconfig root yang dipakai oleh Vite untuk build `scripts/`.

**Files:**

- Modify: `tsconfig.base.json` (tetap sebagai base)
- Create: `tsconfig.json` (di root, extends base, target scripts/)

**Step 1: Buat `tsconfig.json` di root**

```json
{
  "extends": "./tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": ".",
    "baseUrl": ".",
    "paths": {
      "@shared/*": ["shared/types/*"],
      "@scripts/*": ["scripts/*"]
    }
  },
  "include": ["scripts/**/*.ts", "shared/**/*.ts"],
  "exclude": ["node_modules", "dist", "api-worker", "frontend"]
}
```

**Step 2: Commit**

```powershell
git add tsconfig.json
git commit -m "chore: add root tsconfig.json for scripts/ TypeScript build"
```

---

### Task 5: Setup vite.config.ts di Root

**Tujuan:** Konfigurasi Vite untuk build TypeScript scripts ke IIFE bundles.

**Files:**

- Create: `vite.config.ts`

**Step 1: Buat `vite.config.ts`**

```typescript
import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    lib: {
      entry: {
        "checkout-page": resolve(__dirname, "scripts/checkout/CheckoutPage.ts"),
        "checkout-parent": resolve(
          __dirname,
          "scripts/parent/CheckoutParent.ts",
        ),
      },
      formats: ["iife"],
      name: "DetamaCheckout",
    },
    outDir: "dist",
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
        entryFileNames: "[name].js",
      },
    },
    cssCodeSplit: false,
    minify: "esbuild",
  },
});
```

> **Catatan:** Entry points ini belum ada (akan dibuat di Phase 4). Vite config dibuat dulu agar infrastructure siap.

**Step 2: Commit**

```powershell
git add vite.config.ts
git commit -m "chore: add root vite.config.ts for IIFE bundle builds"
```

---

### Task 6: Update Root package.json

**Tujuan:** Hapus workspace `frontend`, tambahkan Vite sebagai devDependency, dan update scripts.

**Files:**

- Modify: `package.json` (root)

**Step 1: Update `package.json`**

```json
{
  "name": "detama-storefront",
  "version": "2.0.0",
  "private": true,
  "type": "module",
  "description": "DeTama Landing Page & Headless Checkout System — Hybrid Architecture",
  "workspaces": ["api-worker", "shared"],
  "scripts": {
    "dev:worker": "npm run dev --workspace=api-worker",
    "build:scripts": "vite build",
    "build:worker": "npm run build --workspace=api-worker",
    "build": "npm run build:scripts && npm run build:worker",
    "typecheck": "tsc --noEmit",
    "test": "npm run test --workspace=api-worker"
  },
  "devDependencies": {
    "vite": "^6.0.0",
    "typescript": "^5.7.0",
    "@types/node": "^22.0.0"
  },
  "engines": {
    "node": ">=20.0.0"
  }
}
```

> **Perubahan penting:**
>
> - `version` → `2.0.0` (major version bump karena restrukturisasi)
> - `type: "module"` ditambahkan
> - workspace `frontend` dihapus
> - scripts `dev:frontend`, `build:frontend` dihapus
> - scripts `build:scripts` ditambahkan (Vite build)
> - `typecheck` sekarang pakai `tsc --noEmit` langsung
> - `vite` + `typescript` sebagai root devDependencies

**Step 2: Commit (jangan install dulu)**

```powershell
git add package.json
git commit -m "chore: update root package.json for hybrid architecture (v2.0.0)"
```

---

### Task 7: Update .gitignore

**Tujuan:** Hapus entry Astro-specific, tambahkan entry untuk struktur baru.

**Files:**

- Modify: `.gitignore`

**Step 1: Replace `.gitignore` content**

```gitignore
# Dependencies
node_modules/

# Build outputs
dist/
api-worker/dist/
*.tsbuildinfo

# Environment files
.env
.env.*
!.env.example
.dev.vars
!.dev.vars.example

# Editor
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Wrangler runtime cache
.wrangler/

# Logs
*.log
npm-debug.log*
```

> **Perubahan:** Hapus semua referensi Astro (`frontend/.astro/`, `frontend/dist/`, `frontend/public/js/`). Tambahkan `dist/` di root untuk output Vite build.

**Step 2: Commit**

```powershell
git add .gitignore
git commit -m "chore: update .gitignore for hybrid architecture"
```

---

### Task 8: Hapus Folder frontend/

> **⚠️ IRREVERSIBLE — Pastikan sudah commit di Task 1**

**Tujuan:** Hapus seluruh folder `frontend/` termasuk Astro config, src, public, dist, node_modules, dan semua file terkait.

**Files:**

- Delete: `frontend/` (entire directory)

**Step 1: Hapus folder frontend**

```powershell
Remove-Item -Recurse -Force "frontend"
```

**Step 2: Commit**

```powershell
git add -A
git commit -m "chore: remove frontend/ (Astro) — replaced by pages/ + scripts/"
```

---

### Task 9: Install Dependencies & Verify

**Tujuan:** Install fresh dependencies dan pastikan project dalam keadaan bersih.

**Step 1: Hapus node_modules dan package-lock di root**

```powershell
Remove-Item -Recurse -Force "node_modules"
Remove-Item -Force "package-lock.json"
```

**Step 2: Install ulang**

```powershell
npm install
```

Expected: Install berhasil tanpa error. Hanya workspace `api-worker` dan `shared` yang ter-resolve.

**Step 3: Verify TypeScript**

```powershell
npx tsc --noEmit
```

Expected: Mungkin ada error karena entry points belum ada — ini OK, akan dibuat di Phase 4.

**Step 4: Commit lock file**

```powershell
git add package-lock.json
git commit -m "chore: regenerate package-lock.json after restructuring"
```

---

### Task 10: Update README.md

**Tujuan:** Update dokumentasi project untuk mencerminkan arsitektur baru.

**Files:**

- Modify: `README.md`

**Step 1: Replace README.md content**

```markdown
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

\`\`\`
detama-storefront/
├── pages/ # HTML+CSS identik dari halaman eksisting (paste ke Scalev)
├── scripts/ # TypeScript checkout logic (build via Vite → IIFE)
├── api-worker/ # Cloudflare Worker (Hono.js)
├── shared/ # Shared TypeScript types
├── dist/ # Build output (gitignored)
├── vite.config.ts # Vite bundler config
└── docs/plans/ # PRD & implementation plans
\`\`\`

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
```

**Step 2: Commit**

```powershell
git add README.md
git commit -m "docs: update README for hybrid architecture v4.0"
```

---

### Task 11: Final Verification

**Step 1: Verify folder structure**

```powershell
Get-ChildItem -Directory -Recurse | Where-Object { $_.FullName -notmatch 'node_modules|\.git|\.wrangler' } | Select-Object FullName
```

Expected output harus menunjukkan:

- `pages/skillforge/`
- `pages/scalemarket/`
- `pages/checkout/`
- `scripts/checkout/`, `scripts/parent/`, `scripts/shared/`
- `api-worker/`
- `shared/`
- `docs/plans/`

**Step 2: Verify git log**

```powershell
git log --oneline -10
```

Expected: 8-9 commits bersih dari Task 1 sampai Task 10.

**Step 3: Verify no frontend/ remnants**

```powershell
Test-Path "frontend"
```

Expected: `False`

---

## Checklist Ringkas

| #   | Task                       | Risk                           |
| --- | -------------------------- | ------------------------------ |
| 1   | Commit current state       | Low                            |
| 2   | Hapus PRD v3.1             | Low                            |
| 3   | Buat folder structure baru | Low                            |
| 4   | Setup tsconfig.json root   | Low                            |
| 5   | Setup vite.config.ts root  | Low                            |
| 6   | Update root package.json   | Medium — workspace change      |
| 7   | Update .gitignore          | Low                            |
| 8   | Hapus folder frontend/     | **High** — irreversible        |
| 9   | Install & verify           | Medium — dependency resolution |
| 10  | Update README.md           | Low                            |
| 11  | Final verification         | Low                            |
