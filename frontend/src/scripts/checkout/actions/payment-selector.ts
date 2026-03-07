import type { PaymentScraper } from '../scrapers/payment-scraper';
import type { IframeBridge } from '../bridge/iframe-bridge';

export class PaymentSelector {
  constructor(
    private paymentScraper: PaymentScraper,
    private bridge: IframeBridge
  ) {}

  /**
   * Automates the selection of a payment method and notifies the parent window.
   */
  public select(methodId: string): boolean {
    const success = this.paymentScraper.selectMethod(methodId);
    
    if (success) {
      // In a real scenario, we wait for the DOM to update then confirm back to parent
      // For now, we assume click = immediate selection
      // The MutationObserver loop will also catch this and send an update.
      console.log(`[PaymentSelector] Successfully selected payment method: ${methodId}`);
    } else {
      console.warn(`[PaymentSelector] Failed to find or select payment method: ${methodId}`);
    }

    return success;
  }
}
