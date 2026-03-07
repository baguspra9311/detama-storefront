import type { ValidationResponse } from '@shared/types/messages';

export class WAValidator {
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

    // Note: Can integrate a real API (like Nusms/Wablas) here if needed.
    return { 
      isValid: true,
      correctedPhone: cleaned
    };
  }
}
