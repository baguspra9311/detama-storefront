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

    // 1. Scrape Summary Rows (Subtotal, Shipping, Tax, Discounts)
    const summaryRowElements = document.querySelectorAll(SELECTORS.TOTALS_SUMMARY_ROWS);
    
    summaryRowElements.forEach((row) => {
      const textContent = row.textContent?.toLowerCase() || '';

      // The amount is the last paragraph in the row
      const amountNode = row.querySelector('p.ml-auto');
      let amount = 0;
      
      if (amountNode && amountNode.textContent) {
        amount = this.parseRupiah(amountNode.textContent);
      }

      // Categorize based on label (the first paragraph in the row)
      const labelNode = row.querySelector('p');
      const label = labelNode?.textContent?.trim() || '';

      if (textContent.includes('harga') || textContent.includes('subtotal')) {
        summary.subtotal = amount;
      } else if (textContent.includes('ongkos kirim') || textContent.includes('ongkir') || textContent.includes('pengiriman')) {
        summary.shipping = amount;
      } else if (textContent.includes('biaya') && (textContent.includes('admin') || textContent.includes('layanan'))) {
        summary.tax += amount; // Treat as tax/fee
      } else if (textContent.includes('potongan') || textContent.includes('diskon')) {
        summary.discountLines.push({ label, amount });
      }
    });

    // 2. Scrape Grand Total Row
    const grandTotalElement = document.querySelector(SELECTORS.TOTALS_TOTAL_ROW);
    if (grandTotalElement && grandTotalElement.textContent) {
      summary.total = this.parseRupiah(grandTotalElement.textContent);
    } else {
      // Fallback if the grand total row selector didn't catch it
      // Usually the total is the sum of subtotal + shipping + tax - discounts
      const totalDiscounts = summary.discountLines.reduce((acc, curr) => acc + curr.amount, 0);
      const calculatedTotal = summary.subtotal + summary.shipping + summary.tax - totalDiscounts;
      // Ensure positive
      summary.total = Math.max(0, calculatedTotal);
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
