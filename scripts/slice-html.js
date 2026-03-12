import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEMP_HTML = process.env.TEMP + '/ScaleMarketHomepage_Source.html';
const OUT_CSS = path.join(__dirname, '../pages/scalemarket/scalemarket.css');
const OUT_JS = path.join(__dirname, '../pages/scalemarket/scalemarket-app.js');
const OUT_HTML = path.join(__dirname, '../pages/scalemarket/scalemarket.html');

let src = fs.readFileSync(TEMP_HTML, 'utf8');

// 1. Extract Main CSS
// Find the <style> that is huge
const styleStartTag = '<style>';
const styleEndTag = '</style>';
const firstStyleIdx = src.indexOf(styleStartTag);
const firstStyleEndIdx = src.indexOf(styleEndTag, firstStyleIdx) + styleEndTag.length;

if (firstStyleIdx !== -1 && firstStyleEndIdx !== -1) {
    const cssContent = src.substring(firstStyleIdx + styleStartTag.length, firstStyleEndIdx - styleEndTag.length);
    fs.writeFileSync(OUT_CSS, cssContent.trim() + '\n', 'utf8');
    src = src.substring(0, firstStyleIdx) + src.substring(firstStyleEndIdx);
}

// 2. Extract Main JS
// Find the <script> right before the cloudflare beacon, which is the main app script
// Usually it's the one starting with <script> and containing "const urlParamsDebug"
const scriptStartTag = '<script>';
const scriptEndTag = '</script>';

const allScriptStarts = [...src.matchAll(/<script>/gi)];
let appScriptStart = -1;
let appScriptEnd = -1;

for (const match of allScriptStarts) {
    const end = src.indexOf(scriptEndTag, match.index) + scriptEndTag.length;
    const content = src.substring(match.index, end);
    if (content.includes('ScaleMarketApp') || content.includes('function initApp')) {
        appScriptStart = match.index;
        appScriptEnd = end;
        break;
    }
}

if (appScriptStart !== -1) {
    const rawJs = src.substring(appScriptStart + scriptStartTag.length, appScriptEnd - scriptEndTag.length);
    fs.writeFileSync(OUT_JS, rawJs.trim() + '\n', 'utf8');
    src = src.substring(0, appScriptStart) + src.substring(appScriptEnd);
} else {
    console.warn("Could not find main app script block.");
}

// 3. Save the rest to scalemarket.html
fs.writeFileSync(OUT_HTML, src.trim() + '\n', 'utf8');
console.log("Successfully sliced original source into 3 components.");
