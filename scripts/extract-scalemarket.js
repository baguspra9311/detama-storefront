import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUT_DIR = path.join(__dirname, '../pages/scalemarket');
const HTML_OUT = path.join(OUT_DIR, 'index.html');

// Local component paths extracted from the user's cdn.html
const CSS_SRC = path.join(__dirname, 'scalemarket-critical.css');
const JS_SRC = path.join(OUT_DIR, 'scalemarket-app.js'); // The parser wrote it here
const TEMPLATE_FILE = path.join(OUT_DIR, 'template-full-body.html');

// Also inject the global head scripts
const HEAD_SCRIPTS_FILE = path.join(__dirname, '../pages/globals/head-scripts.html');

async function main() {
  console.log('[*] Starting ScaleMarket extraction (Local Assembly)...');
  try {
    const cdnCss = fs.readFileSync(CSS_SRC, 'utf8');
    const cdnJs = fs.readFileSync(JS_SRC, 'utf8');
    const templateContent = fs.readFileSync(TEMPLATE_FILE, 'utf8');
    const globalHeadScripts = fs.readFileSync(HEAD_SCRIPTS_FILE, 'utf8');

    // Combine into a pure HTML fragment for Scalev Custom HTML
    // Styles at TOP (with global scripts), Content in MIDDLE, Scripts at BOTTOM
    const htmlFragment = `<!-- ========================================= -->
<!-- 1. OPTIMIZED ASSETS (Inline CSS & Globals)-->
<!-- ========================================= -->

${globalHeadScripts.trim()}

<style>
${cdnCss.trim()}
</style>

<!-- ========================================= -->
<!-- 2. SCALEV COMPONENT HTML BODY             -->
<!-- ========================================= -->
${templateContent.trim()}

<!-- ========================================= -->
<!-- 3. OPTIMIZED ASSETS (Inline JS)           -->
<!-- ========================================= -->
<script>
${cdnJs.trim()}
</script>`;

    fs.writeFileSync(HTML_OUT, htmlFragment, 'utf8');
    console.log('[+] Generated optimized index.html (Pure HTML Fragment with Globals)');
  } catch (error) {
    console.error('[!] Extraction failed:', error);
  }
}

main();
