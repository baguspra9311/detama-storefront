# SkillForge — Deployment ke Scalev Builder (v2)

Panduan ini berisi langkah-langkah untuk melakukan migrasi halaman SkillForge ke Arsitektur Hybrid terbaru, dengan menggunakan aset CDN dan script anti-debug global.

## 1. Upload Aset ke assets.detama.id

Upload hasil ekstraksi berikut ke Cloudflare Pages project `assets.detama.id` (di dalam subfolder `skillforge/` jika Anda menggunakan struktur folder):

- File lokal: `pages/skillforge/skillforge.css` → URL Target: `https://assets.detama.id/skillforge/skillforge.css`
- File lokal: `pages/skillforge/skillforge-app.js` → URL Target: `https://assets.detama.id/skillforge/skillforge-app.js`

## 2. Custom Head Script (Scalev Builder)

Pada halaman SkillForge di Scalev Builder (slug: `skillforge2`), paste isi dari file **`pages/globals/head-scripts.html`** ke dalam bagian **Custom Head Script**.

File ini berisi skrip global (Viewport Override & Anti-Debug) yang digunakan di **semua** halaman landing DeTama. Jangan menambahkan skrip anti-inspect secara inline di HTML component.

> **Catatan:** Jika isi `head-scripts.html` diperbarui, **semua halaman** yang menggunakannya di Scalev Builder harus ikut diperbarui.

## 3. HTML Component (Scalev Builder)

Buka file `pages/skillforge/index.html` dan **Copy** seluruh isinya.
**Paste** isi HTML tersebut ke dalam widget **Custom HTML Component** pada halaman Scalev Builder Anda. 

Struktur HTML ini kini sudah memuat **Full Inline (CSS & JS)** secara langsung di baris teratas. Strategi ini meniru halaman eksisting untuk mendapatkan **Score Performa 99** dan menghilangkan FOUC secara total karena tidak ada request jaringan eksternal (CDN) untuk pemuatan awal. Gaya dan interaktivitas sudah menyatu dalam satu file HTML.

## 4. Verifikasi Akhir

1. Publish perubahan pada halaman `skillforge2`.
2. Buka `https://detama.id/skillforge2` di browser.
3. Lakukan verifikasi visual: margin, padding, typography, button, dan gambar harus sama persis dengan `https://detama.id/skillforge`.
4. Test interaksi Cart/Drawer (`Draft Akuisisi`), lightbox modul, akordion FAQ, dsb.
5. Coba lakukan klik kanan atau tekan `F12` — Global Head Scripts seharusnya secara aktif memblokir inspeksi tersebut.
6. Bila semua lancar 100%, halaman rilis final sudah direkonstruksi utuh. Anda tinggal mengatur swap slug nantinya!
