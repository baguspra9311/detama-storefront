export const IFRAME_BASE_URL = 'https://kelasnyatama.com/c/checkout';

export const ALLOWED_ORIGINS = [
  'https://kelasnyatama.com',
  'http://localhost:4321', // Local dev for parent wrapper
  'http://localhost:3000', // Alternate dev port
] as const;

export const TIMING = {
  IFRAME_READY_TIMEOUT_MS: 10000,
  TOAST_DURATION_MS: 3000,
  TOAST_MAX_VISIBLE: 3,
} as const;

export const STORAGE_KEYS = {
  AUTOFILL: 'detama_checkout_autofill',
  THEME: 'detama_checkout_theme',
} as const;
