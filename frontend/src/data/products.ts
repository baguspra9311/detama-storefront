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
    id: 'sm-theme-scalpee',
    name: 'ScalPee',
    desc: 'Template premium bertema Shopee untuk Scalev. Pengunjung langsung familiar, belanja nyaman, konversi ngebut.',
    badge: 'Best Seller',
    image: 'https://cdn.scalev.id/uploads/1764757883/Me_cBhGxepINo5sGftuUKA/1764757869143-4a39f09a-d020-4380-9f6d-3e9855415992_image_1.webp', // Add correct image later
    features: [
      'All-in-One',
      'Trust UI',
      '1x Inject',
    ],
    comingSoon: false,
    category: 'theme',
    demoUrls: {
      noVariant: 'https://scalemarket.id/scalpeedemo',
    },
    variants: [
      { id: 'var-scalpee-personal', name: 'Personal License', price: 10_000, sku: 'SCL-PEE-PRS' },
    ],
  },
  {
    id: 'sm-theme-scaletok',
    name: 'ScaleTok',
    desc: 'Template premium bertema TikTok Shop. Belanja sambil scroll, UX modern & engaging.',
    badge: 'New',
    image: 'https://cdn.scalev.id/uploads/1764757883/Me_cBhGxepINo5sGftuUKA/1764757869143-4a39f09a-d020-4380-9f6d-3e9855415992_image_1.webp',
    features: [
      'TikTok Style UI',
      'High Conversion',
      'Mobile First',
    ],
    comingSoon: false,
    category: 'theme',
    demoUrls: {
      noVariant: 'https://scalemarket.id/scaletokdemo',
    },
    variants: [
      { id: 'var-scaletok-personal', name: 'Personal License', price: 10_000, sku: 'SCL-TOK-PRS' },
    ],
  },
  {
    id: 'sm-theme-noteblock',
    name: 'NoteBlock',
    desc: 'Link bio template elegan dengan gaya modern.',
    badge: 'Landing Hero',
    image: 'https://cdn.scalev.id/uploads/1764757883/Me_cBhGxepINo5sGftuUKA/1764757869143-4a39f09a-d020-4380-9f6d-3e9855415992_image_1.webp',
    features: [
      'Link Bio Style',
      'Fast Loading',
      'Highly Customizable',
    ],
    comingSoon: false,
    category: 'theme',
    demoUrls: {
      noVariant: 'https://scalemarket.id/noteblockdemo',
    },
    variants: [
      { id: 'var-noteblock-personal', name: 'Personal License', price: 69_000, sku: 'SCL-NTB-PRS' },
    ],
  },
  {
    id: 'sm-theme-gridify',
    name: 'Gridify',
    desc: 'Storefront grid yang clean dan modern untuk katalog produk yang rapi.',
    badge: 'Landing Hero',
    image: 'https://cdn.scalev.id/uploads/1764757883/Me_cBhGxepINo5sGftuUKA/1764757869143-4a39f09a-d020-4380-9f6d-3e9855415992_image_1.webp',
    features: [
      'Grid Storefront',
      'Clean Design',
      'Optimized Cart',
    ],
    comingSoon: false,
    category: 'theme',
    demoUrls: {
      noVariant: 'https://scalemarket.id/gridifydemo',
    },
    variants: [
      { id: 'var-gridify-personal', name: 'Personal License', price: 69_000, sku: 'SCL-GRD-PRS' },
    ],
  },
  {
    id: 'sm-theme-biolink',
    name: 'Bio Link Creator',
    desc: 'Solusi lengkap untuk membuat bio link super cepat.',
    badge: 'Landing Hero',
    image: 'https://cdn.scalev.id/uploads/1764757883/Me_cBhGxepINo5sGftuUKA/1764757869143-4a39f09a-d020-4380-9f6d-3e9855415992_image_1.webp',
    features: [
      'Easy Setup',
      'Social Links',
      'Analytics Ready',
    ],
    comingSoon: false,
    category: 'theme',
    demoUrls: {
      noVariant: 'https://scalemarket.id/biolinkdemo',
    },
    variants: [
      { id: 'var-biolink-personal', name: 'Personal License', price: 69_000, sku: 'SCL-BIO-PRS' },
    ],
  },
];

/**
 * SkillForge Products — Online Courses
 */
export const skillForgeProducts: Product[] = [
  {
    id: 'kelas-office-pro',
    name: 'Kelas Office Pro',
    desc: 'Kuasai Microsoft Word, Excel, & PPT dari nol hingga mahir. Sertifikat resmi LKP yang diakui untuk pemberkasan kerja.',
    badge: 'Sertifikasi LKP',
    image: 'https://cdn.scalev.id/uploads/1764757883/Me_cBhGxepINo5sGftuUKA/1764757869143-4a39f09a-d020-4380-9f6d-3e9855415992_image_1.webp',
    features: [
      '60+ Video Modul',
      'Sertifikat LKP Dikti',
      'Akses Seumur Hidup',
    ],
    comingSoon: false,
    price: 35_000,
    category: 'course',
    demoUrls: { landing: 'https://detama.id/kelasoffice' },
    variants: [
      { id: '406078', name: 'Lifetime Access', price: 35_000, sku: 'SkillForge - Kelas Office' },
    ],
  },
  {
    id: 'skillpedia-elite',
    name: 'SkillPedia Elite',
    desc: 'Panduan taktis Digital Marketing (FB Ads, TikTok, Copywriting). Ubah skill menjadi mesin penghasil profit.',
    badge: 'Best Seller',
    image: 'https://cdn.scalev.id/uploads/1764757891/-dIIPfmzGPO9J3WNLk0X-Q/1764757876580-23516c39-e701-49f4-8ab6-c0ab2b76d37f_image_1.webp',
    features: [
      'Studi Kasus Real',
      'Database Winning Campaign',
      'Grup Support',
    ],
    comingSoon: false,
    price: 35_000,
    category: 'course',
    demoUrls: { landing: 'https://detama.id/skillpedia' },
    variants: [
      { id: '406079', name: 'Lifetime Access', price: 35_000, sku: 'SkillForge - SkillPedia' },
    ],
  },
];

/**
 * Bundle Products — Combinations
 */
export const bundleProducts: Product[] = [
  {
    id: '26356',
    name: 'SkillForge Bundle',
    desc: 'Paket lengkap pegawai masa depan: Administrasi Rapi + Marketing Cuan.',
    badge: 'Ultimate Package',
    image: 'https://cdn.scalev.id/uploads/1764757598/a-Rioq4w0RkAEUlKDE29Gg/1764757583323-5c7bc4f9-3a24-4030-bb22-ee6c703c703d_image_1.webp',
    features: [
      'Kelas Office Pro',
      'SkillPedia Elite',
      'Harga Lebih Hemat'
    ],
    comingSoon: false,
    isBundle: true,
    price: 50_000,
    originalPrice: 70_000,
    category: 'bundle',
    variants: [
      { id: '26356', name: 'SkillForge Bundle', price: 50_000, sku: '[Bundling] SkillForge' },
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
