// =====================================================
// Product Catalog — Single Source of Truth (SSOT)
// All product data lives here. Scalev IDs must match.
// =====================================================

import type { Product } from '../types/index';

/**
 * ScaleMarket Products — Scalev Themes
 */
export const scaleMarketProducts: Product[] = [
  {
    id: 'sm-theme-elegance',
    name: 'Elegance Theme',
    desc: 'Premium Scalev storefront theme with modern design, optimized for conversions.',
    badge: 'Best Seller',
    image: '/images/products/elegance-theme.webp',
    features: [
      'Responsive design',
      'Dark & light mode',
      'Checkout optimization',
      'SEO-friendly structure',
    ],
    comingSoon: false,
    category: 'theme',
    demoUrls: {
      noVariant: 'https://demo.detama.id/elegance',
    },
    variants: [
      { id: 'var-elegance-personal', name: 'Personal License', price: 149_000, sku: 'ELG-PRS' },
      { id: 'var-elegance-business', name: 'Business License', price: 299_000, sku: 'ELG-BIZ' },
    ],
  },
  {
    id: 'sm-theme-minimalist',
    name: 'Minimalist Theme',
    desc: 'Clean and minimal Scalev theme focused on speed and simplicity.',
    image: '/images/products/minimalist-theme.webp',
    features: [
      'Ultra-fast load times',
      'Minimalist UI',
      'Easy customization',
      'Mobile-first design',
    ],
    comingSoon: false,
    category: 'theme',
    demoUrls: {
      noVariant: 'https://demo.detama.id/minimalist',
    },
    variants: [
      { id: 'var-minimalist-personal', name: 'Personal License', price: 99_000, sku: 'MIN-PRS' },
      { id: 'var-minimalist-business', name: 'Business License', price: 199_000, sku: 'MIN-BIZ' },
    ],
  },
];

/**
 * SkillForge Products — Online Courses
 */
export const skillForgeProducts: Product[] = [
  {
    id: 'sf-course-scalev-mastery',
    name: 'Scalev Mastery Course',
    desc: 'Complete guide to building and scaling your online store with Scalev.',
    badge: 'New',
    image: '/images/products/scalev-mastery.webp',
    features: [
      '20+ video lessons',
      'Lifetime access',
      'Private community',
      'Certificate of completion',
    ],
    comingSoon: false,
    price: 349_000,
    category: 'course',
    variants: [
      { id: 'var-mastery-basic', name: 'Basic Access', price: 349_000, sku: 'SVM-BAS' },
      { id: 'var-mastery-premium', name: 'Premium + Mentoring', price: 599_000, sku: 'SVM-PRE' },
    ],
  },
  {
    id: 'sf-course-landing-page',
    name: 'Landing Page Blueprint',
    desc: 'Learn to create high-converting landing pages that sell.',
    image: '/images/products/landing-blueprint.webp',
    features: [
      '15 video lessons',
      'Landing page templates',
      'Copywriting formulas',
      'A/B testing guide',
    ],
    comingSoon: true,
    category: 'course',
    variants: [],
  },
];

/**
 * Bundle Products — Combinations
 */
export const bundleProducts: Product[] = [
  {
    id: 'bundle-starter-pack',
    name: 'DeTama Starter Pack',
    desc: 'Get everything you need to start selling online — theme + course at a special price.',
    badge: 'Bundle Deal',
    image: '/images/products/starter-pack.webp',
    features: [
      'Elegance Theme (Business)',
      'Scalev Mastery Course (Basic)',
      'Priority support',
      '30% savings',
    ],
    comingSoon: false,
    isBundle: true,
    price: 399_000,
    originalPrice: 648_000,
    category: 'bundle',
    variants: [
      { id: 'var-starter-bundle', name: 'Starter Pack', price: 399_000, sku: 'BDL-START' },
    ],
  },
];

/**
 * Get all products across all categories
 */
export function getAllProducts(): Product[] {
  return [...scaleMarketProducts, ...skillForgeProducts, ...bundleProducts];
}

/**
 * Find a product by its ID
 */
export function getProductById(id: string): Product | undefined {
  return getAllProducts().find((p) => p.id === id);
}

/**
 * Find a variant by SKU across all products
 */
export function getVariantBySKU(sku: string): { product: Product; variant: Product['variants'][number] } | undefined {
  for (const product of getAllProducts()) {
    const variant = product.variants.find((v) => v.sku === sku);
    if (variant) {
      return { product, variant };
    }
  }
  return undefined;
}

/**
 * Get products filtered by category
 */
export function getProductsByCategory(category: Product['category']): Product[] {
  return getAllProducts().filter((p) => p.category === category);
}
