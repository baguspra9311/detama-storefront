import { STORAGE_KEYS } from '../constants';
import type { AutofillData } from '@shared/types/messages';

export class AutofillManager {
  /**
   * Keep a copy in memory so we don't need to read from logic repeatedly
   */
  private cachedData: AutofillData | null = null;

  constructor() {
    this.cachedData = this.load();
  }

  public save(data: AutofillData): void {
    try {
      // Merge with existing
      const existing = this.load() || {};
      const updated = { ...existing, ...data };
      
      localStorage.setItem(STORAGE_KEYS.AUTOFILL, JSON.stringify(updated));
      this.cachedData = updated;
    } catch (e) {
      console.warn('[AutofillManager] Failed to save autofill data to localStorage', e);
    }
  }

  public load(): AutofillData | null {
    if (this.cachedData) return this.cachedData;

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.AUTOFILL);
      if (stored) {
        return JSON.parse(stored) as AutofillData;
      }
    } catch (e) {
      console.warn('[AutofillManager] Failed to load autofill data from localStorage', e);
    }
    return null;
  }

  public clear(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.AUTOFILL);
      this.cachedData = null;
    } catch (e) {
      console.warn('[AutofillManager] Failed to clear autofill data', e);
    }
  }
}
