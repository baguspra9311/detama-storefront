import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const URL = 'https://cdn.detama.id/SkillForgeHomepage.html';

const OUT_DIR = path.join(__dirname, '..', 'pages', 'skillforge');
const CSS_OUT = path.join(OUT_DIR, 'skillforge.css');
const HTML_OUT = path.join(OUT_DIR, 'index.html');
const JS_OUT = path.join(OUT_DIR, 'skillforge-app.js');

// Ensure output directory exists
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

console.log(`Fetching from ${URL}...`);

https.get(URL, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log(`Downloaded ${data.length} bytes. Processing...`);
    
    // 1. Extract CSS
    const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
    let cssContent = '';
    let styleMatch;
    while ((styleMatch = styleRegex.exec(data)) !== null) {
      cssContent += styleMatch[1].trim() + '\n\n';
    }
    fs.writeFileSync(CSS_OUT, cssContent.trim(), 'utf8');
    console.log(`[+] Saved ${cssContent.length} bytes to skillforge.css`);

    // 2. Extract JS (Inline Scripts only)
    const scriptRegex = /<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/gi;
    let jsContent = '';
    let scriptMatch;
    while ((scriptMatch = scriptRegex.exec(data)) !== null) {
        const rawJs = scriptMatch[1].trim();
        // Discard empty or JSON data (application/ld+json)
        if (rawJs.length > 0 && !rawJs.startsWith('{') && !rawJs.startsWith('[')) {
            // Check if it's the specific anti-debug or viewport script you want omitted
            // Actually, we are grabbing from cdn.detama.id/SkillForgeHomepage.html, 
            // the custom head scripts are likely NOT in this raw component export.
            jsContent += rawJs + '\n\n';
        }
    }
    
    // Wrap logic in an IIFE to avoid polluting global scope (as requested in fixing previous issues)
    const wrappedJs = `(() => {\n\n${jsContent}\n})();`;
    fs.writeFileSync(JS_OUT, wrappedJs, 'utf8');
    console.log(`[+] Saved ${wrappedJs.length} bytes to skillforge-app.js (IIFE Wrapped)`);

    // 3. Extract Clean HTML
    let htmlContent = data;
    
    // Strip styles and scripts entirely
    htmlContent = htmlContent.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
    htmlContent = htmlContent.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    
    // Strip structural wrappers to make it a partial element
    htmlContent = htmlContent.replace(/<!DOCTYPE[^>]*>/gi, '');
    htmlContent = htmlContent.replace(/<html[^>]*>|<\/html>/gi, '');
    htmlContent = htmlContent.replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '');
    htmlContent = htmlContent.replace(/<body[^>]*>|<\/body>/gi, '');
    htmlContent = htmlContent.replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, '');
    
    htmlContent = htmlContent.trim();
    
    fs.writeFileSync(HTML_OUT, htmlContent, 'utf8');
    console.log(`[+] Saved ${htmlContent.length} bytes to index.html`);
    console.log(`\nExtraction complete! Assets saved to ${OUT_DIR}`);
  });
}).on('error', (err) => {
  console.error(`Error fetching CDN: ${err.message}`);
  process.exit(1);
});
