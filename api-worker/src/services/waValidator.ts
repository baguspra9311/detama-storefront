// =====================================================
// WhatsApp Number Validation Service
// Normalizes phone + proxies to Fonnte API
// Docs: https://docs.fonnte.com/api-validate-number/
// =====================================================

import { normalizePhoneNumber } from '../utils/phoneNormalizer';

const FONNTE_VALIDATE_URL = 'https://api.fonnte.com/validate';

export interface WAValidationResult {
  valid: boolean;
  category: 'success' | 'warning' | 'invalid';
  message: string;
}

/**
 * Validate a WhatsApp number with Fonnte API.
 * Falls back to 'warning' (pass-through) if Fonnte is unreachable — per PRD v3.1 failsafe.
 */
export async function validateWhatsApp(
  rawPhone: string,
  fonnteToken: string
): Promise<WAValidationResult> {
  // 1. Normalize phone number to E.164 (without +)
  const normalized = normalizePhoneNumber(rawPhone);

  if (!normalized) {
    return {
      valid: false,
      category: 'invalid',
      message: 'Format nomor telepon tidak valid. Gunakan format 08xx atau 628xx.',
    };
  }

  // 2. Call Fonnte validate API
  try {
    const response = await fetch(FONNTE_VALIDATE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: fonnteToken,
      },
      body: new URLSearchParams({ target: normalized }).toString(),
    });

    if (!response.ok) {
      console.error(`[Fonnte] HTTP ${response.status}: ${response.statusText}`);
      // Failsafe: if Fonnte is down, pass through with warning
      return {
        valid: true,
        category: 'warning',
        message: 'Tidak dapat memverifikasi WhatsApp saat ini. Pastikan nomor ini aktif.',
      };
    }

    // Fonnte returns: { status: true/false, detail: "..." }
    const result = (await response.json()) as { status?: boolean; detail?: string };

    if (result.status === true) {
      return {
        valid: true,
        category: 'success',
        message: 'Nomor WhatsApp terverifikasi.',
      };
    }

    return {
      valid: false,
      category: 'invalid',
      message: 'Nomor ini tidak terdaftar di WhatsApp.',
    };
  } catch (error) {
    console.error('[Fonnte] Request failed:', error);
    // Failsafe: network error → pass through with warning
    return {
      valid: true,
      category: 'warning',
      message: 'Tidak dapat memverifikasi WhatsApp saat ini. Pastikan nomor ini aktif.',
    };
  }
}
