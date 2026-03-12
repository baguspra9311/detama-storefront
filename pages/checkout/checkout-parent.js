(() => {

const urlParamsDebug = new URLSearchParams(window.location.search);
    const IS_DEBUG_MODE = urlParamsDebug.has('debug');
    const DEFAULT_STORE_ICON_URL = 'https://cdn.scalev.id/business_files/evtBb7rDiursgUYp7C1XwGSf/1760486551169-Logo%20NEW%202025.png';
    const DEFAULT_STORE_NAME = 'DeTama.id';
    const VOUCHER_STORAGE_KEY = 'my_vouchers_v1';
    let masterKeranjang = {};
    let masterProductDatabase = null;
    let validItemCount = 0;
    let invalidItemCount = 0;
    let dataSource = 'none';
    let urlSourceType = 'none';
    let invalidProductsList = [];
    let isBuyNowMode = false;
    let isInCsMode = false;
    let hiddenSKUs = new Set();
    let failsafeTimer = null;
    let removeFailsafeTimer = null;
    let currentValidMap = {};
    let latestImageUrls = {};
    let autoApplyCode = null;
    let autofillData = null;
    let autofillSent = false;
    let shouldShowVoucherButton = false;
    
    let isIframeReady = false;
    let cartItemsReceived = false;
    let totalsReceived = false;
    let paymentOptionsReceived = false;
    let isIframeResized = false;
    let grandRevealDone = false;

    let lastKnownCartItems = [];
    let lastKnownTotals = null;
    let lastKnownPaymentOptions = [];
    let lastKnownItemCount = -1;
    let initialPaymentMethod = 'QRIS';
    
    const WA_PHONE_NUMBER = '6285691290773';
    const defaultButtonText = {
        desktop: "Lanjutkan ke Pembayaran",
        sticky: "Bayar Sekarang"
    };
    
    let isHintVisible = false;
    function handleScrollAndHideHint() {
        if (isHintVisible) {
            const hint = document.getElementById('scroll-hint-overlay');
            if (hint) hint.classList.add('is-hidden'); 
            window.removeEventListener('scroll', handleScrollAndHideHint);
            isHintVisible = false;
            if (IS_DEBUG_MODE) console.log('PARENT: Hint scroll disembunyikan oleh user.');
        }
    }

document.addEventListener('DOMContentLoaded', function() {
    const activeTheme = localStorage.getItem('theme') || 'dark';
    if (IS_DEBUG_MODE) console.log(`PARENT: Tema awal terdeteksi: ${activeTheme}`);
    const wrapper = document.querySelector('.checkout-page-wrapper');
    if (wrapper) wrapper.setAttribute('data-theme', activeTheme);
    if (IS_DEBUG_MODE) console.log('Memulai script checkout v4.1 (SKU + Gerbang 5 Kunci)');

    const CART_KEY = 'universalCart_v1';
    const BUY_NOW_KEY = 'buyNowItem_v1';
    const SCALEV_CHECKOUT_URL = 'https://kelasnyatama.com/c/checkout';
    const iframeOrigin = new URL(SCALEV_CHECKOUT_URL).origin;

    const iframe = document.getElementById('checkout-iframe');
    const checkoutButtons = [document.getElementById('stickyCheckoutBtn'), document.getElementById('desktopCheckoutBtn')];
    const cartItemsWrapper = document.getElementById('cart-items-wrapper');
    const loadingState = document.getElementById('loading-state');
    const iframeWrapper = document.getElementById('iframe-wrapper');

    const paymentModal = document.getElementById('payment-modal');
    const openModalBtn = document.getElementById('changePaymentBtn');
    const closeModalBtn = document.getElementById('payment-modal-close-btn');
    const paymentOptionsList = document.getElementById('payment-options-list');

    const selectedPaymentLogo = document.getElementById('selectedPaymentLogo');
    const selectedPaymentName = document.getElementById('selectedPaymentName');
    const cartTotalEl = document.getElementById('cart-total');
    const stickyCartTotalEl = document.getElementById('sticky-cart-total');
    const subtotalEl = document.getElementById('cart-subtotal');
    const discountRow = document.getElementById('discount-row');
    const discountEl = document.getElementById('cart-discount');
    const feeRow = document.getElementById('fee-row');
    const feeLabel = document.getElementById('fee-label');
    const feeEl = document.getElementById('cart-fee');
    
    const ToastManager = {
        container: document.getElementById('toast-container'),
        create: function(message, type = 'error') {
            if (!this.container) return;
            const toastId = `toast-${Date.now()}`;
            const toast = document.createElement('div');
            toast.id = toastId;
            toast.className = `toast-notification ${type}`;
            let iconSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
            if (type === 'success') iconSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
            if (type === 'warning') iconSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
            toast.innerHTML = `
                <div class="toast-icon-wrapper">${iconSVG}</div>
                <span class="toast-message">${message}</span>
                <button class="toast-close-btn" aria-label="Tutup notifikasi">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            `;
            this.container.appendChild(toast);
            toast.querySelector('.toast-close-btn').addEventListener('click', () => this.remove(toastId));
            setTimeout(() => this.remove(toastId), 6000);
        },
        remove: function(toastId) {
            const toast = document.getElementById(toastId);
            if (toast && !toast.classList.contains('closing')) {
                toast.classList.add('closing');
                toast.addEventListener('animationend', () => toast.remove());
            }
        }
    };
    
    const paymentGroupsBlueprint = {
        'QRIS': { keywords: ['qris'], items: [] },
        'ALL E-Payment': { keywords: ['virtual account / gopay / dana'], items: [] },
        'E-Wallet': { keywords: ['gopay', 'dana', 'ovo', 'shopeepay', 'linkaja'], items: [], open: true }, 
        'Virtual Account': { keywords: ['virtual account'], items: [] }, 
        'Bank Transfer': { keywords: ['bank central asia', 'bank mandiri', 'bank danamon indonesia'], items: [] }
    };
    
    function renderPaymentModal(options) {
        paymentOptionsReceived = true;
        lastKnownPaymentOptions = options || [];
        
        const listContainer = document.getElementById('payment-options-list');
        listContainer.innerHTML = ''; 
        let groups = JSON.parse(JSON.stringify(paymentGroupsBlueprint));
        const cdnBaseUrl = 'https://cdn.scalev.id/icons/';
    
        options.forEach(option => {
            const lowerCaseName = option.name.toLowerCase();
            let foundGroup = false;
            for (const groupName in groups) {
                let isMatch = groups[groupName].keywords.some(kw => lowerCaseName.includes(kw));
                if (groupName === 'E-Wallet' && lowerCaseName.includes('danamon')) {
                    isMatch = false;
                }
                if (isMatch) {
                    groups[groupName].items.push(option);
                    foundGroup = true;
                    break; 
                }
            }
        });
        for (const groupName in groups) {
            const groupData = groups[groupName];
            if (groupData.items.length === 0) continue; 
            if (groupName === 'QRIS' || groupName === 'ALL E-Payment') {
                const item = groupData.items[0];
                listContainer.innerHTML += `
                    <div class="payment-option-item" data-method-name="${item.name}">
                        <img src="${cdnBaseUrl}${item.icon}" alt="${item.name}">
                        <span class="payment-option-name">${item.name}</span>
                        <div class="payment-option-loader"></div>
                    </div>`;
                continue;
            }
            const isOpen = groupData.open ? 'open' : '';
            let itemsHTML = '';
            groupData.items.forEach(item => {
                itemsHTML += `
                    <div class="payment-option-item" data-method-name="${item.name}">
                        <img src="${cdnBaseUrl}${item.icon}" alt="${item.name}">
                        <span class="payment-option-name">${item.name}</span>
                        <div class="payment-option-loader"></div>
                    </div>`;
            });
            listContainer.innerHTML += `
                <details class="payment-group" ${isOpen}>
                    <summary class="payment-group-header">${groupName}</summary>
                    <div class="payment-group-content">${itemsHTML}</div>
                </details>`;
        }
        
        tryGrandReveal();
    }

    const formatIDR = (n) => {
        if (n === 0) return 'Gratis';
        if (!n || isNaN(n)) return 'Rp 0';
        return 'Rp ' + Number(n).toLocaleString('id-ID');
    };
    
    function handleFreeOrder() {
        openModalBtn.disabled = true;
        iframe.contentWindow.postMessage({ type: 'SELECT_PAYMENT_METHOD', methodName: 'No Payment' }, iframeOrigin);
    }

    function updatePaymentTriggerButton(methodName, iconUrl = null, iconFilename = null) {
        const cdnBaseUrl = 'https://cdn.scalev.id/icons/';
        let iconSrc = 'https://placehold.co/32x32/FFFFFF/FFFFFF';
        let nameHTML = methodName;
        
        const chevron = openModalBtn.querySelector('.chevron');
        if (chevron) chevron.style.display = '';

        if (iconUrl) {
            iconSrc = iconUrl;
        } 
        else if (iconFilename) {
            iconSrc = cdnBaseUrl + iconFilename;
        } 
        else if (methodName.toLowerCase() === 'no payment') {
            iconSrc = cdnBaseUrl + 'no_payment.png';
            nameHTML = 'Tidak diperlukan';
            if (chevron) chevron.style.display = 'none';
        }
        else {
            iconSrc = 'https://placehold.co/32x32/FFFFFF/FFFFFF'; 
            if (IS_DEBUG_MODE) console.warn(`updatePaymentTriggerButton: Tidak ada iconUrl atau iconFilename untuk ${methodName}.`);
        }
        
        selectedPaymentLogo.src = iconSrc; 
        selectedPaymentName.innerHTML = nameHTML; 
    }
    
    window.addEventListener('message', function(event) {
        if (event.origin !== iframeOrigin) return;

        try { 
            const message = JSON.parse(event.data);
            if (message && message.type === 'resize' && message.height) {
                iframe.style.height = message.height + 'px';
                
                if (!isIframeResized) {
                    if (IS_DEBUG_MODE) console.log('PARENT: Menerima sinyal "resize" pertama. Iframe sekarang "FIT".');
                    isIframeResized = true;
                    tryGrandReveal(); 
                }
                
                return;
            }
        } catch(e) {}

        if (typeof event.data === 'string' && event.data.startsWith('http')) {
            if (IS_DEBUG_MODE) console.log("PARENT: Menerima sinyal redirect dari iframe. Membersihkan checkoutItems_v1...");
            if (failsafeTimer) clearTimeout(failsafeTimer);
    
            try { 
                localStorage.removeItem('checkoutItems_v1'); 
                if (IS_DEBUG_MODE) console.log("PARENT: checkoutItems_v1 berhasil dihapus.");
            } catch(e){
                if (IS_DEBUG_MODE) console.error("PARENT: Gagal menghapus checkoutItems_v1 saat redirect:", e);
            }
    
            window.location.href = event.data;
            return;
        }

        const data = event.data;
        if (!data || !data.type) return;
        
        if (IS_DEBUG_MODE) console.log("PARENT: Menerima pesan:", data.type);

        switch (data.type) {
            
            case 'VALIDATION_STARTED':
                checkoutButtons.forEach(btn => {
                    if (btn.dataset.action !== 'whatsapp') {
                        btn.disabled = true;
                        btn.classList.add('is-validating-wa');
                        btn.dataset.action = 'none'; 

                        const textEl = btn.querySelector('.button-action-text');
                        if (textEl) {
                            textEl.innerHTML = `
                                Sedang memvalidasi nomor
                                <span class="loading-text-dots">
                                    <span>.</span><span>.</span><span>.</span>
                                </span>
                            `;
                        }
                    }
                });
                break;

            case 'VALIDATION_ENDED':
                 checkoutButtons.forEach(btn => {
                    if (btn.classList.contains('is-validating-wa')) {
                        btn.classList.remove('is-validating-wa'); 
                        
                        const textEl = btn.querySelector('.button-action-text');
                        if (textEl) {
                            if (btn.id === 'desktopCheckoutBtn') {
                                textEl.textContent = defaultButtonText.desktop;
                            } else if (btn.id === 'stickyCheckoutBtn') {
                                textEl.textContent = defaultButtonText.sticky;
                            }
                        }
                    }
                });
                break;
            
            case 'ENABLE_CHECKOUT':
                checkoutButtons.forEach(btn => {
                    if (btn.dataset.action !== 'whatsapp') { 
                        btn.disabled = false;
                        btn.style.background = '';
                        btn.dataset.action = 'submit';
                        btn.classList.remove('is-error-state');
                        
                        const textEl = btn.querySelector('.button-action-text');
                        if (textEl) {
                            if (btn.id === 'desktopCheckoutBtn') {
                                textEl.textContent = defaultButtonText.desktop;
                            } else if (btn.id === 'stickyCheckoutBtn') {
                                textEl.textContent = defaultButtonText.sticky;
                            }
                        }
                    }
                });
                break;

            case 'DISABLE_CHECKOUT':
                checkoutButtons.forEach(btn => {
                    btn.disabled = true;
                    btn.dataset.action = 'none';
                    
                    const textEl = btn.querySelector('.button-action-text');
                    
                    if (textEl && data.message) {
                        btn.classList.add('is-error-state');
                        textEl.textContent = data.message.trim();
                    } else {
                    }
                });
                break;
                
            case 'IFRAME_READY':
                isIframeReady = true;          
                iframe.contentWindow.postMessage({ type: 'SET_THEME', theme: activeTheme }, iframeOrigin);                
                if (cartItemsReceived) {
                    selectInitialPaymentMethod();
                }
                
                tryGrandReveal();
                break;

            case 'PAYMENT_OPTIONS_DATA':
                renderPaymentModal(data.options || []);
                
                if (window.innerWidth <= 992) {
                    const hint = document.getElementById('scroll-hint-overlay');
                    if (hint) {
                        hint.classList.remove('is-hidden');
                        isHintVisible = true;
                        window.addEventListener('scroll', handleScrollAndHideHint, { passive: true });
                        if (IS_DEBUG_MODE) console.log('PARENT: (IFRAME_READY) Menampilkan hint scroll.');
                    }
                }
                break;
                
            case 'UPDATE_CART_ITEMS':
                if (removeFailsafeTimer) { clearTimeout(removeFailsafeTimer); }
                
                const isFirstCartUpdate = !cartItemsReceived;
                cartItemsReceived = true; 
                lastKnownCartItems = data.items || [];
                lastKnownItemCount = data.itemCount !== undefined ? data.itemCount : -1;
                renderFullCart(lastKnownCartItems, lastKnownItemCount);
                
                if (isIframeReady && isFirstCartUpdate) {
                    selectInitialPaymentMethod();
                }
                
                tryGrandReveal();
                break;
                
            case 'INITIAL_PAYMENT_STATE':
                initialPaymentMethod = data.methodName || 'QRIS';
                break;

            case 'UPDATE_TOTALS':
                const isFirstTotalUpdate = !totalsReceived; 

                totalsReceived = true;
                lastKnownTotals = data.data;
                renderTotals(lastKnownTotals);

                if (isFirstTotalUpdate && autofillData && !autofillSent) {
                    if (IS_DEBUG_MODE) console.log('PARENT: (UPDATE_TOTALS) Total diterima, hidrasi diasumsikan selesai. Mengirim data autofill...');
                    iframe.contentWindow.postMessage({
                        type: 'LOAD_AUTOFILL_DATA',
                        data: autofillData
                    }, iframeOrigin);
                    autofillSent = true;
                }

                tryGrandReveal();
                break;

            case 'INVALID_CART':
                handleInvalidCartSignal();
                tryGrandReveal();
                break;
                
            case 'PAYMENT_SELECTION_CONFIRMED': {
                if (IS_DEBUG_MODE) console.log(`PARENT: Konfirmasi diterima! Metode: ${data.methodName}, URL: ${data.iconUrl}, Fallback: ${data.iconFilename}`);
                updatePaymentTriggerButton(data.methodName, data.iconUrl, data.iconFilename); 
                
                const logoWrapper = document.querySelector('#changePaymentBtn .payment-logo-wrapper');
                if (logoWrapper) {
                    logoWrapper.classList.remove('is-pulsing-loading');
                }
                const loadingDots = document.getElementById('payment-loading-dots');
                if (loadingDots) {
                    loadingDots.remove();
                }
                const confirmedItem = document.querySelector(`.payment-option-item.is-selecting`);
                if (confirmedItem) {
                    confirmedItem.classList.remove('is-selecting');
                    setTimeout(() => paymentModal.classList.remove('is-open'), 300); 
                }
                break;
            }
                
            case 'PAYMENT_SELECTION_FAILED': {
                if (IS_DEBUG_MODE) console.error(`PARENT: Iframe gagal memilih metode "${data.requestedMethod}". Alasan: ${data.reason}.`);
                const failedItem = document.querySelector(`.payment-option-item.is-selecting`);
                if (failedItem) {
                    failedItem.classList.remove('is-selecting');
                }
                paymentModal.classList.remove('is-open');

                let fallbackMethodName = data.currentSelectedMethod || 'Unknown';

                if (fallbackMethodName !== 'Unknown' && fallbackMethodName !== 'No Payment') {
                    if (IS_DEBUG_MODE) console.log(`PARENT: Fallback - Menggunakan metode terpilih saat ini dari iframe: ${fallbackMethodName}`);
                    updatePaymentTriggerButton(fallbackMethodName);
                    initialPaymentMethod = fallbackMethodName;
                } else {
                    if (IS_DEBUG_MODE) console.warn(`PARENT: Fallback - Tidak ada metode valid terpilih di iframe. Mereset UI.`);
                    updatePaymentTriggerButton("Pilih Metode Pembayaran");
                     selectedPaymentLogo.src = 'https://placehold.co/32x32/FFFFFF/FFFFFF';
                     const chevron = openModalBtn.querySelector('.chevron');
                     if (chevron) chevron.style.display = '';
                     openModalBtn.disabled = false;
                }
                const logoWrapper = document.querySelector('#changePaymentBtn .payment-logo-wrapper');
                 if (logoWrapper) {
                     logoWrapper.classList.remove('is-pulsing-loading');
                 }
                 const loadingDots = document.getElementById('payment-loading-dots');
                 if (loadingDots) {
                     loadingDots.remove();
                 }
                break;
            }
            
            case 'UPDATE_PRODUCT_IMAGE':
                if (data.variantSKU && data.newImageUrl) {
                    const sku = data.variantSKU;
                    const newImageUrl = data.newImageUrl;
    
                    const imgToUpdate = cartItemsWrapper.querySelector(`.cart-item[data-sku="${sku}"] .cart-item-image`);
                    if (imgToUpdate) {
                        if (IS_DEBUG_MODE) console.log(`PARENT: Mengupdate gambar DOM untuk SKU ${sku}`);
                        imgToUpdate.src = newImageUrl;
                        imgToUpdate.style.background = 'none'; 
                    } else {
                         if (IS_DEBUG_MODE) console.warn(`PARENT: Tidak menemukan elemen gambar DOM untuk diupdate (SKU: ${sku})`);
                    }
    
                    if (IS_DEBUG_MODE) console.log(`PARENT: Menyimpan URL gambar terbaru untuk SKU ${sku} ke latestImageUrls.`);
                    latestImageUrls[sku] = newImageUrl; 
                }
                break;
                
            case 'SHOW_ERROR':
                ToastManager.create(data.message, data.errorType || 'error');
                if (data.errorType === 'error' || data.errorType === 'warning') {
                    releaseCheckoutButtons();
                }
                break;
                
            case 'SAVE_AUTOFILL_DATA':
                if (data.data) {
                    try {
                        localStorage.setItem('autofill_v1', JSON.stringify(data.data));
                        if (IS_DEBUG_MODE) console.log('PARENT: Data autofill berhasil disimpan.');
                        
                        localStorage.removeItem(VOUCHER_STORAGE_KEY);
                        if (IS_DEBUG_MODE) console.log('PARENT: Voucher yang tersimpan telah dihapus.');

                    } catch (e) {
                        if (IS_DEBUG_MODE) console.warn('PARENT: Gagal menyimpan/menghapus storage.', e);
                    }
                }
                break;
                
            case 'SUBMISSION_FAILED':
                releaseCheckoutButtons();
                break;
        }
    });
    
    function renderFullCart(iframeItems, itemCount) {
        if (IS_DEBUG_MODE) console.log(`PARENT: Merender keranjang dengan ${itemCount} item (dari iframe). Sumber data: ${dataSource}`);
        if (IS_DEBUG_MODE) console.log('DEBUG: Isi masterKeranjang SAAT renderFullCart DIMULAI:', JSON.stringify(masterKeranjang));
        cartItemsWrapper.innerHTML = ''; 
        let calculatedSubtotal = 0; 
        invalidProductsList = []; 
        
        let validItemCount = 0;
        let invalidItemCount = 0;
    
        const currentValidMap = {};
        const expectedItemsMap = {};
        
        if (Array.isArray(iframeItems)) {
            iframeItems.forEach((item, index) => {
                try {
                    if (item && typeof item === 'object' && item.variantSKU && typeof item.price === 'string' && item.qty !== undefined) {
                        const sku = item.variantSKU;
                        const priceString = item.price;
                        const quantity = parseInt(item.qty, 10);
                        const cleanedPrice = priceString.replace(/[^0-9]/g, '');
                        const imageUrl = item.image || null;

                        if (sku && cleanedPrice !== '' && !isNaN(quantity)) {
                            currentValidMap[sku] = {
                                price: cleanedPrice,
                                qty: quantity,
                                image: imageUrl,
                            };
                            if (!expectedItemsMap[sku]) expectedItemsMap[sku] = {};
                        } else {
                             if (IS_DEBUG_MODE) console.warn(`PARENT: (currentValidMap) Data item iframe #${index} tidak valid setelah dibersihkan:`, { sku, cleanedPrice, quantity, originalItem: item });
                        }
                    } else {
                         if (IS_DEBUG_MODE) console.warn(`PARENT: (currentValidMap) Melewati item iframe #${index} karena data awal tidak lengkap/valid:`, item);
                    }
                } catch (e) { if (IS_DEBUG_MODE) console.error(`PARENT: (currentValidMap) Error saat memproses item iframe #${index}:`, item, e); }
            });
        } else { if (IS_DEBUG_MODE) console.error("PARENT: (currentValidMap) Data 'iframeItems' bukan array:", iframeItems); }
    
        if (masterKeranjang && typeof masterKeranjang === 'object') {
             Object.values(masterKeranjang).forEach(store => store.items.forEach(item => {
                 const key = item.sku || 'MISSING_SKU_' + item.variantId;
                 if (!hiddenSKUs.has(key)) {
                    expectedItemsMap[key] = { ...item, rendered: false };
                 }
             }));
         }
         
        if (IS_DEBUG_MODE) console.log("PARENT: Membandingkan SKU:");
        if (IS_DEBUG_MODE) console.log(" - Dari Storage (masterKeranjang/expectedItemsMap):", Object.keys(expectedItemsMap));
        if (IS_DEBUG_MODE) console.log(" - Dari Iframe (currentValidMap keys):", Object.keys(currentValidMap));
        if (IS_DEBUG_MODE) console.log(" - SKU yang disembunyikan:", Array.from(hiddenSKUs));
    
        Object.entries(masterKeranjang).forEach(([storeName, storeData]) => {
            if (!storeData || !storeData.items || !storeData.items.length === 0) return;
            
            const itemsToRender = storeData.items.filter(item => {
                const itemSKU_master = item.sku || 'MISSING_SKU_' + item.variantId;
                if (!itemSKU_master) return !hiddenSKUs.has('MISSING_SKU_' + item.variantId);
                return !hiddenSKUs.has(itemSKU_master);
            });

            if (itemsToRender.length === 0) return;
    
            const groupEl = document.createElement('div');
            groupEl.className = 'cart-store-group';
            groupEl.innerHTML = `
                <div class="cart-store-header">
                    <img src="${storeData.icon || DEFAULT_STORE_ICON_URL}" alt="${storeName || DEFAULT_STORE_NAME}" class="cart-store-icon">
                    <span class="cart-store-name">${storeName || DEFAULT_STORE_NAME}</span>
                </div>`;
            let itemsHTML = '';
    
            itemsToRender.forEach(item => {
                const itemSKU_master = item.sku || 'MISSING_SKU_' + item.variantId;
                
                if (hiddenSKUs.has(itemSKU_master)) return;
    
                const displayName = item.productName || item.name || 'Produk Tidak Dikenal';
                const displayVariant = item.variantName || '';
                
                const iframeData = currentValidMap[itemSKU_master];
                
                const displayImage = latestImageUrls[itemSKU_master] || item.productImage || item.image || 'https://placehold.co/48x48';
    
                let itemPriceHTML = '';
                let itemClass = "cart-item";
    
                if (iframeData) {
                    validItemCount++;
                    expectedItemsMap[itemSKU_master].rendered = true;
    
                    try {
                        let priceDisplayHTML = '';
                        let itemPriceNumber = 0;
                        let priceForSubtotalCalc = 0;

                        if (item.isBundle) {
                            itemPriceNumber = item.price || 0;
                            priceDisplayHTML = `<span>${formatIDR(itemPriceNumber)}</span>`; 
                            priceForSubtotalCalc = parseInt(String(iframeData.price).replace(/[^0-9]/g, ''), 10) || 0;
                        } else { 
                            priceForSubtotalCalc = parseInt(String(iframeData.price).replace(/[^0-9]/g, ''), 10) || 0;
                            itemPriceNumber = priceForSubtotalCalc * (iframeData.qty || 1);
                            priceDisplayHTML = `<span>${formatIDR(itemPriceNumber)}</span>`;
                        }

                        calculatedSubtotal += priceForSubtotalCalc * (iframeData.qty || 1);

                        let removeButtonHTML = '';
                            if (itemCount > 1) {
                                removeButtonHTML = `
                                    <button type="button" class="cart-item-remove-btn"
                                        data-sku="${itemSKU_master}" style="background:none; border:none; color:var(--text-muted); cursor:pointer; font-size: 12px; text-decoration:underline; padding:0; margin-top: 4px;"
                                        aria-label="Hapus ${displayName} ${displayVariant} dari keranjang">
                                        Hapus
                                    </button>
                                `; 
                            }
                        itemPriceHTML = `<div style="display: flex; flex-direction: column; align-items: flex-end;">${priceDisplayHTML}${removeButtonHTML}</div>`;
                    
                    } catch(e) {
                         if (IS_DEBUG_MODE) console.error(`ERROR SAAT HITUNG HARGA VALID: SKU Master: ${itemSKU_master}`, 'Item Data:', item, 'Iframe Data:', iframeData, 'Error:', e);
                         itemClass += " item-invalid";
                         invalidItemCount++;
                         invalidProductsList.push({ name: displayName || 'Produk Error Kalkulasi', id: item.variantId });
                         itemPriceHTML = `<div class="cart-item-price" style="color:var(--danger); font-weight: 600; font-size: 14px; text-align: right;">Error Harga</div>`;
                    }
    
                } else {
                    invalidItemCount++;
                    invalidProductsList.push({ name: displayName, id: item.variantId });
                    const dataName = displayName.replace(/'/g, "&apos;");
                    const dataId = item.variantId;
                    
                    itemPriceHTML = `
                    <div class="cart-item-price" style="display: flex; flex-direction: column; align-items: flex-end;">
                        <span style="color:var(--danger); font-weight: 600; font-size: 14px;">Tidak Valid</span>
                        
                        <div class="invalid-item-actions">
                            <button type="button" 
                                    class="invalid-item-report-btn" 
                                    data-name="${dataName}" 
                                    data-id="${dataId}"
                                    aria-label="Info kenapa ${dataName} tidak valid">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="12" y1="16" x2="12" y2="12"></line>
                                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                                </svg>
                            </button>
                            
                            <button type="button" 
                                    class="invalid-item-action-link"
                                    data-sku="${itemSKU_master}"
                                    aria-label="Hapus ${dataName} dari keranjang">Hapus
                            </button>
                        </div>
                    </div>`;

                    itemClass += " item-invalid";
                }
    
                itemsHTML += `<div class="${itemClass}" data-sku="${itemSKU_master}">
                        <img src="${displayImage}" alt="${displayName}" class="cart-item-image">
                        <div class="cart-item-details">
                            <div class="cart-item-name">${displayName}</div>
                            <div class="cart-item-variant">${displayVariant}</div>
                        </div>
                        <div class="cart-item-price">${itemPriceHTML}</div>
                    </div>`;
            });
    
            if (itemsHTML.trim() !== '') {
                groupEl.innerHTML += itemsHTML;
                cartItemsWrapper.appendChild(groupEl);
            }
        });
    
        Object.keys(currentValidMap).forEach(iframeSku => {
             if (!expectedItemsMap[iframeSku] || !expectedItemsMap[iframeSku].rendered) {
                 const iframeData = currentValidMap[iframeSku];
                 let priceFromIframe = parseInt(String(iframeData.price).replace(/[^0-9]/g, ''), 10) || 0;
                 const isFromBundle = Object.values(masterKeranjang).some(store => store.items.some(item => item.isBundle && item.sku === iframeSku));
                 if (!isFromBundle) {
                 }
             }
        });

        subtotalEl.classList.remove('loading-text');
        if (invalidItemCount > 0 && validItemCount === 0) {
            subtotalEl.innerHTML = '<span style="color:var(--danger); font-size: 14px;">Semua Invalid</span>';
            if (grandRevealDone) triggerCsButtonMode();
        } else if (validItemCount === 0 && invalidItemCount === 0) {
            subtotalEl.innerHTML = '<span style="color:var(--danger); font-size: 14px;">Keranjang Kosong</span>';
            if (grandRevealDone) triggerCsButtonMode();
        } else {
            subtotalEl.textContent = formatIDR(calculatedSubtotal);
            if (grandRevealDone) activateCheckoutButtons();
        }
    }
    
    function checkInvalidItemsAndTriggerCS() {
        let visibleValid = 0;
        let visibleInvalid = 0;

        cartItemsWrapper.querySelectorAll('.cart-item').forEach(itemRow => {
            if (itemRow.style.display !== 'none') {
                if (itemRow.classList.contains('item-invalid')) {
                    visibleInvalid++;
                } else {
                    visibleValid++;
                }
            }
        });
        
        if (IS_DEBUG_MODE) console.log(`PARENT: (checkInvalidItems) Status: ${visibleValid} valid, ${visibleInvalid} invalid.`);

        if (visibleInvalid > 0 && visibleValid === 0) {
            if (!isInCsMode) triggerCsButtonMode();
        } else if (visibleInvalid > 0 && visibleValid > 0) {
             ToastManager.create('Beberapa produk tidak valid dan tidak akan di checkout.', 'warning');
             activateCheckoutButtons();
             checkoutButtons.forEach(btn => btn.disabled = false);
        } else if (visibleValid > 0) {
             isInCsMode = false;
             activateCheckoutButtons();
             checkoutButtons.forEach(btn => btn.disabled = false);
        } else if (visibleValid === 0 && visibleInvalid === 0) {
             if (!isInCsMode) triggerCsButtonMode();
             if(lastKnownTotals) {
                lastKnownTotals.subtotal = 'Rp 0';
                lastKnownTotals.discounts = [];
                lastKnownTotals.fee = 'Rp 0';
                lastKnownTotals.total = 'Rp 0';
                renderTotals(lastKnownTotals);
             }
        }
    }

    function renderTotals(totals) {
        if (isInCsMode) {
            if (IS_DEBUG_MODE) console.log("PARENT: (renderTotals) Mode CS aktif, update Total dilewati.");
            return;
        }
        if (!totals) return;
    
        if (totals.subtotal) {
            subtotalEl.textContent = totals.subtotal;
            subtotalEl.classList.remove('loading-text');
        } else {
            subtotalEl.textContent = 'Rp -';
            subtotalEl.classList.remove('loading-text');
        }
    
        if (totals.total) {
            cartTotalEl.textContent = totals.total;
            cartTotalEl.classList.remove('loading-text');
            cartTotalEl.classList.add('is-updating');
            setTimeout(() => cartTotalEl.classList.remove('is-updating'), 500);
            if (stickyCartTotalEl) stickyCartTotalEl.textContent = totals.total;
        } else {
            cartTotalEl.textContent = 'Rp -';
            cartTotalEl.classList.remove('loading-text');
            if (stickyCartTotalEl) stickyCartTotalEl.textContent = 'Rp -';
        }
    
        const discountContainer = document.querySelector('.summary-breakdown');
        discountContainer.querySelectorAll('.summary-row.discount-item').forEach(el => el.remove());
    
        if (totals.discounts && Array.isArray(totals.discounts) && totals.discounts.length > 0) {
            totals.discounts.forEach(discount => {
                const discountRow = document.createElement('div');
                discountRow.className = 'summary-row discount-item';
                discountRow.innerHTML = `
                    <span>${discount.label || 'Diskon'}</span>
                    <span>${discount.amount || '- Rp 0'}</span>
                `;
                if (feeRow) {
                    discountContainer.insertBefore(discountRow, feeRow);
                } else {
                     const totalRow = discountContainer.querySelector('.summary-total');
                     if (totalRow) {
                         discountContainer.insertBefore(discountRow, totalRow);
                     } else {
                         discountContainer.appendChild(discountRow);
                     }
                }
            });
            discountRow.style.display = 'none';
        } else {
            discountRow.style.display = 'none';
        }
    
        if (totals.fee && totals.fee !== 'Rp 0' && totals.fee.toLowerCase() !== 'gratis') {
            feeEl.textContent = totals.fee;
            feeRow.style.display = 'flex';
        } else {
            feeRow.style.display = 'none';
        }
    
        const totalValue = parseInt(String(totals.total).replace(/[^0-9]/g, ''), 10) || 0;
        if (totalValue === 0 && lastKnownItemCount > 0) {
            handleFreeOrder();
            openModalBtn.disabled = true;
        } else if (lastKnownItemCount > 0) {
            openModalBtn.disabled = false;
        } else {
            openModalBtn.disabled = true;
        }
    }

    function selectInitialPaymentMethod() {
         if (IS_DEBUG_MODE) console.log(`PARENT: Mengirim perintah pilih metode awal: ${initialPaymentMethod}`);
         iframe.contentWindow.postMessage({
             type: 'SELECT_PAYMENT_METHOD',
             methodName: initialPaymentMethod
         }, iframeOrigin);
    }
    
    function handleInvalidCartSignal() {
         if (IS_DEBUG_MODE) console.error("PARENT: Menerima sinyal INVALID_CART dari iframe. Menyetel flag untuk Mode CS.");
         isInCsMode = true;
         invalidProductsList = []; 
    
         if (masterKeranjang && typeof masterKeranjang === 'object') {
            Object.values(masterKeranjang).forEach(storeData => {
                storeData.items.forEach(item => {
                    invalidProductsList.push({ name: item.name || 'Produk Tidak Dikenal', id: item.variantId });
                });
            });
         }
         if (invalidProductsList.length === 0) {
             invalidProductsList.push({ name: 'Gagal memuat detail keranjang', id: 'error' });
         }

         openModalBtn.disabled = true;
         
         cartItemsReceived = true;
         totalsReceived = true;

         validItemCount = 0;
         invalidItemCount = invalidProductsList.length || 1;
         if (IS_DEBUG_MODE) console.log("PARENT: (handleInvalidCartSignal) Flag Mode CS disetel. Menunggu event lain untuk memicu tryGrandReveal.");
    }
    
    function tryGrandReveal() {        

        if (cartItemsReceived && totalsReceived && paymentOptionsReceived && isIframeReady && isIframeResized && !grandRevealDone) {
    
            if (IS_DEBUG_MODE) console.log(`PARENT: GRAND REVEAL! (5 Kunci SIAP). Iframe sudah fit dan siap. Menampilkan...`);
            
            if (shouldShowVoucherButton) {
                const openVoucherBtn = document.getElementById('openVoucherModalBtn');
                if (openVoucherBtn) {
                    if (IS_DEBUG_MODE) console.log('PARENT: (Grand Reveal) Menampilkan tombol voucher (Kondisi 3).');
                    openVoucherBtn.style.display = 'flex';
                }
            }

            grandRevealDone = true;      

            const stickyFooter = document.querySelector('.sticky-checkout-footer');
            if (stickyFooter) stickyFooter.classList.add('footer-is-visible');    

            if (isInCsMode || (invalidItemCount > 0 && validItemCount === 0)) {
                 if (IS_DEBUG_MODE) console.log(`PARENT: (Grand Reveal) Mode CS terdeteksi (isInCsMode: ${isInCsMode}, invalidCount: ${invalidItemCount}, validCount: ${validItemCount}). Mengaktifkan mode CS final.`);

                     triggerCsButtonMode();
    
            } else {
                 if (IS_DEBUG_MODE) console.log(`PARENT: (Grand Reveal) Ditemukan ${validItemCount} item valid. Melanjutkan checkout normal.`);
                 activateCheckoutButtons(); 
                 checkoutButtons.forEach(btn => btn.disabled = false); 
    
                 loadingState.style.display = 'none';
                 iframeWrapper.style.opacity = '1';
                 iframeWrapper.style.pointerEvents = 'auto';
    
                 mirrorStickyTotal();
                 if (invalidItemCount > 0) {
                     ToastManager.create('Beberapa produk tidak valid, cek keterangannya atau hapus.', 'warning');
                 }
            }
        } else {
            if (IS_DEBUG_MODE) console.log(`PARENT: Belum siap Grand Reveal. Status Kunci: Items=${cartItemsReceived}, Totals=${totalsReceived}, Options=${paymentOptionsReceived}, IframeReady=${isIframeReady}, IframeResized=${isIframeResized}`);
        }
    }
    
    function mirrorStickyTotal() {
        const sourceEl = cartTotalEl;
        const targetEl = stickyCartTotalEl;
        if (sourceEl && targetEl) {
            const mirrorObserver = new MutationObserver(() => {
                targetEl.textContent = sourceEl.textContent;

                if (targetEl.classList.contains('loading-text')) {
                    targetEl.classList.remove('loading-text');
                }
            });
            mirrorObserver.observe(sourceEl, { 
                childList: true,
                characterData: true,
                subtree: true
            });
            
            targetEl.textContent = sourceEl.textContent;
            
            if (sourceEl.classList.contains('loading-text')) {
                targetEl.classList.add('loading-text');
            }
        }
    }

    function activateCheckoutButtons() {
        isInCsMode = false;
        checkoutButtons.forEach(btn => {
            const skeleton = btn.querySelector('.skeleton-box');
            if(skeleton) skeleton.remove();            

            btn.dataset.action = 'submit';
            btn.style.background = ''; 
        });
    }
    
    function triggerCsButtonMode() {
        
        if (!isInCsMode) { 
             if (IS_DEBUG_MODE) console.log("PARENT: (triggerCsButtonMode) Menyetel isInCsMode = true");
             isInCsMode = true; 
        } else {
             if (IS_DEBUG_MODE) console.warn('PARENT: (triggerCsButtonMode) Dipanggil saat isInCsMode sudah true. Melanjutkan eksekusi UI.');
        }

        if (IS_DEBUG_MODE) console.warn('PARENT: Produk invalid terdeteksi ATAU iframe gagal scrape. Mengubah UI ke mode CS.');
        
        if (IS_DEBUG_MODE) console.log("PARENT: (triggerCsButtonMode) Merender ulang item dari storage sebagai invalid...");
        cartItemsWrapper.innerHTML = '';    

        if (invalidProductsList.length === 0 && masterKeranjang && typeof masterKeranjang === 'object') {
             if (IS_DEBUG_MODE) console.log("PARENT: (triggerCsButtonMode) Membangun ulang invalidProductsList...");
             Object.values(masterKeranjang).forEach(storeData => {
                 storeData.items.forEach(item => {
                     invalidProductsList.push({ name: item.name || 'Produk Tidak Dikenal', id: item.variantId });
                 });
             });
             if (invalidProductsList.length === 0) {
                 invalidProductsList.push({ name: 'Gagal memuat detail keranjang', id: 'error' });
             }
        }
    
        Object.entries(masterKeranjang).forEach(([storeName, storeData]) => {
            if (!storeData || !storeData.items || storeData.items.length === 0) return;
    
            const groupEl = document.createElement('div');
            groupEl.className = 'cart-store-group';
            const headerHTML = `
                <div class="cart-store-header">
                    <img src="${storeData.icon || DEFAULT_STORE_ICON_URL}" alt="${storeName || DEFAULT_STORE_NAME}" class="cart-store-icon">
                    <span class="cart-store-name">${storeName || DEFAULT_STORE_NAME}</span>
                </div>`;
            let itemsHTML = '';
            
            storeData.items.forEach(item => {
                const itemSKU = item.variantSKU || item.sku || 'MISSING_SKU_' + item.variantId;
                if (hiddenSKUs.has(itemSKU)) return; 
    
                const displayName = item.productName || item.name || 'Produk Tidak Dikenal'; 
                const displayVariant = item.variantName || '';
                const displayImage = item.image || item.productImage || 'https://placehold.co/48x48'; 
                
                const itemPriceHTML = `<div style="display: flex; flex-direction: column; align-items: flex-end; gap: 4px;">
                                           <span style="color:var(--danger); font-weight: 600;">Tidak Valid</span>
                                        </div>`;
                
                itemsHTML += `<div class="cart-item item-invalid" data-sku="${itemSKU}">
                        <img src="${displayImage}" alt="${displayName}" class="cart-item-image">
                        <div class="cart-item-details">
                            <div class="cart-item-name">${displayName}</div>
                            <div class="cart-item-variant">${displayVariant || ''}</div>
                        </div>
                        <div class="cart-item-price">${itemPriceHTML}</div>
                    </div>`;
            });
            
            if (itemsHTML) { 
                groupEl.innerHTML = headerHTML + itemsHTML;
                cartItemsWrapper.appendChild(groupEl);
            }
        });

        subtotalEl.innerHTML = '<span style="color:var(--danger); font-size: 14px;">Semua Invalid</span>'; 
        cartTotalEl.innerHTML = '<span style="color:var(--danger); font-size: 20px;">Error</span>';
        if(stickyCartTotalEl) stickyCartTotalEl.innerHTML = '<span style="color:var(--danger); font-size: 18px;">Error</span>';

        openModalBtn.disabled = true;
        openModalBtn.style.cursor = 'not-allowed';
        openModalBtn.style.opacity = '0.6';
        selectedPaymentName.innerHTML = '<span style="color: var(--text-muted);">Keranjang Tidak Valid</span>'; 
        selectedPaymentLogo.src = 'https://placehold.co/32x32/FFFFFF/FFFFFF'; 
        const chevron = openModalBtn.querySelector('.chevron');
        if (chevron) chevron.style.display = 'none'; 
        const paymentSkeleton = selectedPaymentName.querySelector('.skeleton-box');
        if (paymentSkeleton) paymentSkeleton.remove();
        const logoWrapper = document.querySelector('#changePaymentBtn .payment-logo-wrapper');
        if (logoWrapper) logoWrapper.classList.remove('is-pulsing-loading');
        const loadingDots = document.getElementById('payment-loading-dots');
        if (loadingDots) loadingDots.remove();

        checkoutButtons.forEach(btn => {
            const skeleton = btn.querySelector('.skeleton-box');
            if(skeleton) skeleton.remove(); 
            btn.classList.remove('is-loading'); 
            btn.disabled = false; 
            btn.dataset.action = 'whatsapp';
            
            btn.style.background = 'var(--danger)';
            btn.style.boxShadow = 'none'; 
            btn.style.color = 'var(--brand-contrast)';

            if (btn.id === 'desktopCheckoutBtn') {
                btn.innerHTML = `
                    <svg fill="currentColor" width="20" height="20" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg" style="margin-right: 8px;"><title>whatsapp</title><path d="M26.576 5.363c-2.69-2.69-6.406-4.354-10.511-4.354-8.209 0-14.865 6.655-14.865 14.865 0 2.732 0.737 5.291 2.022 7.491l-0.038-0.070-2.109 7.702 7.879-2.067c2.051 1.139 4.498 1.809 7.102 1.809h0.006c8.209-0.003 14.862-6.659 14.862-14.868 0-4.103-1.662-7.817-4.349-10.507l0 0zM16.062 28.228h-0.005c-0 0-0.001 0-0.001 0-2.319 0-4.489-0.64-6.342-1.753l0.056 0.031-0.451-0.267-4.675 1.227 1.247-4.559-0.294-0.467c-1.185-1.862-1.889-4.131-1.889-6.565 0-6.822 5.531-12.353 12.353-12.353s12.353 5.531 12.353 12.353c0 6.822-5.53 12.353-12.353 12.353h-0zM22.838 18.977c-0.371-0.186-2.197-1.083-2.537-1.208-0.341-0.124-0.589-0.185-0.837 0.187-0.246 0.371-0.958 1.207-1.175 1.455-0.216 0.249-0.434 0.279-0.805 0.094-1.15-0.466-2.138-1.087-2.997-1.852l0.010 0.009c-0.799-0.74-1.484-1.587-2.037-2.521l-0.028-0.052c-0.216-0.371-0.023-0.572 0.162-0.757 0.167-0.166 0.372-0.434 0.557-0.65 0.146-0.179 0.271-0.384 0.366-0.604l0.006-0.017c0.043-0.087 0.068-0.188 0.068-0.296 0-0.131-0.037-0.253-0.101-0.357l0.002 0.003c-0.094-0.186-0.836-2.014-1.145-2.758-0.302-0.724-0.609-0.625-0.836-0.637-0.216-0.010-0.464-0.012-0.712-0.012-0.395 0.010-0.746 0.188-0.988 0.463l-0.001 0.002c-0.802 0.761-1.3 1.834-1.3 3.023 0 0.026 0 0.053 0.001 0.079l-0-0.004c0.131 1.467 0.681 2.784 1.527 3.857l-0.012-0.015c1.604 2.379 3.742 4.282 6.251 5.564l0.094 0.043c0.548 0.248 1.25 0.513 1.968 0.74l0.149 0.041c0.442 0.14 0.951 0.221 1.479 0.221 0.303 0 0.601-0.027 0.889-0.078l-0.031 0.004c1.069-0.223 1.956-0.868 2.497-1.749l0.009-0.017c0.165-0.366 0.261-0.793 0.261-1.242 0-0.185-0.016-0.366-0.047-0.542l0.003 0.019c-0.092-0.155-0.34-0.247-0.712-0.434z"></path></svg>
                    <span class="button-action-text">Laporkan Masalah</span>
                `;
            } else if (btn.id === 'stickyCheckoutBtn') {
                const totalEl = btn.querySelector('.button-total-price');
                if(totalEl) totalEl.remove();
                
                const loader = btn.querySelector('.loader');
                if(loader) loader.remove();

                btn.innerHTML = `
                    <svg fill="currentColor" width="18" height="18" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg" style="flex-shrink: 0;"><title>whatsapp</title><path d="M26.576 5.363c-2.69-2.69-6.406-4.354-10.511-4.354-8.209 0-14.865 6.655-14.865 14.865 0 2.732 0.737 5.291 2.022 7.491l-0.038-0.070-2.109 7.702 7.879-2.067c2.051 1.139 4.498 1.809 7.102 1.809h0.006c8.209-0.003 14.862-6.659 14.862-14.868 0-4.103-1.662-7.817-4.349-10.507l0 0zM16.062 28.228h-0.005c-0 0-0.001 0-0.001 0-2.319 0-4.489-0.64-6.342-1.753l0.056 0.031-0.451-0.267-4.675 1.227 1.247-4.559-0.294-0.467c-1.185-1.862-1.889-4.131-1.889-6.565 0-6.822 5.531-12.353 12.353-12.353s12.353 5.531 12.353 12.353c0 6.822-5.53 12.353-12.353 12.353h-0zM22.838 18.977c-0.371-0.186-2.197-1.083-2.537-1.208-0.341-0.124-0.589-0.185-0.837 0.187-0.246 0.371-0.958 1.207-1.175 1.455-0.216 0.249-0.434 0.279-0.805 0.094-1.15-0.466-2.138-1.087-2.997-1.852l0.010 0.009c-0.799-0.74-1.484-1.587-2.037-2.521l-0.028-0.052c-0.216-0.371-0.023-0.572 0.162-0.757 0.167-0.166 0.372-0.434 0.557-0.65 0.146-0.179 0.271-0.384 0.366-0.604l0.006-0.017c0.043-0.087 0.068-0.188 0.068-0.296 0-0.131-0.037-0.253-0.101-0.357l0.002 0.003c-0.094-0.186-0.836-2.014-1.145-2.758-0.302-0.724-0.609-0.625-0.836-0.637-0.216-0.010-0.464-0.012-0.712-0.012-0.395 0.010-0.746 0.188-0.988 0.463l-0.001 0.002c-0.802 0.761-1.3 1.834-1.3 3.023 0 0.026 0 0.053 0.001 0.079l-0-0.004c0.131 1.467 0.681 2.784 1.527 3.857l-0.012-0.015c1.604 2.379 3.742 4.282 6.251 5.564l0.094 0.043c0.548 0.248 1.25 0.513 1.968 0.74l0.149 0.041c0.442 0.14 0.951 0.221 1.479 0.221 0.303 0 0.601-0.027 0.889-0.078l-0.031 0.004c1.069-0.223 1.956-0.868 2.497-1.749l0.009-0.017c0.165-0.366 0.261-0.793 0.261-1.242 0-0.185-0.016-0.366-0.047-0.542l0.003 0.019c-0.092-0.155-0.34-0.247-0.712-0.434z"></path></svg>
                    <span class="button-action-text">Laporkan Masalah</span>
                `;
                
                btn.style.justifyContent = 'center';
                btn.style.gap = '8px';
            }
        });
        
        iframeWrapper.style.display = 'none';
        
        const formHeader = document.querySelector('.form-header');
        if (formHeader) formHeader.style.display = 'none';
        
        loadingState.style.display = 'flex';
        
        loadingState.className = 'empty-cart-placeholder'; 
        
        loadingState.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--danger); opacity: 0.8; margin-bottom: 24px;">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <p style="font-size: 22px; font-weight: 800; color: var(--text-header); margin-bottom: 12px;">Keranjang Anda Bermasalah</p>
            <span style="font-size: 16px; color: var(--text-muted); max-width: 450px; line-height: 1.6;">
                Beberapa produk Anda mengalami masalah sinkronisasi (kemungkinan ID-nya berubah).
                Mohon bantuannya untuk hubungi kami agar dapat segera kami perbaiki.
            </span>
        `;
        
        if (IS_DEBUG_MODE) console.log('PARENT: Mode CS aktif. Mengisi loadingState dengan pesan error, menyembunyikan iframe.');
    }
    
    function triggerTimeoutError() {
        if (IS_DEBUG_MODE) console.error("TIMEOUT: Menjalankan triggerTimeoutError(). Iframe gagal dimuat tepat waktu.");

        const iframeWrapper = document.getElementById('iframe-wrapper');
        const summaryContainer = document.querySelector('.order-summary-container');
        const stickyFooter = document.querySelector('.sticky-checkout-footer');
        const formHeader = document.querySelector('.form-header');
        
        if (iframeWrapper) iframeWrapper.style.display = 'none';
        if (summaryContainer) summaryContainer.style.display = 'none';
        if (stickyFooter) stickyFooter.style.display = 'none';
        if (formHeader) formHeader.style.display = 'none';

        const loadingState = document.getElementById('loading-state');
        if (loadingState) {
            loadingState.style.display = 'flex';
            loadingState.className = 'empty-cart-placeholder';
            
            loadingState.innerHTML = `
                <svg width="64" height="64" viewBox="0 0 489.6 489.6" fill="currentColor" xmlns="http://www.w3.org/2000/svg" style="color: var(--danger); opacity: 0.8; margin-bottom: 24px;">
                    <g> <g> <g>
                        <path d="M179.6,235.6c-33.7,10.3-65.5,28.5-92.2,55.1l46.6,46.6c13.9-13.9,30.1-24.8,47.6-32.5L179.6,235.6z"/>
                        <path d="M175.8,109C111.3,122,49.9,153.4,0,203.3l46.6,46.6c37.5-37.5,83.1-61.9,131.2-73.7L175.8,109z"/>
                        <path d="M313.8,109l-2,67.3c48.1,11.8,93.7,36.2,131.2,73.7l46.6-46.6C439.8,153.4,378.3,122,313.8,109z"/>
                        <path d="M307.9,304.8c17.5,7.7,33.7,18.6,47.7,32.6l46.6-46.6c-26.6-26.6-58.5-44.9-92.2-55.2L307.9,304.8z"/>
                    </g> <circle cx="244.8" cy="403.2" r="40"/> <g>
                        <path d="M260.6,330.4h-31.7c-8.3,0-15.1-6.6-15.3-14.9L206,62.2c-0.3-8.6,6.7-15.8,15.3-15.8h47c8.6,0,15.6,7.1,15.3,15.8 l-7.7,253.3C275.7,323.8,268.9,330.4,260.6,330.4z"/>
                    </g> </g> </g>
                </svg>
                
                <p style="font-size: 22px; font-weight: 800; color: var(--text-header); margin-bottom: 12px;">Gagal Memuat Form</p>
                <span style="font-size: 16px; color: var(--text-muted); max-width: 450px; line-height: 1.6; margin-bottom: 24px;">
                    Kami tidak dapat terhubung ke form checkout. Ini bisa jadi karena koneksi internet yang lambat atau gangguan sementara pada server kami.
                </span>
                
                <div class="timeout-actions" style="display: flex; gap: 12px; margin-top: 16px;">
                    <button class="btn" id="refreshCheckoutBtn" style="min-width: 180px;">
                        Muat Ulang Halaman
                    </button>
                    <button class="btn ghost" id="reportTimeoutBtn" style="min-width: 180px;">
                        Laporkan Masalah
                    </button>
                </div>
            `;
        }
    }
    
    function releaseCheckoutButtons() {
        if (IS_DEBUG_MODE) console.log("PARENT: Merilis tombol checkout (via failsafe atau error).");
        checkoutButtons.forEach(btn => {
            btn.classList.remove('is-loading');
            btn.disabled = false;
        });
        if (failsafeTimer) {
            clearTimeout(failsafeTimer);
            failsafeTimer = null;
        }
    }
    
    async function loadProductDatabase() {
        try {
            const response = await fetch('https://cdn.detama.id/product.json'); 
            if (!response.ok) {
                throw new Error(`Gagal fetch database: ${response.status}`);
            }
            const hierarchicalData = await response.json();
            masterProductDatabase = hierarchicalData; 
    
            window.flatVariantDatabase = {}; 
            for (const storeKey in masterProductDatabase) {
                const storeData = masterProductDatabase[storeKey];
                if (storeData.products && Array.isArray(storeData.products)) {
                    storeData.products.forEach(product => {
                        if (product.variants && Array.isArray(product.variants)) {
                            product.variants.forEach(variant => {
                                if (variant.id) { 
                                    window.flatVariantDatabase[variant.id] = {
                                        productId: product.id,
                                        productName: product.name,
                                        productImage: product.image || '...', 
                                        variantId: variant.id,
                                        name: product.name,
                                        variantName: variant.name,
                                        price: variant.price,
                                        sku: variant.sku || null, 
                                        storeName: storeData.name, 
                                        storeIcon: storeData.icon,
                                        isBundle: false
                                    };
                                }
                            });
                        }
                    });
                }
            }
            if (IS_DEBUG_MODE) console.log('DATABASE: Berhasil membuat flatVariantDatabase:', window.flatVariantDatabase);

            window.flatBundleDatabase = {};
            for (const storeKey in masterProductDatabase) {
                 const storeData = masterProductDatabase[storeKey];
                 if (storeData.bundles && Array.isArray(storeData.bundles)) {
                     storeData.bundles.forEach(bundle => {
                         if (bundle.id) { 
                            window.flatBundleDatabase[bundle.id] = {
                                productId: `bundle-${bundle.id}`,
                                productName: bundle.name,
                                productImage: bundle.image || '...',
                                variantId: bundle.id,
                                name: bundle.name,
                                variantId: bundle.id,
                                price: bundle.price || 0,
                                sku: bundle.sku || `BUNDLE-${bundle.id}`,
                                storeName: storeData.name, 
                                storeIcon: storeData.icon,
                                isBundle: true
                            };
                         }
                     });
                 }
            }
            if (IS_DEBUG_MODE) console.log('DATABASE: Berhasil membuat flatBundleDatabase:', window.flatBundleDatabase);

            initCheckout();
        } catch (error) {
            if (IS_DEBUG_MODE) console.error('DATABASE: Gagal memuat/memproses masterProductDatabase:', error);
            const loadingState = document.getElementById('loading-state');
            if (loadingState) {
                loadingState.innerHTML = `<p style="color: var(--danger);">Gagal memuat data produk. Mohon muat ulang halaman.</p>`;
            }
        }
    }

    function initCheckout() {
        if (IS_DEBUG_MODE) console.log('INIT: Memulai proses checkout (v4.4 - Perbaikan Urutan Logika)');
        masterKeranjang = {};
        itemsForIframe = [];
        dataSource = 'none';
        urlSourceType = 'none';
        invalidProductsList = [];
        autoApplyCode = null;
        autofillData = null;
        autofillSent = false;
        isIframeReady = false;
        cartItemsReceived = false;
        totalsReceived = false;
        paymentOptionsReceived = false;
        isIframeResized = false;
        grandRevealDone = false;
        isInCsMode = false;
        hiddenSKUs = new Set();
        latestImageUrls = {};

        try {
            const storedAutofill = localStorage.getItem('autofill_v1');
            if (storedAutofill) {
                autofillData = JSON.parse(storedAutofill);
                if (IS_DEBUG_MODE) console.log('INIT: Data autofill ditemukan di localStorage.', autofillData);
            }
        } catch (e) {
            if (IS_DEBUG_MODE) console.warn("INIT: Gagal parse data autofill dari localStorage.", e);
            autofillData = null;
        }

        try {
            const urlParams = new URLSearchParams(window.location.search);
            const paramItems = urlParams.get('items');
            const paramBundles = urlParams.get('bundles');
            const paramPromo = urlParams.get('promo');

            if (paramItems || paramBundles) {
                dataSource = 'url';
                if (IS_DEBUG_MODE) console.log('INIT: Sumber data item = Parameter URL. Membersihkan checkoutItems_v1...');
                try { localStorage.removeItem('checkoutItems_v1'); } catch(e){}

                let idsToProcess = [];
                let lookupDb = null;
                let itemTypeForIframe = '';
    
                if (paramItems) {
                    urlSourceType = 'items'; 
                    idsToProcess = paramItems.split(',');
                    lookupDb = window.flatVariantDatabase; 
                    itemTypeForIframe = 'variant';
                    if (IS_DEBUG_MODE) console.log(`INIT: Memproses VARIAN ID dari URL: ${idsToProcess.join(', ')}`);
                } else if (paramBundles) {
                    urlSourceType = 'bundles';
                    idsToProcess = paramBundles.split(',');
                    lookupDb = window.flatBundleDatabase; 
                    itemTypeForIframe = 'bundle';
                    if (IS_DEBUG_MODE) console.log(`INIT: Memproses BUNDLE ID dari URL: ${idsToProcess.join(', ')}`);
                }
    
                idsToProcess.forEach(id => {
                    const cleanId = id.trim();
                    if (!cleanId) return;
                    const itemData = lookupDb ? lookupDb[cleanId] : null; 
                    if (itemData && itemData.sku) { 
                         if (IS_DEBUG_MODE) console.log(`DEBUG: ID ${cleanId} (tipe: ${itemTypeForIframe}) ditemukan di database.`);
                         const storeName = itemData.storeName || 'DeTama.id'; 
                         if (!masterKeranjang[storeName]) masterKeranjang[storeName] = { icon: itemData.storeIcon || DEFAULT_STORE_ICON_URL, items: [] };
                         masterKeranjang[storeName].items.push({ ...itemData }); 
                         itemsForIframe.push({ id: cleanId, type: itemTypeForIframe });
                    } else {
                         if (IS_DEBUG_MODE) console.warn(`INIT: ID "${cleanId}" (tipe: ${itemTypeForIframe}) tidak ditemukan di database atau tidak punya SKU.`);
                         invalidProductsList.push({ name: `Produk (ID: ${cleanId})`, id: cleanId }); 
                    }
                });
                if (IS_DEBUG_MODE) console.log('DEBUG: Isi masterKeranjang SETELAH loop URL:', JSON.stringify(masterKeranjang));
    
            } else {
                const checkoutItemsRaw = localStorage.getItem('checkoutItems_v1'); 
                if (checkoutItemsRaw) {
                    if (IS_DEBUG_MODE) console.log('INIT: Sumber data = localStorage (checkoutItems_v1).');
                    dataSource = 'buynow_or_selection'; 
                    try {
                         masterKeranjang = JSON.parse(checkoutItemsRaw); 
                         if (typeof masterKeranjang !== 'object' || masterKeranjang === null) {
                             throw new Error("checkoutItems_v1 bukan objek JSON valid.");
                         }
                         Object.values(masterKeranjang).forEach(store => {
                             if (store.items && Array.isArray(store.items)) {
                                 store.items.forEach(item => {
                                     const id = item.variantId;
                                     const type = item.isBundle ? 'bundle' : 'variant';
                                     if (id) { 
                                         itemsForIframe.push({ id: id, type: type });
                                         if (item.isBundle === undefined) item.isBundle = false; 
                                     } else {
                                         if (IS_DEBUG_MODE) console.warn("INIT: Item di checkoutItems_v1 tidak memiliki variantId:", item);
                                         invalidProductsList.push({ name: item.name || 'Produk Tanpa ID', id: 'unknown' });
                                     }
                                 });
                             }
                         });
                         if (IS_DEBUG_MODE) console.log('DEBUG: Isi masterKeranjang SETELAH parse checkoutItems_v1:', JSON.stringify(masterKeranjang));
                     } catch (e) {
                         if (IS_DEBUG_MODE) console.error("INIT: Gagal parse checkoutItems_v1. Menganggap keranjang kosong.", e);
                         masterKeranjang = {}; 
                         itemsForIframe = [];
                         dataSource = 'empty'; 
                         try { localStorage.removeItem('checkoutItems_v1'); } catch(err){} 
                     }
                } else {
                    if (IS_DEBUG_MODE) console.log('INIT: Sumber data = Tidak ada (URL kosong, checkoutItems_v1 kosong).');
                    dataSource = 'empty';
                }
            }
    
            if (itemsForIframe.length === 0) {
                 if (dataSource === 'url' && invalidProductsList.length > 0) {
                     if (IS_DEBUG_MODE) console.error(`INIT: Semua item dari URL tidak valid: ${invalidProductsList.map(p=>p.id).join(', ')}`);
                 } else if (dataSource !== 'empty') {
                     if (IS_DEBUG_MODE) console.warn("INIT: Tidak ada item valid ditemukan.");
                 }
                 dataSource = 'empty';
            }
            if (dataSource === 'empty') {
                 throw new Error('Keranjang kosong atau item tidak valid.');
            }


            const openVoucherBtn = document.getElementById('openVoucherModalBtn');

            if (paramPromo) {
                autoApplyCode = paramPromo.trim();
                if (IS_DEBUG_MODE) console.log(`INIT: (Kondisi 1) ?promo= terdeteksi. Mengunci: ${autoApplyCode}`);
                
                if (openVoucherBtn) openVoucherBtn.style.display = 'none';

            } else {
                if (IS_DEBUG_MODE) console.log(`INIT: Tidak ada ?promo=. Mengecek localStorage...`);

                let vouchers = [];
                try {
                    vouchers = JSON.parse(localStorage.getItem(VOUCHER_STORAGE_KEY) || '[]');
                } catch(e) { vouchers = []; }

                if (vouchers.length === 1) {
                    autoApplyCode = vouchers[0].code;
                    if (IS_DEBUG_MODE) console.log(`INIT: (Kondisi 2) Ditemukan 1 voucher. Menerapkan via parameter: ${autoApplyCode}`);
                    
                    if (openVoucherBtn) openVoucherBtn.style.display = 'none';
                    
                    try { sessionStorage.setItem('singleVoucherApplied', 'true'); } catch(e){}

                } else if (vouchers.length > 1) {
                    if (IS_DEBUG_MODE) console.log(`INIT: (Kondisi 3) Ditemukan ${vouchers.length} voucher. Menampilkan tombol modal.`);
                    
                    shouldShowVoucherButton = true;

                } else {
                    if (openVoucherBtn) openVoucherBtn.style.display = 'none';
                }
            }
            
            const variantIds = itemsForIframe.filter(item => item.type === 'variant').map(item => item.id);
            const bpoIds = itemsForIframe.filter(item => item.type === 'bundle').map(item => item.id);
            let iframeSrc = SCALEV_CHECKOUT_URL;
            const params = [];
            if (variantIds.length > 0) params.push(`variant_ids=${variantIds.join(',')}`);
            if (bpoIds.length > 0) params.push(`bpo_ids=${bpoIds.join(',')}`);

            if (autoApplyCode) {
                 params.push(`discount_code=${encodeURIComponent(autoApplyCode)}`);
                 if (IS_DEBUG_MODE) console.log(`INIT: Menambahkan &discount_code=${autoApplyCode} ke URL iframe (Kondisi 1 atau 2).`);
            }

            if (params.length > 0) iframeSrc += `?${params.join('&')}`;

            if (IS_DEBUG_MODE) console.log(`INIT: Memuat iframe dengan URL: ${iframeSrc}`);
            iframe.src = iframeSrc;
            
            const IFRAME_LOAD_TIMEOUT = 20000;
            if (IS_DEBUG_MODE) console.log(`INIT: Failsafe timer ${IFRAME_LOAD_TIMEOUT / 1000} detik dimulai...`);
            setTimeout(() => {
                if (isIframeReady && cartItemsReceived) {
                    if (IS_DEBUG_MODE) console.log(`INIT: Failsafe timer ... selesai. Kunci vital (Ready, Items) sudah diterima...`);
                    return; 
                }
                if (IS_DEBUG_MODE) console.warn(`INIT: Failsafe timer ... terpicu! Kunci vital (Ready/Items) tidak diterima.`);
                triggerTimeoutError();
            }, IFRAME_LOAD_TIMEOUT);

            if (IS_DEBUG_MODE) console.log('INIT: Melakukan Render Parsial (dari masterKeranjang)...');
            renderPartialCartFromMaster();

        } catch (error) {
            if (IS_DEBUG_MODE) console.error('INIT: Gagal memuat checkout:', error.message);
            iframeWrapper.style.display = 'none';
            loadingState.className = 'empty-cart-placeholder';
            
            const isFromUrlWithError = (dataSource === 'url' && invalidProductsList.length > 0);
            const title = isFromUrlWithError ? 'Produk Tidak Ditemukan' : 'Pilih Item Terlebih Dahulu';
            const message = isFromUrlWithError ? 'Link checkout yang Anda gunakan mungkin salah atau produk sudah tidak tersedia.' : 'Sepertinya Anda belum memilih item apapun untuk di-checkout.';
            
            loadingState.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                <p>${title}</p>
                <span>${message}</span>
                <a href="https://detama.id" class="back-to-shop-btn">Kembali Berbelanja</a> 
            `;

            const summaryContainer = document.querySelector('.order-summary-container');
            const stickyFooter = document.querySelector('.sticky-checkout-footer');
            const formHeader = document.querySelector('.form-header');
            
            if (summaryContainer) summaryContainer.style.display = 'none';
            if (stickyFooter) stickyFooter.style.display = 'none';
            if (formHeader) formHeader.style.display = 'none';
        }
    }
    
    function renderPartialCartFromMaster() {
        cartItemsWrapper.innerHTML = '';
        if (!masterKeranjang || Object.keys(masterKeranjang).length === 0) {
            if (IS_DEBUG_MODE) console.log("RENDER PARTIAL: masterKeranjang kosong, tidak merender skeleton.");
             cartItemsWrapper.innerHTML = '<p class="loading-text" style="text-align: center; padding: 20px 0;">Memuat detail keranjang...</p>'; // Placeholder sementara
            return;
        }
    
        if (IS_DEBUG_MODE) console.log("RENDER PARTIAL: Menampilkan skeleton berdasarkan masterKeranjang...");
        
        let itemCount = 0;
        try {
            if (masterKeranjang && typeof masterKeranjang === 'object') {
                Object.values(masterKeranjang).forEach(storeData => {
                    if (storeData && storeData.items && Array.isArray(storeData.items)) {
                        itemCount += storeData.items.length;
                    }
                });
            }
        } catch (e) {
             if (IS_DEBUG_MODE) console.error("RENDER PARTIAL: Error saat menghitung itemCount:", e);
             itemCount = 1;
        }

        const count = Math.max(1, itemCount); 
        
        let skeletonHTML = '<div class="cart-skeleton-loader">';
        if (IS_DEBUG_MODE) console.log(`RENDER PARTIAL: Merender ${count} skeleton item(s).`);

        for (let i = 0; i < count; i++) {
            skeletonHTML += `
                <div class="skeleton-item">
                    <div class="skeleton-box skeleton-image"></div>
                    <div class="skeleton-details">
                        <div class="skeleton-box skeleton-line-title" style="width: 70%;"></div>
                        <div class="skeleton-box skeleton-line-variant" style="width: 40%;"></div>
                    </div>
                    <div class="skeleton-box skeleton-line-price" style="width: 50px;"></div>
                </div>`;
        }
        skeletonHTML += '</div>';
        cartItemsWrapper.innerHTML = skeletonHTML;
    }
    
    function applyVoucherAndReloadIframe(codeToApply) {
        if (IS_DEBUG_MODE) console.log(`PARENT: Menerapkan voucher ${codeToApply} dengan me-reload iframe...`);
        if (iframeWrapper) iframeWrapper.style.opacity = '0';
        if (loadingState) loadingState.style.display = 'flex'; 

        cartItemsReceived = false;
        totalsReceived = false;
        paymentOptionsReceived = false;
        isIframeReady = false;
        isIframeResized = false;
        grandRevealDone = false; 
        autofillSent = false; 

        let currentIframeSrc = iframe.src;
        currentIframeSrc = currentIframeSrc.replace(/&?discount_code=[^&]*/g, '');
        currentIframeSrc = currentIframeSrc.replace(/&?promo=[^&]*/g, '');

        const separator = currentIframeSrc.includes('?') ? '&' : '?';
        const newIframeSrc = `${currentIframeSrc}${separator}discount_code=${encodeURIComponent(codeToApply)}`;

        if (IS_DEBUG_MODE) console.log(`PARENT: Me-reload iframe ke: ${newIframeSrc}`);
        iframe.src = newIframeSrc;
    }
    
    checkoutButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            if (btn.classList.contains('is-loading')) return;
            const action = btn.dataset.action;
            if (action === 'submit') {
                btn.classList.add('is-loading');
                btn.disabled = true;

                if (failsafeTimer) clearTimeout(failsafeTimer);
                failsafeTimer = setTimeout(() => {
                    if (IS_DEBUG_MODE) console.warn("PARENT: Failsafe 15 detik terpicu! Tidak ada balasan sukses dari iframe.");
                    releaseCheckoutButtons();
                    ToastManager.create('Selesaikan pengisian form order untuk melanjutkan pembayaran.', 'error');
                }, 5000);

                if (IS_DEBUG_MODE) console.log('PARENT: Mengirim perintah SUBMIT_CHECKOUT ke iframe...');
                iframe.contentWindow.postMessage({ type: 'SUBMIT_CHECKOUT' }, iframeOrigin);
            } else if (action === 'whatsapp') {
                if (IS_DEBUG_MODE) console.log('PARENT: Memicu tombol CS global...');
                let productListText = '';
                invalidProductsList.forEach(item => {
                    productListText += `\n- ${item.name} (ID: ${item.id})`;
                });
                if (productListText === '') {
                     productListText = "\n- Produk saya gagal dimuat atau keranjang kosong.";
                }
                const waMessage = `Halo DeTama.id, saya menemukan produk yang bermasalah di checkout: ${productListText} \n\nTolong bantuannya untuk diperbaiki.`;
                const waUrl = `https://wa.me/${WA_PHONE_NUMBER}?text=${encodeURIComponent(waMessage)}`;
                window.open(waUrl, '_blank');
            }
        });
    });
    
    openModalBtn.addEventListener('click', () => paymentModal.classList.add('is-open'));
    closeModalBtn.addEventListener('click', () => paymentModal.classList.remove('is-open'));
    paymentModal.addEventListener('click', function(event) {
        if (event.target === paymentModal) {
            paymentModal.classList.remove('is-open');
        }
    });
    
    paymentOptionsList.addEventListener('click', (e) => {
        const optionItem = e.target.closest('.payment-option-item');
        if (!optionItem || optionItem.classList.contains('is-selecting')) return;
        document.querySelectorAll('.payment-option-item').forEach(item => item.classList.remove('is-selecting'));
        optionItem.classList.add('is-selecting');
        const methodName = optionItem.dataset.methodName;
        iframe.contentWindow.postMessage({ type: 'SELECT_PAYMENT_METHOD', methodName }, iframeOrigin);
    });
    
    cartItemsWrapper.addEventListener('click', function(e) {
        const removeButton = e.target.closest('.cart-item-remove-btn, .invalid-item-action-link');
        if (!removeButton) return;
        
        e.preventDefault();
        const sku = removeButton.dataset.sku;
        
        if (!sku || sku === 'MISSING_SKU') {
            if (IS_DEBUG_MODE) console.warn("Tombol hapus diklik tapi SKU tidak valid:", sku);
            return;
        }

        const cartItemRow = removeButton.closest('.cart-item');
        if (cartItemRow) {
            if (IS_DEBUG_MODE) console.log(`PARENT: Menyembunyikan item ${sku} & menambahkannya ke hiddenSKUs.`);
            cartItemRow.style.display = 'none';
            hiddenSKUs.add(sku);
        }

        if (removeButton.classList.contains('cart-item-remove-btn')) {
            if (IS_DEBUG_MODE) console.log(`PARENT: Menghapus item VALID (${sku}). Menonaktifkan tombol & mengirim postMessage.`);

            if (removeFailsafeTimer) {
                clearTimeout(removeFailsafeTimer);
            }

            cartItemsWrapper.querySelectorAll('.cart-item-remove-btn, .invalid-item-action-link').forEach(btn => {
                btn.disabled = true;
                if (btn.classList.contains('cart-item-remove-btn')) {
                     btn.textContent = 'Menghapus...';
                     btn.style.textDecoration = 'none';
                     btn.style.cursor = 'wait';
                }
            });
            
            iframe.contentWindow.postMessage({ 
                type: 'REMOVE_ITEM', 
                variantSKU: sku 
            }, iframeOrigin);
            
            removeFailsafeTimer = setTimeout(() => {
                if (IS_DEBUG_MODE) console.warn(`PARENT: Failsafe HAPUS terpicu! Tidak ada respons dari iframe untuk SKU: ${sku}`);
                ToastManager.create('Gagal menghapus item. Mohon coba beberapa saat lagi.', 'error');
                
                cartItemsWrapper.querySelectorAll('.cart-item-remove-btn, .invalid-item-action-link').forEach(btn => {
                    btn.disabled = false;
                    if (btn.classList.contains('cart-item-remove-btn')) {
                         btn.textContent = 'Hapus';
                         btn.style.textDecoration = 'underline';
                         btn.style.cursor = 'pointer';
                    }
                });
            }, 10000);
            
        }        

        else if (removeButton.classList.contains('invalid-item-action-link')) {
            if (IS_DEBUG_MODE) console.log(`PARENT: Menghapus item INVALID (${sku}). Memaksa render ulang lokal.`);            

            checkInvalidItemsAndTriggerCS();
        }
    });    

    const popover = document.getElementById('item-report-popover');
    const popoverArrow = popover.querySelector('.popover-arrow');
    const popoverTitle = document.getElementById('popover-title');
    const popoverText = document.getElementById('popover-text');
    const popoverActionBtn = document.getElementById('popover-action-btn');

    document.addEventListener('click', function(e) {
        
        const invalidReportBtn = e.target.closest('.invalid-item-report-btn');
        const feeInfoBtn = e.target.closest('.fee-info-trigger-btn');
        const clickedInsidePopover = e.target.closest('#item-report-popover');

        const refreshBtn = e.target.closest('#refreshCheckoutBtn');
        const reportTimeoutBtn = e.target.closest('#reportTimeoutBtn');

        let triggerElement = null;
        let popoverData = {};
        
        if (invalidReportBtn) {
            triggerElement = invalidReportBtn;
            popoverData = {
                title: 'Kenapa Tidak Valid?',
                text: `Produk "${triggerElement.dataset.name}" mengalami masalah sinkronisasi (kemungkinan ID-nya berubah). Mohon bantuannya untuk melapor agar bisa kami perbaiki.`,
                showButton: true,
                buttonData: { name: triggerElement.dataset.name, id: triggerElement.dataset.id }
            };
        } else if (feeInfoBtn) {
            triggerElement = feeInfoBtn;
            popoverData = {
                title: 'Info Biaya Penanganan',
                text: 'Biaya ini merupakan biaya administrasi yang dikenakan oleh bank atau penyedia layanan pembayaran (seperti QRIS, VA, E-Wallet) atas setiap transaksi.',
                showButton: false
            };
        }

        if (triggerElement) {
            e.preventDefault(); 
            popoverTitle.textContent = popoverData.title;
            popoverText.textContent = popoverData.text;
            if (popoverData.showButton) {
                popoverActionBtn.style.display = 'inline-flex';
                popoverActionBtn.dataset.name = popoverData.buttonData.name;
                popoverActionBtn.dataset.id = popoverData.buttonData.id;
            } else {
                popoverActionBtn.style.display = 'none';
            }
            const iconRect = triggerElement.getBoundingClientRect();
            const popoverWidth = popover.offsetWidth; 
            let top = window.scrollY + iconRect.bottom + 12; 
            let left = window.scrollX + iconRect.left - (popoverWidth / 2) + (iconRect.width / 2);
            if (left < 10) left = 10;
            if (left + popoverWidth > window.innerWidth - 10) {
                left = window.innerWidth - popoverWidth - 10;
            }
            popover.style.top = `${top}px`;
            popover.style.left = `${left}px`;
            const arrowLeft = (window.scrollX + iconRect.left + (iconRect.width / 2)) - left - 6;
            popoverArrow.style.left = `${arrowLeft}px`;
            popoverArrow.style.right = 'auto';

            popover.classList.add('is-visible');
        } 
        else if (!clickedInsidePopover) {
            popover.classList.remove('is-visible');
        }

        if (refreshBtn) {
            e.preventDefault();
            if (IS_DEBUG_MODE) console.log("TIMEOUT: Tombol 'Muat Ulang' diklik. Memuat ulang halaman...");
            window.location.reload();
            return; 
        }

        if (reportTimeoutBtn) {
            e.preventDefault();
            if (IS_DEBUG_MODE) console.log("TIMEOUT: Tombol 'Laporkan Masalah' diklik. Membuka WA...");
            const waMessage = `Halo DeTama.id, saya mengalami error timeout (Gagal Memuat Form) di halaman checkout. Mohon bantuannya. URL: ${window.location.href}`;
            const waUrl = `https://wa.me/${WA_PHONE_NUMBER}?text=${encodeURIComponent(waMessage)}`;
            window.open(waUrl, '_blank');
            return; 
        }
        
    });
    
    popoverActionBtn.addEventListener('click', function(e) {
        const productName = e.currentTarget.dataset.name;
        const productId = e.currentTarget.dataset.id;
        
        if (IS_DEBUG_MODE) console.log(`PARENT: Memicu laporan WA untuk ${productName} (ID: ${productId})`);
        
        const waMessage = `Halo DeTama.id, saya menemukan produk yang bermasalah di checkout: \n\n- Nama Produk: ${productName} \n- ID Produk: ${productId} \n\nTolong bantuannya untuk diperbaiki.`;
        const waUrl = `https://wa.me/${WA_PHONE_NUMBER}?text=${encodeURIComponent(waMessage)}`;
        
        window.open(waUrl, '_blank');
        
        popover.classList.remove('is-visible');
    });
    
    const voucherModal = document.getElementById('voucher-modal');
    const openVoucherBtn_listener = document.getElementById('openVoucherModalBtn');
    const closeVoucherBtn = document.getElementById('voucher-modal-close-btn');
    const voucherOptionsList = document.getElementById('voucher-options-list');

    if (openVoucherBtn_listener && voucherModal && closeVoucherBtn && voucherOptionsList) {
        openVoucherBtn_listener.addEventListener('click', () => {
            let vouchers = [];
            try {
                vouchers = JSON.parse(localStorage.getItem(VOUCHER_STORAGE_KEY) || '[]');
            } catch(e) { vouchers = []; }

            voucherOptionsList.innerHTML = '';
            if (vouchers.length > 0) {
                vouchers.forEach(voucher => {
                    const displayName = voucher.title || voucher.code;
                    voucherOptionsList.innerHTML += `
                    <div class="voucher-item" data-code="${voucher.code}">
                        <div class="voucher-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--accent-yellow);">
                                <line x1="19" y1="5" x2="5" y2="19"></line>
                                <circle cx="6.5" cy="6.5" r="2.5"></circle>
                                <circle cx="17.5" cy="17.5" r="2.5"></circle>
                            </svg>
                        </div>
                        <div class="voucher-details">
                            <span class="voucher-code">${displayName}</span>
                            <span class="voucher-desc">${voucher.desc || 'Voucher Diskon'}</span>
                        </div>
                        </div>
                    `;
                });
            } else {
                voucherOptionsList.innerHTML = '<p class="loading-text" style="text-align: center;">Anda tidak memiliki voucher tersimpan.</p>';
            }

            voucherModal.classList.add('is-open');
        });

        closeVoucherBtn.addEventListener('click', () => voucherModal.classList.remove('is-open'));
        voucherModal.addEventListener('click', (e) => {
            if (e.target === voucherModal) voucherModal.classList.remove('is-open');
        });

        voucherOptionsList.addEventListener('click', (e) => {
            const voucherItem = e.target.closest('.voucher-item');
            if (!voucherItem) return; 

            const codeToApply = voucherItem.dataset.code;
            if (!codeToApply) return;

            if (IS_DEBUG_MODE) console.log(`PARENT: Mengirim (Kondisi 3) ${codeToApply} ke iframe...`);
            iframe.contentWindow.postMessage({ 
                type: 'APPLY_VOUCHER_CODE', 
                code: codeToApply 
            }, iframeOrigin);

            voucherModal.classList.remove('is-open');
        });
    }

    loadProductDatabase();
});


})();