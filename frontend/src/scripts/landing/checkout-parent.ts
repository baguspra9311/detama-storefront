import { ParentBridge } from './bridge/parent-bridge';
import { URLParser } from './managers/url-parser';
import { IframeManager } from './managers/iframe-manager';
import { AutofillManager } from './managers/autofill-manager';
import { CSModeManager } from './managers/cs-mode-manager';
import { CartRenderer } from './ui/cart-renderer';
import { TotalsRenderer } from './ui/totals-renderer';
import { PaymentModal } from './ui/payment-modal';
import { VoucherManager } from './ui/voucher-manager';
import { ToastManager } from './ui/toast-manager';


export class CheckoutParent {
  private bridge: ParentBridge;
  private iframeManager: IframeManager;
  private autofillManager: AutofillManager;
  private csModeManager: CSModeManager;
  
  private cartRenderer: CartRenderer;
  private totalsRenderer: TotalsRenderer;
  private paymentModal: PaymentModal;
  private voucherManager: VoucherManager;
  private toastManager: ToastManager;

  private isSubmitting = false;

  constructor() {
    console.log('[CheckoutParent] Initializing...');
    
    // Initialize bridge
    this.bridge = new ParentBridge();

    // Initialize Managers
    this.iframeManager = new IframeManager('iframe-wrapper', 'iframe-loading');
    this.autofillManager = new AutofillManager();
    this.csModeManager = new CSModeManager('cs-mode-banner');

    // Initialize UI
    this.cartRenderer = new CartRenderer('cart-items-container');
    this.totalsRenderer = new TotalsRenderer('totals-container', 'sticky-total-price');
    this.toastManager = new ToastManager('toast-container');
    
    // Voucher Manager setup
    this.voucherManager = new VoucherManager('voucher-input', 'apply-voucher-btn', (code) => {
      this.bridge.send({ type: 'APPLY_VOUCHER_CODE', code });
      this.voucherManager.setLoading(true);
    });

    // Payment Modal Setup
    this.paymentModal = new PaymentModal('payment-modal', 'payment-methods-grid', (methodId) => {
      this.bridge.send({ type: 'SELECT_PAYMENT_METHOD', methodId });
      // UI update is handled blindly here but will be forced via CONFIRMED event soon
      this.paymentModal.updateSelectedUI(methodId);
    });

    this.setupMessageHandlers();
    this.setupDOMHandlers();
  }

  public start(): void {
    const params = URLParser.parse();
    
    // Set voucher from URL if present
    if (params.voucher) {
      this.voucherManager.setCode(params.voucher);
    }

    // Build iframe URL and create it
    const iframeSrc = URLParser.buildIframeSrc(params);
    const iframeEl = this.iframeManager.create(iframeSrc);
    
    // Bind to bridge
    this.bridge.bindIframe(iframeEl);

    // Initial theme sync
    this.bridge.send({ type: 'SET_THEME', theme: params.theme });
  }

  private setupMessageHandlers(): void {
    this.bridge.on('IFRAME_READY', () => {
      console.log('[CheckoutParent] Iframe reported ready');
      this.bridge.setReady();
      this.iframeManager.show();

      // Send autofill data if we have it
      const savedAutofill = this.autofillManager.load();
      if (savedAutofill) {
        this.bridge.send({ type: 'LOAD_AUTOFILL_DATA', data: savedAutofill });
      }
    });

    this.bridge.on('VALIDATION_STARTED', () => {
      this.setSubmitting(true);
    });

    this.bridge.on('VALIDATION_ENDED', (payload) => {
      if (!payload.isValid) {
        this.setSubmitting(false);
        this.toastManager.show('Silakan periksa kembali data Anda.', 'warning');
      }
      // If valid, we wait for iframe to do the navigation
    });

    this.bridge.on('UPDATE_CART_ITEMS', (payload) => {
      this.cartRenderer.render(payload.items);
    });

    this.bridge.on('UPDATE_TOTALS', (payload) => {
      this.totalsRenderer.render(payload.data);
      // If voucher was applying, stop loading state
      this.voucherManager.setLoading(false);
    });

    this.bridge.on('PAYMENT_OPTIONS_DATA', (payload) => {
      this.paymentModal.renderOptions(payload.options);
    });

    this.bridge.on('PAYMENT_SELECTION_CONFIRMED', (payload) => {
      this.paymentModal.updateSelectedUI(payload.methodId, payload.iconUrl);
    });

    this.bridge.on('PAYMENT_SELECTION_FAILED', (payload) => {
      this.toastManager.show(`Gagal memilih metode pembayaran: ${payload.reason || 'Terjadi kesalahan'}`, 'error');
    });

    this.bridge.on('SUBMISSION_FAILED', (payload) => {
      this.setSubmitting(false);
      this.toastManager.show(payload.errors?.[0] || 'Gagal memproses pesanan', 'error');
    });

    this.bridge.on('SHOW_ERROR', (payload) => {
      this.toastManager.show(payload.message, payload.errorType || 'error');
      this.voucherManager.setLoading(false); // Failsafe
    });

    this.bridge.on('SAVE_AUTOFILL_DATA', (payload) => {
      this.autofillManager.save(payload.data);
    });

    this.bridge.on('INVALID_CART', () => {
      console.warn('[CheckoutParent] Invalid cart, activating CS mode');
      this.csModeManager.activate();
      this.setCheckoutEnabled(false);
    });
  }

  private setupDOMHandlers(): void {
    const submitBtn = document.getElementById('submit-checkout-btn');
    if (submitBtn) {
      submitBtn.addEventListener('click', () => {
        if (this.isSubmitting) return;
        this.bridge.send({ type: 'SUBMIT_CHECKOUT' });
      });
    }
  }

  private setSubmitting(isSubmitting: boolean): void {
    this.isSubmitting = isSubmitting;
    const btn = document.getElementById('submit-checkout-btn') as HTMLButtonElement;
    if (btn) {
      if (isSubmitting) {
        btn.disabled = true;
        btn.innerHTML = `<span class="spinner"></span> Memproses...`;
      } else {
        btn.disabled = false;
        btn.innerHTML = `Selesaikan Pesanan`;
      }
    }
  }

  private setCheckoutEnabled(isEnabled: boolean): void {
    const btn = document.getElementById('submit-checkout-btn') as HTMLButtonElement;
    if (btn && !this.isSubmitting) {
      btn.disabled = !isEnabled;
    }
  }
}

// Global initialization for script tag usage
window.addEventListener('DOMContentLoaded', () => {
  const app = new CheckoutParent();
  app.start();
  // Expose to window for debugging if needed
  // @ts-ignore
  window.DetamaCheckout = app;
});
