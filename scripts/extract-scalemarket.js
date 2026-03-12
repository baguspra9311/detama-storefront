import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUT_DIR = path.join(__dirname, '../pages/scalemarket');
const HTML_OUT = path.join(OUT_DIR, 'index.html');

// Local component paths
const CSS_SRC = path.join(OUT_DIR, 'scalemarket.css');
const JS_SRC = path.join(OUT_DIR, 'scalemarket-app.js');
const TEMPLATE_FILE = path.join(OUT_DIR, 'scalemarket.html');

async function main() {
  console.log('[*] Starting ScaleMarket extraction (Local Assembly)...');
  try {
    const minCss = fs.readFileSync(CSS_SRC, 'utf8');
    const minJs = fs.readFileSync(JS_SRC, 'utf8');
    const templateContent = fs.readFileSync(TEMPLATE_FILE, 'utf8');

    // Combine into a pure HTML fragment for Scalev Custom HTML
    // Styles at TOP, Content in MIDDLE, Scripts at BOTTOM
    const htmlFragment = `<!-- ========================================= -->
<!-- 1. OPTIMIZED ASSETS (Inline CSS)          -->
<!-- ========================================= -->

<style>
${minCss.trim()}
</style>

<!-- ========================================= -->
<!-- 2. SCALEV COMPONENT HTML BODY             -->
<!-- ========================================= -->
${templateContent.trim()}

<!-- ========================================= -->
<!-- 3. OPTIMIZED ASSETS (Inline JS)           -->
<!-- ========================================= -->
<script>
${minJs.trim()}
</script>`;

    fs.writeFileSync(HTML_OUT, htmlFragment, 'utf8');
    console.log('[+] Generated optimized index.html (Pure HTML Fragment)');
  } catch (error) {
    console.error('[!] Extraction failed:', error);
  }
}

main();
