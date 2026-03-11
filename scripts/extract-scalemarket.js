import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CSS_URL = 'https://cdn.detama.id/ScaleMarket.css';
const JS_URL = 'https://cdn.detama.id/ScaleMarket.js';

const OUT_DIR = path.join(__dirname, '../pages/scalemarket');
const HTML_OUT = path.join(OUT_DIR, 'index.html');
const CSS_OUT = path.join(OUT_DIR, 'scalemarket.css');
const JS_OUT = path.join(OUT_DIR, 'scalemarket-app.js');

const BODY_FILE = path.join(__dirname, 'scalemarket-body.html');
const CRITICAL_CSS_FILE = path.join(__dirname, 'scalemarket-critical.css');

function download(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
      res.on('error', (err) => reject(err));
    });
  });
}

async function main() {
  console.log('[*] Starting ScaleMarket extraction...');
  try {
    const cdnCss = await download(CSS_URL);
    const cdnJs = await download(JS_URL);
    fs.writeFileSync(CSS_OUT, cdnCss, 'utf8');
    fs.writeFileSync(JS_OUT, cdnJs, 'utf8');

    const bodyContent = fs.readFileSync(BODY_FILE, 'utf8');
    const criticalCss = fs.readFileSync(CRITICAL_CSS_FILE, 'utf8');

    // Combine into a pure HTML fragment for Scalev Custom HTML
    const htmlFragment = `<!-- ========================================= -->
<!-- 1. OPTIMIZED ASSETS (Inline CSS)          -->
<!-- ========================================= -->
<style>
${criticalCss.trim()}

${cdnCss.trim()}
</style>

<!-- ========================================= -->
<!-- 2. SCALEV COMPONENT HTML BODY             -->
<!-- ========================================= -->
${bodyContent.trim()}

<!-- ========================================= -->
<!-- 3. OPTIMIZED ASSETS (Inline JS)           -->
<!-- ========================================= -->
<script>
${cdnJs.trim()}
</script>`;

    fs.writeFileSync(HTML_OUT, htmlFragment, 'utf8');
    console.log('[+] Generated optimized index.html (Pure HTML Fragment)');
  } catch (error) {
    console.error('[!] Extraction failed:', error);
  }
}

main();
