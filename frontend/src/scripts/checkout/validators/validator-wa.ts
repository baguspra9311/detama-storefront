import type { ValidationResponse } from '@shared/types/messages';
import { API_ENDPOINTS } from '../constants';

export class WAValidator {
  private cache = new Map<string, Promise<ValidationResponse>>();

  /**
   * Validates and sanitizes an Indonesian WhatsApp number.
   * Format: replaces leading 0 or +62 with local conventions.
   */
  public async validate(phone: string): Promise<ValidationResponse> {
    let cleaned = phone.replace(/[^0-9+]/g, '');

    if (!cleaned) {
      return { isValid: false, errors: ['Nomor WA wajib diisi'] };
    }

    // Convert 08... to 628...
    if (cleaned.startsWith('0')) {
      cleaned = '62' + cleaned.substring(1);
    } else if (cleaned.startsWith('+62')) {
      cleaned = '62' + cleaned.substring(3);
    }

    // Basic length check (Indonesian mobile numbers are generally 10-14 digits starting with 628)
    if (!cleaned.startsWith('628') || cleaned.length < 10 || cleaned.length > 15) {
      return { isValid: false, errors: ['Nomor WA tidak valid. Pastikan dimulai dengan 08 atau 628.'] };
    }

    // Cache lookup
    if (this.cache.has(cleaned)) {
      return this.cache.get(cleaned)!;
    }

    // Proxy API call
    const requestPromise = this.callProxy(cleaned);
    this.cache.set(cleaned, requestPromise);
    
    return requestPromise;
  }

  private async callProxy(phone: string): Promise<ValidationResponse> {
    try {
      const response = await fetch(API_ENDPOINTS.VALIDATE_WA, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });
      
      if (!response.ok) {
        throw new Error(`Proxy error: ${response.status}`);
      }
      
      const payload = await response.json(); 
      const data = payload?.data;

      if (data && typeof data.is_valid === 'boolean') {
        const isValid = data.is_valid;
        const errors = !isValid && data.reason ? [data.reason] : [];
        return { isValid, errors, correctedPhone: phone };
      }

      // If response format changes, fallback to valid
      return { isValid: true, correctedPhone: phone };
    } catch (e) {
      console.error('[WAValidator] Error validating phone, falling back to true:', e);
      // Fallback: If network fails, don't block the user
      return { isValid: true, correctedPhone: phone };
    }
  }
}
