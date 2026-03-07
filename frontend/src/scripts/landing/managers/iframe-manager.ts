import { TIMING } from '../constants';

export class IframeManager {
  private iframeEl: HTMLIFrameElement | null = null;
  private container: HTMLElement;
  private loadingSpinner: HTMLElement | null;
  private timeoutId?: number;

  constructor(containerId: string, loadingSpinnerId: string) {
    const el = document.getElementById(containerId);
    if (!el) {
      throw new Error(`[IframeManager] Container element #${containerId} not found`);
    }
    this.container = el;
    this.loadingSpinner = document.getElementById(loadingSpinnerId);
  }

  /**
   * Create the iframe element and mount it
   */
  public create(src: string): HTMLIFrameElement {
    if (this.iframeEl) {
      return this.iframeEl; // Return existing if already created
    }

    this.iframeEl = document.createElement('iframe');
    this.iframeEl.src = src;
    
    // Iframe styling defaults (these are inline but can be moved to CSS)
    this.iframeEl.style.width = '100%';
    this.iframeEl.style.height = '100%';
    this.iframeEl.style.border = 'none';
    this.iframeEl.style.opacity = '0'; // Hide initially
    this.iframeEl.style.transition = 'opacity 0.3s ease-in-out';
    this.iframeEl.allow = 'payment'; // For Apple Pay / Google Pay if requested down the line
    
    this.container.appendChild(this.iframeEl);
    
    // Setup fail-safe timeout
    this.setupTimeout();

    return this.iframeEl;
  }

  /**
   * Called when the iframe signals it is fully ready
   */
  public show(): void {
    if (this.timeoutId) {
      window.clearTimeout(this.timeoutId);
    }

    if (this.loadingSpinner) {
      this.loadingSpinner.style.display = 'none';
    }

    if (this.iframeEl) {
      this.iframeEl.style.opacity = '1';
    }
  }

  private setupTimeout(): void {
    this.timeoutId = window.setTimeout(() => {
      console.error('[IframeManager] IFRAME_READY not received. Timeout reached.');
      // Provide fallback or show error state if needed
    }, TIMING.IFRAME_READY_TIMEOUT_MS);
  }

  public destroy(): void {
    if (this.timeoutId) {
      window.clearTimeout(this.timeoutId);
    }
    if (this.iframeEl && this.iframeEl.parentNode) {
      this.iframeEl.parentNode.removeChild(this.iframeEl);
    }
    this.iframeEl = null;
  }
}
