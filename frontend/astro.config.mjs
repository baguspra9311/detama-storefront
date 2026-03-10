import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  output: 'static',

  build: {
    // Keep ALL CSS as external <link> tags — never inline
    inlineStylesheets: 'never',
    // Custom asset directory for CDN-friendly output
    assets: '_assets',
  },

  vite: {
    // Tailwind v4 uses a Vite plugin (not an Astro integration)
    plugins: [tailwindcss()],
    build: {
      // Prevent tiny assets from being inlined as base64
      assetsInlineLimit: 0,
      rollupOptions: {
        output: {
          // Predictable filenames for CDN hosting on assets.detama.id
          entryFileNames: 'js/[name]-[hash:8].js',
          chunkFileNames: 'js/chunks/[name]-[hash:8].js',
          assetFileNames: 'css/[name]-[hash:8][extname]',
        },
      },
    },
  },
});
