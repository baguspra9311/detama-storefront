import type { ValidationResponse } from '@shared/types/messages';
import { API_ENDPOINTS } from '../constants';

export class EmailValidator {
  private cache = new Map<string, Promise<ValidationResponse>>();

  /**
   * Validates an email address.
   * Performs structural validation first, then calls a proxy to the Scalev API.
   */
  public async validate(email: string): Promise<ValidationResponse> {
    const trimmed = email.trim();
    
    if (!trimmed) {
      return { isValid: false, errors: ['Email wajib diisi'] };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      return { isValid: false, errors: ['Format email tidak valid'] };
    }

    // Cache lookup to prevent duplicate network requests
    if (this.cache.has(trimmed)) {
      return this.cache.get(trimmed)!;
    }

    // Proxy API call
    const requestPromise = this.callProxy(trimmed);
    this.cache.set(trimmed, requestPromise);
    
    return requestPromise;
  }

  private async callProxy(email: string): Promise<ValidationResponse> {
    try {
      const response = await fetch(API_ENDPOINTS.VALIDATE_EMAIL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      if (!response.ok) {
        throw new Error(`Proxy error: ${response.status}`);
      }
      
      const payload = await response.json(); 
      // Scalev usually returns `{ status: 'success', data: { is_valid: true, reason: null } }`
      // Or 400 with similar structure if invalid.  
      const data = payload?.data;

      if (data && typeof data.is_valid === 'boolean') {
        const isValid = data.is_valid;
        const errors = !isValid && data.reason ? [data.reason] : [];
        return { isValid, errors };
      }

      // If response format changes, fallback to valid
      return { isValid: true };
    } catch (e) {
      console.error('[EmailValidator] Error validating email, falling back to true:', e);
      // Fallback: If network fails, don't block the user
      return { isValid: true };
    }
  }
}
