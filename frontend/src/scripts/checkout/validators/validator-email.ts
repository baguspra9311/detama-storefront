import type { ValidationResponse } from '@shared/types/messages';

export class EmailValidator {
  /**
   * Validates an email address.
   * Simple regex for structural validation.
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

    // In a real environment, you might hit a third-party API here
    // For now, structual validation is sufficient for the iframe side.
    return { isValid: true };
  }
}
