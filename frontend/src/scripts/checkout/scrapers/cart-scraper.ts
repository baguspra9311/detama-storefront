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
      // Scalev typically uses an img tag with a specific class or just the first img
      const imgEl = node.querySelector('img');
      const imageUrl = imgEl?.src || '';

      // 2. Name
      // Extract from a bold/title element or similar
      // E.g., .sclv-checkout-item__name
      const nameEl = node.querySelector('.sclv-text-body-bold, .sclv-checkout-item__name, font.font-bold, strong');
      const name = nameEl?.textContent?.trim() || 'Unknown Product';

      // 3. Price
      // Sometimes there are original prices (struck through) and final prices. We want the final active price.
      // Often inside something like .sclv-text-green-500 or just formatted as Rp 
      // We'll scrape all text nodes looking for "Rp" and take the last one or most prominent
      const priceTextNode = node.querySelector('.text-green-500, .sclv-text-green-500, .sclv-checkout-item__price');
      let price = 0;
      if (priceTextNode && priceTextNode.textContent) {
        price = this.parseRupiah(priceTextNode.textContent);
      } else {
        // Fallback: search raw text for Rp
        const match = node.textContent?.match(/Rp\s*([0-9.,]+)/);
        if (match && match[1]) {
          price = this.parseRupiah(match[1]);
        }
      }

      // 4. Quantity
      // Found near a multiplier, e.g., "x 1" or inside an input if editable
      let quantity = 1;
      const qtyRegex = /x\s*(\d+)/i;
      const qtyMatch = node.textContent?.match(qtyRegex);
      if (qtyMatch && qtyMatch[1]) {
        quantity = parseInt(qtyMatch[1], 10) || 1;
      }

      // 5. SKU (Optional)
      // Usually stored in a data attribute or part of the name
      // If we don't have it explicitly, we leave it undefined and let the parent match by name
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
   * Helper to parse a Rupiah string like "Rp 100.000" into a number
   */
  private parseRupiah(text: string): number {
    const cleaned = text.replace(/[^0-9]/g, '');
    return parseInt(cleaned, 10) || 0;
  }
}
