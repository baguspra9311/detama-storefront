# PRD: DeTama Landing Page & Headless Checkout System

**Version:** 3.1 (Master) | **Updated:** 2026-03-07 | **Status:** APPROVED — Single Source of Truth

> _Merged dari: Implementation Plan V1 + analisis CDN source code + klarifikasi user (v3.1)_

---

## 1. Latar Belakang & Konteks Bisnis

### 1.1. Tentang DeTama.id

DeTama.id adalah brand yang mengoperasikan beberapa produk digital via Scalev:

| Produk          | URL                     | Deskripsi                                                |
| --------------- | ----------------------- | -------------------------------------------------------- |
| **SkillForge**  | `detama.id/skillforge`  | Platform kursus vokasi (Office, Digital Marketing, dll.) |
| **ScaleMarket** | `detama.id/scalemarket` | Marketplace template HTML untuk Scalev                   |
| **Checkout**    | `detama.id/checkout`    | Halaman checkout headless universal — semua produk       |

### 1.2. Masalah Utama

**Scalev** sebagai backend memiliki keterbatasan:

1. **Landing Page hanya bisa custom melalui HTML komponen** — Layout bawaan Scalev sangat kaku.
2. **Checkout form tidak bisa di-custom layout-nya** — Form berjalan di domain `kelasnyatama.com`. Hanya bisa inject script via "Custom Head Script".

**Solusi saat ini (legacy):** File HTML & JS di-host di `cdn.detama.id`. Vanilla JS, tidak ada type safety, tidak ada build system.

| Masalah                                   | Dampak                                                  |
| ----------------------------------------- | ------------------------------------------------------- |
| Vanilla JS tanpa type safety              | Runtime errors, sulit di-debug                          |
| PHP validation endpoints + MySQL (cPanel) | Legacy, tidak ada edge caching, single point of failure |
| CSS ditulis dengan `!important` manual    | Sulit di-maintain, tidak konsisten                      |
| Tidak ada SSG/build system                | Tidak ada hot reload, tidak ada linting                 |

### 1.3. Solusi — Astro + TypeScript + Cloudflare

- **Astro** sebagai SSG: output HTML fragment & JS IIFE bundles
- **TypeScript** end-to-end, termasuk postMessage protocol
- **Cloudflare Pages** (`assets.detama.id`): host static bundles
- **Cloudflare Workers** (`api.detama.id`): ganti semua PHP endpoint + MySQL cPanel
- **Cloudflare KV**: store purchase events & validation cache

> **Database Migration**: Seluruh data dari MySQL cPanel dimigrasikan ke **Cloudflare KV** — tidak ada dependency ke hosting lama sama sekali.

### 1.4. Keputusan Subdomain

| Domain             | Kegunaan                                                   |
| ------------------ | ---------------------------------------------------------- |
| `cdn.detama.id`    | **Deprecated** — legacy JS/CSS/HTML files (jangan dihapus) |
| `assets.detama.id` | **BARU** — hosting JS bundles dari build Astro baru        |
| `api.detama.id`    | Cloudflare Worker (validation, webhook, purchase data)     |
| `detama.id`        | Domain utama landing page (hosted via Scalev)              |

---

## 2. Produk & User Journey

### 2.1. SkillForge (`detama.id/skillforge`)

**Journey:**

```
Landing Page (HTML di Scalev)
  → Pilih paket → klik CTA → detama.id/checkout?items=SKU1,SKU2
  → Checkout universal (detama.id/checkout)
```

### 2.2. ScaleMarket (`detama.id/scalemarket`)

**Journey:**

```
Landing Page (HTML di Scalev)
  → Lihat demo template → klik "Bawa ke Orbit"
  → detama.id/checkout?items=SKU_TEMPLATE     ← ✅ SAMA dengan SkillForge!
```

> **⚠️ Klarifikasi v3.1:** ScaleMarket **juga** menggunakan `detama.id/checkout` yang sama. Checkout page ini universal — bisa membaca parameter URL (`?items=`, `?bundles=`, `?voucher=`) maupun localStorage untuk berbagai produk.

### 2.3. Checkout (`detama.id/checkout`) — Universal

**Journey:**

```
Parent (detama.id/checkout?items=X&voucher=Y)
  ├── Parse URL params + localStorage
  ├── Render cart summary dari data Scalev
  ├── Embed iframe → kelasnyatama.com/checkout?items=X
  │     ├── CheckoutPage.ts: scrape DOM Scalev
  │     ├── ValidatorWA.ts: validasi nomor WA via Fonnte
  │     ├── ValidatorEmail.ts: validasi email via quickemailverification
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
    if (e.keyCode == 123) return false; // F12
    if (e.ctrlKey && e.shiftKey && e.keyCode == 73) return false; // Ctrl+Shift+I
    if (e.ctrlKey && e.shiftKey && e.keyCode == 67) return false; // Ctrl+Shift+C
    if (e.ctrlKey && e.shiftKey && e.keyCode == 74) return false; // Ctrl+Shift+J
    if (e.ctrlKey && e.keyCode == 85) return false; // Ctrl+U
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

> **PRD Decision:** Script ini tetap dipasang manual di Scalev Custom Head Script — harus berjalan sebelum render apapun. Tidak di-bundle.

---

## 3. Arsitektur Sistem

### 3.1. Prinsip Kunci

1. **Output Astro adalah HTML fragment + JS IIFE bundles** — bukan website tradisional
2. **Tidak ada server-side rendering saat request** — pure SSG + Cloudflare CDN
3. **Parent-iframe dipertahankan** — Scalev form cross-origin (`kelasnyatama.com` ≠ `detama.id`)
4. **Astro hanya sebagai build tool** — route pages → output HTML fragment yang di-paste ke Scalev
5. **Server-side logic di Cloudflare Workers** (`api.detama.id`)

### 3.2. Monorepo Structure

```
detama-storefront/
├── frontend/                          # Astro + TypeScript (SSG)
│   ├── astro.config.ts
│   ├── vite.checkout.config.ts        # Vite IIFE build: checkout-page.js
│   ├── vite.parent.config.ts          # Vite IIFE build: checkout-parent.js
│   └── src/
│       ├── data/
│       │   └── products.ts            # SSOT: semua produk dengan harga & SKU
│       ├── layouts/
│       │   ├── FragmentLayout.astro   # Output: HTML fragment (NO doctype/html/body)
│       │   └── CheckoutLayout.astro   # Output: Full HTML untuk checkout parent page
│       ├── pages/
│       │   ├── scalemarket/index.astro  → scalemarket.html (disalin ke Scalev)
│       │   ├── skillforge/index.astro   → skillforge.html (disalin ke Scalev)
│       │   └── checkout/index.astro     → checkout/index.html (parent window)
│       ├── components/
│       │   ├── shared/
│       │   │   ├── GlobalHead.astro
│       │   │   └── GlobalScripts.astro
│       │   ├── landing/
│       │   │   ├── Hero.astro
│       │   │   ├── ProductCard.astro
│       │   │   ├── PricingSection.astro
│       │   │   ├── Testimonials.astro
│       │   │   ├── FAQ.astro
│       │   │   ├── Footer.astro
│       │   │   └── PurchaseTicker.astro
│       │   └── checkout/
│       │       ├── CartSummary.astro
│       │       ├── TotalsBreakdown.astro
│       │       ├── PaymentSelector.astro
│       │       └── VoucherInput.astro
│       ├── scripts/
│       │   ├── checkout/              # → assets.detama.id/checkout-page.js
│       │   │   ├── CheckoutPage.ts    # Orchestrator
│       │   │   ├── constants.ts       # SELECTORS, TIMING, ALLOWED_ORIGINS, API
│       │   │   ├── scrapers/
│       │   │   │   ├── CartScraper.ts
│       │   │   │   ├── TotalsScraper.ts
│       │   │   │   ├── PaymentScraper.ts
│       │   │   │   └── FormScraper.ts
│       │   │   ├── actions/
│       │   │   │   ├── DiscountApplier.ts
│       │   │   │   ├── SubmitHandler.ts
│       │   │   │   └── PaymentSelector.ts
│       │   │   ├── validators/
│       │   │   │   ├── ValidatorEmail.ts  # → api.detama.id/api/validate/email
│       │   │   │   └── ValidatorWA.ts     # → api.detama.id/api/validate/wa
│       │   │   └── bridge/
│       │   │       └── IframeBridge.ts
│       │   ├── parent/                # → assets.detama.id/checkout-parent.js
│       │   │   ├── CheckoutParent.ts
│       │   │   ├── bridge/ParentBridge.ts
│       │   │   ├── managers/
│       │   │   │   ├── IframeManager.ts
│       │   │   │   ├── URLParser.ts
│       │   │   │   ├── AutofillManager.ts
│       │   │   │   └── CSModeManager.ts
│       │   │   └── ui/
│       │   │       ├── CartRenderer.ts
│       │   │       ├── TotalsRenderer.ts
│       │   │       ├── PaymentModal.ts
│       │   │       ├── VoucherManager.ts
│       │   │       └── ToastManager.ts
│       │   └── shared/
│       │       └── analytics.ts
│       └── styles/
│           ├── global.css
│           ├── checkout-iframe.css    # Injected ke Scalev iframe head via JS (✅ done)
│           └── checkout-parent.css
│
├── api-worker/                        # Cloudflare Workers + Hono.js
│   ├── wrangler.toml
│   └── src/
│       ├── index.ts
│       ├── routes/
│       │   ├── webhook.ts             # POST /webhook/scalev  (all Scalev events)
│       │   ├── purchases.ts           # GET  /api/latest-purchases
│       │   ├── validateEmail.ts       # POST /api/validate/email
│       │   └── validateWA.ts          # POST /api/validate/wa
│       ├── middleware/
│       │   ├── cors.ts
│       │   └── errorHandler.ts
│       └── services/
│           ├── emailValidator.ts      # quickemailverification proxy
│           ├── waValidator.ts         # Fonnte API proxy
│           └── purchaseStore.ts       # Cloudflare KV operations
│
├── shared/
│   └── types/
│       └── messages.ts               # ✅ DONE — IframeMessage, ParentMessage, guards
│
└── docs/plans/
    └── 2026-03-07-checkout-migration-design.md  # This file
```

### 3.3. Build Output & Deployment

```
Astro Build Output → Cloudflare Pages (assets.detama.id)
├── scalemarket/index.html   → disalin ke Scalev Custom HTML
├── skillforge/index.html    → disalin ke Scalev Custom HTML
├── checkout/index.html      → disalin ke Scalev Custom HTML
└── _astro/                  → static assets via CDN

Vite IIFE Build Output → assets.detama.id
├── checkout-page.js         → di-load via Scalev Custom Head Script (iframe)
└── checkout-parent.js       → di-embed di checkout/index.html (parent)

Wrangler Deploy → api.detama.id (Cloudflare Worker)
├── POST /webhook/scalev
├── GET  /api/latest-purchases
├── POST /api/validate/email
├── POST /api/validate/wa
└── GET  /health
```

---

## 4. Checkout System — Detail Teknis

### 4.1. Arsitektur Parent-Iframe

```
Browser (detama.id/checkout?items=A,B&voucher=CODE)
│
├── [Parent Window: detama.id]
│   ├── HTML dari checkout/index.astro
│   ├── Custom Head Script: font + viewport + checkout-parent.js
│   │
│   └── CheckoutParent.ts
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
    └── CheckoutPage.ts
        ├── injectStyles()     → inject checkout-iframe.css ke head
        ├── CartScraper, TotalsScraper, PaymentScraper, FormScraper
        ├── ValidatorWA        → debounce 1000ms, proxy via api.detama.id
        ├── ValidatorEmail     → debounce 1200ms, proxy via api.detama.id
        ├── DiscountApplier, SubmitHandler, PaymentSelector
        └── IframeBridge       → postMessage send/receive
```

### 4.2. PostMessage Protocol (type-safe via `shared/types/messages.ts`)

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

### 4.3. Build Strategy — IIFE Bundles

```typescript
// vite.checkout.config.ts
build: {
  lib: {
    entry: 'src/scripts/checkout/CheckoutPage.ts',
    name: 'CheckoutPage',
    formats: ['iife'],
    fileName: () => 'checkout-page.js',
  },
  outDir: 'dist-scripts',
  rollupOptions: {
    output: { inlineDynamicImports: true }, // CRITICAL: prevents lazy chunks
  },
  cssCodeSplit: false,
}
```

**CSS Injection dalam JS bundle:**

```typescript
import checkoutStyles from "../styles/checkout-iframe.css?inline";
function injectStyles() {
  const style = document.createElement("style");
  style.innerHTML = checkoutStyles;
  document.head.appendChild(style);
}
```

---

## 5. Scalev DOM Selectors Registry (CRITICAL)

> Semua selector dipusatkan di `constants.ts`. Scalev menggunakan generated class names yang **bisa berubah kapan saja tanpa pemberitahuan**.

```typescript
// frontend/src/scripts/checkout/constants.ts
export const SELECTORS = {
  // Cart
  cartItemContainer: "#main-form-items-JmLZKLNejx > div.mt-\\[16px\\] > div",
  cartItemSKU: "span.w-full.text-\\[16px\\].font-\\[500\\].leading-\\[22px\\]",
  cartItemPrice: "span.text-\\[14px\\]",
  cartItemQty: 'input[type="number"]',
  cartItemImage: "img[data-nuxt-img]",
  cartItemRemoveBtn: 'button[type="button"]',

  // Totals
  totalRow: "div.border-t-2.border-gray-400 > p.ml-auto",
  summaryRows:
    "div.flex.w-full.flex-col.gap-y-\\[12px\\].px-\\[16px\\].pb-\\[16px\\] > div.flex.w-full",

  // Payment options
  paymentOption: "div.w-full.cursor-pointer.rounded",
  paymentOptionName: "span.text-\\[16px\\]",

  // Form fields
  nameInput: "#name",
  emailInput: "#email",
  phoneInput: "#phone",
  discountInput: "#discountCode",

  // Submit (filtered by text "buat pesanan")
  submitButton: "form button",
} as const;

export const TIMING = {
  paymentPollInterval: 200,
  paymentPollMaxAttempts: 25, // 5s max
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

## 6. API Worker — api.detama.id

### 6.1. Routes

| Route                   | Method | Auth                          | Purpose                                |
| ----------------------- | ------ | ----------------------------- | -------------------------------------- |
| `/webhook/scalev`       | POST   | `X-Scalev-Hmac-Sha256` (HMAC) | Single webhook endpoint, event routing |
| `/api/latest-purchases` | GET    | None (public, 60s cache)      | Social proof ticker                    |
| `/api/validate/email`   | POST   | None                          | Proxy ke quickemailverification.com    |
| `/api/validate/wa`      | POST   | None                          | Proxy ke Fonnte API                    |
| `/health`               | GET    | None                          | Health check                           |

### 6.2. External API Integrations

#### 6.2.1. WhatsApp Validation — Fonnte

- **Provider:** [Fonnte](https://fonnte.com)
- **Endpoint:** `POST https://api.fonnte.com/validate`
- **Auth:** `Authorization: <TOKEN>` header
- **Request:**
  ```json
  { "target": "628123456789", "countryCode": "62" }
  ```
- **Response:**
  ```json
  { "registered": ["628123456789"], "not_registered": [], "status": true }
  ```
- **Failsafe:** Jika Fonnte down (`status: false` / network error) → **skip validasi, izinkan submit**
- **Env variable:** `FONNTE_TOKEN`
- **KV Cache:** `wa_cache:<normalized_number>` — TTL **1 jam**

#### 6.2.2. Email Validation — quickemailverification

- **Provider:** [quickemailverification.com](https://quickemailverification.com)
- **Endpoint:** `GET https://api.quickemailverification.com/v1/verify`
- **Auth:** `?apikey=<KEY>` query parameter
- **Sandbox (local dev):** Gunakan email khusus yang return response yang sudah diketahui — lihat [docs sandbox](https://docs.quickemailverification.com/email-verification-api/sandbox-mode)
- **Response fields yang dipakai:**
  ```json
  {
    "result": "valid|invalid|unknown",
    "reason": "accepted_email|rejected_email|invalid_email|...",
    "disposable": "true|false",
    "safe_to_send": "true|false",
    "did_you_mean": "suggestion@example.com"
  }
  ```
- **Logic kategorisasi:**

  | Kondisi                                    | Kategori   | Block? |
  | ------------------------------------------ | ---------- | ------ |
  | `result=valid` + `safe_to_send=true`       | `valid`    | No     |
  | `result=valid` + `disposable=true`         | `risky`    | Soft   |
  | `result=invalid`                           | `invalid`  | Yes    |
  | `result=unknown` / network error / timeout | `failsafe` | No     |

- **Failsafe:** Jika API error → return `{ valid: true, category: 'failsafe' }` — jangan blokir user
- **Env variable:** `QEV_API_KEY`
- **KV Cache:** `email_cache:<email>` — TTL **24 jam**

> **💡 QEV Sandbox untuk Local Dev:** API menggunakan email address khusus sebagai trigger. Misalnya `valid@example.com` → result valid, `invalid@example.com` → result invalid. Ini tidak membutuhkan kredit API dan bisa digunakan tanpa batas untuk testing.

### 6.3. API Contracts

```typescript
// POST /api/validate/email
// Body:  { email: string }
// 200:   { valid: boolean, category: 'valid'|'risky'|'invalid'|'failsafe', message: string, suggestion?: string }

// POST /api/validate/wa
// Body:  { nomor: string }  // raw input, worker normalizes +62/0/etc. → 628xx
// 200:   { valid: boolean, registered: boolean }

// POST /webhook/scalev
// Headers: X-Scalev-Hmac-Sha256: <base64-hmac-signature>
// Body: { event: string, timestamp: string, data: OrderData }
// 200:  { ok: true }
// 401:  { error: 'Invalid signature' }

// GET /api/latest-purchases
// 200:  { purchases: PurchaseEvent[] }  // max 5 items
```

### 6.4. Scalev HMAC Webhook

> **⚠️ Klarifikasi v3.1:** Scalev **TIDAK** mendukung custom request header (`X-Scalev-Secret`). Scalev menggunakan mekanisme **HMAC-SHA256 signature** via header `X-Scalev-Hmac-Sha256`.

**Mekanisme verifikasi:**

```typescript
// api-worker/src/routes/webhook.ts
import { createHmac } from "crypto";

async function verifyScalevWebhook(
  body: string,
  signature: string,
  signingSecret: string,
): Promise<boolean> {
  const hmac = createHmac("sha256", signingSecret);
  const calculated = hmac.update(body).digest("base64");
  return calculated === signature;
}

// Di handler:
const signature = c.req.header("X-Scalev-Hmac-Sha256");
const body = await c.req.text();
if (
  !signature ||
  !(await verifyScalevWebhook(body, signature, c.env.SCALEV_SIGNING_SECRET))
) {
  return c.json({ error: "Unauthorized" }, 401);
}
```

**Event routing** (Scalev hanya mendukung 1 webhook URL):

```typescript
const payload = await c.req.json();
switch (payload.event) {
  case "order.created":
    await handleOrderCreated(payload.data, env);
    break;
  case "order.status_changed":
    if (payload.data.status === "completed") {
      await storePurchaseEvent(payload.data, env);
    }
    break;
  // ignore others
}
```

### 6.5. Cloudflare Storage — Migrasi dari cPanel MySQL

> **Keputusan arsitektur v3.1:** Database MySQL cPanel **dimigrasikan total ke Cloudflare**. Tidak ada dependency ke hosting lama.

| Data                   | Storage           | Alasan                                                                    |
| ---------------------- | ----------------- | ------------------------------------------------------------------------- |
| Latest purchase events | **Cloudflare KV** | Global edge read, eventually consistent — cocok untuk social proof ticker |
| Validation cache       | **Cloudflare KV** | TTL-based cache untuk email/WA yang sudah divalidasi                      |

> **Apakah perlu Cloudflare D1?** TIDAK — KV sudah cukup. D1 dibutuhkan jika ada relasi antar data atau query kompleks.

**KV Schema:**

```typescript
// Key: "latest_purchases"
// Value: JSON.stringify(PurchaseEvent[]) — max 5 items, FIFO
interface PurchaseEvent {
  buyerName: string; // dari webhook data.destination_address.name
  productName: string; // dari webhook data.final_variants
  timestamp: number;
  city?: string; // dari webhook data.destination_address.city
}

// Key: "email_cache:user@example.com"  — TTL 24h
// Key: "wa_cache:628123456789"         — TTL 1h
```

### 6.6. Environment Variables

| Variable                | Used In                      | Description                                        |
| ----------------------- | ---------------------------- | -------------------------------------------------- |
| `SCALEV_SIGNING_SECRET` | `routes/webhook.ts`          | Signing secret dari Scalev dashboard > Developers  |
| `FONNTE_TOKEN`          | `services/waValidator.ts`    | API token Fonnte untuk WA validation               |
| `QEV_API_KEY`           | `services/emailValidator.ts` | API key quickemailverification                     |
| `ALLOWED_ORIGINS`       | `middleware/cors.ts`         | Whitelist: `detama.id,kelasnyatama.com`            |
| `KV_PURCHASES`          | `services/purchaseStore.ts`  | Cloudflare KV namespace binding (di wrangler.toml) |

> **⚠️ Security:** Nilai aktual API keys TIDAK dicatat di sini. Gunakan `wrangler secret put` untuk values sensitif.

### 6.7. Server-Side Caching Strategy

```typescript
// services/waValidator.ts — KV cache
const cacheKey = `wa_cache:${normalizedNumber}`;
const cached = await env.KV_PURCHASES.get(cacheKey);
if (cached) return JSON.parse(cached);

const result = await callFonnte(normalizedNumber, env.FONNTE_TOKEN);
await env.KV_PURCHASES.put(cacheKey, JSON.stringify(result), {
  expirationTtl: 3600, // 1h TTL
});
return result;
```

---

## 7. Custom Head Scripts (Final)

### 7.1. Parent Window (`detama.id/checkout`)

```html
<!-- Google Fonts -->
<script>
  (function () {
    var l = document.createElement("link");
    l.href =
      "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap";
    l.rel = "stylesheet";
    l.as = "style";
    document.head.appendChild(l);
  })();
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

### 7.2. Scalev Checkout Form (Iframe — `kelasnyatama.com`)

```html
<!-- Google Fonts -->
<script>
  (function () {
    var l = document.createElement("link");
    l.href =
      "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap";
    l.rel = "stylesheet";
    l.as = "style";
    document.head.appendChild(l);
  })();
</script>

<!-- Iframe Checkout Bundle (CSS injection + validators included) -->
<script src="https://assets.detama.id/checkout-page.js" defer></script>
```

### 7.3. Landing Pages (SkillForge & ScaleMarket)

```html
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
```

---

## 8. Data Model

```typescript
// frontend/src/types/index.ts

export interface Product {
  id: string; // Scalev product ID
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  description: string;
  features: string[];
  image?: string;
  variantSKU: string; // Scalev variant unique ID for checkout URL
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

## 9. Implementation Plan (Phased)

### Phase 1 — Foundation ✅ (Done)

- [x] Monorepo setup (npm workspaces)
- [x] TypeScript interfaces di `types/index.ts`
- [x] PostMessage protocol di `shared/types/messages.ts`
- [x] Astro + Tailwind configured
- [x] Starter `checkout-iframe.css`
- [ ] `data/products.ts` SSOT catalog ← belum diisi data produk

### Phase 2a — Checkout Iframe Scripts

> **Goal:** `checkout-page.js` IIFE bundle — identik behavioral dengan CDN lama

- [ ] `constants.ts`
- [ ] `scrapers/` (Cart, Totals, Payment, Form)
- [ ] `actions/` (DiscountApplier, SubmitHandler, PaymentSelector)
- [ ] `validators/ValidatorWA.ts` (debounce 1000ms, Fonnte via api.detama.id)
- [ ] `validators/ValidatorEmail.ts` (debounce 1200ms, QEV via api.detama.id)
- [ ] `bridge/IframeBridge.ts`
- [ ] `CheckoutPage.ts` orchestrator + `injectStyles()`
- [ ] Complete `styles/checkout-iframe.css`
- [ ] `vite.checkout.config.ts`
- [ ] **Verification:** single IIFE, zero `import()`, zero TS errors

### Phase 2b — Checkout Parent Window

> **Goal:** `checkout-parent.js` + `checkout/index.html` — identik dengan CDN lama

- [ ] `bridge/ParentBridge.ts`
- [ ] `managers/` (URLParser, IframeManager, AutofillManager, CSModeManager)
- [ ] `ui/` (CartRenderer, TotalsRenderer, PaymentModal, VoucherManager, ToastManager)
- [ ] `parent/CheckoutParent.ts` orchestrator
- [ ] `pages/checkout/index.astro`
- [ ] `styles/checkout-parent.css`
- [ ] `vite.parent.config.ts`

### Phase 3 — API Worker

> **Goal:** Ganti semua PHP endpoint + mysql cPanel dengan Cloudflare Worker

- [ ] Hono.js + Wrangler setup di `api-worker/`
- [ ] CORS middleware (whitelist: detama.id, kelasnyatama.com)
- [ ] `POST /api/validate/email` → proxy ke quickemailverification + KV cache (24h TTL)
- [ ] `POST /api/validate/wa` → normalize number + proxy ke Fonnte + KV cache (1h TTL)
- [ ] `POST /webhook/scalev` → HMAC-SHA256 verify + event routing + KV store
- [ ] `GET /api/latest-purchases` → return KV latest 5 purchases
- [ ] Unit tests (Vitest) — gunakan QEV sandbox emails untuk email tests
- [ ] **Setup Cloudflare:** `wrangler login` → create Worker → bind KV namespace
- [ ] **Set secrets:** `wrangler secret put FONNTE_TOKEN`, `wrangler secret put QEV_API_KEY`, `wrangler secret put SCALEV_SIGNING_SECRET`
- [ ] Deploy ke `api.detama.id`

### Phase 4 — Landing Page Components

> **Goal:** Rebuild SkillForge & ScaleMarket sebagai Astro components

- [ ] `layouts/FragmentLayout.astro` (no doctype output)
- [ ] `layouts/CheckoutLayout.astro`
- [ ] `components/shared/GlobalHead.astro`, `GlobalScripts.astro`
- [ ] `components/landing/Hero.astro`, `ProductCard.astro`, `PricingSection.astro`
- [ ] `components/landing/Testimonials.astro`, `FAQ.astro`, `Footer.astro`
- [ ] `components/landing/PurchaseTicker.astro`
- [ ] `data/products.ts` SSOT (SkillForge + ScaleMarket)
- [ ] `pages/skillforge/index.astro`
- [ ] `pages/scalemarket/index.astro`

### Phase 5 — Integration & Deployment

- [ ] E2E checkout flow test
- [ ] Lighthouse audit > 90 mobile
- [ ] CI/CD: GitHub Actions (Astro build → Cloudflare Pages, Wrangler deploy)
- [ ] Update Scalev Custom Head Scripts (`cdn.detama.id` → `assets.detama.id`)
- [ ] Validate webhook live di Scalev dashboard

---

## 10. Risk Registry

| Risk                               | Likelihood | Impact | Mitigation                                         |
| ---------------------------------- | ---------- | ------ | -------------------------------------------------- |
| Scalev ubah CSS class names        | Medium     | High   | Centralkan di `constants.ts`; update 1 file        |
| Payment scraping timeout           | Medium     | High   | Polling 25×200ms = 5s max                          |
| postMessage origin spoofing        | Low        | High   | Strict `ALLOWED_ORIGINS` check                     |
| Vite IIFE lazy chunk split         | Low        | High   | `inlineDynamicImports: true`                       |
| Fonnte down                        | Medium     | Medium | Failsafe: skip WA validation, allow submit         |
| quickemailverification down        | Low        | Medium | Failsafe: return `failsafe` category, allow submit |
| Scalev webhook signature invalid   | Low        | High   | Test dulu dengan `business.test_event` di setup    |
| KV eventually consistent           | Low        | Low    | Social proof tidak butuh strong consistency        |
| Discount auto-apply race condition | High       | Medium | Debounce 1000ms + dispatch `input` event           |
| CSS CSP conflict di Scalev         | Low        | Medium | Fallback ke inline `style` attribute               |

---

## 11. Rollback Strategy

1. Kembalikan Scalev Custom Head Script ke URL lama (`cdn.detama.id`)
2. File legacy tidak dihapus — tetap di CDN lama sebagai backup
3. Zero database migration rollback — KV hanya append, tidak replace MySQL
4. Rollback = swap URL satu baris di Scalev dashboard

---

## 12. Definition of Done

- [ ] Semua legacy files berhasil di-port ke TypeScript (zero behavior regression)
- [ ] `checkout-page.js` — single IIFE bundle, zero `import()`, zero TS errors
- [ ] `checkout-parent.js` — single IIFE bundle, zero TS errors
- [ ] Checkout E2E: cart, totals, payment, voucher, WA validation, email validation, submit ✓
- [ ] Dark mode sync parent ↔ iframe ✓
- [ ] Toast notifications ✓
- [ ] API Worker deployed di `api.detama.id`, semua route berfungsi ✓
- [ ] Webhook HMAC verified sukses dari Scalev dashboard ✓
- [ ] SkillForge & ScaleMarket pages build berhasil sebagai HTML fragment ✓
- [ ] Lighthouse > 90 mobile ✓
- [ ] CI/CD pipeline aktif ✓

---

## 13. Open Questions / Blockers

| #   | Pertanyaan                                              | Status                                                              |
| --- | ------------------------------------------------------- | ------------------------------------------------------------------- |
| 1   | WhatsApp API — Fonnte `FONNTE_TOKEN`                    | ✅ Resolved — token tersedia                                        |
| 2   | Email validation — quickemailverification `QEV_API_KEY` | ✅ Resolved — key tersedia, sandbox siap dipakai                    |
| 3   | Scalev webhook — support custom header?                 | ✅ Resolved: pakai HMAC-SHA256, bukan custom header                 |
| 4   | Webhook — pakai webhook atau API Scalev?                | ✅ Resolved: pakai webhook + event routing                          |
| 5   | Cloudflare account access                               | ✅ `wrangler login` sudah dijalankan                                |
| 6   | Scalev `SIGNING_SECRET` — di mana ditemukan?            | ⏳ Perlu cek di Scalev dashboard > Settings > Developers > Webhooks |
| 7   | Subdomain `assets.detama.id`                            | ⏳ Perlu setup di Cloudflare dashboard                              |

---

_PRD ini adalah single source of truth. Update selalu di file ini, bukan di AI chat context._
