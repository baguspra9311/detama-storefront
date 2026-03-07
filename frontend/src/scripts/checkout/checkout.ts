import { IframeBridge } from './bridge/iframe-bridge';
import { CartScraper } from './scrapers/cart-scraper';
import { TotalsScraper } from './scrapers/totals-scraper';
import { FormScraper } from './scrapers/form-scraper';
import { PaymentScraper } from './scrapers/payment-scraper';
import { DiscountApplier } from './actions/discount-applier';
import { PaymentSelector } from './actions/payment-selector';
import { SubmitHandler } from './actions/submit-handler';
import { EmailValidator } from './validators/validator-email';
import { WAValidator } from './validators/validator-wa';
import { TIMING } from './constants';
// CSS is imported as a raw string and injected into Scalev's <head> at runtime,
// since we cannot add a <link> tag via Scalev's Custom Head Script feature.
import iframeCss from '../../styles/checkout-iframe.css?raw';

/** Injects our checkout styles into the Scalev form's <head>. */
function injectStyles(): void {
  if (document.getElementById('checkout-parent-styles')) return; // Already injected
  const style = document.createElement('style');
  style.id = 'checkout-parent-styles';
  style.textContent = iframeCss;
  document.head.appendChild(style);
}

class CheckoutOrchestrator {
  private bridge: IframeBridge;
  
  // Scrapers
  private cartScraper: CartScraper;
  private totalsScraper: TotalsScraper;
  private formScraper: FormScraper;
  private paymentScraper: PaymentScraper;
  
  // Actions
  private discountApplier: DiscountApplier;
  private paymentSelector: PaymentSelector;
  private submitHandler: SubmitHandler;

  // Validators
  private emailValidator: EmailValidator;
  private waValidator: WAValidator;

  // State cache for change detection
  private lastCartState = '';
  private lastTotalsState = '';
  private lastPaymentState = '';
  private lastFormState = '';

  constructor() {
    this.bridge = new IframeBridge();
    this.cartScraper = new CartScraper();
    this.totalsScraper = new TotalsScraper();
    this.formScraper = new FormScraper();
    this.paymentScraper = new PaymentScraper();

    this.discountApplier = new DiscountApplier(this.formScraper, this.bridge);
    this.paymentSelector = new PaymentSelector(this.paymentScraper, this.bridge);
    this.submitHandler = new SubmitHandler(this.formScraper, this.bridge);

    this.emailValidator = new EmailValidator();
    this.waValidator = new WAValidator();
  }

  public init() {
    // 1. Inject our CSS styles into Scalev's <head>
    injectStyles();

    this.bindBridgeEvents();
    this.submitHandler.attach();
    this.startDOMObserver();
    
    // Notify parent we are ready to receive data
    this.bridge.send({ type: 'IFRAME_READY' });

    // Initial scrape
    setTimeout(() => {
      this.scrapeAndBroadcast();
      this.attachRealtimeValidation();
    }, 500);

    // Periodically sync form data to parent for caching
    setInterval(() => this.syncFormData(), 2000);
  }

  private syncFormData() {
    const data = this.formScraper.getFormData();
    const stringData = JSON.stringify(data);
    if (this.lastFormState !== stringData && data.name) { // Ensure at least a name exists before saving
      this.lastFormState = stringData;
      this.bridge.send({ type: 'SAVE_AUTOFILL_DATA', data });
    }
  }

  private attachRealtimeValidation() {
    const inputs = this.formScraper.getInputs();

    if (inputs.email) {
      let timeout: ReturnType<typeof setTimeout>;
      inputs.email.addEventListener('input', (e) => {
        clearTimeout(timeout);
        timeout = setTimeout(async () => {
          const val = (e.target as HTMLInputElement).value;
          if (!val) return;
          const res = await this.emailValidator.validate(val);
          this.updateValidationUI(inputs.email!, res.isValid, res.errors?.[0]);
          if (!res.isValid && res.errors) {
            this.bridge.send({ type: 'VALIDATION_ENDED', isValid: false, errors: res.errors });
          }
        }, TIMING.EMAIL_DEBOUNCE_MS);
      });
    }

    if (inputs.phone) {
      let timeout: ReturnType<typeof setTimeout>;
      inputs.phone.addEventListener('input', (e) => {
        clearTimeout(timeout);
        timeout = setTimeout(async () => {
          const val = (e.target as HTMLInputElement).value;
          if (!val) return;
          const res = await this.waValidator.validate(val);
          this.updateValidationUI(inputs.phone!, res.isValid, res.errors?.[0]);
          if (!res.isValid && res.errors) {
            this.bridge.send({ type: 'VALIDATION_ENDED', isValid: false, errors: res.errors });
          }
        }, TIMING.WA_DEBOUNCE_MS);
      });
    }
  }

  private updateValidationUI(input: HTMLInputElement, isValid: boolean, errorMsg?: string) {
    if (!input) return;
    
    input.classList.toggle('is-invalid-input', !isValid);
    
    let errorEl = input.parentElement?.querySelector('.validation-error-msg');
    if (!isValid) {
      if (!errorEl) {
        errorEl = document.createElement('span');
        errorEl.className = 'validation-error-msg text-red-500 text-xs mt-1 block';
        input.parentElement?.appendChild(errorEl);
      }
      errorEl.textContent = errorMsg || 'Invalid value';
    } else if (errorEl) {
      errorEl.remove();
    }
  }

  private bindBridgeEvents() {
    this.bridge.on('APPLY_VOUCHER_CODE', async (payload) => {
      await this.discountApplier.apply(payload.code);
    });

    this.bridge.on('SELECT_PAYMENT_METHOD', (payload) => {
      const success = this.paymentSelector.select(payload.methodId);
      if (success) {
        this.bridge.send({ type: 'PAYMENT_SELECTION_CONFIRMED', methodId: payload.methodId });
      } else {
        this.bridge.send({ type: 'PAYMENT_SELECTION_FAILED', methodId: payload.methodId });
      }
    });

    this.bridge.on('LOAD_AUTOFILL_DATA', (payload) => {
      this.formScraper.fillAutofill(payload.data);
    });

    this.bridge.on('SUBMIT_CHECKOUT', async () => {
      // 1. Pre-validate custom fields heavily relied upon
      const formData = this.formScraper.getFormData();
      
      let errors: string[] = [];
      
      if (formData.email) {
        const emailRes = await this.emailValidator.validate(formData.email);
        if (!emailRes.isValid && emailRes.errors) errors.push(...emailRes.errors);
      }
      
      if (formData.phone) {
        const waRes = await this.waValidator.validate(formData.phone);
        if (!waRes.isValid && waRes.errors) errors.push(...waRes.errors);
      }

      if (errors.length > 0) {
        this.bridge.send({ type: 'VALIDATION_ENDED', isValid: false, errors });
        return;
      }

      // 2. Trigger actual submit
      this.submitHandler.triggerSubmit();
    });

    this.bridge.on('SET_THEME', (payload) => {
      // Toggle .checkout-dark-theme on <html> element — matches CSS selector
      // in checkout-iframe.css which uses .checkout-dark-theme for variable overrides
      document.documentElement.classList.toggle('checkout-dark-theme', payload.theme === 'dark');
    });

    this.bridge.on('DISABLE_CHECKOUT', () => {
      (window as any)._detamaCartInvalid = true;
    });

    this.bridge.on('ENABLE_CHECKOUT', () => {
      (window as any)._detamaCartInvalid = false;
    });
  }

  private startDOMObserver() {
    // Observe the main container for pricing/cart updates
    // Scalev uses Vue so elements constantly re-render
    const observer = new MutationObserver(() => {
      this.scrapeAndBroadcast();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });
  }

  private scrapeAndBroadcast() {
    // 1. Cart
    const cartItems = this.cartScraper.scrape();
    const currentCartState = JSON.stringify(cartItems);
    if (this.lastCartState !== currentCartState) {
      this.lastCartState = currentCartState;
      this.bridge.send({ type: 'UPDATE_CART_ITEMS', items: cartItems });
    }

    // 2. Totals
    const totals = this.totalsScraper.scrape();
    const currentTotalsState = JSON.stringify(totals);
    if (this.lastTotalsState !== currentTotalsState) {
      this.lastTotalsState = currentTotalsState;
      this.bridge.send({ type: 'UPDATE_TOTALS', data: totals });
    }

    // 3. Payment Methods
    const paymentMethods = this.paymentScraper.scrapeAll();
    const currentPaymentState = JSON.stringify(paymentMethods);
    if (this.lastPaymentState !== currentPaymentState && paymentMethods.length > 0) {
      this.lastPaymentState = currentPaymentState;
      this.bridge.send({ type: 'PAYMENT_OPTIONS_DATA', options: paymentMethods });
    }
  }
}

// Bootstrap
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new CheckoutOrchestrator().init();
  });
} else {
  new CheckoutOrchestrator().init();
}
