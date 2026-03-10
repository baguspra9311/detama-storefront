# PRD: DeTama Landing Page & Headless Checkout System

**Version:** 4.0 (Hybrid Architecture) | **Updated:** 2026-03-10 | **Status:** DRAFT — Menunggu Review

> _Menggantikan PRD v3.1. Perubahan utama: Astro dihapus, kembali ke raw HTML+CSS+VanillaJS untuk layout pages, TypeScript+Vite hanya untuk logic yang kompleks._

---

## 1. Latar Belakang & Konteks Bisnis

### 1.1. Tentang DeTama.id

DeTama.id adalah brand yang mengoperasikan beberapa produk digital via Scalev:

| Produk          | URL                     | Deskripsi                                                |
| --------------- | ----------------------- | -------------------------------------------------------- |
| **SkillForge**  | `detama.id/skillforge`  | Platform kursus vokasi (Office, Digital Marketing, dll.) |
| **ScaleMarket** | `detama.id/scalemarket` | Marketplace template HTML untuk Scalev                   |
| **Checkout**    | `detama.id/checkout`    | Halaman checkout headless universal — semua produk       |

### 1.2. Masalah yang Ditemukan pada PRD v3.1

PRD v3.1 mengusulkan **Astro SSG** sebagai build tool. Setelah implementasi, ditemukan masalah fundamental:

| Masalah                                                 | Dampak                                                  |
| ------------------------------------------------------- | ------------------------------------------------------- |
| Astro men-transform HTML (scoped CSS, data-astro-\*)    | Layout Scalev Builder RUSAK — tidak identik lagi        |
| Astro rename class names via CSS scoping                | CSS selector custom tidak cocok                         |
| Build output berbeda dari raw HTML input                | Hasil TIDAK PERNAH sama persis dengan halaman eksisting |
| Over-engineering untuk use case "paste HTML ke builder" | Astro solve problem yang tidak kita punya               |

**Kesimpulan:** Astro adalah tool yang **salah** untuk konteks ini. Scalev Builder butuh **raw HTML fragment** — framework apapun yang mentransformasi HTML akan merusak layout.

### 1.3. Solusi Baru — Hybrid Architecture

**Prinsip:** _Salin identik_ HTML+CSS dari halaman eksisting, gunakan TypeScript hanya untuk logic yang kompleks.

| Layer              | Tech Stack                   | Alasan                                             |
| ------------------ | ---------------------------- | -------------------------------------------------- |
| **Landing Pages**  | Raw HTML + CSS + Vanilla JS  | Identik dengan eksisting, paste langsung ke Scalev |
| **Checkout Logic** | TypeScript + Vite → IIFE     | Perlu type safety untuk postMessage, validation    |
| **API Backend**    | Hono.js + Cloudflare Workers | Edge computing, replace PHP+MySQL legacy           |
| **Asset Hosting**  | Cloudflare Pages             | CDN global untuk CSS & JS bundles                  |

### 1.4. Keputusan Subdomain

| Domain             | Kegunaan                                                                |
| ------------------ | ----------------------------------------------------------------------- |
| `cdn.detama.id`    | **Legacy** — file JS/CSS/HTML lama (tetap jalan sampai migrasi selesai) |
| `assets.detama.id` | **BARU** — hosting CSS & JS bundles                                     |
| `api.detama.id`    | Cloudflare Worker (validation, webhook, purchase data)                  |
| `detama.id`        | Domain utama landing page (hosted via Scalev)                           |

---

## 2. Produk & User Journey

### 2.1. SkillForge (`detama.id/skillforge`)

```
Landing Page (HTML di Scalev)
  → Pilih paket → klik CTA → detama.id/checkout?items=SKU1,SKU2
  → Checkout universal (detama.id/checkout)
```

### 2.2. ScaleMarket (`detama.id/scalemarket`)

```
Landing Page (HTML di Scalev)
  → Lihat demo template → klik "Bawa ke Orbit"
  → detama.id/checkout?items=SKU_TEMPLATE
```

> **Catatan:** ScaleMarket **juga** menggunakan `detama.id/checkout` yang sama. Checkout page universal — membaca parameter URL (`?items=`, `?bundles=`, `?voucher=`) maupun localStorage.

### 2.3. Checkout (`detama.id/checkout`) — Universal

```
Parent (detama.id/checkout?items=X&voucher=Y)
  ├── Parse URL params + localStorage
  ├── Render cart summary dari data Scalev
  ├── Embed iframe → kelasnyatama.com/checkout?items=X
  │     ├── checkout-page.js: scrape DOM Scalev
  │     ├── Validasi nomor WA via Fonnte
  │     ├── Validasi email via quickemailverification
  │     └── kirim data ke parent via postMessage
  └── Parent update UI: cart, total, payment, toast, dll.
```

### 2.4. Checkout URL Parameters

| Parameter | Contoh             | Keterangan                |
| --------- | ------------------ | ------------------------- |
| `items`   | `?items=SKU1,SKU2` | Scalev variant unique IDs |
| `bundles` | `?bundles=BSKU`    | Bundle IDs                |
| `voucher` | `?voucher=CODE`    | Pre-fill voucher code     |
| `promo`   | `?promo=po1`       | Promo campaign ID         |

### 2.5. Global Settings (semua halaman Scalev)

**Script A — DevTools Block & Context Menu Disable:**

```html
<script>
  document.addEventListener("contextmenu", (e) => e.preventDefault());
  document.onkeydown = function (e) {
    if (e.keyCode == 123) return false;
    if (e.ctrlKey && e.shiftKey && e.keyCode == 73) return false;
    if (e.ctrlKey && e.shiftKey && e.keyCode == 67) return false;
    if (e.ctrlKey && e.shiftKey && e.keyCode == 74) return false;
    if (e.ctrlKey && e.keyCode == 85) return false;
  };
</script>
```

**Script B — Viewport Override:**

```html
<script>
  !(function () {
    var e = document.querySelector("meta[name=viewport]");
    e && e.remove();
    var a = document.createElement("meta");
    a.name = "viewport";
    a.content =
      "width=device-width, initial-scale=1.0, maximum-scale=2, user-scalable=yes";
    document.head.appendChild(a);
  })();
</script>
```

> Script ini tetap dipasang manual di Scalev Custom Head Script — harus berjalan sebelum render apapun. Tidak di-bundle.

---

## 3. Arsitektur Sistem

### 3.1. Prinsip Kunci

1. **HTML+CSS disalin identik** dari halaman eksisting — TIDAK ada transformasi, TIDAK ada framework
2. **Vanilla JS untuk UI interactions** — toggle cart, FAB, lightbox, scroll animations
3. **TypeScript hanya untuk logic kompleks** — checkout postMessage, validasi, API calls
4. **Vite hanya sebagai bundler TypeScript** → output single IIFE file, bukan framework
5. **Server-side logic di Cloudflare Workers** (`api.detama.id`)

### 3.2. Project Structure

```
detama-storefront/
├── pages/                          # HTML + CSS (IDENTIK dari halaman eksisting)
│   ├── scalemarket/
│   │   ├── index.html              # HTML component → paste ke Scalev Builder
│   │   ├── scalemarket.css         # CSS → upload ke assets.detama.id
│   │   └── scalemarket-app.js      # Vanilla JS (cart, FAB, UI interactions)
│   ├── skillforge/
│   │   ├── index.html              # HTML component → paste ke Scalev Builder
│   │   ├── skillforge.css          # CSS → upload ke assets.detama.id
│   │   └── skillforge-app.js       # Vanilla JS (cart, UI interactions)
│   └── checkout/
│       ├── index.html              # HTML checkout parent → paste ke Scalev Builder
│       └── checkout-parent.css     # CSS → upload ke assets.detama.id
│
├── scripts/                        # TypeScript (di-build via Vite → IIFE)
│   ├── checkout/
│   │   ├── CheckoutPage.ts         # Runs inside Scalev iframe (kelasnyatama.com)
│   │   ├── constants.ts            # Selectors, timing, origins, API URLs
│   │   ├── scrapers/
│   │   │   ├── CartScraper.ts
│   │   │   ├── TotalsScraper.ts
│   │   │   ├── PaymentScraper.ts
│   │   │   └── FormScraper.ts
│   │   ├── actions/
│   │   │   ├── DiscountApplier.ts
│   │   │   ├── SubmitHandler.ts
│   │   │   └── PaymentSelector.ts
│   │   ├── validators/
│   │   │   ├── ValidatorEmail.ts
│   │   │   └── ValidatorWA.ts
│   │   └── bridge/
│   │       └── IframeBridge.ts
│   │
│   ├── parent/
│   │   ├── CheckoutParent.ts       # Runs on parent window (detama.id/checkout)
│   │   ├── bridge/ParentBridge.ts
│   │   ├── managers/
│   │   │   ├── IframeManager.ts
│   │   │   ├── URLParser.ts
│   │   │   ├── AutofillManager.ts
│   │   │   └── CSModeManager.ts
│   │   └── ui/
│   │       ├── CartRenderer.ts
│   │       ├── TotalsRenderer.ts
│   │       ├── PaymentModal.ts
│   │       ├── VoucherManager.ts
│   │       └── ToastManager.ts
│   │
│   └── shared/
│       ├── types.ts                # Shared TS interfaces
│       └── messages.ts             # PostMessage protocol types
│
├── api-worker/                     # Cloudflare Workers + Hono.js
│   ├── wrangler.toml
│   └── src/
│       ├── index.ts
│       ├── routes/
│       │   ├── webhook.ts
│       │   ├── purchases.ts
│       │   ├── validateEmail.ts
│       │   └── validateWA.ts
│       ├── middleware/
│       │   ├── cors.ts
│       │   └── errorHandler.ts
│       └── services/
│           ├── emailValidator.ts
│           ├── waValidator.ts
│           └── purchaseStore.ts
│
├── dist/                           # Build output (gitignored)
│   ├── checkout-page.js            # IIFE → upload ke assets.detama.id
│   └── checkout-parent.js          # IIFE → upload ke assets.detama.id
│
├── vite.config.ts                  # Vite config untuk TypeScript builds
├── tsconfig.json                   # TypeScript config
├── package.json                    # Scripts: build, deploy
└── docs/plans/
    └── 2026-03-10-prd-v4-hybrid-architecture.md  # This file
```

### 3.3. Build Output & Deployment

```
pages/ → Langsung disalin ke Scalev Builder (TANPA build step)
  ├── scalemarket/index.html  → paste ke Scalev Custom HTML Component
  ├── skillforge/index.html   → paste ke Scalev Custom HTML Component
  └── checkout/index.html     → paste ke Scalev Custom HTML Component

CSS & JS statis → Upload ke Cloudflare Pages (assets.detama.id)
  ├── scalemarket.css
  ├── skillforge.css
  ├── checkout-parent.css
  ├── scalemarket-app.js
  └── skillforge-app.js

Vite Build → IIFE bundles → Upload ke assets.detama.id
  ├── checkout-page.js
  └── checkout-parent.js

Wrangler Deploy → api.detama.id (Cloudflare Worker)
  ├── POST /webhook/scalev
  ├── GET  /api/latest-purchases
  ├── POST /api/validate/email
  ├── POST /api/validate/wa
  └── GET  /health
```

### 3.4. Workflow Migrasi per Halaman

```
Untuk setiap halaman (skillforge, scalemarket, checkout):
1. Scrape HTML dari halaman eksisting → simpan ke pages/<name>/index.html
2. Scrape CSS dari halaman eksisting → simpan ke pages/<name>/<name>.css
3. Scrape JS dari halaman eksisting → simpan ke pages/<name>/<name>-app.js
4. Upload CSS & JS ke assets.detama.id
5. Buat halaman baru di Scalev Builder (slug: <name>2)
6. Set Custom Head Script: link CSS + viewport override + devtools block
7. Paste HTML ke Custom HTML Component di Scalev Builder
8. Test: bandingkan visual halaman baru vs eksisting
9. Jika OK → swap slug (hapus eksisting, rename <name>2 → <name>)
```

---

## 4. Checkout System — Detail Teknis

### 4.1. Arsitektur Parent-Iframe

```
Browser (detama.id/checkout?items=A,B&voucher=CODE)
│
├── [Parent Window: detama.id]
│   ├── HTML dari pages/checkout/index.html
│   ├── Custom Head Script: font + viewport + checkout-parent.js
│   │
│   └── CheckoutParent.ts (TypeScript → IIFE bundle)
│       ├── URLParser  → parse ?items=, ?bundles=, ?voucher=
│       ├── IframeManager → buat & kelola iframe lifecycle
│       ├── AutofillManager → load/save localStorage (name, email, phone)
│       ├── CartRenderer, TotalsRenderer, PaymentModal
│       ├── VoucherManager, ToastManager, CSModeManager
│       └── ParentBridge → postMessage send/receive (type-safe)
│
└── [Iframe: kelasnyatama.com/checkout?items=A,B]
    ├── Custom Head Script: font + checkout-page.js
    │
    └── CheckoutPage.ts (TypeScript → IIFE bundle)
        ├── injectStyles()     → inject checkout-iframe.css ke head
        ├── CartScraper, TotalsScraper, PaymentScraper, FormScraper
        ├── ValidatorWA        → debounce 1000ms, proxy via api.detama.id
        ├── ValidatorEmail     → debounce 1200ms, proxy via api.detama.id
        ├── DiscountApplier, SubmitHandler, PaymentSelector
        └── IframeBridge       → postMessage send/receive
```

### 4.2. PostMessage Protocol (type-safe via `scripts/shared/messages.ts`)

**Iframe → Parent:**

| Type                          | Payload                                           |
| ----------------------------- | ------------------------------------------------- |
| `IFRAME_READY`                | `{}`                                              |
| `UPDATE_CART_ITEMS`           | `{ items: CartItemSummary[], itemCount: number }` |
| `UPDATE_TOTALS`               | `{ data: TotalsSummary }`                         |
| `PAYMENT_OPTIONS_DATA`        | `{ options: PaymentOption[] }`                    |
| `INITIAL_PAYMENT_STATE`       | `{ methodId: string }`                            |
| `PAYMENT_SELECTION_CONFIRMED` | `{ methodId, iconUrl }`                           |
| `SAVE_AUTOFILL_DATA`          | `{ data: AutofillData }`                          |
| `SHOW_ERROR`                  | `{ message, errorType }`                          |
| `SUBMISSION_FAILED`           | `{ errors?: string[] }`                           |
| `INVALID_CART`                | `{}`                                              |
| `DISABLE_CHECKOUT`            | `{ message }`                                     |
| `ENABLE_CHECKOUT`             | `{}`                                              |
| `VALIDATION_STARTED / ENDED`  | `{ isValid?: boolean }`                           |

**Parent → Iframe:**

| Type                    | Payload                        |
| ----------------------- | ------------------------------ |
| `SET_THEME`             | `{ theme: 'light' \| 'dark' }` |
| `LOAD_AUTOFILL_DATA`    | `{ data: AutofillData }`       |
| `APPLY_VOUCHER_CODE`    | `{ code }`                     |
| `SUBMIT_CHECKOUT`       | `{}`                           |
| `SELECT_PAYMENT_METHOD` | `{ methodId }`                 |
| `REMOVE_ITEM`           | `{ variantSKU }`               |

### 4.3. Build Strategy — IIFE Bundles (Vite)

```typescript
// vite.config.ts
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
  },
});
```

### 4.4. Scalev DOM Selectors Registry

> Semua selector dipusatkan di `scripts/checkout/constants.ts`. Scalev menggunakan generated class names yang **bisa berubah kapan saja tanpa pemberitahuan**.

```typescript
export const SELECTORS = {
  cartItemContainer: "#main-form-items-JmLZKLNejx > div.mt-\\[16px\\] > div",
  cartItemSKU: "span.w-full.text-\\[16px\\].font-\\[500\\].leading-\\[22px\\]",
  cartItemPrice: "span.text-\\[14px\\]",
  cartItemQty: 'input[type="number"]',
  cartItemImage: "img[data-nuxt-img]",
  cartItemRemoveBtn: 'button[type="button"]',
  totalRow: "div.border-t-2.border-gray-400 > p.ml-auto",
  summaryRows:
    "div.flex.w-full.flex-col.gap-y-\\[12px\\].px-\\[16px\\].pb-\\[16px\\] > div.flex.w-full",
  paymentOption: "div.w-full.cursor-pointer.rounded",
  paymentOptionName: "span.text-\\[16px\\]",
  nameInput: "#name",
  emailInput: "#email",
  phoneInput: "#phone",
  discountInput: "#discountCode",
  submitButton: "form button",
} as const;

export const TIMING = {
  paymentPollInterval: 200,
  paymentPollMaxAttempts: 25,
  imageObserverInterval: 500,
  imageObserverMaxAttempts: 15,
  mutationDebounce: 300,
  emailDebounce: 1200,
  waDebounce: 1000,
  initialPaymentDelay: 1500,
  discountDebounce: 1000,
} as const;

export const ALLOWED_ORIGINS = [
  "https://detama.id",
  "https://kelasnyatama.com",
] as const;

export const API = {
  validateEmail: "https://api.detama.id/api/validate/email",
  validateWA: "https://api.detama.id/api/validate/wa",
  latestPurchases: "https://api.detama.id/api/latest-purchases",
} as const;
```

---

## 5. API Worker — api.detama.id

### 5.1. Routes

| Route                   | Method | Auth                          | Purpose                                |
| ----------------------- | ------ | ----------------------------- | -------------------------------------- |
| `/webhook/scalev`       | POST   | `X-Scalev-Hmac-Sha256` (HMAC) | Single webhook endpoint, event routing |
| `/api/latest-purchases` | GET    | None (public, 60s cache)      | Social proof ticker                    |
| `/api/validate/email`   | POST   | None                          | Proxy ke quickemailverification.com    |
| `/api/validate/wa`      | POST   | None                          | Proxy ke Fonnte API                    |
| `/health`               | GET    | None                          | Health check                           |

### 5.2. External API Integrations

#### WhatsApp Validation — Fonnte

- **Endpoint:** `POST https://api.fonnte.com/validate`
- **Auth:** `Authorization: <TOKEN>` header
- **Failsafe:** Jika down → skip validasi, izinkan submit
- **KV Cache:** `wa_cache:<normalized_number>` — TTL 1 jam

#### Email Validation — quickemailverification

- **Endpoint:** `GET https://api.quickemailverification.com/v1/verify`
- **Auth:** `?apikey=<KEY>` query parameter
- **Failsafe:** Jika API error → return `{ valid: true, category: 'failsafe' }` — jangan blokir user
- **KV Cache:** `email_cache:<email>` — TTL 24 jam

### 5.3. API Contracts

```typescript
// POST /api/validate/email
// Body:  { email: string }
// 200:   { valid: boolean, category: 'valid'|'risky'|'invalid'|'failsafe', message: string, suggestion?: string }

// POST /api/validate/wa
// Body:  { nomor: string }
// 200:   { valid: boolean, registered: boolean }

// POST /webhook/scalev
// Headers: X-Scalev-Hmac-Sha256: <base64-hmac-signature>
// Body: { event: string, timestamp: string, data: OrderData }
// 200:  { ok: true }
// 401:  { error: 'Invalid signature' }

// GET /api/latest-purchases
// 200:  { purchases: PurchaseEvent[] }  // max 5 items
```

### 5.4. Environment Variables

| Variable                | Used In                      | Description                             |
| ----------------------- | ---------------------------- | --------------------------------------- |
| `SCALEV_SIGNING_SECRET` | `routes/webhook.ts`          | Signing secret dari Scalev dashboard    |
| `FONNTE_TOKEN`          | `services/waValidator.ts`    | API token Fonnte                        |
| `QEV_API_KEY`           | `services/emailValidator.ts` | API key quickemailverification          |
| `ALLOWED_ORIGINS`       | `middleware/cors.ts`         | Whitelist: `detama.id,kelasnyatama.com` |
| `KV_PURCHASES`          | `services/purchaseStore.ts`  | Cloudflare KV namespace binding         |

### 5.5. KV Schema

```typescript
// Key: "latest_purchases"
// Value: JSON.stringify(PurchaseEvent[]) — max 5 items, FIFO
interface PurchaseEvent {
  buyerName: string;
  productName: string;
  timestamp: number;
  city?: string;
}

// Key: "email_cache:user@example.com"  — TTL 24h
// Key: "wa_cache:628123456789"         — TTL 1h
```

---

## 6. Custom Head Scripts (Final)

> **⚠️ CONSTRAINT: Scalev Custom Head Script HANYA mendukung tag `<script>`.** Tag lain seperti `<link>`, `<style>`, `<meta>` **TIDAK akan dirender** di halaman live. Semua resource (CSS, fonts) HARUS di-load via JavaScript di dalam tag `<script>`.

### 6.1. Pola Load CSS via Fetch+Inject

Karena `<link>` tidak didukung, CSS harus di-load dengan pola ini:

```html
<script>
  fetch("https://assets.detama.id/nama-file.css")
    .then((r) => r.text())
    .then((css) => {
      var style = document.createElement("style");
      style.innerHTML = css;
      document.head.appendChild(style);
    });
</script>
```

### 6.2. Pola Load Font via JS

```html
<script>
  (function () {
    var fontLink = document.createElement("link");
    fontLink.href =
      "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap";
    fontLink.rel = "stylesheet";
    fontLink.as = "style";
    document.head.appendChild(fontLink);
  })();
</script>
```

### 6.3. Parent Window (`detama.id/checkout`)

```html
<!-- Google Fonts -->
<script>
  (function () {
    var fontLink = document.createElement("link");
    fontLink.href =
      "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap";
    fontLink.rel = "stylesheet";
    fontLink.as = "style";
    document.head.appendChild(fontLink);
  })();
</script>

<!-- CSS via fetch+inject -->
<script>
  fetch("https://assets.detama.id/checkout-parent.css")
    .then((r) => r.text())
    .then((css) => {
      var style = document.createElement("style");
      style.innerHTML = css;
      document.head.appendChild(style);
    });
</script>

<!-- Viewport Override -->
<script>
  !(function () {
    var e = document.querySelector("meta[name=viewport]");
    e && e.remove();
    var a = document.createElement("meta");
    a.name = "viewport";
    a.content =
      "width=device-width, initial-scale=1.0, maximum-scale=2, user-scalable=yes";
    document.head.appendChild(a);
  })();
</script>

<!-- Parent Checkout Controller -->
<script src="https://assets.detama.id/checkout-parent.js" defer></script>
```

### 6.4. Scalev Checkout Form (Iframe — `kelasnyatama.com`)

```html
<!-- Google Fonts -->
<script>
  (function () {
    var fontLink = document.createElement("link");
    fontLink.href =
      "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap";
    fontLink.rel = "stylesheet";
    fontLink.as = "style";
    document.head.appendChild(fontLink);
  })();
</script>

<!-- CSS via fetch+inject -->
<script>
  fetch("https://assets.detama.id/checkout-page.css")
    .then((r) => r.text())
    .then((css) => {
      var style = document.createElement("style");
      style.innerHTML = css;
      document.head.appendChild(style);
    });
</script>

<!-- Iframe Checkout Bundle -->
<script src="https://assets.detama.id/checkout-page.js" defer></script>
```

### 6.5. Landing Pages (SkillForge & ScaleMarket)

```html
<!-- Google Fonts -->
<script>
  (function () {
    var fontLink = document.createElement("link");
    fontLink.href =
      "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap";
    fontLink.rel = "stylesheet";
    fontLink.as = "style";
    document.head.appendChild(fontLink);
  })();
</script>

<!-- Custom CSS via fetch+inject -->
<script>
  fetch("https://assets.detama.id/<page-name>.css")
    .then((r) => r.text())
    .then((css) => {
      var style = document.createElement("style");
      style.innerHTML = css;
      document.head.appendChild(style);
    });
</script>

<!-- DevTools Block -->
<script>
  document.addEventListener("contextmenu", (e) => e.preventDefault());
  document.onkeydown = function (e) {
    if (e.keyCode == 123) return false;
    if (e.ctrlKey && e.shiftKey && e.keyCode == 73) return false;
    if (e.ctrlKey && e.shiftKey && e.keyCode == 67) return false;
    if (e.ctrlKey && e.shiftKey && e.keyCode == 74) return false;
    if (e.ctrlKey && e.keyCode == 85) return false;
  };
</script>

<!-- Viewport Override -->
<script>
  !(function () {
    var e = document.querySelector("meta[name=viewport]");
    e && e.remove();
    var a = document.createElement("meta");
    a.name = "viewport";
    a.content =
      "width=device-width, initial-scale=1.0, maximum-scale=2, user-scalable=yes";
    document.head.appendChild(a);
  })();
</script>

<!-- App JS -->
<script src="https://assets.detama.id/<page-name>-app.js" defer></script>
```

---

## 7. Data Model

```typescript
// scripts/shared/types.ts

export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  description: string;
  features: string[];
  image?: string;
  variantSKU: string;
  badge?: string;
  isFeatured?: boolean;
}

export interface CartItem {
  variantId: string;
  variantSKU: string;
  productName: string;
  variantName: string;
  price: number;
  quantity: number;
  image: string;
}

export interface PurchaseEvent {
  buyerName: string;
  productName: string;
  timestamp: number;
  city?: string;
}

export type ValidationCategory = "valid" | "risky" | "invalid" | "failsafe";
export interface ValidationResponse {
  valid: boolean;
  category: ValidationCategory;
  message: string;
  suggestion?: string;
}
```

---

## 8. Implementation Plan (Phased)

### Phase 1 — Setup Struktur Baru (Saat ini)

- [ ] Buat folder structure baru (`pages/`, `scripts/`)
- [ ] Setup Vite config untuk TypeScript builds
- [ ] Setup tsconfig.json
- [ ] Update package.json scripts
- [ ] Hapus folder `frontend/` (Astro)
- [ ] Hapus PRD v3.1

### Phase 2 — Migrasi SkillForge

> **Sumber:** halaman eksisting `detama.id/skillforge`

- [ ] Scrape/extract HTML dari halaman eksisting → `pages/skillforge/index.html`
- [ ] Scrape/extract CSS → `pages/skillforge/skillforge.css`
- [ ] Scrape/extract JS → `pages/skillforge/skillforge-app.js`
- [ ] Upload CSS & JS ke `assets.detama.id`
- [ ] Setup Custom Head Script di Scalev Builder (halaman baru)
- [ ] Paste HTML ke Scalev Builder
- [ ] **Test:** Bandingkan visual vs halaman eksisting
- [ ] **Jika OK:** Swap slug (skillforge2 → skillforge)

### Phase 3 — Migrasi ScaleMarket

> **Sumber:** halaman eksisting `detama.id/scalemarket`

- [ ] Scrape/extract HTML dari halaman eksisting → `pages/scalemarket/index.html`
- [ ] Scrape/extract CSS → `pages/scalemarket/scalemarket.css`
- [ ] Scrape/extract JS → `pages/scalemarket/scalemarket-app.js`
- [ ] Upload CSS & JS ke `assets.detama.id`
- [ ] Setup Custom Head Script di Scalev Builder (halaman baru)
- [ ] Paste HTML ke Scalev Builder
- [ ] **Test:** Bandingkan visual vs halaman eksisting
- [ ] **Jika OK:** Swap slug (scalemarket2 → scalemarket)

### Phase 4 — Migrasi Checkout

> **Paling kompleks:** TypeScript build + parent-iframe architecture

- [ ] Extract HTML checkout parent → `pages/checkout/index.html`
- [ ] Extract CSS → `pages/checkout/checkout-parent.css`
- [ ] Port checkout-page.js dari `cdn.detama.id` ke TypeScript (`scripts/checkout/`)
- [ ] Port checkout-parent.js dari `cdn.detama.id` ke TypeScript (`scripts/parent/`)
- [ ] Setup Vite IIFE build
- [ ] Build & upload ke `assets.detama.id`
- [ ] Setup Custom Head Script di Scalev Builder
- [ ] Paste HTML ke Scalev Builder
- [ ] **Test:** Full checkout flow (cart, totals, payment, voucher, validation, submit)
- [ ] **Jika OK:** Swap URL di Scalev Custom Head Script

### Phase 5 — API Worker

> **Goal:** Ganti semua PHP endpoint + MySQL cPanel

- [ ] Setup Hono.js + Wrangler di `api-worker/`
- [ ] CORS middleware
- [ ] `POST /api/validate/email`
- [ ] `POST /api/validate/wa`
- [ ] `POST /webhook/scalev` (HMAC verify + event routing)
- [ ] `GET /api/latest-purchases`
- [ ] Deploy ke `api.detama.id`

### Phase 6 — Cleanup & Go Live

- [ ] Hapus halaman eksisting setelah migrasi berhasil
- [ ] Swap semua slug ke URL final
- [ ] Verifikasi semua fitur berjalan
- [ ] Hapus dependency ke `cdn.detama.id` (jangan delete filenya, biarkan sebagai backup)

---

## 9. Risk Registry

| Risk                        | Likelihood | Impact | Mitigation                                            |
| --------------------------- | ---------- | ------ | ----------------------------------------------------- |
| Scalev ubah CSS class names | Medium     | High   | Centralkan di `constants.ts`; update 1 file           |
| HTML copy tidak identik     | Low        | High   | Scrape langsung dari halaman live, test pixel-perfect |
| Payment scraping timeout    | Medium     | High   | Polling 25×200ms = 5s max                             |
| postMessage origin spoofing | Low        | High   | Strict `ALLOWED_ORIGINS` check                        |
| Fonnte down                 | Medium     | Medium | Failsafe: skip WA validation, allow submit            |
| quickemailverification down | Low        | Medium | Failsafe: return `failsafe` category                  |

---

## 10. Rollback Strategy

1. Halaman eksisting tetap hidup sampai migrasi selesai — zero downtime
2. File legacy di `cdn.detama.id` TIDAK dihapus — tetap sebagai backup
3. Rollback = swap slug kembali di Scalev dashboard (1 klik)
4. Rollback API = kembalikan Custom Head Script ke JS file lama

---

## 11. Definition of Done

- [ ] SkillForge: halaman baru **identik visual** dengan eksisting
- [ ] ScaleMarket: halaman baru **identik visual** dengan eksisting
- [ ] Checkout: full flow berjalan (cart, totals, payment, voucher, validation, submit)
- [ ] `checkout-page.js` — single IIFE, zero TS errors
- [ ] `checkout-parent.js` — single IIFE, zero TS errors
- [ ] API Worker deployed di `api.detama.id`, semua route berfungsi
- [ ] Semua slug di-swap ke URL final
- [ ] Zero dependency ke `cdn.detama.id` (kecuali backup)

---

_PRD ini adalah single source of truth. Update selalu di file ini, bukan di AI chat context._
