export class VoucherManager {
  private inputEl: HTMLInputElement;
  private applyBtn: HTMLButtonElement;
  private onApplyCallback: (code: string) => void;

  constructor(
    inputId: string,
    applyBtnId: string,
    onApplyCallback: (code: string) => void
  ) {
    const input = document.getElementById(inputId) as HTMLInputElement | null;
    const btn = document.getElementById(applyBtnId) as HTMLButtonElement | null;

    if (!input || !btn) {
      console.warn('[VoucherManager] Input or Button not found');
    }

    this.inputEl = input!;
    this.applyBtn = btn!;
    this.onApplyCallback = onApplyCallback;

    this.setupListeners();
  }

  /**
   * Pre-fill the voucher input, e.g. from URL params
   */
  public setCode(code: string): void {
    if (this.inputEl) {
      this.inputEl.value = code;
    }
  }

  /**
   * Visually indicate loading state when validating voucher
   */
  public setLoading(isLoading: boolean): void {
    if (!this.applyBtn) return;
    
    if (isLoading) {
      this.applyBtn.disabled = true;
      this.inputEl.disabled = true;
      this.applyBtn.textContent = 'Memeriksa...';
    } else {
      this.applyBtn.disabled = false;
      this.inputEl.disabled = false;
      this.applyBtn.textContent = 'Gunakan';
    }
  }

  private setupListeners(): void {
    if (!this.applyBtn || !this.inputEl) return;

    this.applyBtn.addEventListener('click', () => {
      const code = this.inputEl.value.trim();
      if (code && this.onApplyCallback) {
        this.onApplyCallback(code);
      }
    });

    this.inputEl.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const code = this.inputEl.value.trim();
        if (code && this.onApplyCallback) {
          this.onApplyCallback(code);
        }
      }
    });
  }
}
