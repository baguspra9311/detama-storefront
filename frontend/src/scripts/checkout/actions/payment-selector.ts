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
      console.log(`[PaymentSelector] Successfully selected payment method: ${methodId}`);
    } else {
      console.warn(`[PaymentSelector] Method ${methodId} not immediately found. Retrying via polling...`);
      // Retry via polling if it wasn't found (due to async rendering component)
      this.paymentScraper.pollPaymentState((options) => {
        const found = options.some(o => o.id === methodId || o.name === methodId);
        if (found) {
          this.paymentScraper.selectMethod(methodId);
          console.log(`[PaymentSelector] Successfully selected payment method (async): ${methodId}`);
        }
      });
    }

    // Return the synchronous success state. Parent UI should react to cart updates.
    return success;
  }
}
