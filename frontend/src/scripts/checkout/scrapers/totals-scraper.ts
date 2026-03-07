import type { TotalsSummary } from '@shared/types/messages';
import { SELECTORS } from '../constants';

export class TotalsScraper {
  /**
   * Scrapes the totals (subtotal, shipping, discounts, tax, total) from the Scalev DOM.
   */
  public scrape(): TotalsSummary {
    const summary: TotalsSummary = {
      subtotal: 0,
      shipping: 0,
      discountLines: [],
      tax: 0,
      total: 0,
    };

    const container = document.querySelector(SELECTORS.TOTALS_CONTAINER.primary)
      || document.querySelector(SELECTORS.TOTALS_CONTAINER.fallback);

    if (!container) {
      console.warn('[TotalsScraper] Totals container not found.');
      return summary;
    }

    // Scalev typically displays each row in a flex container, e.g. .flex.justify-between
    // We'll iterate through all rows inside the totals container and categorize them by their label text
    const rows = container.querySelectorAll('.flex.justify-between, .sclv-checkout__totals-row, tr');

    rows.forEach((row) => {
      const textContent = row.textContent?.toLowerCase() || '';

      // The amount is usually the last number in the row or has a specific class
      const amountNode = row.querySelector('.text-right, .sclv-text-right, td:last-child, div:last-child');
      let amount = 0;
      
      if (amountNode && amountNode.textContent) {
        amount = this.parseRupiah(amountNode.textContent);
      } else {
        // Fallback: search row text
        const match = textContent.match(/rp\s*([0-9.,]+)/);
        if (match && match[1]) {
          amount = this.parseRupiah(match[1]);
        }
      }

      // Categorize based on label
      if (textContent.includes('subtotal') || textContent.includes('total harga')) {
        summary.subtotal = amount;
      } else if (textContent.includes('ongkos kirim') || textContent.includes('ongkir') || textContent.includes('shipping')) {
        summary.shipping = amount;
      } else if (textContent.includes('pajak') || textContent.includes('tax')) {
        summary.tax = amount;
      } else if (textContent.includes('diskon') || textContent.includes('potongan') || textContent.includes('discount')) {
        // Find the specific label name, e.g. "Diskon Produk" or "Voucher Lebaran"
        const labelNode = row.querySelector('.text-left, .sclv-text-left, td:first-child, div:first-child');
        const label = labelNode?.textContent?.trim() || 'Diskon';
        summary.discountLines.push({ label, amount });
      } else if (textContent.includes('total') && !textContent.includes('subtotal') && !textContent.includes('harga')) {
        // "Total" usually represents the grand total
        summary.total = amount;
      }
    });

    // In some cases, the grand total is highlighted in a specific large font container
    const grandTotalNode = container.querySelector('.sclv-text-head-3, .font-bold.text-lg, .sclv-checkout__total-price');
    if (grandTotalNode && grandTotalNode.textContent) {
      const possibleTotal = this.parseRupiah(grandTotalNode.textContent);
      if (possibleTotal > 0) {
        summary.total = possibleTotal;
      }
    }

    return summary;
  }

  /**
   * Helper to parse a Rupiah string like "Rp 100.000" into a number
   */
  private parseRupiah(text: string): number {
    const cleaned = text.replace(/[^0-9]/g, '');
    return parseInt(cleaned, 10) || 0;
  }
}
