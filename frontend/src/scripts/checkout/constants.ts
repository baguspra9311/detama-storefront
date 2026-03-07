// Constants for the Checkout Iframe Script

export const SELECTORS = {
  CART_ITEM: {
    primary: '#main-form-items-JmLZKLNejx > div.mt-\\[16px\\] > div',
    fallback: '.sclv-checkout-item',
  },
  CART_ITEM_SKU: 'span.w-full.text-\\[16px\\].font-\\[500\\].leading-\\[22px\\]',
  CART_ITEM_PRICE: 'span.text-\\[14px\\]',
  CART_ITEM_QTY: 'input[type="number"]',
  CART_ITEM_IMAGE: 'img[data-nuxt-img]',
  CART_ITEM_REMOVE_BTN: 'button[type="button"]',
  
  TOTALS_TOTAL_ROW: 'div.border-t-2.border-gray-400 > p.ml-auto',
  TOTALS_SUMMARY_ROWS: 'div.flex.w-full.flex-col.gap-y-\\[12px\\].px-\\[16px\\].pb-\\[16px\\] > div.flex.w-full',
  
  PAYMENT_OPTION: 'div.w-full.cursor-pointer.rounded',
  PAYMENT_OPTION_NAME: 'span.text-\\[16px\\]',
  
  FORM_NAME: { primary: '#name', fallback: 'input[name="name"]' },
  FORM_EMAIL: { primary: '#email', fallback: 'input[name="email"]' },
  FORM_PHONE: { primary: '#phone', fallback: 'input[type="tel"]' },
  FORM_ADDRESS: { primary: '#address', fallback: 'textarea[name="address"]' },
  DISCOUNT_INPUT: { primary: '#discountCode', fallback: 'input[name="discount_code"]' },
  DISCOUNT_APPLY_BTN: {
    primary: 'button[id*="apply-discount"]',
    fallback: '.sclv-btn-apply-discount',
  },
  SUBMIT_BTN: { primary: 'form button', fallback: 'button[type="submit"]' },
  ERROR_TOAST: '.text-red-500.text-xs, .sclv-text-error, .sclv-error-message',
  PRODUCT_IMAGES: 'img[src*="/uploads/"]',
} as const;

export const API_ENDPOINTS = {
  VALIDATE_EMAIL: 'https://api.detama.id/api/validate/email',
  VALIDATE_WA: 'https://api.detama.id/api/validate/wa',
};

export const TIMING = {
  EMAIL_DEBOUNCE_MS: 1200,
  WA_DEBOUNCE_MS: 1000,
  PAYMENT_POLL_INTERVAL_MS: 200,
  PAYMENT_POLL_MAX_ATTEMPTS: 25,
  IMAGE_POLL_INTERVAL_MS: 500,
  IMAGE_POLL_MAX_ATTEMPTS: 15,
  MUTATION_OBSERVER_DEBOUNCE_MS: 300,
  INITIAL_DELAY_MS: 1500,
  SUBMIT_CHECK_DELAY_MS: 500,
};

export const CACHE_TTL = {
  EMAIL_VALID_S: 3600,
  EMAIL_FAILSAFE_S: 20,
  WA_SUCCESS_S: 3600,
  WA_FAILURE_S: 600,
};

export const ALLOWED_ORIGINS = [
  'https://detama.id',
  'https://kelasnyatama.com',
  'http://localhost:4321',
] as const;
