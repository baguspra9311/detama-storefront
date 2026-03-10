import { defineConfig } from 'vite';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

/**
 * Vite config for building the Checkout Iframe (Page) script.
 *
 * Naming convention:
 *   checkout-page.js   → runs INSIDE Scalev's form iframe (legacy: CheckoutPage.js)
 *   checkout-parent.js → runs on the detama.id parent window (built in Phase 2b)
 *
 * Output: `public/js/checkout-page.js` — loaded via Scalev's Custom Head Script:
 *   <script src="https://assets.detama.id/checkout-page.js" defer></script>
 *
 * Must NOT use dynamic import() — everything must be self-contained (true IIFE).
 */
export default defineConfig({
  resolve: {
    alias: {
      // Mirror the paths from tsconfig.json so @shared/ resolves correctly
      '@shared': resolve(__dirname, '../shared'),
      '@': resolve(__dirname, './src'),
    },
  },

  build: {
    // Output to dist/js — directly deployable to CDN (assets.detama.id/checkout-page.js)
    // Note: NOT using public/js to avoid Vite warning about outDir inside publicDir.
    // This script is uploaded to CDN separately, not served through Astro.
    outDir: 'dist/js',
    emptyOutDir: false, // Don't wipe dist/js — other files may live here

    // Vite lib mode for a standalone IIFE
    lib: {
      entry: resolve(__dirname, 'src/scripts/checkout/checkout.ts'),
      name: 'CheckoutPage',       // IIFE global: window.CheckoutPage (matches legacy)
      fileName: () => 'checkout-page.js',
      formats: ['iife'],
    },

    rollupOptions: {
      output: {
        // Force everything inline — no code splitting, no dynamic imports
        inlineDynamicImports: true,
      },
    },

    // Sourcemaps for local debugging — disable in production CDN upload
    sourcemap: false,
    minify: true,
  },
});
