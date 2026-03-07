// =====================================================
// PostMessage Protocol Types
// Communication between Parent (Landing Page) & Iframe (Checkout)
// =====================================================

// ===== Shared Sub-Types =====

export interface AutofillData {
  name?: string;
  email?: string;
  phone?: string;
}

export interface CartItemSummary {
  sku?: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

export interface DiscountLine {
  label: string;
  amount: number;
}

export interface TotalsSummary {
  subtotal: number;
  shipping: number;
  discountLines: DiscountLine[];
  tax: number;
  total: number;
}

export interface PaymentOption {
  id: string;
  name: string;
  type: 'bank_transfer' | 'ewallet' | 'cod' | 'va' | 'retail';
  iconUrl?: string;
}

export interface ValidationResponse {
  isValid: boolean;
  errors?: string[];
  correctedPhone?: string;
  provider?: string;
}

// ===== Iframe → Parent Messages (sent FROM Checkout iframe) =====

export type IframeMessage =
  | { type: 'IFRAME_READY' }
  | { type: 'VALIDATION_STARTED' }
  | { type: 'VALIDATION_ENDED'; isValid: boolean; errors?: string[] }
  | { type: 'UPDATE_CART_ITEMS'; items: CartItemSummary[] }
  | { type: 'UPDATE_TOTALS'; data: TotalsSummary }
  | { type: 'PAYMENT_OPTIONS_DATA'; options: PaymentOption[] }
  | { type: 'PAYMENT_SELECTION_CONFIRMED'; methodId: string }
  | { type: 'PAYMENT_SELECTION_FAILED'; methodId: string }
  | { type: 'SUBMISSION_FAILED'; errors?: string[] };

// ===== Parent → Iframe Messages (sent FROM Landing Page) =====

export type ParentMessage =
  | { type: 'SET_THEME'; theme: 'light' | 'dark' }
  | { type: 'APPLY_VOUCHER_CODE'; code: string }
  | { type: 'SELECT_PAYMENT_METHOD'; methodId: string }
  | { type: 'LOAD_AUTOFILL_DATA'; data: AutofillData }
  | { type: 'SUBMIT_CHECKOUT' };

// ===== Type Guard Helpers =====

export function isIframeMessage(data: unknown): data is IframeMessage {
  return (
    typeof data === 'object' &&
    data !== null &&
    'type' in data &&
    typeof (data as { type: unknown }).type === 'string'
  );
}

export function isParentMessage(data: unknown): data is ParentMessage {
  return (
    typeof data === 'object' &&
    data !== null &&
    'type' in data &&
    typeof (data as { type: unknown }).type === 'string'
  );
}
