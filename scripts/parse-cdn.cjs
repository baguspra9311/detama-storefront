const fs = require('fs');
const path = require('path');

const CDN_HTML = path.join(__dirname, '../pages/scalemarket/cdn.html');
const CSS_OUT = path.join(__dirname, 'scalemarket-critical.css');
const HTML_OUT = path.join(__dirname, '../pages/scalemarket/template-full-body.html');
const JS_OUT = path.join(__dirname, '../pages/scalemarket/scalemarket-app.js'); // Actually, let's put JS in a local file that extract-scalemarket.js can read.

let content = fs.readFileSync(CDN_HTML, 'utf8');

// The file format looks like:
// <style> ... </style>
// <body> ... </body>  --> Actually, looking at the snippet, there is no <body> tag wrapped around the whole thing? Or maybe there is? Let's check.
// Wait, the snippet showed:
// <style> ... </style>
// <div ...> ... 
// <script> ... </script>
// Let's use regex to extract <style>, <script>, and the rest.

let cssMatch = content.match(/<style>([\s\S]*?)<\/style>/i);
let cssContent = cssMatch ? cssMatch[1].trim() : '';
content = content.replace(/<style>[\s\S]*?<\/style>/i, '');

// There are multiple script tags!
let jsContent = '';
let htmlContent = content;

// Some scripts might be external, like beacon.min.js. We don't want the beacon one.
// Let's match all scripts.
const scriptRegex = /<script(?:[^>]*)>([\s\S]*?)<\/script>/gi;
let match;
while ((match = scriptRegex.exec(content)) !== null) {
    if (match[1].trim() && !match[0].includes('beacon.min.js')) {
        jsContent += match[1].trim() + '\n\n';
    }
    htmlContent = htmlContent.replace(match[0], '');
}

fs.writeFileSync(CSS_OUT, cssContent, 'utf8');
fs.writeFileSync(HTML_OUT, htmlContent.trim(), 'utf8');
fs.writeFileSync(JS_OUT, jsContent.trim(), 'utf8');

console.log("Successfully parsed cdn.html into CSS, JS, and HTML templates.");
