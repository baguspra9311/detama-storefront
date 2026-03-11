import https from 'https';
import fs from 'fs';
import path from 'path';

const CDN_URL = 'https://cdn.detama.id/SkillForgeHomepage'; // Removed .html
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


        const fontRegex = /@import url\(['"`]?(https:\/\/fonts\.googleapis\.com[^'`")]+)['"`]?\)/gi;
        const originalFonts = originalHtml.match(fontRegex) || [];
        const localFonts = localHtml.match(fontRegex) || [];
        console.log('Original Fonts Found:', originalFonts.length);
        console.log('Local Fonts Found:', localFonts.length);
        if (originalFonts.length > 0) console.log('Original Font 0:', originalFonts[0]);
        if (localFonts.length > 0) console.log('Local Font 0:', localFonts[0]);

        // Check for specific script differences
        const originalScripts = originalHtml.match(/<script[^>]*>[\s\S]*?<\/script>/gi) || [];
        const localScripts = localHtml.match(/<script[^>]*>[\s\S]*?<\/script>/gi) || [];
        console.log('\n--- SCRIPT DETAIL ---');
        console.log('Original Script 0 (first 100 chars):', originalScripts[0]?.substring(0, 100));
        console.log('Local Script 0 (first 100 chars):', localScripts[0]?.substring(0, 100));

        // Save original for manual diff if needed
        fs.writeFileSync('C:/Users/Bagus Pratama/OneDrive/Documents/detama-storefront/original_cdn.html', originalHtml);
        console.log('\nOriginal HTML saved to original_cdn.html');
    });
});
