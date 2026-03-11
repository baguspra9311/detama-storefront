(() => {

/* --- THE LIVING ARCHIVE LOGIC --- */

    // Database Copywriting "Museum/Arsip"
    const logData = [
        // Kategori: Aktivitas Pembelian (Social Proof)
        "Arsip #882: Budi S. resmi memulai studi Office.",
        "Koleksi Baru: Citra M. mengambil Bundle Aset.",
        "Akses Diberikan: Member #1094 masuk Ruang Kelas.",
        "Transaksi: Hendra K. mengamankan harga promo.",
        "Jurnal Masuk: 1 Anggota baru di Ruang Bisnis.",
        "Arsip #901: Putri Z. mengamankan akses Lifetime.",
        "Checkout: Paket SkillPedia Elite diambil oleh Rian D.",
        "Nota #221: Pembayaran terverifikasi otomatis.",

        // Kategori: Aktivitas Belajar (Active Community)
        "Catatan: Fajar N. sedang mempelajari Modul Excel.",
        "Status: Dewi L. berhasil lolos post-test.",
        "Sertifikat: 1 Dokumen kompetensi baru saja terbit.",
        "Aktivitas: 45 user sedang online di Dashboard.",
        "Progres: Modul CapCut selesai dipelajari Member T.",
        "Unduhan: Ebook Bonus diakses oleh 12 member.",

        // Kategori: Kelangkaan & Sistem (Urgency & Trust)
        "Info: Slot promo tersisa terbatas hari ini.",
        "Sistem: Server stabil. Kecepatan akses optimal.",
        "Update: Materi baru ditambahkan ke database.",
        "Validasi: Data kelulusan sinkron dengan LKP.",
        "Traffic: Kunjungan meningkat di halaman Bundle.",
        "Notifikasi: Admin menyetujui validasi berkas."
    ];

    // Fungsi Efek Mengetik (Typewriter)
    function typeWriter(text, element, speed = 40) {
        let i = 0;
        element.innerHTML = "";

        function type() {
            if (i < text.length) {
                element.innerHTML += text.charAt(i);
                i++;
                setTimeout(type, speed);
            }
        }
        type();
    }

    function triggerLog() {
        const container = document.getElementById('ethereal-log');
        const textEl = document.getElementById('log-text');

        if (!container || !textEl) return;

        // 1. Pilih Pesan Acak
        const message = logData[Math.floor(Math.random() * logData.length)];
        const time = new Date().toLocaleTimeString('id-ID', {
            hour: "2-digit",
            minute: "2-digit"
        });

        // Format: [14:05] Pesan...
        const fullText = `[${time}] ${message}`;

        // 2. Munculkan Container
        container.classList.add('active');

        // 3. Jalankan Efek Ketik
        // Delay sedikit (300ms) agar animasi CSS slide-in selesai dulu baru ngetik
        setTimeout(() => {
            typeWriter(fullText, textEl, 30);
        }, 300);

        // 4. Hilangkan setelah 6 detik
        setTimeout(() => {
            container.classList.remove('active');
        }, 6000);
    }

    // JALANKAN LOG
    document.addEventListener('DOMContentLoaded', () => {
        // Muncul pertama kali agak cepat
        setTimeout(triggerLog, 2500);

        // Interval acak (15 - 30 detik)
        setInterval(() => {
            if (Math.random() > 0.3) triggerLog();
        }, 20000);
    });

    // --- UTILITIES ---
    function switchPanel(panelId, btnElement) {
        document.querySelectorAll('.split-btn').forEach(el => el.classList.remove('active'));
        document.querySelectorAll('.split-panel').forEach(el => {
            el.classList.remove('active');
            el.style.display = 'none';
        });
        btnElement.classList.add('active');
        const targetPanel = document.getElementById(panelId);
        if (targetPanel) {
            targetPanel.style.display = 'block';
            setTimeout(() => targetPanel.classList.add('active'), 10);
        }
    }

    /* --- FINAL FIXED LIGHTBOX LOGIC --- */

    function openLightbox(source, type = 'image') {
        const lightbox = document.getElementById('sf-lightbox');
        const imgEl = document.getElementById('lightbox-img');
        const vidWrapper = document.getElementById('lightbox-video-wrapper');
        const iframe = document.getElementById('lightbox-iframe');

        if (!lightbox) return;

        // Reset Display
        imgEl.style.display = 'none';
        vidWrapper.style.display = 'none';
        iframe.src = ''; // Stop video lama

        if (type === 'video') {
            // LOGIC BARU: Auto-Convert YouTube Link ke Format Embed
            let videoSrc = source;

            // Cek apakah ini link YouTube
            if (source.includes('youtube.com') || source.includes('youtu.be')) {
                let videoId = '';

                // Pola 1: youtu.be/ID
                if (source.includes('youtu.be/')) {
                    videoId = source.split('youtu.be/')[1].split('?')[0];
                }
                // Pola 2: youtube.com/watch?v=ID
                else if (source.includes('v=')) {
                    videoId = source.split('v=')[1].split('&')[0];
                }
                // Pola 3: youtube.com/embed/ID (Sudah benar)
                else if (source.includes('embed/')) {
                    videoId = source.split('embed/')[1].split('?')[0];
                }

                // Jika Video ID ditemukan, susun ulang jadi link Embed yang valid
                if (videoId) {
                    videoSrc = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
                }
            }

            iframe.src = videoSrc;
            vidWrapper.style.display = 'block';
        } else {
            // Mode Image
            imgEl.src = source;
            imgEl.style.display = 'block';
        }

        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        const lightbox = document.getElementById('sf-lightbox');
        const iframe = document.getElementById('lightbox-iframe');
        if (lightbox) {
            lightbox.classList.remove('active');
            setTimeout(() => {
                iframe.src = ''; // Matikan suara video saat tutup
            }, 300);
            document.body.style.overflow = '';
        }
    }

    // Handle klik background untuk tutup
    function handleLightboxClick(e) {
        if (e.target.id === 'sf-lightbox') {
            closeLightbox();
        }
    }

    // --- CORE APPLICATION ---
    const app = {
        products: [],
        bundles: [],
        cartData: {},

        // CONFIG
        CDN_URL: 'https://cdn.detama.id/product.json',
        STORAGE_KEY: 'universalCart_v1',
        CHECKOUT_KEY: 'checkoutItems_v1',
        CHECKOUT_URL: 'https://detama.id/checkout',
        STORE_NAME: 'SkillForge',
        STORE_ICON: 'https://cdn.scalev.id/uploads/1764246194/VkCrrtqFMmlfE4bjNWxZ0g/1764246182912-favicon.png',

        init: async function() {
            // [PHASE 3 FIX] Force Theme Light untuk konsistensi Checkout Page
            localStorage.setItem('theme', 'light');
            document.documentElement.setAttribute('data-theme', 'light');

            console.log("🚀 SkillForge App Ready.");

            this.setupEventListeners();
            await this.loadProductData();
            this.loadCart();
            this.renderCartUI();
        },

        setupEventListeners: function() {
            // 1. Overlay Cart
            const overlay = document.getElementById('sideCartOverlay');
            if (overlay) {
                overlay.addEventListener('click', (e) => {
                    if (e.target === overlay) this.closeCart();
                });
            }

            // 2. Header Cart Button
            const headerCartBtn = document.querySelector('.sf-header .sf-btn-outline');
            if (headerCartBtn) {
                headerCartBtn.onclick = null;
                headerCartBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.openCart();
                });
            }

            // [BARU] Scroll Listener untuk Header
            const header = document.querySelector('.sf-header');
            const handleScroll = () => {
                if (window.scrollY > 50) {
                    header.classList.add('scrolled');
                } else {
                    header.classList.remove('scrolled');
                }
            };

            // Pasang listener
            window.addEventListener('scroll', handleScroll);
            // Panggil sekali saat init (jika user refresh di tengah halaman)
            handleScroll();


            // 3. Storage Sync (Multi-tab support)
            window.addEventListener('storage', () => {
                this.loadCart();
                this.renderCartUI();
                if (document.getElementById('sideCartOverlay').classList.contains('visible')) {
                    this.renderSideCartItems();
                }
            });
        },

        // --- DATA FETCHING ---
        loadProductData: async function() {
            try {
                const response = await fetch(this.CDN_URL);
                if (!response.ok) throw new Error("Gagal fetch CDN");
                const data = await response.json();

                if (data.skillforge) {
                    this.products = data.skillforge.products || [];
                    this.bundles = data.skillforge.bundles || [];
                    this.bindProductButtons();
                }
            } catch (error) {
                console.error("Error loading data:", error);
            }
        },

        bindProductButtons: function() {
            const bind = (prodId, btnId, isDirect = false) => {
                const product = this.products.find(p => p.id === prodId) || this.bundles.find(b => b.id === prodId);
                const btn = document.getElementById(btnId);

                if (product && btn) {
                    // Update Harga UI
                    const priceTag = btn.parentElement.querySelector('.price-amount');
                    if (priceTag) priceTag.innerText = this.formatRupiah(product.price);

                    // Update Coretan Bundle
                    if (isDirect) {
                        const totalSatuan = this.products.reduce((acc, curr) => acc + curr.price, 0);
                        const crossTag = btn.parentElement.querySelector('.price-crossed');
                        if (crossTag) crossTag.innerText = this.formatRupiah(totalSatuan);
                    }

                    // Bind Click
                    btn.onclick = (e) => {
                        e.preventDefault();
                        if (isDirect) {
                            this.buyDirect(product);
                        } else {
                            this.addToCart(product);
                        }
                    };
                }
            };

            bind('kelas-office-pro', 'btn-pricing-office');
            bind('skillpedia-elite', 'btn-pricing-skillpedia');
            bind('26356', 'btn-pricing-bundle', true);
        },

        // --- LOGIC HELPER ---
        createItemObject: function(product) {
            let variantId, variantName, price, sku;

            if (product.isBundle) {
                variantId = product.id;
                variantName = (product.variants && product.variants[0]) ? product.variants[0].name : "Bundle Package";
                price = product.price;
                sku = product.sku;
            } else {
                const variant = product.variants[0];
                variantId = variant.id;
                variantName = variant.name;
                price = variant.price;
                sku = variant.sku;
            }

            return {
                productId: product.id,
                variantId: variantId,
                name: product.name,
                variantName: variantName,
                price: price,
                image: product.image,
                sku: sku,
                isBundle: product.isBundle || false,
                storeName: this.STORE_NAME
            };
        },

        // --- TRANSAKSI ---
        buyDirect: function(product) {
            // Payload mapping sesuai standar ScaleMarket
            const itemForCheckout = {
                variantId: product.id,
                sku: product.sku,
                productName: product.name,
                variantName: (product.variants && product.variants[0]) ? product.variants[0].name : "Bundle Package",
                price: product.price,
                productImage: product.image,
                isBundle: true,
                productId: product.id,
                storeName: this.STORE_NAME,
                storeIcon: this.STORE_ICON
            };

            const checkoutPayload = {
                [this.STORE_NAME]: {
                    icon: this.STORE_ICON,
                    items: [itemForCheckout]
                }
            };

            localStorage.setItem(this.CHECKOUT_KEY, JSON.stringify(checkoutPayload));
            window.location.href = this.CHECKOUT_URL;
        },

        addToCart: function(product) {
            const item = this.createItemObject(product);
            this.loadCart();
            let fullData = this.cartData;

            if (!fullData[this.STORE_NAME]) {
                fullData[this.STORE_NAME] = {
                    icon: this.STORE_ICON,
                    items: []
                };
            }

            const existing = fullData[this.STORE_NAME].items.find(i => i.variantId === item.variantId);
            if (!existing) {
                fullData[this.STORE_NAME].items.push(item);
                this.saveCart(fullData);
            }
            this.openCart();
        },

        removeFromCart: function(storeName, variantId) {
            this.loadCart();
            let fullData = this.cartData;

            if (fullData[storeName]) {
                fullData[storeName].items = fullData[storeName].items.filter(i => i.variantId !== variantId);
                if (fullData[storeName].items.length === 0) delete fullData[storeName];
                this.saveCart(fullData);
                this.renderSideCartItems();
            }
        },

        // --- STORAGE & UI ---
        loadCart: function() {
            const raw = localStorage.getItem(this.STORAGE_KEY);
            this.cartData = raw ? JSON.parse(raw) : {};
        },

        saveCart: function(data) {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
            this.cartData = data;
            this.renderCartUI();
            this.renderSideCartItems();
        },

        renderSideCartItems: function() {
            const container = document.querySelector('.side-cart-body');
            const subtotalEl = document.getElementById('cartSubtotal');
            const checkoutBtn = document.getElementById('checkoutBtn');
            if (!container) return;

            const storeKeys = Object.keys(this.cartData);
            if (storeKeys.length === 0) {
                this.renderEmptyState(container, subtotalEl, checkoutBtn);
                return;
            }

            let html = '';
            let globalTotal = 0;

            // URL Logo Default (Sesuai request Anda)
            const DEFAULT_ICON = 'https://cdn.scalev.id/uploads/1764246194/VkCrrtqFMmlfE4bjNWxZ0g/1764246182912-favicon.png';

            storeKeys.forEach(storeName => {
                const store = this.cartData[storeName];

                // LOGIKA IKON: Gunakan icon dari data, jika kosong gunakan DEFAULT_ICON
                const storeIcon = store.icon ? store.icon : DEFAULT_ICON;

                if (store.items.length > 0) {
                    html += `
                <div class="cart-store-group">
                    <div class="cart-store-header">
                        <div style="display:flex; align-items:center; gap:10px;">
                             <img src="${storeIcon}" style="width:20px; height:20px; object-fit:contain; border-radius:4px;">
                             <span style="font-weight:700; color:var(--brand-navy);">KOLEKSI DARI: ${storeName.toUpperCase()}</span>
                        </div>
                    </div>`;

                    store.items.forEach(item => {
                        globalTotal += item.price;
                        const displayName = item.name || item.productName || 'Produk';
                        const displayVariant = item.variantName || 'Single Item';
                        const displayImage = item.image || item.productImage;

                        html += `
                    <div class="cart-item">
                        <img src="${displayImage}" class="cart-item-image">
                        <div class="cart-item-details">
                            <div class="cart-item-name">${displayName}</div>
                            <div class="cart-item-variant">${displayVariant}</div>
                            <div class="cart-item-price">${this.formatRupiah(item.price)}</div>
                        </div>
                        <button class="cart-item-remove" onclick="app.removeFromCart('${storeName}', '${item.variantId}')" title="Hapus dari daftar">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    </div>`;
                    });
                    html += `</div>`;
                }
            });

            container.innerHTML = html;
            if (subtotalEl) subtotalEl.innerText = this.formatRupiah(globalTotal);
            if (checkoutBtn) {
                checkoutBtn.classList.remove('disabled');
                checkoutBtn.innerText = "SELESAIKAN AKUISISI"; // Update teks tombol
            }
        },

        renderEmptyState: function(container, subtotalEl, checkoutBtn) {
            // HTML Baru: The Empty Vault Concept
            container.innerHTML = `
            <div class="cart-empty-container">
                <svg class="empty-vault-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                    <line x1="12" y1="22.08" x2="12" y2="12"></line>
                </svg>
                
                <h3 class="empty-title">Arsip Masih Kosong</h3>
                
                <p class="empty-desc">
                    Belum ada aset keahlian yang diamankan. Jangan biarkan portofolio Anda kosong.
                </p>
                
                <button onclick="app.closeCart(); document.getElementById('pricing-anchor').scrollIntoView({behavior: 'smooth'})" class="btn-explore">
                    Telusuri Katalog Aset →
                </button>
            </div>`;

            // Reset Footer State
            if (subtotalEl) subtotalEl.innerText = "Rp 0";
            if (checkoutBtn) {
                checkoutBtn.classList.add('disabled');
                checkoutBtn.innerText = "PILIH ASET DULU"; // Ubah teks tombol checkout jadi instruksi
            }
        },

        renderCartUI: function() {
            // 1. Hitung Total Item di Keranjang
            let totalItems = 0;
            if (this.cartData) {
                Object.values(this.cartData).forEach(store => totalItems += store.items.length);
            }

            // 2. Update Badge Header (Desktop Icon)
            const dot = document.getElementById('cartDot');
            if (dot) dot.classList.toggle('active', totalItems > 0);

            // 3. Update "Archivist Desk" (Mobile Sticky Bar)
            const mobileBadge = document.getElementById('mobile-badge-new');
            const goldBtnText = document.querySelector('#gold-action-btn .btn-text');

            // Pastikan elemen mobile bar ada sebelum dimanipulasi
            if (mobileBadge && goldBtnText) {
                if (totalItems > 0) {
                    // KONDISI: Ada Barang (Mode Transaksi)
                    // Tampilkan badge angka
                    mobileBadge.innerText = totalItems;
                    mobileBadge.style.display = 'inline-block';

                    // Ubah teks tombol jadi ajakan bayar
                    goldBtnText.innerText = "BAYAR SEKARANG";
                } else {
                    // KONDISI: Keranjang Kosong (Mode Jelajah)
                    // Sembunyikan badge
                    mobileBadge.style.display = 'none';

                    // Kembalikan teks tombol ke default
                    goldBtnText.innerText = "BUKA AKSES";
                }
            }
        },

        openCart: function() {
            this.renderSideCartItems();
            const overlay = document.getElementById('sideCartOverlay');
            if (overlay) overlay.classList.add('visible');
        },

        closeCart: function() {
            const overlay = document.getElementById('sideCartOverlay');
            if (overlay) overlay.classList.remove('visible');
        },

        checkout: function() {
            if (Object.keys(this.cartData).length === 0) return;

            // [CRITICAL FIX] Mapping Data for Checkout Page Consistency
            const checkoutData = {};
            for (const storeName in this.cartData) {
                const store = this.cartData[storeName];
                if (store.items && store.items.length > 0) {
                    checkoutData[storeName] = {
                        icon: store.icon || this.STORE_ICON,
                        items: []
                    };
                    store.items.forEach(item => {
                        // Normalize Keys
                        checkoutData[storeName].items.push({
                            variantId: item.variantId,
                            sku: item.sku || item.variantSKU || null,
                            productName: item.name || item.productName || 'Produk',
                            variantName: item.variantName || '',
                            price: item.price || 0,
                            productImage: item.image || item.productImage || '',
                            isBundle: item.isBundle || false,
                            productId: item.productId || null,
                            storeName: storeName,
                            storeIcon: store.icon || ''
                        });
                    });
                }
            }

            localStorage.setItem(this.CHECKOUT_KEY, JSON.stringify(checkoutData));
            window.location.href = this.CHECKOUT_URL;
        },

        formatRupiah: (n) => 'Rp ' + n.toLocaleString('id-ID')
    };

    document.addEventListener('DOMContentLoaded', () => {
        app.init();
    });

    /* --- REVISED JS: ARCHIVIST LOGIC --- */

    // 1. Logic Tombol Emas (Smart Action)
    function handleMobileAction() {
        // Cek apakah ada isi keranjang
        let totalItems = 0;
        if (app && app.cartData) {
            Object.values(app.cartData).forEach(store => totalItems += store.items.length);
        }

        if (totalItems > 0) {
            // Jika ada keranjang, Buka Cart
            app.openCart();
        } else {
            // Jika kosong, Scroll ke Pricing
            const pricingSec = document.getElementById('pricing-anchor');
            if (pricingSec) pricingSec.scrollIntoView({
                behavior: 'smooth'
            });
        }
    }

    /* --- FINAL JS: SYNCED VISIBILITY (DESKTOP & MOBILE) --- */

    function updateNavigationState() {
        // 1. LOGIKA VISIBILITAS (Hanya Tampil Setelah Hero)
        const heroSection = document.querySelector('.hero-museum-dark');
        const archivistBar = document.querySelector('.archivist-bar'); // Mobile
        const desktopNav = document.querySelector('.desktop-theater-nav'); // Desktop

        if (heroSection) {
            // Trigger Point: Setelah scroll melewati 70% tinggi Hero
            const heroLimit = heroSection.offsetHeight * 0.7;

            if (window.scrollY > heroLimit) {
                // TAMPILKAN
                if (archivistBar) archivistBar.classList.add('is-visible');
                if (desktopNav) desktopNav.classList.add('is-visible');
            } else {
                // SEMBUNYIKAN
                if (archivistBar) archivistBar.classList.remove('is-visible');
                if (desktopNav) desktopNav.classList.remove('is-visible');
            }
        }

        // 2. LOGIKA TAB AKTIF (Strict Spy - Tidak Berubah)
        const officeSec = document.getElementById('tour-office');
        const skillSec = document.getElementById('tour-business');

        // Elements
        const tabOffice = document.getElementById('tab-office');
        const tabSkill = document.getElementById('tab-skill');
        const deskOffice = document.getElementById('link-office');
        const deskSkill = document.getElementById('link-business');

        // Reset Active State
        [tabOffice, tabSkill, deskOffice, deskSkill].forEach(el => {
            if (el) el.classList.remove('active');
        });

        if (!officeSec || !skillSec) return;

        const officeRect = officeSec.getBoundingClientRect();
        const skillRect = skillSec.getBoundingClientRect();

        // Titik Trigger Tengah Layar
        const triggerPoint = window.innerHeight * 0.4;
        const bottomTrigger = window.innerHeight * 0.8;

        // Cek Section SkillPedia (Bawah)
        if (skillRect.top <= bottomTrigger && skillRect.bottom >= triggerPoint) {
            if (tabSkill) tabSkill.classList.add('active');
            if (deskSkill) deskSkill.classList.add('active');
        }
        // Cek Section Office (Atas)
        else if (officeRect.top <= bottomTrigger && officeRect.bottom >= triggerPoint) {
            if (tabOffice) tabOffice.classList.add('active');
            if (deskOffice) deskOffice.classList.add('active');
        }
    }

    // Pastikan event listener tetap ada
    window.addEventListener('scroll', updateNavigationState);
    updateNavigationState(); // Trigger awal

    // --- SCRIPT: SCROLL REVEAL & PARALLAX ---
    document.addEventListener('DOMContentLoaded', () => {

        // 1. Setup Elemen yang Ingin Dianimasi
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1 // Sedikit saja masuk layar (10%) langsung trigger
        };

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Tambahkan delay sedikit agar tidak kaget
                    setTimeout(() => {
                        entry.target.classList.add('visible');
                    }, 100);
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // DAFTAR TARGET BARU (AUDIT LENGKAP)
        // Saya menambahkan selector baru agar semua elemen kebagian jatah animasi
        const selectors = [
            '.archive-card',
            '.method-card',
            '.ticket-card',
            '.black-card',
            '.manuscript-card',
            '.evidence-frame',
            '.sf-h2',
            '.section-header-center p',

            // --- TAMBAHAN BARU (HASIL AUDIT) ---
            '.impact-metrics', // Angka Statistik
            '.museum-frame', // Bingkai Sertifikat
            '.credibility-plaque', // Plakat Legalitas
            '.module-category', // Kelompok Modul SkillPedia
            '.tech-specs', // Tabel Spesifikasi
            '.sticky-podium', // Podium Kanan (Desktop)
            '.sf-accordion-item', // FAQ (Akan muncul berurutan)
            '.footer-brand', // Footer Kiri
            '.footer-meta' // Footer Kanan
        ];

        // Gabungkan semua selector jadi satu string
        const targets = document.querySelectorAll(selectors.join(', '));

        targets.forEach((el, index) => {
            el.classList.add('reveal-on-scroll');

            // LOGIKA DELAY OTOMATIS (ZIG-ZAG EFFECT)
            // Jika elemen bersebelahan (sibling), kita kasih delay bertingkat biar manis

            // Cek apakah elemen ini bagian dari Grid/List yang sama
            if (el.classList.contains('archive-card') ||
                el.classList.contains('method-card') ||
                el.classList.contains('ticket-card') ||
                el.classList.contains('evidence-frame') ||
                el.classList.contains('sf-accordion-item')) {

                // Modulo 3 untuk pola 0ms -> 100ms -> 200ms
                const delay = (index % 3) * 100;
                el.style.transitionDelay = `${delay}ms`;
            }

            observer.observe(el);
        });

        // 2. ULTRA SMOOTH PARALLAX (Updated)
        let lastScrollY = window.scrollY;
        let ticking = false;
        const tablet = document.querySelector('.hero-visual-frame');

        function updateParallax() {
            // Hanya jalankan jika elemen ada dan di area atas
            if (tablet && lastScrollY < 1000) {
                // Angka 0.12 adalah kecepatan parallax (semakin kecil semakin pelan/halus)
                // Menggunakan translate3d memaksa GPU bekerja (Hardware Acceleration) = Lebih Smooth
                tablet.style.transform = `translate3d(0, ${lastScrollY * 0.12}px, 0)`;
            }
            ticking = false;
        }

        window.addEventListener('scroll', () => {
            lastScrollY = window.scrollY;
            if (!ticking) {
                window.requestAnimationFrame(updateParallax);
                ticking = true;
            }
        });
    });

    // --- SCRIPT: THEATER SPOTLIGHT & BACKGROUND ---
    document.addEventListener('mousemove', (e) => {
        const stage = document.getElementById('theaterStage');
        if (stage) {
            const rect = stage.getBoundingClientRect();
            // Hanya aktif jika mouse berada di dalam area stage/window view
            const x = e.clientX;
            const y = e.clientY;

            // Update CSS Variables untuk posisi spotlight
            stage.style.setProperty('--mouse-x', x + 'px');
            stage.style.setProperty('--mouse-y', y + 'px');
        }
    });

    // Aktifkan Background saat scroll masuk area theater
    const theaterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                document.body.classList.add('in-tour-zone');
            } else {
                document.body.classList.remove('in-tour-zone');
            }
        });
    }, {
        threshold: 0.1
    });

    const stageEl = document.querySelector('.grand-theater-stage');
    if (stageEl) theaterObserver.observe(stageEl);


})();