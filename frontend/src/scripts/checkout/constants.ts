// Constants for the Checkout Iframe Script

export const ALLOWED_ORIGINS = [
  'https://detama.id',
  'http://localhost:4321', // Local dev
];

export const SELECTORS = {
  // Cart & Totals
  CART_ITEM: {
    primary: '.sclv-checkout-item',
    fallback: '[data-checkout-item]',
  },
  TOTALS_CONTAINER: {
    primary: '.sclv-checkout__totals',
    fallback: '.checkout-summary',
  },

  // Form Inputs
  FORM_NAME: {
    primary: 'input[name="name"]',
    fallback: '.sclv-input[name="name"]',
  },
  FORM_EMAIL: {
    primary: 'input[name="email"]',
    fallback: 'input[type="email"]',
  },
  FORM_PHONE: {
    primary: 'input[name="phone"]',
    fallback: 'input[type="tel"]',
  },

  // Discount
  DISCOUNT_INPUT: {
    primary: 'input[name="discount_code"]',
    fallback: '#sclv-discount-code',
  },
  DISCOUNT_APPLY_BTN: {
    primary: 'button[id*="apply-discount"]',
    fallback: '.sclv-btn-apply-discount',
  },

  // Payment
  PAYMENT_WRAPPER: {
    primary: '.v-popper__popper', // Dropdown wrapper
    fallback: '.sclv-checkout__payment-method',
  },
  PAYMENT_ITEM: {
    primary: '.sclv-payment-method-item',
    fallback: '.payment-option',
  },

  // Submit
  SUBMIT_BTN: {
    primary: '.sclv-checkout-submit-btn',
    fallback: 'button[type="submit"]',
  },
} as const;

export const API_ENDPOINTS = {
  VALIDATE_EMAIL: 'https://detama.id/api/validate/email',
  VALIDATE_WA: 'https://detama.id/api/validate/wa',
};

// For local testing of API endpoints
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
  API_ENDPOINTS.VALIDATE_EMAIL = 'http://localhost:4321/api/validate/email';
  API_ENDPOINTS.VALIDATE_WA = 'http://localhost:4321/api/validate/wa';
}

export const TIMING = {
  VALIDATION_DEBOUNCE_MS: 500,
  POLLING_INTERVAL_MS: 500,
  MAX_POLLING_ATTEMPTS: 20,
};
