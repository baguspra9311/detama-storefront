import type { PaymentOption } from '@shared/types/messages';
import { SELECTORS, TIMING } from '../constants';

export class PaymentScraper {
  /**
   * Scrapes all available payment options listed in the DOM.
   */
  public scrapeAll(): PaymentOption[] {
    const options: PaymentOption[] = [];

    const items = document.querySelectorAll(SELECTORS.PAYMENT_OPTION);
    if (!items || items.length === 0) {
      console.warn('[PaymentScraper] No payment items found.');
      return options;
    }

    items.forEach((item, index) => {
      // Name
      const nameNode = item.querySelector(SELECTORS.PAYMENT_OPTION_NAME);
      const name = nameNode?.textContent?.trim() || `Payment Method ${index + 1}`;

      // ID (from an input value or assuming it maps directly if no input)
      const inputEl = item.querySelector('input[type="radio"]') as HTMLInputElement;
      const id = inputEl?.value || name; // Fallback to name if ID is missing

      // Icon
      const imgEl = item.querySelector('img');
      const iconUrl = imgEl?.src;

      // Type (Infer from name mostly)
      let type: PaymentOption['type'] = 'bank_transfer'; // Default
      const lowerName = name.toLowerCase();
      if (lowerName.includes('cod') || lowerName.includes('bayar di tempat')) type = 'cod';
      else if (lowerName.includes('qris') || lowerName.includes('ovo') || lowerName.includes('gopay') || lowerName.includes('dana') || lowerName.includes('shopeepay')) type = 'ewallet';
      else if (lowerName.includes('indomaret') || lowerName.includes('alfamart')) type = 'retail';
      else if (lowerName.includes('va') || lowerName.includes('virtual account')) type = 'va';

      options.push({
        id,
        name,
        type,
        iconUrl,
      });
    });

    return options;
  }

  /**
   * Identifies the currently selected payment method.
   */
  public getSelected(): string | undefined {
    const defaultSelector = 'input[name="payment_method"]:checked, input[type="radio"]:checked';
    const checkedInput = document.querySelector(defaultSelector) as HTMLInputElement;

    return checkedInput?.value;
  }

  /**
   * Simulates clicking/selecting a specific payment method.
   */
  public selectMethod(paymentIdOrName: string): boolean {
    // Look for exact exact radio
    const inputs = Array.from(document.querySelectorAll('input[type="radio"]')) as HTMLInputElement[];
    const exactInput = inputs.find((inp) => inp.value === paymentIdOrName);

    if (exactInput) {
      exactInput.click();
      return true;
    }

    // Fallback: click the exact container matching text
    const items = Array.from(document.querySelectorAll(
      SELECTORS.PAYMENT_OPTION
    )) as HTMLElement[];

    const matchedItem = items.find((item) => {
      return item.textContent?.toLowerCase().includes(paymentIdOrName.toLowerCase());
    });

    if (matchedItem) {
      matchedItem.click();
      return true;
    }

    return false;
  }

  /**
   * Polls the DOM until the payment options are fully rendered.
   * Scalev uses async Vue rendering, causing delays. We poll (e.g., 25 times every 200ms).
   */
  public pollPaymentState(callback: (options: PaymentOption[]) => void): void {
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      const items = this.scrapeAll();
      
      // Assume fully rendered if > 0 OR if we maxed attempts
      if (items.length > 0 || attempts >= TIMING.PAYMENT_POLL_MAX_ATTEMPTS) {
        clearInterval(interval);
        callback(items);
      }
    }, TIMING.PAYMENT_POLL_INTERVAL_MS);
  }
}
