import { SELECTORS } from '../constants';
import type { FormScraper } from '../scrapers/form-scraper';
import type { IframeBridge } from '../bridge/iframe-bridge';

export class DiscountApplier {
  constructor(
    private formScraper: FormScraper,
    private bridge: IframeBridge
  ) {}

  /**
   * Applies a voucher code by simulating user input and clicking the apply button.
   */
  public async apply(code: string): Promise<boolean> {
    const { discount: discountInput } = this.formScraper.getInputs();
    
    // Some themes don't have discount inputs
    if (!discountInput) {
      console.warn('[DiscountApplier] Discount input not found.');
      return false;
    }

    // 1. Fill the input
    this.setInputValue(discountInput, code);

    // Give Vue a single tick to register the input value before clicking apply
    await new Promise((resolve) => setTimeout(resolve, 50));

    // 2. Click the apply button
    const applyBtn = document.querySelector(SELECTORS.DISCOUNT_APPLY_BTN.primary) as HTMLButtonElement
      || document.querySelector(SELECTORS.DISCOUNT_APPLY_BTN.fallback) as HTMLButtonElement;

    if (!applyBtn) {
      console.warn('[DiscountApplier] Discount apply button not found.');
      return false;
    }

    applyBtn.click();

    // The result (success/failure) will be picked up by the global MutationObserver 
    // in CheckoutPage OR we can wait for a specific DOM change here if needed.
    // For now, returning true means we successfully trigged the action.
    return true;
  }

  /**
   * Helper to set value bypassing Vue proxy
   */
  private setInputValue(element: HTMLInputElement, value: string) {
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      'value'
    )?.set;
    
    if (nativeInputValueSetter) {
      nativeInputValueSetter.call(element, value);
    } else {
      element.value = value;
    }

    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
  }
}
