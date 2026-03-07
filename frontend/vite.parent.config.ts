import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  publicDir: false,
  build: {
    outDir: 'public', // Writes directly to Astro's public folder
    emptyOutDir: false, // Don't wipe the public folder!
    lib: {
      entry: resolve(__dirname, 'src/scripts/landing/checkout-parent.ts'),
      name: 'DetamaCheckout',
      formats: ['iife'],
      fileName: () => 'checkout-parent-bundle.js'
    },
    minify: 'esbuild'
  },
  resolve: {
    alias: {
      '@shared': resolve(__dirname, '../shared')
    }
  }
});
