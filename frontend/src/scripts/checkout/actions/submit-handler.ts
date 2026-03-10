import { SELECTORS } from '../constants';
import { IframeBridge } from '../bridge/iframe-bridge';

export class SubmitHandler {
  private submitBtn: HTMLButtonElement | null = null;
  private isSubmitting = false;

  constructor(
    private bridge: IframeBridge
  ) {}

  /**
   * Hooks into the native Scalev submit button to intercept or report submission status.
   */
  public attach() {
    this.submitBtn = document.querySelector(SELECTORS.SUBMIT_BTN.primary) as HTMLButtonElement
      || document.querySelector(SELECTORS.SUBMIT_BTN.fallback) as HTMLButtonElement;

    if (!this.submitBtn) {
      console.warn('[SubmitHandler] Submit button not found on load. Will retry periodically.');
      return;
    }

    // Wrap the original click or form submit. We use capture phase to intercept before Vue.
    this.submitBtn.addEventListener('click', this.handleNativeSubmitClick.bind(this), true);
  }

  /**
   * Called when the user clicks the actual Scalev button (or when we programmatically click it)
   */
  private handleNativeSubmitClick(e: MouseEvent) {
    if (this.isSubmitting) return;

    // Guard if parent window told us the cart is invalid 
    if ((window as any)._detamaCartInvalid) {
      e.preventDefault();
      e.stopPropagation();
      this.bridge.send({
        type: 'VALIDATION_ENDED',
        isValid: false,
        errors: ['Keranjang belanja telah berubah, harap refresh halaman.']
      });
      return;
    }

    // Send notification to parent that a submission attempt started
    this.bridge.send({
      type: 'VALIDATION_STARTED'
    });

    // We don't prevent default here unless we have our own async validation to run first
    // By default, we let Scalev's Vue handler run, and the browser will show validation messages
    
    setTimeout(() => {
      // Small delay to let Vue process the click and show errors
      this.checkValidationErrors();
    }, 500);
  }

  /**
   * Checks for Scalev validation errors in the DOM.
   */
  private checkValidationErrors() {
    // Look for error text classes that Scalev shows
    const errorElements = document.querySelectorAll(SELECTORS.ERROR_TOAST);
    const hasVisibleErrors = Array.from(errorElements).some(el => {
      // Ensure it's actually visible
      const style = window.getComputedStyle(el);
      return style.display !== 'none' && el.textContent?.trim().length;
    });

    if (hasVisibleErrors) {
      this.bridge.send({
        type: 'VALIDATION_ENDED',
        isValid: false,
        errors: ['Terdapat form yang belum lengkap atau tidak valid.']
      });
    } else {
      // It might be submitting...
    }
  }

  /**
   * Programmatically triggers the submit button.
   */
  public triggerSubmit() {
    this.isSubmitting = true;
    this.bridge.send({ type: 'VALIDATION_STARTED' });

    // Always fetch the latest button ref in SPAs
    this.submitBtn = document.querySelector(SELECTORS.SUBMIT_BTN.primary) as HTMLButtonElement
      || document.querySelector(SELECTORS.SUBMIT_BTN.fallback) as HTMLButtonElement;

    if (this.submitBtn) {
      this.submitBtn.click();
    } else {
      this.bridge.send({
        type: 'VALIDATION_ENDED',
        isValid: false,
        errors: ['Tombol submit tidak ditemukan.']
      });
    }

    this.isSubmitting = false;
  }
}
