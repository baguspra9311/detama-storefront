import { TIMING } from '../constants';

export class ToastManager {
  private container: HTMLElement;

  constructor(containerId: string) {
    let el = document.getElementById(containerId);
    
    // Create container if it doesn't exist (e.g. Astro skeleton didn't include it natively, we inject it)
    if (!el) {
      el = document.createElement('div');
      el.id = containerId;
      el.className = 'toast-container'; // Requires CSS styling (fixed position)
      document.body.appendChild(el);
    }
    this.container = el;
  }

  /**
   * Show a toast message.
   * Type maps to CSS classes (e.g. error -> bg-red-500, success -> bg-green-500)
   */
  public show(message: string, type: 'error' | 'success' | 'warning' = 'error'): void {
    // 1. Enforce max visible toasts
    if (this.container.children.length >= TIMING.TOAST_MAX_VISIBLE) {
      this.container.removeChild(this.container.firstChild!);
    }

    // 2. Create the element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    // Add icon based on type (SVG inline or simple emoji fallback)
    let icon = '';
    if (type === 'error') icon = '⚠️';
    if (type === 'success') icon = '✅';
    if (type === 'warning') icon = 'ℹ️';

    toast.innerHTML = `
      <span class="toast-icon">${icon}</span>
      <span class="toast-message">${message}</span>
      <button class="toast-close">&times;</button>
    `;

    // 3. Setup close handler
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn?.addEventListener('click', () => {
      this.remove(toast);
    });

    // 4. Mount
    this.container.appendChild(toast);

    // 5. Trigger CSS animation by adding an active class slightly after mount
    requestAnimationFrame(() => {
      toast.classList.add('toast-show');
    });

    // 6. Auto remove
    setTimeout(() => {
      this.remove(toast);
    }, TIMING.TOAST_DURATION_MS);
  }

  private remove(toast: HTMLElement): void {
    if (!toast.parentNode) return;
    
    // CSS fade out class
    toast.classList.remove('toast-show');
    toast.classList.add('toast-hide');
    
    // Wait for animation then remove from DOM
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300); // 300ms transition time
  }
}
