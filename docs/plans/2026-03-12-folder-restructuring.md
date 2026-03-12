# Folder & Codebase Restructuring Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rapikan struktur folder dan codebase sebelum Phase 4 (Checkout), standarisasi folder page, hapus file sisa development.

**Architecture:** Cleanup-only — tidak ada perubahan fungsional. Hapus file sementara, rename untuk konsistensi, pindah `product.json` ke `data/`, update extraction scripts, update semua AGENTS.md.

**Tech Stack:** Git (file operations), Node.js (extraction scripts)

---

### Task 1: Hapus Global Head Scripts dari ScaleMarket index.html

**Files:**
- Modify: `pages/scalemarket/index.html`

**Step 1: Hapus blok global scripts (baris 5-28)**

Hapus semua kode antara comment `<!-- Viewport Override -->` sampai closing `</script>` anti-debug. Baris pertama setelah comment section 1 harus langsung `<style>`.

**Step 2: Verifikasi**

Run: `head -35 pages/scalemarket/index.html`
Expected: Baris pertama setelah comment section langsung `<style>`, tidak ada `<script>` viewport/anti-debug.

**Step 3: Commit**

```bash
git add pages/scalemarket/index.html
git commit -m "fix(scalemarket): remove global head scripts from index.html"
```

---

### Task 2: Update extract-scalemarket.js

**Files:**
- Modify: `scripts/extract-scalemarket.js`

**Step 1: Hapus injection global head scripts**

Hapus `HEAD_SCRIPTS_FILE` constant dan `fs.readFileSync(HEAD_SCRIPTS_FILE)`. Update template literal agar tidak menyisipkan `globalHeadScripts`. Section 1 comment menjadi `Inline CSS` saja (tanpa `& Globals`).

**Step 2: Verifikasi**

Run: `node scripts/extract-scalemarket.js`
Expected: `[+] Generated optimized index.html` — output tanpa global scripts.

**Step 3: Commit**

```bash
git add scripts/extract-scalemarket.js pages/scalemarket/index.html
git commit -m "refactor(scripts): remove global head scripts injection from extract-scalemarket"
```

---

### Task 3: Cleanup pages/scalemarket/ — Hapus File Sisa

**Files:**
- Delete: `pages/scalemarket/cdn.html`
- Delete: `pages/scalemarket/ScaleMarket.js`
- Rename: `pages/scalemarket/template-full-body.html` → `pages/scalemarket/scalemarket.html`

**Step 1: Hapus file duplikat**

```bash
git rm pages/scalemarket/cdn.html
git rm pages/scalemarket/ScaleMarket.js
```

**Step 2: Rename template ke nama standar**

```bash
git mv pages/scalemarket/template-full-body.html pages/scalemarket/scalemarket.html
```

**Step 3: Update extract-scalemarket.js path**

Ganti referensi `template-full-body.html` menjadi `scalemarket.html` di extraction script.

**Step 4: Verifikasi**

```bash
ls pages/scalemarket/
```
Expected: `.gitkeep`, `DEPLOY.md`, `index.html`, `scalemarket-app.js`, `scalemarket.css`, `scalemarket.html`

**Step 5: Commit**

```bash
git add -A
git commit -m "refactor(scalemarket): standardize folder structure to match skillforge"
```

---

### Task 4: Pindah product.json ke data/

**Files:**
- Move: `pages/scalemarket/product.json` → `data/products.json`
- Create: `data/AGENTS.md`

**Step 1: Buat folder dan pindah file**

```bash
mkdir data
git mv pages/scalemarket/product.json data/products.json
```

**Step 2: Buat data/AGENTS.md**

```markdown
# Data (Static Assets Mirror)

## Package Identity
Mirror/backup dari data statis yang di-host di CDN (`cdn.scalev.id`). Dipakai sebagai referensi development dan version control.

## Patterns & Conventions
- **CDN-First**: Data produk di-serve dari CDN saat runtime, file di sini hanya mirror.
- **Future Migration**: Di Phase 5, data akan migrasi ke Cloudflare D1/KV via API Worker.

## Key Files
- `products.json` — Data produk (mirror dari `cdn.scalev.id`)
```

**Step 3: Commit**

```bash
git add -A
git commit -m "refactor: move product.json to data/ folder as CDN mirror"
```

---

### Task 5: Cleanup File Debug di Root

**Files:**
- Delete: `debug_compare.js`
- Delete: `debug_compare.mjs`
- Delete: `deep_compare.mjs`
- Delete: `original_cdn.html`
- Delete: `original_full.html`

**Step 1: Hapus semua file debug**

```bash
git rm debug_compare.js debug_compare.mjs deep_compare.mjs original_cdn.html original_full.html
```

**Step 2: Commit**

```bash
git commit -m "chore: remove debug and backup files from root"
```

---

### Task 6: Cleanup File Sisa di scripts/

**Files:**
- Delete: `scripts/parse-cdn.cjs`
- Delete: `scripts/scalemarket-body.html`
- Delete: `scripts/scalemarket-critical.css`

**Step 1: Hapus file sementara**

```bash
git rm scripts/parse-cdn.cjs scripts/scalemarket-body.html scripts/scalemarket-critical.css
```

**Step 2: Update extract-scalemarket.js**

Hapus referensi ke `scalemarket-critical.css` jika masih ada di script. CSS source sekarang langsung dari `pages/scalemarket/scalemarket.css`.

**Step 3: Verifikasi extraction masih jalan**

Run: `node scripts/extract-scalemarket.js`
Expected: Success tanpa error.

**Step 4: Commit**

```bash
git add -A
git commit -m "chore(scripts): remove temporary extraction artifacts"
```

---

### Task 7: Update Semua AGENTS.md

**Files:**
- Modify: `AGENTS.md` (root)
- Modify: `pages/AGENTS.md`
- Modify: `scripts/AGENTS.md`

**Step 1: Update root AGENTS.md**

- Tambahkan `data/` ke JIT Index Package Structure
- Klarifikasi: global scripts **hanya** di Scalev Custom Head Script, **bukan** inline di index.html

**Step 2: Update pages/AGENTS.md**

- Klarifikasi standar isi folder page:
  - `index.html` = full inline code (**tanpa** global scripts)
  - `{name}.css` = mirror CSS
  - `{name}.html` = mirror HTML body
  - `{name}-app.js` = mirror JS
  - `DEPLOY.md` + `.gitkeep`
- Tambahkan referensi ke `data/` untuk data produk

**Step 3: Update scripts/AGENTS.md**

- Hapus referensi ke file yang sudah dihapus (`scalemarket-critical.css`, dll.)
- Klarifikasi extraction scripts **tidak** meng-inject global head scripts

**Step 4: Commit**

```bash
git add -A
git commit -m "docs: update all AGENTS.md files to reflect restructured codebase"
```

---

### Task 8: Final Verification & Push

**Step 1: Cek struktur akhir**

```bash
ls pages/scalemarket/
ls pages/skillforge/
ls scripts/
ls data/
ls *.js *.mjs *.html 2>$null  # should return nothing
```

**Step 2: Run extraction scripts**

```bash
node scripts/extract-scalemarket.js
node scripts/extract-skillforge.js
```
Expected: Keduanya success.

**Step 3: Push ke GitHub**

```bash
git push
```
