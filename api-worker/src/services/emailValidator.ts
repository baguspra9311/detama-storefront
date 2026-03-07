// =====================================================
// Email Validation Service
// Strict regex-based email validation
// =====================================================

// Local type alias — mirrors shared/types/messages.ts ValidationResponse
interface ValidationResponse {
  valid: boolean;
  category: 'success' | 'warning' | 'invalid';
  message: string;
}


// RFC 5322-compliant simplified regex
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

// Known disposable/temporary email domains
const DISPOSABLE_DOMAINS = new Set([
  'tempmail.com', 'guerrillamail.com', 'throwaway.email',
  'yopmail.com', 'sharklasers.com', 'mailinator.com',
  'trashmail.com', 'temp-mail.org', 'dispostable.com',
]);

// Known problematic TLDs
const SUSPICIOUS_TLDS = new Set(['.tk', '.ml', '.ga', '.cf', '.gq']);

/**
 * Validate an email address with strict checks.
 */
export function validateEmail(email: string): ValidationResponse {
  const trimmed = email.trim().toLowerCase();

  // Basic presence check
  if (!trimmed) {
    return { valid: false, category: 'invalid', message: 'Email tidak boleh kosong.' };
  }

  // Regex format check
  if (!EMAIL_REGEX.test(trimmed)) {
    return { valid: false, category: 'invalid', message: 'Format email tidak valid.' };
  }

  // Extract domain
  const domain = trimmed.split('@')[1];
  if (!domain) {
    return { valid: false, category: 'invalid', message: 'Domain email tidak ditemukan.' };
  }

  // Check disposable domains
  if (DISPOSABLE_DOMAINS.has(domain)) {
    return { valid: false, category: 'invalid', message: 'Email sementara (disposable) tidak diperbolehkan.' };
  }

  // Check suspicious TLDs
  const tld = '.' + domain.split('.').pop();
  if (SUSPICIOUS_TLDS.has(tld)) {
    return { valid: true, category: 'warning', message: 'Email terdeteksi menggunakan domain yang kurang umum. Pastikan email ini aktif.' };
  }

  return { valid: true, category: 'success', message: 'Email valid.' };
}
