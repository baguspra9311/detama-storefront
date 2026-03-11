# ScaleMarket — Deployment ke Scalev Builder

Panduan ini berisi langkah-langkah untuk melakukan migrasi halaman ScaleMarket ke Arsitektur Hybrid terbaru dengan strategi **Full Inline (CSS & JS)**.

## 1. Mirroring Assets (Opsional)

Meskipun halaman akhir menggunakan metode inlining, file terpisah tetap dihasilkan untuk kemudahan pengembangan:

- File lokal: `pages/scalemarket/scalemarket.css`
- File lokal: `pages/scalemarket/scalemarket-app.js`

File ini mencerminkan apa yang ada di dalam `index.html`. Jika Anda ingin melakukan integrasi CDN di masa depan, Anda bisa meng-upload file ini ke `assets.detama.id`.

## 2. Custom Head Script (Scalev Builder)

Pada halaman ScaleMarket di Scalev Builder, paste skrip berikut ke dalam bagian **Custom Head Script**. Skrip ini menangani viewport agar responsif di semua perangkat:

```html
<script>!function(){var e=document.querySelector("meta[name=viewport]");e&&e.remove();var a=document.createElement("meta");a.name="viewport",a.content="width=device-width, initial-scale=1.0, maximum-scale=2, user-scalable=yes",document.head.appendChild(a)}();</script>
```

> **Catatan:** Logika Anti-Inspect (Klik Kanan & F12 Disable) sudah terintegrasi langsung di dalam `index.html` (di bagian bawah), jadi tidak perlu ditambahkan lagi di Custom Head Script kecuali jika ingin diterapkan secara global di level domain.

## 3. HTML Component (Scalev Builder)

Buka file `pages/scalemarket/index.html` dan **Copy** seluruh isinya. Isinya sudah mencakup:
1.  **Critical Styles (Top):** CSS internal + CDN CSS yang sudah di-inline.
2.  **Modular Body (Middle):** Struktur HTML utama termasuk canvas untuk animasi.
3.  **App Logic (Bottom):** Anti-inspect + Logika aplikasi (Canvas, Nebula, Aurora, Cart, Voucher) yang sudah di-inline.

**Paste** isi HTML tersebut ke dalam widget **Custom HTML Component** pada halaman Scalev Builder Anda.

## 4. Verifikasi Akhir

1.  Buka preview halaman di Scalev Builder.
2.  **Visual Test:** Pastikan animasi **Plexus Canvas**, **Nebula**, dan **Starfield** berjalan lancar.
3.  **Logic Test:** Buka Modul Produk, coba tambahkan ke Cart, dan tes fitur tema (Light/Dark mode).
4.  **Performance Test:** Cek PageSpeed Insights. Target skor Performa adalah **100** karena tidak ada request aset CSS/JS eksternal yang menghambat rendering awal.
5.  **Security Test:** Coba klik kanan — seharusnya terblokir oleh script anti-inspect yang menyatu di dalam HTML.

Setelah verifikasi sukses, halaman siap dipublikasikan (Publish)!
