import type { CartItemSummary } from '@shared/types/messages';
import { SELECTORS } from '../constants';

export class CartScraper {
  /**
   * Scrapes all cart items currently rendered in the Scalev DOM.
   */
  public scrape(): CartItemSummary[] {
    const items: CartItemSummary[] = [];

    // Find all cart item elements using primary or fallback selector
    const elements = document.querySelectorAll(SELECTORS.CART_ITEM.primary);
    const itemNodes = elements.length > 0
      ? elements
      : document.querySelectorAll(SELECTORS.CART_ITEM.fallback);

    if (itemNodes.length === 0 && elements.length === 0) {
      console.warn('[CartScraper] No cart items found using known selectors.');
      return items;
    }

    itemNodes.forEach((node) => {
      // 1. Image URL
      const imgEl = node.querySelector(SELECTORS.CART_ITEM_IMAGE) as HTMLImageElement | null;
      let imageUrl = '';
      if (imgEl && imgEl.hasAttribute('src')) {
        imageUrl = imgEl.getAttribute('src') || '';
      }

      // 2. Name
      // Extract from the SKU row
      const nameEl = node.querySelector(SELECTORS.CART_ITEM_SKU);
      const name = nameEl?.textContent?.trim() || 'Unknown Product';

      // 3. Price
      const priceTextNode = node.querySelector(SELECTORS.CART_ITEM_PRICE);
      let price = 0;
      if (priceTextNode && priceTextNode.textContent) {
        price = this.parseRupiah(priceTextNode.textContent);
      }

      // 4. Quantity
      const qtyInput = node.querySelector(SELECTORS.CART_ITEM_QTY) as HTMLInputElement;
      let quantity = 1;
      if (qtyInput && qtyInput.value) {
        quantity = parseInt(qtyInput.value, 10) || 1;
      }

      // 5. SKU (Optional)
      let sku: string | undefined;

      items.push({
        sku,
        name,
        price,
        quantity,
        imageUrl,
      });
    });

    return items;
  }

  /**
   * Checks if the cart contains any items.
   * Used for INVALID_CART detection.
   */
  public hasItems(): boolean {
    const elements = document.querySelectorAll(SELECTORS.CART_ITEM.primary);
    if (elements.length > 0) return true;
    
    const fallbackElements = document.querySelectorAll(SELECTORS.CART_ITEM.fallback);
    return fallbackElements.length > 0;
  }

  /**
   * Helper to parse a Rupiah string like "Rp 100.000" into a number
   */
  private parseRupiah(text: string): number {
    const cleaned = text.replace(/[^0-9]/g, '');
    return parseInt(cleaned, 10) || 0;
  }
}
