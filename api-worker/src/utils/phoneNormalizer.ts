// =====================================================
// Phone Number Normalizer
// Converts Indonesian phone formats to 628xxx standard
// =====================================================

/**
 * Normalize an Indonesian phone number to international format (628xxx).
 *
 * Handles:
 * - 08xxx      → 628xxx
 * - +628xxx    → 628xxx
 * - 628xxx     → 628xxx (no change)
 * - 8xxx       → 628xxx
 *
 * Strips spaces, dashes, and parentheses.
 *
 * @returns Normalized number string, or null if invalid format
 */
export function normalizePhoneNumber(raw: string): string | null {
  // Strip all non-digit characters except leading +
  let cleaned = raw.replace(/[^\d+]/g, '');

  // Remove leading +
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.slice(1);
  }

  // Convert 08xx → 628xx
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1);
  }

  // Convert 8xx → 628xx (bare number without country code)
  if (cleaned.startsWith('8') && cleaned.length >= 9 && cleaned.length <= 13) {
    cleaned = '62' + cleaned;
  }

  // Validate: must start with 62 and be 10-15 digits
  if (!/^62\d{8,13}$/.test(cleaned)) {
    return null;
  }

  return cleaned;
}
