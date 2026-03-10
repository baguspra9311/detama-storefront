import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    lib: {
      entry: {
        "checkout-page": resolve(__dirname, "scripts/checkout/CheckoutPage.ts"),
        "checkout-parent": resolve(__dirname, "scripts/parent/CheckoutParent.ts"),
      },
      formats: ["iife"],
      name: "DetamaCheckout",
    },
    outDir: "dist",
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
        entryFileNames: "[name].js",
      },
    },
    cssCodeSplit: false,
    minify: "esbuild",
  },
});
