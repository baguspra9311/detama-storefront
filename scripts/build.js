import { build } from 'vite';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = resolve(__dirname, '..');

async function run() {
  const entries = [
    { name: 'checkout-child', path: 'scripts/checkout/checkout-child.ts' },
    { name: 'checkout-parent', path: 'scripts/parent/CheckoutParent.ts' }
  ];

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    await build({
      configFile: false,
      root,
      build: {
        emptyOutDir: i === 0, // Only empty the output directory on the first build
        outDir: 'dist',
        lib: {
          entry: resolve(root, entry.path),
          formats: ['iife'],
          name: 'DetamaApp',
          fileName: () => `${entry.name}.js`
        },
        minify: 'esbuild',
        rollupOptions: {
          output: {
            inlineDynamicImports: true
          }
        }
      }
    });
  }
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
