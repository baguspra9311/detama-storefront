import type { CartItemSummary } from '@shared/types/messages';

export class CartRenderer {
  private container: HTMLElement;

  constructor(containerId: string) {
    const el = document.getElementById(containerId);
    if (!el) {
      throw new Error(`[CartRenderer] Container element #${containerId} not found`);
    }
    this.container = el;
  }

  /**
   * Render the list of cart items
   */
  public render(items: CartItemSummary[]): void {
    if (!items || items.length === 0) {
      this.clear();
      return;
    }

    // Build the HTML using template literals
    const html = items.map(item => this.createItemHTML(item)).join('');
    this.container.innerHTML = html;
    this.container.style.display = 'block';
  }

  public clear(): void {
    this.container.innerHTML = '';
    this.container.style.display = 'none';
  }

  private createItemHTML(item: CartItemSummary): string {
    const defaultImage = 'https://s3.ap-southeast-1.amazonaws.com/assets.scalev.id/store/detama/209c735d5dc8ac0c4516-Scalev-ID-Tumbhnail.png';
    const imageUrl = item.imageUrl || defaultImage;

    return `
      <div class="checkout-cart-item">
        <div class="cart-item-image">
          <img src="${imageUrl}" alt="${item.name}" loading="lazy" />
          <span class="cart-item-qty">${item.quantity}</span>
        </div>
        <div class="cart-item-details">
          <h4 class="cart-item-name">${item.name}</h4>
          ${item.sku ? `<span class="cart-item-sku">SKU: ${item.sku}</span>` : ''}
          <div class="cart-item-price">Rp ${item.price.toLocaleString('id-ID')}</div>
        </div>
      </div>
    `;
  }
}
