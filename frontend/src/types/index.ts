// =====================================================
// Frontend TypeScript Interfaces
// Product Catalog, Cart, Validation, Purchase Events
// =====================================================

// ===== Product Catalog =====

export interface Variant {
  /** Scalev Variant ID */
  id: string;
  name: string;
  price: number;
  sku?: string;
}

export interface DemoUrls {
  noVariant?: string;
  variant?: string;
  bundle?: string;
  landing?: string;
}

export type ProductCategory = 'theme' | 'course' | 'bundle';

export interface Product {
  id: string;
  name: string;
  desc: string;
  badge?: string;
  image: string;
  features: string[];
  comingSoon: boolean;
  price?: number;
  isBundle?: boolean;
  originalPrice?: number;
  category: ProductCategory;
  demoUrls?: DemoUrls;
  variants: Variant[];
}

// ===== Cart =====

export interface CartItem {
  variantId: string;
  variantSKU: string;
  productName: string;
  variantName: string;
  price: number;
  quantity: number;
  image: string;
}

export interface CartState {
  items: CartItem[];
  promoCode?: string;
  version: 'v1';
}

export const CART_STORAGE_KEY = 'universalCart_v1';

// ===== Validation API Responses =====

export type ValidationCategory = 'success' | 'warning' | 'invalid';

export interface ValidationResponse {
  valid: boolean;
  category: ValidationCategory;
  message: string;
}

// ===== Purchase Events (Real-Time Social Proof) =====

export interface PurchaseEvent {
  buyerName: string;
  productName: string;
  /** Unix timestamp in milliseconds */
  timestamp: number;
  city?: string;
}

export interface LatestPurchasesResponse {
  purchases: PurchaseEvent[];
}

// ===== API Configuration =====

export const API_BASE_URL = 'https://api.detama.id';
export const CDN_BASE_URL = 'https://assets.detama.id';

export const ALLOWED_ORIGINS: readonly string[] = [
  'https://detama.id',
  'https://kelasnyatama.com',
] as const;
