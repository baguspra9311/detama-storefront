const https = require('https');
const fs = require('fs');
const path = require('path');

const CDN_URL = 'https://cdn.detama.id/SkillForgeHomepage.html';
const LOCAL_PATH = 'C:/Users/Bagus Pratama/OneDrive/Documents/detama-storefront/pages/skillforge/index.html';

https.get(CDN_URL, res => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => {
        const originalHtml = data;
        const localHtml = fs.readFileSync(LOCAL_PATH, 'utf8');

        console.log('--- SIZE COMPARISON ---');
        console.log('Original Size:', originalHtml.length);
        console.log('Local Size:', localHtml.length);

        console.log('\n--- TAG COMPARISON ---');
        const countTags = (html, tag) => (html.match(new RegExp('<' + tag, 'gi')) || []).length;
        console.log('Original Style Tags:', countTags(originalHtml, 'style'));
        console.log('Local Style Tags:', countTags(localHtml, 'style'));
        console.log('Original Script Tags:', countTags(originalHtml, 'script'));
        console.log('Local Script Tags:', countTags(localHtml, 'script'));

        console.log('\n--- FONT URLS ---');
        const fontRegex = /@import url\(['"`]?(https:\/\/fonts\.googleapis\.com[^'`")]+)['"`]?\)/gi;
        console.log('Original Fonts:', originalHtml.match(fontRegex));
        console.log('Local Fonts:', localHtml.match(fontRegex));

        console.log('\n--- HEAD STRIP CHECK ---');
        console.log('Original has <html>:', originalHtml.toLowerCase().includes('<html'));
        console.log('Local has <html>:', localHtml.toLowerCase().includes('<html'));

        // Save original for manual diff if needed
        fs.writeFileSync('C:/Users/Bagus Pratama/OneDrive/Documents/detama-storefront/original_cdn.html', originalHtml);
    });
});
