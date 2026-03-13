# Checkout (Parent) — Deployment ke Scalev Builder

Panduan ini berisi langkah-langkah untuk melakukan migrasi halaman Checkout (Parent) ke Arsitektur Hybrid terbaru (v4).

## 1. Upload Assets (CDN)
Skrip aplikasi Checkout Parent dan Checkout Child (Iframe) dide-deploy ke Scalev melalui CDN (`assets.detama.id`). 
Proses **push ke repository ini (branch master)** akan secara otomatis me-deploy scripts berikut ke Cloudflare Pages (yang me-routing `assets.detama.id`):
- `https://assets.detama.id/checkout/checkout-parent.js`
- `https://assets.detama.id/checkout/checkout-child.js`
- `https://assets.detama.id/checkout/checkout-child.css`

## 2. Custom Head Script (Scalev Builder)

Pada halaman Checkout di Scalev Builder (contoh slug: `checkout`), paste seluruh isi dari file **`pages/globals/head-scripts.html`** ke dalam bagian **Custom Head Script**.

**Penting:** Custom head script hanya digunakan untuk **Viewport Override & Anti-Debug**. Jangan menambahkan skrip spesifik komponen atau inisiasi checkout ke sini agar tidak rancu dengan global head logic.

## 3. HTML Component (Scalev Builder)

Buka file `pages/checkout/index.html` dan **Copy** seluruh isinya.
Isinya mencakup:
1.  **Critical Styles (Top):** CSS internal untuk styling kerangka parent.
2.  **HTML Structure (Middle):** Struktur DOM container untuk cart dan iframe parent.
3.  **UI Script (Bottom):** Script layout/interaction UI (inline).
4.  **Backend Script Binding (Bottom-most):** Pemanggilan modul CDN `<script src="https://assets.detama.id/checkout/checkout-parent.js"></script>`

**Paste** isi HTML tersebut ke dalam widget **Custom HTML Component** pada halaman Scalev Builder Anda.

## 4. Konfigurasi Iframe Child

Untuk halaman Child (kelasnyatama.com/checkout):
1. **HTML Component:** Tambahkan `<script src="https://assets.detama.id/checkout/checkout-child.js"></script>` dan load CSS `https://assets.detama.id/checkout/checkout-child.css` di parent DOM atau di dalam HTML Component.
2. Halaman ini akan di-load di dalam iframe milik Parent Checkout, dan kedua script tersebut akan menangani "postMessage" communication dua arah secara otomatis.

## 5. Verifikasi Akhir

1. Buka halaman parent Checkout di perangkat asli.
2. Pastikan Cart loading tidak terjadi **FOUC** (Flash of Unstyled Content).
3. Verifikasi interaksi komunikasi postMessage: Pilih kurir, voucher, dll; total biaya di Parent harus ter-update real-time merespons Child iframe.
4. **Security Test:** Coba klik kanan atau tekan `F12` — Global Head Script seharusnya memblokir inspeksi.
