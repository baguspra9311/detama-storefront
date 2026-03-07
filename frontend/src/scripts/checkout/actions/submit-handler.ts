import { SELECTORS } from '../constants';
import type { IframeBridge } from '../bridge/iframe-bridge';
import type { FormScraper } from '../scrapers/form-scraper';

export class SubmitHandler {
  private submitBtn: HTMLButtonElement | null = null;
  private isSubmitting = false;

  constructor(
    private formScraper: FormScraper,
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

    // Wrap the original click or form submit
    // Note: Scalev often puts the button outside a standard <form>, using Vue @click handlers.
    // Intercepting Vue @click directly is hard. Instead, we can listen during the capture phase,
    // or just listen and notify the parent.

    this.submitBtn.addEventListener('click', this.handleNativeSubmitClick.bind(this), true);
  }

  /**
   * Called when the user clicks the actual Scalev button (or when we programmatically click it)
   */
  private handleNativeSubmitClick(e: MouseEvent) {
    if (this.isSubmitting) return;

    // Send notification to parent that a submission attempt started
    // (useful to show loading states in the parent wrapper)
    this.bridge.send({
      type: 'VALIDATION_STARTED'
    });

    // We don't prevent default here unless we have our own async validation to run first
    // By default, we let Scalev's Vue handler run, and the browser will show validation messages
    
    // We can assume if no navigation happens immediately, validation might have failed or succeeded
    // A robust way to catch validation errors is observing error toast notifications or error classes
    // on inputs.
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
    const errorElements = document.querySelectorAll('.text-red-500.text-xs, .sclv-text-error, .sclv-error-message');
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
      // We could listen for network requests or unload events, but currently
      // we just know it didn't fail synchronous DOM validation
    }
  }

  /**
   * Programmatically triggers the submit button.
   */
  public triggerSubmit() {
    this.isSubmitting = true;
    this.bridge.send({ type: 'VALIDATION_STARTED' });

    if (this.submitBtn) {
      this.submitBtn.click();
    } else {
      // Re-query if it wasn't there initially
      this.attach();
      const btn = this.submitBtn as HTMLButtonElement | null;
      if (btn) {
        btn.click();
      } else {
        this.bridge.send({
          type: 'VALIDATION_ENDED',
          isValid: false,
          errors: ['Tombol submit tidak ditemukan.']
        });
      }
    }

    this.isSubmitting = false;
  }
}
