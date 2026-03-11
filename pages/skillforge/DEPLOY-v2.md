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

<!-- PAGE-SPECIFIC ASSETS (Fonts, CSS, JS) -->
<!-- Google Fonts (Manrope + Playfair Display) -->
<script>
  (function() {
    var fontLink = document.createElement('link');
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600&display=swap';
    fontLink.rel = 'stylesheet';
    fontLink.as = 'style';
    document.head.appendChild(fontLink);
  })();
</script>

<!-- CSS via fetch+inject -->
<script>
  fetch('https://assets.detama.id/skillforge/skillforge.css')
    .then(r => r.text())
    .then(css => {
      var style = document.createElement('style');
      style.innerHTML = css;
      document.head.appendChild(style);
    });
</script>

<!-- App JS Loader -->
<script src="https://assets.detama.id/skillforge/skillforge-app.js" defer></script>
```

> **Catatan:** Semua diletakkan di dalam tag `<script>` sesuai aturan *custom head* dari Scalev.

## 3. HTML Component (Scalev Builder)

Buka file `pages/skillforge/index.html` dan **Copy** seluruh isinya.
**Paste** isi HTML tersebut ke dalam widget **Custom HTML Component** pada halaman Scalev Builder Anda. Struktur HTML ini sudah bersih dari inline logic Javascript dan tag referensi `<style>` eksternal.

## 4. Verifikasi Akhir

1. Publish perubahan pada halaman `skillforge2`.
2. Buka `https://detama.id/skillforge2` di browser.
3. Lakukan verifikasi visual: margin, padding, typography, button, dan gambar harus sama persis dengan `https://detama.id/skillforge`.
4. Test interaksi Cart/Drawer (`Draft Akuisisi`), lightbox modul, akordion FAQ, dsb.
5. Coba lakukan klik kanan atau tekan `F12` — Global Head Scripts seharusnya secara aktif memblokir inspeksi tersebut.
6. Bila semua lancar 100%, halaman rilis final sudah direkonstruksi utuh. Anda tinggal mengatur swap slug nantinya!
