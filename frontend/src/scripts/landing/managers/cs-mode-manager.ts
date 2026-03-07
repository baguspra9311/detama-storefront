export class CSModeManager {
  private bannerEl: HTMLElement | null;

  constructor(bannerId: string) {
    this.bannerEl = document.getElementById(bannerId);
  }

  /**
   * Shows the Customer Service fallback banner and optionally disables the main UI
   */
  public activate(): void {
    console.warn('[CSModeManager] Activating CS Mode (Invalid Cart detected)');
    if (this.bannerEl) {
      this.bannerEl.style.display = 'block';
      // In CSS, this banner will likely be styled as an overlay or persistent topbar asking user to contact WhatsApp.
    }
    
    // Could also hide elements, e.g. the checkout container:
    // document.getElementById('iframe-wrapper')?.style.display = 'none';
  }

  public deactivate(): void {
    if (this.bannerEl) {
      this.bannerEl.style.display = 'none';
    }
  }
}
