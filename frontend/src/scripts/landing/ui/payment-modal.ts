import type { PaymentOption } from '@shared/types/messages';

export class PaymentModal {
  private modalEl: HTMLElement;
  private methodsContainerId: string;
  private onSelectCallback: (methodId: string) => void;

  constructor(
    modalId: string, 
    methodsContainerId: string, 
    onSelectCallback: (methodId: string) => void
  ) {
    const modal = document.getElementById(modalId);
    if (!modal) throw new Error(`[PaymentModal] Modal #${modalId} not found`);

    this.modalEl = modal;
    this.methodsContainerId = methodsContainerId;
    this.onSelectCallback = onSelectCallback;

    this.setupListeners();
  }

  public renderOptions(options: PaymentOption[]): void {
    const container = document.getElementById(this.methodsContainerId);
    if (!container) return;

    if (!options || options.length === 0) {
      container.innerHTML = '<p class="text-sm text-gray-500">No payment methods available.</p>';
      return;
    }

    // Group by type
    const grouped = options.reduce((acc, opt) => {
      (acc[opt.type] = acc[opt.type] || []).push(opt);
      return acc;
    }, {} as Record<string, PaymentOption[]>);

    let html = '';
    
    // Define grouping order
    const order = ['bank_transfer', 'va', 'ewallet', 'retail', 'cod'];
    const titles: Record<string, string> = {
      bank_transfer: 'Transfer Bank (Verifikasi Manual)',
      va: 'Virtual Account (Verifikasi Otomatis)',
      ewallet: 'E-Wallet',
      retail: 'Minimarket',
      cod: 'Bayar di Tempat (COD)'
    };

    order.forEach(type => {
      const typeGroup = grouped[type];
      if (typeGroup && typeGroup.length > 0) {
        html += `<h3 class="payment-group-title">${titles[type] || type}</h3>`;
        html += `<div class="payment-method-grid">`;
        
        typeGroup.forEach(method => {
          const iconHtml = method.iconUrl 
            ? `<img src="${method.iconUrl}" alt="${method.name}" class="payment-icon" loading="lazy" />` 
            : '';
            
          html += `
            <button class="payment-method-btn" data-method-id="${method.id}">
              ${iconHtml}
              <span class="payment-method-name">${method.name}</span>
            </button>
          `;
        });
        
        html += `</div>`;
      }
    });

    container.innerHTML = html;

    // Attach click listeners to new buttons
    const btns = container.querySelectorAll('.payment-method-btn');
    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-method-id');
        if (id) {
          this.onSelectCallback(id);
          this.close();
        }
      });
    });
  }

  public open(): void {
    this.modalEl.style.display = 'flex'; // Assuming a flex overlay
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  }

  public close(): void {
    this.modalEl.style.display = 'none';
    document.body.style.overflow = '';
  }

  public updateSelectedUI(methodId: string, iconUrl?: string, name?: string): void {
    const btn = document.getElementById('select-payment-btn');
    if (!btn) return;
    
    let html = '';
    if (iconUrl) {
      html += `<img src="${iconUrl}" alt="${name || methodId}" class="selected-payment-icon" />`;
    }
    if (name) {
      html += `<span class="selected-payment-name">${name}</span>`;
    }

    if (!iconUrl && !name) {
      html = 'Pilih Metode Pembayaran';
    }

    btn.innerHTML = html;
  }

  private setupListeners(): void {
    // Open button logic
    const openBtn = document.getElementById('select-payment-btn');
    if (openBtn) {
      openBtn.addEventListener('click', () => this.open());
    }

    // Close buttons (X or overlay click)
    const closeBtns = this.modalEl.querySelectorAll('[data-close-modal]');
    closeBtns.forEach(btn => {
      btn.addEventListener('click', () => this.close());
    });

    // Close on clicking outside the modal content wrapper
    this.modalEl.addEventListener('click', (e) => {
      if (e.target === this.modalEl) {
        this.close();
      }
    });
  }
}
