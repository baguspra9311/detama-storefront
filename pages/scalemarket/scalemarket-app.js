const urlParamsDebug = new URLSearchParams(window.location.search);
const IS_DEBUG_MODE = urlParamsDebug.has('debug');

const ScaleMarketApp = {
    products: [],
    vouchers: [],
    cart: {},
    config: {
        CART_KEY: 'universalCart_v1',
        CHECKOUT_ITEMS_KEY: 'checkoutItems_v1',
        VOUCHER_WALLET_KEY: 'my_vouchers_v1',
        CHECKOUT_BASE_URL: 'https://detama.id/checkout',
        WAITLIST_FORM_URL: 'https://detama.id/subscribe',
        WHATSAPP_URL: 'https://wa.me/6285691290773?text=Halo%20ScaleMarket'
    },
    storeInfo: {
        name: 'ScaleMarket',
        icon: 'https://cdn.scalev.id/business_files/aMT9VueGZ3klINJBtE5s6oHx/1760057133110-favicon.png'
    },
    audio: {
        addToCartSound: null,
        flipSoundEffect: null,
        jetSound: null,
        ambientSound: null,
        isAudioInitialized: false,
        isFirstFabInteraction: true,
    },
    heavyFeaturesInitialized: false,
    boundTriggerHeavyFeatures: null,
    plexus: {
        canvas: null,
        ctx: null,
        particlesArray: [],
        mouse: { x: null, y: null, radius: 150 },
        animationFrameId: null
    },
    purchaseEvents: [],

    init: async function() {
        if (IS_DEBUG_MODE) console.log('🚀 ScaleMarket App Initializing...');
        
        await this.loadData();
        
        this.loadVouchers();
        this.loadPurchaseEvents();
        this.renderCart();
        this.render();
        this.bindEvents();
        this.personalizeGreeting();
        this.setupStaticUI();
        this.setupStoreIconListener();
        this.setupStaticListeners();
        this.setupVisibilityListener();
        this.setupNavObserver();

        this.boundTriggerHeavyFeatures = this.triggerHeavyFeatures.bind(this);
        setTimeout(this.boundTriggerHeavyFeatures, 2500);
        ['mousemove', 'scroll', 'touchstart', 'click'].forEach(event => {
            window.addEventListener(event, this.boundTriggerHeavyFeatures, { once: true, passive: true });
        });
        
        if (IS_DEBUG_MODE) console.log('✅ScaleMarket App Ready!');
    },

    loadData: async function() {
        const cdnUrl = 'https://cdn.detama.id/product.json';
        if (IS_DEBUG_MODE) console.log(`Mengambil data produk dari: ${cdnUrl}`);
        try {
            const response = await fetch(cdnUrl);
            if (!response.ok) { throw new Error(`HTTP error! status: ${response.status}`); }
            const jsonData = await response.json();
    
            if (!jsonData || !jsonData.scalemarket) {
                throw new Error("Struktur data JSON tidak sesuai. Key 'scalemarket' tidak ditemukan.");
            }
    
            const productsArray = Array.isArray(jsonData.scalemarket.products) ? jsonData.scalemarket.products : [];
            const bundlesArray = Array.isArray(jsonData.scalemarket.bundles) ? jsonData.scalemarket.bundles : [];
    
            const combinedProducts = productsArray.concat(bundlesArray);
    
            if (combinedProducts.length === 0) {
                console.warn("Tidak ada produk atau bundle yang ditemukan dalam data JSON.");
            } else {
                if (IS_DEBUG_MODE) console.log(`Berhasil memuat ${combinedProducts.length} total item (produk & bundle).`);
            }
    
            this.products = combinedProducts;
    
        } catch (error) {
            console.error("Gagal memuat atau memproses data produk dari CDN:", error);
            this.products = [];
            const productGrid = document.getElementById('productGrid');
            if (productGrid) {
                productGrid.innerHTML = `<p style="text-align:center; color: var(--danger);">Gagal memuat koleksi produk. Coba muat ulang halaman.</p>`;
            }
        }
    },
    
    loadVouchers: function() {
        try {
            const dataElement = document.getElementById('voucher-data');
            if (!dataElement) {
                throw new Error("Elemen data voucher (#voucher-data) tidak ditemukan.");
            }
            const data = JSON.parse(dataElement.textContent);
            if (Array.isArray(data)) {
                this.vouchers = data;
            } else {
                throw new Error("Format data voucher bukan Array.");
            }
        } catch (error) {
            console.error(error);
            this.vouchers = [];
        }
    },
    
    openVoucherModal: function() {
        this.renderVouchers(); 
        
        const modal = document.getElementById('voucherModalOverlay');
        if (modal) {
            modal.style.display = 'flex';
            setTimeout(() => modal.classList.add('visible'), 10);
        }
    },
    
    closeVoucherModal: function() {
        const modal = document.getElementById('voucherModalOverlay');
        if (modal) {
            modal.classList.remove('visible');
            setTimeout(() => modal.style.display = 'none', 300);
        }
    },
    
    renderVouchers: function() {
        const container = document.querySelector('.voucher-modal-body');
        if (!container) return;
    
        if (this.vouchers.length === 0) {
            container.innerHTML = `<p class="muted" style="text-align: center; padding: 20px 0;">Saat ini tidak ada voucher yang tersedia.</p>`;
            return;
        }
    
        const claimedVouchers = JSON.parse(localStorage.getItem(this.config.VOUCHER_WALLET_KEY)) || [];
        const claimedCodes = claimedVouchers.map(v => v.code);
    
        const voucherTicketsHTML = this.vouchers.map(voucher => {
            const isAlreadyClaimed = claimedCodes.includes(voucher.code);
            const isDisabled = !voucher.isAvailable || isAlreadyClaimed;
            
            let buttonText = 'Klaim';
            if (isAlreadyClaimed) {
                buttonText = '✅ Terklaim';
            } else if (!voucher.isAvailable) {
                buttonText = 'Habis';
            }
    
            return `
            <div class="voucher-ticket">
                <div class="voucher-visual">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                       <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                       <path d="M15 5l6 6l-11 11l-6 -6l11 -11"></path>
                       <line x1="7" y1="13" x2="11" y2="17"></line>
                       <line x1="18.01" y1="8.99" x2="18.01" y2="9.001"></line>
                    </svg>
                </div>
                <div class="voucher-info">
                    <h4 class="voucher-title">${voucher.title}</h4>
                    <p class="voucher-desc">${voucher.desc}</p>
                </div>
                <div class="voucher-action">
                    <button class="btn small btn-klaim" data-code="${voucher.code}" ${isDisabled ? 'disabled' : ''}>
                        ${buttonText}
                    </button>
                </div>
            </div>`;
        }).join('');
    
        container.innerHTML = `<div class="voucher-list">${voucherTicketsHTML}</div>`;
    },
    
    handleClaimVoucher: function(button) {
        const voucherCode = button.dataset.code;
    
        let claimedVouchers = JSON.parse(localStorage.getItem(this.config.VOUCHER_WALLET_KEY)) || [];
        const isAlreadyClaimed = claimedVouchers.some(v => v.code === voucherCode);
        if (isAlreadyClaimed) return;
    
        const voucherToClaim = this.vouchers.find(v => v.code === voucherCode);
        if (!voucherToClaim) {
            alert('Voucher tidak valid.');
            return;
        }
    
        const voucherForWallet = {
            code: voucherToClaim.code,
            title: voucherToClaim.title,
            desc: voucherToClaim.desc
        };
    
        claimedVouchers.push(voucherForWallet);
        try {
            localStorage.setItem(this.config.VOUCHER_WALLET_KEY, JSON.stringify(claimedVouchers));
            button.textContent = '✅ Terklaim';
            button.disabled = true;
        } catch (error) {
            console.error('Gagal menyimpan voucher ke Dompet:', error);
            alert('Gagal mengklaim voucher.');
        }
    },

    setupStoreIconListener: function() {
        const findAndSetIcon = () => {
            const favicon = document.querySelector("link[rel='icon'][href*='cdn.scalev.id'][href$='.png']");
            if (favicon && favicon.href) {
                this.storeInfo.icon = favicon.href;
                this.renderCart(); 
                return true;
            }
            return false;
        };
    
        if (findAndSetIcon()) {
            return;
        }
    
        const observer = new MutationObserver((mutations, obs) => {
            if (findAndSetIcon()) {
                obs.disconnect();
            }
        });
    
        observer.observe(document.head, {
            childList: true,
            subtree: true
        });
    },
    
    personalizeGreeting: function() {
         try {
            const greetingElement = document.querySelector('.hero h1');
            const subGreetingElement = document.querySelector('.hero .sub');
            const visitedKey = 'scaleMarketVisited_v1';
            if (localStorage.getItem(visitedKey)) {
                if (greetingElement) greetingElement.textContent = 'Selamat Datang Kembali, Penjelajah!';
                if (subGreetingElement) subGreetingElement.textContent = 'Semesta digital Anda menanti untuk kembali dijelajahi. Mari lanjutkan ekspedisi.';
            } else {
                localStorage.setItem(visitedKey, 'true');
            }
        } catch (e) {
            console.warn('Tidak dapat mengakses localStorage untuk personalisasi:', e);
        }
    },
    
    setupStaticUI: function() {
        document.getElementById('fabWhatsappBtn').href = this.config.WHATSAPP_URL;
    },
    
    setupStaticListeners: function() {
        const themeToggleDesktop = document.getElementById('themeToggleDesktop');
        const themeToggleMobile = document.getElementById('themeToggleMobile');
        const setTheme = (theme) => {
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
            if (themeToggleDesktop) themeToggleDesktop.checked = theme === 'dark';
            if (themeToggleMobile) themeToggleMobile.checked = theme === 'dark';
            if (window.initPlexus) window.initPlexus();
        };
        const storedTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        setTheme(storedTheme);
        const handleThemeToggle = (e) => setTheme(e.target.checked ? 'dark' : 'light');
        if (themeToggleDesktop) themeToggleDesktop.addEventListener('change', handleThemeToggle);
        if (themeToggleMobile) themeToggleMobile.addEventListener('change', handleThemeToggle);

        const hdr = document.querySelector('header');
        const sky = document.querySelector('.sky');
        const celestialBody = document.querySelector('.celestial-body');
        const starfield = document.querySelector('.starfield');

        window.addEventListener('scroll', () => {
            if (hdr) hdr.classList.toggle('shrink', window.scrollY > 24);
            const totalHeight = document.body.scrollHeight - window.innerHeight;
            const progress = (window.scrollY / totalHeight);
            if (hdr) hdr.style.setProperty('--scroll-progress', (progress * 100) + '%');

            if (sky && celestialBody && starfield) {
                const yOffset = progress * 300;
                const scale = 1 - (progress * 0.6);
                const starDrift = progress * 50;
                celestialBody.style.transform = `translateY(${yOffset}px) scale(${scale})`;
                starfield.style.transform = `translate(${starDrift}px, ${starDrift}px)`;
                sky.style.opacity = Math.max(0, 1 - (window.scrollY / (window.innerHeight * 1.5)));
            }
            
            if (fabContainer && fabContainer.classList.contains('is-open')) {
                fabContainer.classList.remove('is-open');
            }
        }, { passive: true });

        const fabContainer = document.getElementById('fabContainer');
        const fabMain = document.getElementById('fabMain');
        if (fabMain) {
            fabMain.addEventListener('click', (e) => {
                e.stopPropagation();
                fabContainer.classList.toggle('is-open');
                
                const mainBadge = fabMain.querySelector('#fabCartBadge');
                const childBadge = document.getElementById('fabChildCartBadge');
        
                if (fabContainer.classList.contains('is-open')) {
                    if (mainBadge) mainBadge.style.setProperty('display', 'none', 'important');
                    if (childBadge) childBadge.style.setProperty('display', 'flex', 'important');
                } else {
                    if (mainBadge) mainBadge.style.display = '';
                    if (childBadge) childBadge.style.display = '';
                }
        
                if (fabContainer.classList.contains('is-open') && typeof this.handleAudioInteraction === 'function') {
                    this.handleAudioInteraction();
                }
            });
        }
        
        setInterval(() => {
            if (Math.random() > 0.65) {
                this.showToast();
            }
        }, 8000);
        
        const heroSection = document.querySelector('.hero');
        if (heroSection) {
            document.addEventListener('mousemove', e => {
                document.body.style.setProperty('--cursor-x', e.clientX + 'px');
                document.body.style.setProperty('--cursor-y', e.clientY + 'px');
                if (this.plexus.canvas) {
                    const rect = this.plexus.canvas.getBoundingClientRect();
                    this.plexus.mouse.x = e.clientX - rect.left;
                    this.plexus.mouse.y = e.clientY - rect.top;
                }
            });
            heroSection.addEventListener('mouseleave', () => { if(this.plexus) this.plexus.mouse.x = null; this.plexus.mouse.y = null; });
        }
    },
    
    setupVisibilityListener: function() {
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                if (this.plexus.animationFrameId) {
                    cancelAnimationFrame(this.plexus.animationFrameId);
                    this.plexus.animationFrameId = null;
                }
            } else {
                if (!this.plexus.animationFrameId && this.plexus.canvas) {
                    const animatePlexus = () => {
                        if (!this.plexus.canvas.isConnected) {
                            cancelAnimationFrame(this.plexus.animationFrameId);
                            this.plexus.animationFrameId = null;
                            return;
                        }
                        this.plexus.ctx.clearRect(0, 0, this.plexus.canvas.width, this.plexus.canvas.height);
                        this.plexus.particlesArray.forEach(p => {
                            this.plexus.ctx.beginPath();
                            this.plexus.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                            this.plexus.ctx.fill();
                        });
                        if (this.plexus.connectFn) this.plexus.connectFn();
                        this.plexus.animationFrameId = requestAnimationFrame(animatePlexus);
                    };
                    animatePlexus();
                }
            }
        });
    },
    
    setupNavObserver: function() {
        const menuLinks = document.querySelectorAll('.desktop-menu a');
        const sections = document.querySelectorAll('section[data-menu-item]');
        const heroSection = document.querySelector('.hero');
        if (menuLinks.length === 0) return;

        if (sections.length > 0) {
            const sectionObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const id = entry.target.getAttribute('data-menu-item');
                        menuLinks.forEach(link => {
                            const linkTarget = link.getAttribute('href').substring(1);
                            const section = document.getElementById(linkTarget);
                            if(section) {
                               link.classList.toggle('active', section.getAttribute('data-menu-item') === id);
                            }
                        });
                    }
                });
            }, { rootMargin: '-50% 0px -50% 0px' });
            sections.forEach(sec => sectionObserver.observe(sec));
        }

        if (heroSection) {
            const heroObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        menuLinks.forEach(link => link.classList.remove('active'));
                    }
                });
            }, { threshold: 0.7 });
            heroObserver.observe(heroSection);
        }
    },

    bindEvents: function() {
        document.body.addEventListener('click', (e) => {
            const target = e.target;
            const handlers = {
                '.add-to-cart-btn': this.handleAddToCart,
                '.buy-now-btn': this.handleBuyNow,
                '.buy-bundle-now-btn:not(:disabled)': this.handleBuyBundleNow,
                '#voucherStationDesktop': this.openVoucherModal,
                '#voucherStationMobile': this.openVoucherModal,
                '#closeVoucherModal': this.closeVoucherModal,
                '.btn-klaim:not(:disabled)': this.handleClaimVoucher,
                '.hero .cta-row .btn:not(.ghost)': this.handleLaunchExpedition,
                '.open-product-modal-btn, .desc.truncated': this.handleOpenModal,
                '.cart-item-remove': this.handleRemoveFromCart,
                '.variant-btn': this.handleVariantClick,
                '.btn-flip-front, .btn-flip-back': this.handleCardFlip,
                '#mobileMenuToggle': this.openMobileMenu,
                '#mobileMenuClose': this.closeMobileMenu,
                '.nav-overlay': this.closeMobileMenu,
                '.mobile-nav-container .menu a': this.handleMobileNavClick,
                '#closeProductModal': this.closeProductModal,
                '#closeSideCart': this.closeCart,
                '#continueShoppingBtn': this.closeCart,
                '#cartToggleFab': this.openCart,
                '#checkoutBtn:not(.disabled)': this.handleGoToCheckout,
                '#audioToggle': (el, ev) => {
                  ev.stopPropagation();
                  if (typeof this.toggleSound === 'function') this.toggleSound();
                }
            };

            for (const selector in handlers) {
                const element = target.closest(selector);
                if (element) {
                    handlers[selector].call(this, element, e);
                    return; 
                }
            }
        });

        const productModal = document.getElementById('productModal');
        const sideCartOverlay = document.getElementById('sideCartOverlay');
        const voucherModalOverlay = document.getElementById('voucherModalOverlay');
        
        if (productModal) productModal.addEventListener('click', (e) => { if (e.target === productModal) this.closeProductModal(); });
        if (sideCartOverlay) sideCartOverlay.addEventListener('click', (e) => { if (e.target === sideCartOverlay) this.closeCart(); });
        if (voucherModalOverlay) voucherModalOverlay.addEventListener('click', (e) => { if (e.target === voucherModalOverlay) this.closeVoucherModal(); });

        window.addEventListener('storage', () => this.renderCart());
    },

    handleAddToCart: async function(button) {
        const modal = button.closest('.product-modal-content');
        const activeVariantBtn = modal.querySelector('.variant-btn.active');
        if (!activeVariantBtn) return;
    
        const productId = button.dataset.productId;
        const variantId = activeVariantBtn.dataset.variantId;
        if (!productId || !variantId) return;
        
        const wasAdded = await this.addToCart(productId, variantId); 
    
        if (wasAdded) {
            button.classList.add('added');
            this.animateRocketToCart(button);
    
        } else {
            const btnText = button.querySelector('.btn-text');
            if (btnText) {
                const originalText = btnText.textContent;
                button.classList.add('already-in-cart');
                btnText.textContent = '✔️ Sudah diamankan';
                
                setTimeout(() => {
                    button.classList.remove('already-in-cart');
                    btnText.textContent = originalText;
                }, 2000);
            }
            setTimeout(() => {
                this.openCart();
            }, 800);
        }
    },
    
    animateRocketToCart: function(button) {

        setTimeout(() => {
            button.classList.remove('added');
        }, 2000);
    
        const fabCartIcon = document.getElementById('fabMain');
        if (!fabCartIcon) {
            console.error('ERROR: Ikon keranjang (fabMain) tidak ditemukan! Langsung buka keranjang.');
            this.openCart();
            return;
        }

        const startRect = button.getBoundingClientRect();
        const endRect = fabCartIcon.getBoundingClientRect();
    
        const rocket = document.createElement('div');
        rocket.style.position = 'fixed';
        rocket.style.left = `${startRect.left + startRect.width / 2 - 12}px`;
        rocket.style.top = `${startRect.top + startRect.height / 2 - 12}px`;
        rocket.style.zIndex = '9999';
        rocket.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round" style="color: var(--brand); transform: rotate(-45deg);"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><path d="M4 13a8 8 0 0 1 7 7a6 6 0 0 0 3 -5a9 9 0 0 0 6 -8a3 3 0 0 0 -3 -3a9 9 0 0 0 -8 6a6 6 0 0 0 -5 3"></path><path d="M7 14a6 6 0 0 0 -3 6a6 6 0 0 0 6 -3"></path><path d="M15 9m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path></svg>`;
        document.body.appendChild(rocket);

        setTimeout(() => {
            rocket.style.transition = 'transform 0.7s cubic-bezier(0.5, -0.25, 0.735, 0.045), opacity 0.7s ease-out';
            rocket.style.transform = `translate(${endRect.left - startRect.left}px, ${endRect.top - startRect.top}px) scale(0.5)`;
            rocket.style.opacity = '0.5';
        }, 10);
    
        setTimeout(() => {
            if (document.body.contains(rocket)) {
                document.body.removeChild(rocket);
            }
            this.openCart();
        }, 710);
    },
    
    handleLaunchExpedition: async function(button, e) {
        e.preventDefault();
        const targetSection = document.querySelector(button.getAttribute('href'));
        if (!targetSection) return;
        
        if (window.innerWidth <= 768) {
            targetSection.scrollIntoView({ behavior: 'smooth' });
            return;
        }

        document.body.style.overflow = 'hidden';
        await this.ensureAudioIsReady();
        if (this.audio.jetSound) {
            this.audio.jetSound.triggerAttack();
        }
        document.body.classList.add('screen-shaking');

        const floatingIcons = document.querySelectorAll('.hero-card .float');
        const clones = [];
        floatingIcons.forEach((icon, index) => {
            icon.style.opacity = '0';
            const clone = icon.cloneNode(true);
            const rect = icon.getBoundingClientRect();
            Object.assign(clone.style, { position: 'fixed', left: `${rect.left}px`, top: `${rect.top}px`, width: `${rect.width}px`, height: `${rect.height}px`, zIndex: '1000', margin: '0', animation: 'shockLaunch 1.1s cubic-bezier(0.6, -0.28, 0.735, 0.045) forwards', animationDelay: `${index * 0.07}s` });
            document.body.appendChild(clone);
            clones.push(clone);
        });

        setTimeout(() => {
            targetSection.scrollIntoView({ behavior: 'smooth' });
            document.body.style.overflow = '';
        }, 1100);

        setTimeout(() => {
            clones.forEach(clone => document.body.removeChild(clone));
            floatingIcons.forEach(icon => icon.style.opacity = '1');
            document.body.classList.remove('screen-shaking');
        }, 1500);
    },
    
    handleMobileNavClick: function(link, e) {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth' });
        }
        this.closeMobileMenu();
    },

    handleBuyNow: function(button) {
        const modal = button.closest('.product-modal-content');
        const activeVariantBtn = modal.querySelector('.variant-btn.active');
    
        if (activeVariantBtn) {
            const productId = modal.querySelector('.add-to-cart-btn').dataset.productId;
            const variantId = activeVariantBtn.dataset.variantId;
            const product = this.products.find(p => p.id === productId && !p.isBundle);
            const variant = product ? product.variants.find(v => v.id === variantId) : null;
        
            if (!product || !variant) {
                console.error('handleBuyNow: Produk atau Varian tidak ditemukan.', { productId, variantId });
                alert('Produk tidak ditemukan, silakan muat ulang halaman.');
                return;
            }
        
            const itemForCheckout = {
                variantId: variant.id,
                sku: variant.sku,
                productName: product.name,
                variantName: variant.name,
                price: variant.price,
                productImage: product.image,
                isBundle: false,
                
                productId: product.id,
                storeName: this.storeInfo.name,
                storeIcon: this.storeInfo.icon
            };

            const checkoutData = {
                [this.storeInfo.name]: {
                    icon: this.storeInfo.icon,
                    items: [itemForCheckout]
                }
            };
            
            try {
                const jsonDataString = JSON.stringify(checkoutData);
                if (IS_DEBUG_MODE) console.log('handleBuyNow: Menyimpan ke checkoutItems_v1:', jsonDataString);
                localStorage.setItem(this.config.CHECKOUT_ITEMS_KEY, jsonDataString);
                window.location.href = this.config.CHECKOUT_BASE_URL;
            } catch (error) {
                console.error('Gagal menyimpan data Beli Langsung ke localStorage:', error);
                alert('Terjadi kesalahan, silakan coba lagi.');
            }
        } else {
            alert('Silakan pilih lisensi terlebih dahulu.');
        }
    },
    
    handleBuyBundleNow: function(button) {
        const bundleId = button.dataset.bundleId;
        const bundle = this.products.find(p => p.id === bundleId && p.isBundle === true);
    
        if (!bundle) {
            console.error('handleBuyBundleNow: Bundle tidak ditemukan.', { bundleId });
            alert('Bundle tidak ditemukan.');
            return;
        }
    
        const itemForCheckout = {
            variantId: bundle.id,
            sku: bundle.sku,
            productName: bundle.name,
            variantName: "Bundle Item",
            price: bundle.price,
            productImage: bundle.image,
            isBundle: true,
            
            productId: `bundle-${bundle.id}`,
            storeName: this.storeInfo.name, 
            storeIcon: this.storeInfo.icon
        };

        const checkoutData = {
            [this.storeInfo.name]: {
                icon: this.storeInfo.icon,
                items: [itemForCheckout]
            }
        };
        
        try {
            const jsonDataString = JSON.stringify(checkoutData);
            if (IS_DEBUG_MODE) console.log('handleBuyBundleNow: Menyimpan ke checkoutItems_v1:', jsonDataString);
            localStorage.setItem(this.config.CHECKOUT_ITEMS_KEY, jsonDataString);
            window.location.href = this.config.CHECKOUT_BASE_URL; 
        } catch (error) {
            console.error('Gagal menyimpan data Bundle ke localStorage:', error);
            alert('Terjadi kesalahan, silakan coba lagi.');
        }
    },
    
    handleGoToCheckout: function(button, e) {
        e.preventDefault();
    
        this.cart = this.getCart();
        
        if (Object.keys(this.cart).length === 0) {
            alert("Keranjang Anda kosong.");
            return;
        }
        
        const checkoutData = {}; 
        let totalItemsForCheckout = 0;

        for (const storeName in this.cart) {
            const store = this.cart[storeName];
            if (store && store.items && store.items.length > 0) {
                checkoutData[storeName] = {
                    icon: store.icon || this.storeInfo.icon,
                    items: []
                };
                
                store.items.forEach(item => {
                    const itemForCheckout = {
                        variantId: item.variantId,
                        sku: item.variantSKU || item.sku || null,
                        productName: item.name || item.productName || 'Nama Produk?',
                        variantName: item.variantName || '',
                        price: item.price || 0,
                        productImage: item.image || item.productImage || '...',
                        isBundle: item.isBundle || false,
                        productId: item.productId || null,
                        storeName: storeName,
                        storeIcon: store.icon || this.storeInfo.icon
                    };
                    checkoutData[storeName].items.push(itemForCheckout);
                    totalItemsForCheckout++;
                });
            }
        }
    
        if (totalItemsForCheckout === 0) {
            alert("Tidak ada item valid di keranjang untuk checkout.");
            return;
        }
    
        try {
            const jsonDataString = JSON.stringify(checkoutData);
            if (IS_DEBUG_MODE) console.log('handleGoToCheckout: Menyimpan ke checkoutItems_v1:', jsonDataString);
            localStorage.setItem(this.config.CHECKOUT_ITEMS_KEY, jsonDataString);
            window.location.href = this.config.CHECKOUT_BASE_URL;
        } catch (error) {
            console.error('Gagal menyimpan data keranjang ke Troli Kasir:', error);
            alert('Terjadi kesalahan saat menuju checkout.');
        }
    },

    handleOpenModal: function(trigger) {
        const card = trigger.closest('.card');
        if (card && card.dataset.productId) this.openProductModal(card.dataset.productId);
    },

    handleRemoveFromCart: function(button) {
        this.removeFromCart(button.dataset.storeName, button.dataset.variantId);
    },
    
    handleVariantClick: function(button) {
        const variantsContainer = button.closest('.product-modal-variants');
        const modal = button.closest('.product-modal-content');
        variantsContainer.querySelectorAll('.variant-btn').forEach(b => b.classList.remove('active'));
        button.classList.add('active');
        modal.querySelector('.product-modal-price').textContent = this.formatIDR(parseInt(button.dataset.price, 10));
    },
    
    handleCardFlip: async function(button, e) {
        e.preventDefault();
        const card = button.closest('.card');
        if (card) {
            card.classList.toggle('is-flipped');
            await this.ensureAudioIsReady();
            if (this.audio.flipSoundEffect) {
                const now = Tone.now();
                this.audio.flipSoundEffect.noise.triggerAttack(now);
                this.audio.flipSoundEffect.filter.frequency.rampTo(8000, 0.05, now);
                this.audio.flipSoundEffect.filter.frequency.rampTo(100, 0.1, now + 0.05);
            }
        }
    },
    
    openMobileMenu: function() { document.body.classList.add('nav-open'); },
    closeMobileMenu: function() { document.body.classList.remove('nav-open'); },

    debounce: function(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func.apply(this, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    apply3dEffect: function(cards) {
        const MAX_ROTATION = 8;
        cards.forEach(card => {
            if (card.classList.contains('manifesto-card')) return;
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const mouseX = (e.clientX - rect.left) / rect.width - 0.5;
                const mouseY = (e.clientY - rect.top) / rect.height - 0.5;
                const rotateY = mouseX * MAX_ROTATION;
                const rotateX = -mouseY * MAX_ROTATION;
                const glareX = (e.clientX - rect.left) / rect.width * 100;
                const glareY = (e.clientY - rect.top) / rect.height * 100;
                card.style.transition = 'transform 0.05s linear';
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
                card.style.setProperty('--glare-x', `${glareX}%`);
                card.style.setProperty('--glare-y', `${glareY}%`);
                card.style.setProperty('--glare-opacity', '1');
            });
            card.addEventListener('mouseleave', () => {
                card.style.transition = 'transform 0.4s ease-out';
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
                card.style.setProperty('--glare-opacity', '0');
            });
        });
    },
    
    formatIDR: (n) => { if (n === 0) return 'Gratis'; return 'Rp ' + n.toLocaleString('id-ID'); },

    addToCart: async function(productId, variantId) {
        this.cart = this.getCart();
        const storeName = this.storeInfo.name;
        if (!this.cart[storeName]) this.cart[storeName] = { icon: this.storeInfo.icon, items: [] };
        const existingItem = this.cart[storeName].items.find(item => item.variantId === variantId);
    
        if (!existingItem) {
            const product = this.products.find(p => p.id === productId);
            const variant = product.variants.find(v => v.id === variantId);
            if (product && variant) {
                this.cart[storeName].items.push({
                    productId: product.id, 
                    variantId: variant.id, 
                    name: product.name,
                    variantName: variant.name, 
                    price: variant.price,
                    image: product.image || 'https://placehold.co/120x120?text=IMG',
                    variantSKU: variant.sku || null
                });
                
                await this.ensureAudioIsReady();
                if (this.audio.addToCartSound) {
                    this.audio.addToCartSound.triggerAttackRelease('G5', '8n');
                }
    
                this.saveCart();
                this.renderCart(variantId);
                return true;
            }
        }
        
        return false;
    },
    
    removeFromCart: function(storeName, variantId) {
        this.cart = this.getCart();
        if (this.cart[storeName]) {
            this.cart[storeName].items = this.cart[storeName].items.filter(item => item.variantId !== variantId);
            if (this.cart[storeName].items.length === 0) delete this.cart[storeName];
            this.saveCart();
            this.renderCart();
        }
    },

    getCart: function() { try { const d = localStorage.getItem(this.config.CART_KEY); return d ? JSON.parse(d) : {}; } catch (e) { return {}; } },
    saveCart: function() { try { localStorage.setItem(this.config.CART_KEY, JSON.stringify(this.cart)); } catch (e) { console.error("Gagal menyimpan keranjang:", e); } },
    openCart: function() { document.getElementById('sideCartOverlay')?.classList.add('visible'); },
    closeCart: function() { document.getElementById('sideCartOverlay')?.classList.remove('visible'); },

    render: function() {
        const grid = document.getElementById('productGrid');
        if (grid) grid.innerHTML = this.products.map(p => this.cardTemplate(p)).join('');
        setTimeout(() => document.querySelectorAll('.thumb.skeleton').forEach(el => el.classList.remove('skeleton')), 500);
        this.setupTruncatedDescriptions();
        document.querySelectorAll('.card, .section-title, .hero .content > div, .hero-card, details, .roadmap').forEach(el => {
            new IntersectionObserver((entries) => {
                entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('in-view'); });
            }, { threshold: 0.1 }).observe(el);
        });
    },

    renderCart: function(highlightedVariantId = null) {
        this.cart = this.getCart();
        const cartBody = document.querySelector('.side-cart-body');
        const subtotalEl = document.getElementById('cartSubtotal');
        const checkoutBtn = document.getElementById('checkoutBtn');
        const continueShoppingBtn = document.getElementById('continueShoppingBtn');

        if (!cartBody || !subtotalEl || !checkoutBtn) return;
        
        cartBody.innerHTML = '';
        let totalItems = 0;
        let subtotal = 0;
        const allVariantIds = [];
        const stores = Object.keys(this.cart);

        if (stores.length === 0) {
            cartBody.innerHTML = `<div class="cart-empty-state"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg><p>Keranjang Anda masih kosong.</p></div>`;
            checkoutBtn.style.display = 'none';
            continueShoppingBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><path d="M4 13a8 8 0 0 1 7 7a6 6 0 0 0 3 -5a9 9 0 0 0 6 -8a3 3 0 0 0 -3 -3a9 9 0 0 0 -8 6a6 6 0 0 0 -5 3"></path><path d="M7 14a6 6 0 0 0 -3 6a6 6 0 0 0 6 -3"></path><path d="M15 9m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path></svg> 
                <span>Mulai Misi Baru</span>
            `;
            continueShoppingBtn.classList.remove('ghost');

        } else {
            stores.forEach(storeName => {
                const store = this.cart[storeName];
                const storeGroupEl = document.createElement('div');
                storeGroupEl.className = 'cart-store-group';
                storeGroupEl.innerHTML = `<div class="cart-store-header"><img src="${store.icon}" alt="${storeName}" class="cart-store-icon"><span class="cart-store-name">${storeName}</span></div>`;
                store.items.forEach(item => {
                    const itemEl = document.createElement('div');
                    itemEl.className = 'cart-item';
                    if (item.variantId === highlightedVariantId) itemEl.classList.add('is-newly-added');
                    itemEl.innerHTML = `
                        <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                        <div class="cart-item-details">
                            <div class="cart-item-name">${item.name}</div>
                            <div class="cart-item-variant">${item.variantName}</div>
                            <div class="cart-item-price">${this.formatIDR(item.price)}</div>
                        </div>
                        <button class="cart-item-remove" data-store-name="${storeName}" data-variant-id="${item.variantId}" title="Hapus item">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>`;
                    storeGroupEl.appendChild(itemEl);
                    subtotal += item.price;
                    totalItems++;
                    allVariantIds.push(item.variantId);
                });
                cartBody.appendChild(storeGroupEl);
            });
            checkoutBtn.style.display = 'inline-flex';
            continueShoppingBtn.innerHTML = 'Pilih Template Lainnya';
            continueShoppingBtn.classList.add('ghost');
        }
        
        subtotalEl.textContent = this.formatIDR(subtotal);
        this.updateFabIcon(totalItems, highlightedVariantId !== null);
        
        if (totalItems > 0) {
            checkoutBtn.classList.remove('disabled');
            checkoutBtn.href = '#';
        } else {
            checkoutBtn.classList.add('disabled');
            checkoutBtn.href = '#';
        }
    },
    
    updateFabIcon: function(totalItems, isNewAddition = false) {
        const fabMain = document.getElementById('fabMain');
        const fabBadge = document.getElementById('fabCartBadge');
        const fabChildBadge = document.getElementById('fabChildCartBadge'); 
        if (!fabMain || !fabBadge || !fabChildBadge) return;
    
        const defaultIcon = fabMain.querySelector('.fab-icon-default');
        const cartIcon = fabMain.querySelector('.fab-icon-cart');
    
        if (totalItems > 0) {
            if (defaultIcon) defaultIcon.style.display = 'none';
            if (cartIcon) cartIcon.style.display = 'inline-block';
            
            fabBadge.textContent = totalItems;
            fabChildBadge.textContent = totalItems;
            
            fabBadge.classList.add('visible');
            fabChildBadge.style.display = 'flex';

            if (isNewAddition) {
                fabBadge.classList.add('is-blinking');
                setTimeout(() => fabBadge.classList.remove('is-blinking'), 900);
            }
        } else {
            if (defaultIcon) defaultIcon.style.display = 'inline-block';
            if (cartIcon) cartIcon.style.display = 'none';
            
            fabBadge.classList.remove('visible');
            fabChildBadge.textContent = '0';
            fabChildBadge.style.display = 'none';
        }
    },
    
    cardTemplate: function(p) {
        if (p.comingSoon) { return `<article class="card coming" data-id="${p.id}"><div class="card-inner"><div class="card-face card-front"><span class="ribbon">${p.badge||'Coming Soon'}</span><div class="coming-soon-body"><svg class="coming-soon-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><g transform="rotate(25 32 32)"><rect x="23" y="15" width="18" height="34" rx="4" fill="var(--muted)" opacity="0.7"/><rect x="25" y="17" width="14" height="30" rx="2" fill="url(#sat-grad)"/><path d="M28,21h8v2h-8z M28,26h8v2h-8z M28,31h8v2h-8z" fill="var(--surface)" opacity="0.5"/><path d="M7,11h12v14H7z M9,13h8v2H9z M9,16h8v2H9z M9,19h8v2H9z" fill="var(--brand-2)"/><rect x="6" y="10" width="14" height="16" rx="2" fill="none" stroke="var(--muted)" stroke-width="1.5"/><path d="M45,39h12v14H45z M47,41h8v2h-8z M47,44h8v2h-8z M47,47h8v2h-8z" fill="var(--brand-2)"/><rect x="44" y="38" width="14" height="16" rx="2" fill="none" stroke="var(--muted)" stroke-width="1.5"/><path d="M32,49v6" stroke="var(--muted)" stroke-width="1.5"/><path d="M32,55 a8,8 0 0,1 -8,-8" fill="none" stroke="var(--brand)" stroke-width="2"/><path d="M32,55 a8,8 0 0,0 8,-8" fill="none" stroke="var(--brand-2)" stroke-width="2"/></g></svg><p class="coming-soon-text muted">Sinyal baru sedang ditangkap...</p><button class="btn small ghost btn-flip-front">Ikut Waitlist</button></div></div><div class="card-face card-back"><h4>Daftar Tunggu</h4><p class="desc" style="text-align: center; font-size: 14px; margin: -8px 0 8px;">Jadilah yang pertama tahu saat template ini meluncur!</p><div class="form-embed-container"><iframe scrolling="no" width="100%" frameborder="0" src="${this.config.WAITLIST_FORM_URL}" title="Formulir Daftar Tunggu"></iframe></div><button class="btn-flip-return btn-flip-back" aria-label="Kembali ke depan"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 14l-4-4l4-4"></path><path d="M5 10h11a4 4 0 1 1 0 8h-1"></path></svg</button></div></div></article>`; }
        if (p.isBundle) {
            return `
            <article class="card bundle-card" data-bundle-id="${p.id}">
                <div class="card-inner">
                    <div class="card-face card-front">
                        <div class="thumb" aria-label="Bundle preview">
                            <img loading="lazy" src="${p.image || 'https://placehold.co/120x120?text=BUNDLE'}" alt="Preview ${p.name}">
                            ${p.badge ? `<span class="badge">${p.badge}</span>` : ''}
                        </div>
                        <div class="card-body">
                            <h3 class="title">${p.name}</h3>
                            <p class="desc">${p.desc}</p>
                            <div class="price">${this.formatIDR(p.price)}</div> 
                            <div class="actions" style="margin-top:12px">
                                <button class="btn small buy-bundle-now-btn" data-bundle-id="${p.id}" ${p.id === "null" ? 'disabled' : ''}>Beli Langsung</button>
                                
                            </div>
                        </div>
                    </div>
                    
                </div>
            </article>`;
        } 
        
        // --- TEMPLATE UNTUK PRODUK BIASA (DEFAULT) ---
        else {
        return `<article class="card" data-product-id="${p.id}"><div class="card-inner"><div class="card-face card-front"><div class="thumb" aria-label="GIF preview"><img loading="lazy" src="${p.image}" alt="Preview ${p.name}"></img>${p.badge?`<span class="badge">${p.badge}</span>`:''}</div><div class="card-body"><h3 class="title">${p.name}</h3><p class="desc">${p.desc}</p><div class="features">${p.features.map(f=>`<span class="chip">${f}</span>`).join('')}</div><div class="price">${this.getPriceDisplay(p)}</div><div class="actions" style="margin-top:12px"><button class="btn small open-product-modal-btn">Bawa ke Orbit</button><button class="btn-demo-icon btn-flip-front" aria-label="Lihat Varian Demo"><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-eye-animated"><defs><radialGradient id="cosmic-eye-gradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%"><stop offset="0%" stop-color="var(--surface)" stop-opacity="0.8"/><stop offset="30%" stop-color="var(--brand-2)"/><stop offset="75%" stop-color="var(--brand)"/><stop offset="100%" stop-color="var(--accent)" stop-opacity="0.7"/></radialGradient></defs><path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="12" r="5" fill="url(#cosmic-eye-gradient)" class="pupil"/><path d="M19 8L21 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M5 8L3 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M12 3V1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg><span class="btn-tooltip">Intip Demo</span></button></div></div></div><div class="card-face card-back"><h4>Pilih Tipe Demo</h4><nav class="demo-links"><a href="${p.demoUrls.noVariant}" target="_blank" rel="noopener"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8.5v-3.5a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-3.5"></path><rect x="3" y="12" width="6" height="6" rx="1"></rect></svg><span>Produk Tanpa Varian</span></a><a href="${p.demoUrls.variant}" target="_blank" rel="noopener"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h6v6h-6z"></path><path d="M14 4h6v6h-6z"></path><path d="M4 14h6v6h-6z"></path><path d="M14 14h6v6h-6z"></path></svg><span>Produk Varian</span></a><a href="${p.demoUrls.bundle}" target="_blank" rel="noopener"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7.5 7.5l9 9"></path><path d="M13 3l-5 5"></path><path d="M21 11l-5 5"></path><path d="M5.5 13.5l5 -5"></path><path d="M16.5 5.5l5 -5"></path></svg><span>Produk Bundle</span></a></nav><button class="btn-flip-return btn-flip-back" aria-label="Kembali ke depan"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 14l-4-4l4-4"></path><path d="M5 10h11a4 4 0 1 1 0 8h-1"></path></svg</button></div></div></article>`;
        }
    },
    
    getPriceDisplay: function(product) {
        if (!product.variants || product.variants.length === 0) return '';
        const hasFreeVariant = product.variants.some(v => v.price === 0);
        if (hasFreeVariant) return '<span class="price-free">Cobain Dulu, Gratis</span>';
        const minPrice = Math.min(...product.variants.map(v => v.price));
        return `Mulai dari <span class="currency">IDR</span><span>${this.formatIDR(minPrice)}</span>`;
    },
    
    openProductModal: function(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;
        const modal = document.getElementById('productModal');
        if (!modal) return;
        
        modal.querySelector('.product-modal-title').textContent = product.name;
        modal.querySelector('.product-modal-badge').textContent = product.badge;
        modal.querySelector('.product-modal-desc').textContent = product.desc;
        modal.querySelector('.product-modal-image img').src = product.image.replace('120x120', '600x400');
        modal.querySelector('.add-to-cart-btn').dataset.productId = productId;
        
        const variantsContainer = modal.querySelector('.product-modal-variants');
        variantsContainer.innerHTML = '';
    
        let firstActiveSet = false;
    
        if (product.variants && product.variants.length > 0) {
            product.variants.forEach((variant, index) => {
                const btn = document.createElement('button');
                btn.className = 'variant-btn';
                btn.textContent = variant.name;
                btn.dataset.variantId = variant.id;
                btn.dataset.price = variant.price;
    
                if (variant.id === "null") {
                    btn.disabled = true;
                }
    
                if (!btn.disabled && !firstActiveSet) {
                    btn.classList.add('active');
                    modal.querySelector('.product-modal-price').textContent = this.formatIDR(variant.price);
                    firstActiveSet = true;
                }
    
                variantsContainer.appendChild(btn);
            });
    
            if (!firstActiveSet) {
                 modal.querySelector('.product-modal-price').textContent = "Pilih Varian";
            }
        } else {
            modal.querySelector('.product-modal-price').textContent = 'Dalam Perjalanan';
        }

        const demoLinksContainer = modal.querySelector('.product-modal-demo-links nav');
        demoLinksContainer.innerHTML = `<a href="${product.demoUrls.noVariant}" target="_blank" rel="noopener">Produk Tanpa Varian</a><a href="${product.demoUrls.variant}" target="_blank" rel="noopener">Produk Varian</a><a href="${product.demoUrls.bundle}" target="_blank" rel="noopener">Produk Bundle</a>`;
        
        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('visible'), 10);
    },
    
    closeProductModal: function() {
        const modal = document.getElementById('productModal');
        if (modal) {
            modal.classList.remove('visible');
            setTimeout(() => modal.style.display = 'none', 300);
        }
    },
    
    setupTruncatedDescriptions: function() {
        document.querySelectorAll('#katalog .card-body .desc').forEach(descEl => {
            if (descEl.scrollHeight > descEl.clientHeight) descEl.classList.add('truncated');
        });
    },
    
    injectSchema: function() {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        const data = {
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            'itemListElement': this.products.map((p, i) => ({
                '@type': 'ListItem',
                'position': i + 1,
                'name': p.name
            }))
        };
        script.textContent = JSON.stringify(data);
        document.head.appendChild(script);
    },
    
    loadPurchaseEvents: function() {
        try {
            const dataElement = document.getElementById('purchase-events-data');
            this.purchaseEvents = JSON.parse(dataElement.textContent);
        } catch (e) {
            console.warn('Gagal memuat data purchase events.');
            this.purchaseEvents = [];
        }
    },
    
    showToast: function() {
        if (this.purchaseEvents.length === 0) return;
        const event = this.purchaseEvents[Math.floor(Math.random() * this.purchaseEvents.length)];
        
        const timeNow = new Date();
        const timePurchase = new Date(event.timestamp);
        const diffMinutes = Math.round((timeNow - timePurchase) / (1000 * 60));
        
        let timeAgo = '';
        if (diffMinutes < 1) timeAgo = 'baru saja';
        else if (diffMinutes < 60) timeAgo = `${diffMinutes} menit yang lalu`;
        else timeAgo = `beberapa jam yang lalu`;
    
        const toast = document.getElementById('toast');
        const toastItemEl = document.getElementById('toastItem');
        if (toastItemEl) toastItemEl.textContent = event.item;
        if (toast) {
            toast.firstChild.textContent = `${event.buyer} ${timeAgo}`;
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 4500);
        }
    },

    triggerHeavyFeatures: function() {
        if (this.heavyFeaturesInitialized) return;
        this.heavyFeaturesInitialized = true;
        this.initHeavyFeatures();
        ['mousemove', 'scroll', 'touchstart'].forEach(event => {
            window.removeEventListener(event, this.boundTriggerHeavyFeatures);
        });
    },

    initHeavyFeatures: function() {
        const heroSection = document.querySelector('.hero');
        this.plexus.canvas = document.getElementById('plexusCanvas');

        if (this.plexus.canvas && heroSection) {
            this.plexus.ctx = this.plexus.canvas.getContext('2d');
            const self = this;

            const initPlexus = () => {
                let rect = heroSection.getBoundingClientRect();
                if (!rect.width || !rect.height) return;
                self.plexus.canvas.width = rect.width;
                self.plexus.canvas.height = rect.height;
                let rootStyles = getComputedStyle(document.documentElement);
                self.plexus.ctx.strokeStyle = rootStyles.getPropertyValue('--plexus-color').trim();
                self.plexus.ctx.fillStyle = rootStyles.getPropertyValue('--plexus-color').trim();
                self.plexus.particlesArray = [];
                let numberOfParticles = (self.plexus.canvas.width * self.plexus.canvas.height) / 9000;
                for (let i = 0; i < numberOfParticles; i++) {
                    self.plexus.particlesArray.push({
                        x: Math.random() * self.plexus.canvas.width,
                        y: Math.random() * self.plexus.canvas.height,
                        size: Math.random() * 1.5 + 0.5
                    });
                }
            };
            const connectPlexus = () => {
                if (self.plexus.mouse.x == null || !self.plexus.particlesArray) return;
                for (let a = 0; a < self.plexus.particlesArray.length; a++) {
                    let dx = self.plexus.mouse.x - self.plexus.particlesArray[a].x;
                    let dy = self.plexus.mouse.y - self.plexus.particlesArray[a].y;
                    let distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < self.plexus.mouse.radius) {
                        self.plexus.ctx.beginPath();
                        self.plexus.ctx.moveTo(self.plexus.mouse.x, self.plexus.mouse.y);
                        self.plexus.ctx.lineTo(self.plexus.particlesArray[a].x, self.plexus.particlesArray[a].y);
                        self.plexus.ctx.lineWidth = 1 - distance / self.plexus.mouse.radius;
                        self.plexus.ctx.stroke();
                    }
                }
            };
            const animatePlexus = () => {
                if (!self.plexus.particlesArray || !self.plexus.canvas.isConnected) {
                    cancelAnimationFrame(self.plexus.animationFrameId);
                    return;
                }
                self.plexus.ctx.clearRect(0, 0, self.plexus.canvas.width, self.plexus.canvas.height);
                for (let i = 0; i < self.plexus.particlesArray.length; i++) {
                    self.plexus.ctx.beginPath();
                    self.plexus.ctx.arc(self.plexus.particlesArray[i].x, self.plexus.particlesArray[i].y, self.plexus.particlesArray[i].size, 0, Math.PI * 2);
                    self.plexus.ctx.fill();
                }
                connectPlexus();
                self.plexus.animationFrameId = requestAnimationFrame(animatePlexus);
            };
            window.initPlexus = initPlexus;
            initPlexus();
            animatePlexus();
            self.plexus.connectFn = connectPlexus;
            window.addEventListener('resize', () => initPlexus());
        }
        
        const loadScript = (src, callback) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = () => callback();
            script.onerror = () => console.error(`Gagal memuat skrip: ${src}`);
            document.head.appendChild(script);
        };
        
        const allCards = document.querySelectorAll('.card');
        if (allCards.length > 0) {
            this.apply3dEffect(allCards);
        }

        loadScript('https://cdnjs.cloudflare.com/ajax/libs/tone/14.7.77/Tone.js', () => {
            try {
                const reverb = new Tone.Reverb({ decay: 1.5, wet: 0.4 }).toDestination();
                this.audio.addToCartSound = new Tone.Synth({ oscillator: { type: 'triangle' }, envelope: { attack: 0.005, decay: 0.1, sustain: 0.2, release: 0.4 } }).connect(reverb);
                this.audio.addToCartSound.volume.value = -8;
                
                this.audio.jetSound = new Tone.NoiseSynth({ noise: { type: "pink" }, envelope: { attack: 0.02, decay: 0.6, sustain: 0, release: 0.3 }, filterEnvelope: { attack: 0.01, decay: 0.5, sustain: 0, baseFrequency: 150, octaves: 7, exponent: 1.5, } }).toDestination();
                this.audio.jetSound.volume.value = -10;

                const filter = new Tone.Filter({ type: 'lowpass', frequency: 8000 }).toDestination();
                const noise = new Tone.NoiseSynth({ noise: { type: 'white' }, envelope: { attack: 0.001, decay: 0.1, sustain: 0 } }).connect(filter);
                noise.volume.value = -15;
                filter.frequency.value = 100;
                filter.Q.value = 15;
                this.audio.flipSoundEffect = { noise, filter };
                
                this.audio.ambientSound = new Tone.Noise("brown").toDestination();
                const autoFilter = new Tone.AutoFilter({ frequency: "8m", baseFrequency: 200, octaves: 4 }).toDestination();
                this.audio.ambientSound.connect(autoFilter);
                this.audio.ambientSound.volume.value = -35;
                autoFilter.start();

            } catch (e) { console.error("Gagal membuat suara efek:", e); }
        });
    },
    
    ensureAudioIsReady: async function() {
        if (this.audio.isAudioInitialized) return;
    
        try {
            await Tone.start();
            this.audio.isAudioInitialized = true;
        } catch (e) {
            console.error("Gagal memulai Audio Context:", e);
        }
    },
    
    handleAudioInteraction: async function() {
        await this.ensureAudioIsReady();
        if (this.audio.isFirstFabInteraction) {
            this.audio.isFirstFabInteraction = false;
            const isMuted = localStorage.getItem('scaleMarketAudioMuted') === 'true';
            if (!isMuted) this.toggleSound(); else this.updateAudioUI(false);
        }
    },

    toggleSound: function() {
        if (!this.audio.isAudioInitialized || !this.audio.ambientSound) return;
        if (this.audio.ambientSound.state === 'started') {
            this.audio.ambientSound.stop();
            this.updateAudioUI(false);
        } else {
            this.audio.ambientSound.start();
            this.updateAudioUI(true);
        }
        localStorage.setItem('scaleMarketAudioMuted', this.audio.ambientSound.state !== 'started');
    },

    updateAudioUI: function(isPlaying) {
        const fabMain = document.getElementById('fabMain');
        const audioToggle = document.getElementById('audioToggle');
        if (!fabMain || !audioToggle) return;
        const soundOnIcon = audioToggle.querySelector('.sound-on');
        const soundOffIcon = audioToggle.querySelector('.sound-off');
        fabMain.classList.toggle('pulsing', isPlaying);
        if(soundOnIcon) soundOnIcon.style.display = isPlaying ? 'inline-block' : 'none';
        if(soundOffIcon) soundOffIcon.style.display = isPlaying ? 'none' : 'inline-block';
        audioToggle.title = isPlaying ? 'Matikan Suara' : 'Aktifkan Suara';
        audioToggle.dataset.state = isPlaying ? 'playing' : 'stopped';
    },
};

window.addEventListener('load', () => {
    ScaleMarketApp.init();
});
