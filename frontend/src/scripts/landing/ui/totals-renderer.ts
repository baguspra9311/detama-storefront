import type { TotalsSummary } from '@shared/types/messages';

export class TotalsRenderer {
  private summaryContainer: HTMLElement;
  private footerTotalEl: HTMLElement;

  constructor(summaryContainerId: string, footerTotalId: string) {
    const summary = document.getElementById(summaryContainerId);
    const footerTotal = document.getElementById(footerTotalId);

    if (!summary) throw new Error(`[TotalsRenderer] Summary container #${summaryContainerId} not found`);
    if (!footerTotal) throw new Error(`[TotalsRenderer] Footer total #${footerTotalId} not found`);

    this.summaryContainer = summary;
    this.footerTotalEl = footerTotal;
  }

  public render(data: TotalsSummary): void {
    // 1. Update the breakdown summary section
    let html = `
      <div class="summary-line">
        <span>Subtotal</span>
        <span>Rp ${data.subtotal.toLocaleString('id-ID')}</span>
      </div>
    `;

    if (data.shipping >= 0) {
      html += `
        <div class="summary-line">
          <span>Ongkos Kirim</span>
          <span>Rp ${data.shipping.toLocaleString('id-ID')}</span>
        </div>
      `;
    }

    if (data.tax > 0) {
      html += `
        <div class="summary-line">
          <span>Pajak</span>
          <span>Rp ${data.tax.toLocaleString('id-ID')}</span>
        </div>
      `;
    }

    if (data.discountLines && data.discountLines.length > 0) {
      data.discountLines.forEach(disc => {
        html += `
          <div class="summary-line discount-line">
            <span>${disc.label}</span>
            <span>- Rp ${Math.abs(disc.amount).toLocaleString('id-ID')}</span>
          </div>
        `;
      });
    }

    html += `
      <div class="summary-line total-line">
        <span>Total Bayar</span>
        <span>Rp ${data.total.toLocaleString('id-ID')}</span>
      </div>
    `;

    this.summaryContainer.innerHTML = html;
    this.summaryContainer.style.display = 'block';

    // 2. Update the sticky footer total
    this.footerTotalEl.textContent = `Rp ${data.total.toLocaleString('id-ID')}`;
    
    // Hide footer skeleton if it exists
    const skeleton = document.getElementById('footer-total-skeleton');
    if (skeleton) skeleton.style.display = 'none';
    this.footerTotalEl.style.display = 'block';
  }
}
