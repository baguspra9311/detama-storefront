import { build } from 'vite';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = resolve(__dirname, '..');

async function run() {
  // Create dummy files for Phase 4 if they don't exist yet so the build doesn't fail
  const checkoutPagePath = resolve(root, 'scripts/checkout/CheckoutPage.ts');
  if (!fs.existsSync(checkoutPagePath)) {
    fs.mkdirSync(dirname(checkoutPagePath), { recursive: true });
    fs.writeFileSync(checkoutPagePath, 'console.log("CheckoutPage Placeholder");\n');
  }

  const checkoutParentPath = resolve(root, 'scripts/parent/CheckoutParent.ts');
  if (!fs.existsSync(checkoutParentPath)) {
    fs.mkdirSync(dirname(checkoutParentPath), { recursive: true });
    fs.writeFileSync(checkoutParentPath, 'console.log("CheckoutParent Placeholder");\n');
  }

  const entries = [
    { name: 'checkout-page', path: 'scripts/checkout/CheckoutPage.ts' },
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
