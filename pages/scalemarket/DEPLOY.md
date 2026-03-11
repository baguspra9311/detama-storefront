# ScaleMarket — Deployment ke Scalev Builder

Panduan ini berisi langkah-langkah untuk melakukan migrasi halaman ScaleMarket ke Arsitektur Hybrid terbaru dengan strategi **Full Inline (CSS & JS)**.

## 1. Mirroring Assets (Opsional)

Meskipun halaman akhir menggunakan metode inlining, file terpisah tetap dihasilkan untuk kemudahan pengembangan:

- File lokal: `pages/scalemarket/scalemarket.css`
- File lokal: `pages/scalemarket/scalemarket-app.js`

File ini mencerminkan apa yang ada di dalam `index.html`. Jika Anda ingin melakukan integrasi CDN di masa depan, Anda bisa meng-upload file ini ke `assets.detama.id`.

## 2. Custom Head Script (Scalev Builder)

Pada halaman ScaleMarket di Scalev Builder (slug: `scalemarket2`), paste isi dari file **`pages/globals/head-scripts.html`** ke dalam bagian **Custom Head Script**.

File ini berisi skrip global (Viewport Override & Anti-Debug) yang digunakan di **semua** halaman landing DeTama. Jangan menambahkan skrip anti-inspect secara inline di HTML component.

> **Catatan:** Jika isi `head-scripts.html` diperbarui, **semua halaman** yang menggunakannya di Scalev Builder harus ikut diperbarui.

## 3. HTML Component (Scalev Builder)

Buka file `pages/scalemarket/index.html` dan **Copy** seluruh isinya. Isinya sudah mencakup:
1.  **Critical Styles (Top):** CSS internal + CDN CSS yang sudah di-inline.
2.  **Modular Body (Middle):** Struktur HTML utama termasuk canvas untuk animasi.
3.  **App Logic (Bottom):** Logika aplikasi (Canvas, Nebula, Aurora, Cart, Voucher) yang sudah di-inline.

**Paste** isi HTML tersebut ke dalam widget **Custom HTML Component** pada halaman Scalev Builder Anda.

## 4. Verifikasi Akhir

1.  Buka preview halaman di Scalev Builder.
2.  **Visual Test:** Pastikan animasi **Plexus Canvas**, **Nebula**, dan **Starfield** berjalan lancar.
3.  **Logic Test:** Buka Modul Produk, coba tambahkan ke Cart, dan tes fitur tema (Light/Dark mode).
4.  **Performance Test:** Cek PageSpeed Insights. Target skor Performa adalah **100** karena tidak ada request aset CSS/JS eksternal.
5.  **Security Test:** Coba klik kanan atau tekan `F12` — Global Head Script seharusnya memblokir inspeksi.

Setelah verifikasi sukses, halaman siap dipublikasikan (Publish)!
