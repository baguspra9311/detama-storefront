import type { PaymentOption } from '@shared/types/messages';
import { SELECTORS } from '../constants';

export class PaymentScraper {
  /**
   * Scrapes all available payment options listed in the DOM.
   */
  public scrapeAll(): PaymentOption[] {
    const options: PaymentOption[] = [];

    // Scalev payment methods are typically rendered in lists
    const container = document.querySelector(SELECTORS.PAYMENT_WRAPPER.primary)
      || document.querySelector(SELECTORS.PAYMENT_WRAPPER.fallback);

    if (!container) {
      console.warn('[PaymentScraper] Payment container not found.');
      return options;
    }

    const items = container.querySelectorAll(
      SELECTORS.PAYMENT_ITEM.primary + ', ' + SELECTORS.PAYMENT_ITEM.fallback
    );

    items.forEach((item, index) => {
      // Name
      const nameNode = item.querySelector('.sclv-text-body-bold, .payment-name, h4, span.font-bold');
      const name = nameNode?.textContent?.trim() || `Payment Method ${index + 1}`;

      // ID (from an input value or data attribute)
      const inputEl = item.querySelector('input[type="radio"]') as HTMLInputElement;
      const id = inputEl?.value || item.getAttribute('data-value') || name;

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
    const container = document.querySelector(SELECTORS.PAYMENT_WRAPPER.primary)
      || document.querySelector(SELECTORS.PAYMENT_WRAPPER.fallback);

    if (!container) return false;

    // We'll look for input.value === paymentIdOrName first, then visible text 
    const inputs = Array.from(container.querySelectorAll('input[type="radio"]')) as HTMLInputElement[];
    const exactInput = inputs.find((inp) => inp.value === paymentIdOrName);

    if (exactInput) {
      exactInput.click();
      return true;
    }

    // Fallback: click the exact container matching text
    const items = Array.from(container.querySelectorAll(
      SELECTORS.PAYMENT_ITEM.primary + ', ' + SELECTORS.PAYMENT_ITEM.fallback
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
}
