# SkillForge — Deployment ke Scalev Builder (v2)

Panduan ini berisi langkah-langkah untuk melakukan migrasi halaman SkillForge ke Arsitektur Hybrid terbaru, dengan menggunakan aset CDN dan script anti-debug global.

## 1. Upload Aset ke assets.detama.id

Upload hasil ekstraksi berikut ke Cloudflare Pages project `assets.detama.id` (di dalam subfolder `skillforge/` jika Anda menggunakan struktur folder):

- File lokal: `pages/skillforge/skillforge.css` → URL Target: `https://assets.detama.id/skillforge/skillforge.css`
- File lokal: `pages/skillforge/skillforge-app.js` → URL Target: `https://assets.detama.id/skillforge/skillforge-app.js`

## 2. Custom Head Script (Scalev Builder)

Pada halaman SkillForge di Scalev Builder (slug: `skillforge2`), paste skrip berikut ke dalam bagian **Custom Head Script**:

```html
<!-- GLOBAL SCRIPTS (Viewport & Anti-Debug) -->
<script>!function(){var e=document.querySelector("meta[name=viewport]");e&&e.remove();var a=document.createElement("meta");a.name="viewport",a.content="width=device-width, initial-scale=1.0, maximum-scale=2, user-scalable=yes",document.head.appendChild(a)}();</script>
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

> **Catatan:** Semua diletakkan di dalam tag `<script>` sesuai aturan *custom head* dari Scalev.

## 3. HTML Component (Scalev Builder)

Buka file `pages/skillforge/index.html` dan **Copy** seluruh isinya.
**Paste** isi HTML tersebut ke dalam widget **Custom HTML Component** pada halaman Scalev Builder Anda. 

Struktur HTML ini kini sudah memuat **Inline CSS** (tag `<style>`) secara langsung di baris teratas. Strategi ini meniru halaman eksisting untuk mendapatkan **Score Performa 99** dan menghilangkan FOUC secara total karena tidak ada request jaringan eksternal untuk pemuatan gaya awal.

## 4. Verifikasi Akhir

1. Publish perubahan pada halaman `skillforge2`.
2. Buka `https://detama.id/skillforge2` di browser.
3. Lakukan verifikasi visual: margin, padding, typography, button, dan gambar harus sama persis dengan `https://detama.id/skillforge`.
4. Test interaksi Cart/Drawer (`Draft Akuisisi`), lightbox modul, akordion FAQ, dsb.
5. Coba lakukan klik kanan atau tekan `F12` — Global Head Scripts seharusnya secara aktif memblokir inspeksi tersebut.
6. Bila semua lancar 100%, halaman rilis final sudah direkonstruksi utuh. Anda tinggal mengatur swap slug nantinya!
