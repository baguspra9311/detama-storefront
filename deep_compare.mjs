import https from 'https';
import fs from 'fs';

const CDN_URL = 'https://cdn.detama.id/SkillForgeHomepage';
const LOCAL_PATH = 'C:/Users/Bagus Pratama/OneDrive/Documents/detama-storefront/pages/skillforge/index.html';

https.get(CDN_URL, res => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => {
        const originalHtml = data;
        const localHtml = fs.readFileSync(LOCAL_PATH, 'utf8');

        console.log('=== STRUCTURAL DIFFERENCES ===');
        const checkTag = (html, tag) => {
            const regex = new RegExp('<' + tag, 'i');
            return regex.test(html);
        };
        console.log('Original has <html>:', checkTag(originalHtml, 'html'));
        console.log('Local has <html>:', checkTag(localHtml, 'html'));
        console.log('Original has <head>:', checkTag(originalHtml, 'head'));
        console.log('Local has <head>:', checkTag(localHtml, 'head'));
        console.log('Original has <body>:', checkTag(originalHtml, 'body'));
        console.log('Local has <body>:', checkTag(localHtml, 'body'));

        console.log('\n=== STYLE COMPARISON ===');
        const originalStyles = originalHtml.match(/<style[^>]*>([\s\S]*?)<\/style>/gi) || [];
        const localStyles = localHtml.match(/<style[^>]*>([\s\S]*?)<\/style>/gi) || [];
        console.log('Original Style Count:', originalStyles.length);
        console.log('Local Style Count:', localStyles.length);
        
        const fontRegex = /@import url\(['"`]?(https:\/\/fonts\.googleapis\.com[^'`")]+)['"`]?\)/gi;
        const countFontImports = (html) => (html.match(fontRegex) || []).length;
        console.log('Original Font Imports:', countFontImports(originalHtml));
        console.log('Local Font Imports:', countFontImports(localHtml));

        console.log('\n=== SCRIPT COMPARISON ===');
        const originalScripts = originalHtml.match(/<script[^>]*>([\s\S]*?)<\/script>/gi) || [];
        const localScripts = localHtml.match(/<script[^>]*>([\s\S]*?)<\/script>/gi) || [];
        console.log('Original Script Count:', originalScripts.length);
        console.log('Local Script Count:', localScripts.length);

        originalScripts.forEach((s, i) => {
            console.log(`Original Script ${i} Tag:`, s.match(/<script[^>]*>/i)[0]);
            console.log(`Original Script ${i} Length:`, s.length);
        });

        console.log('\n=== FIRST 500 CHARS OF CLEAN HTML ===');
        // Strip tags for comparison
        const stripTags = (html) => html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '').replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '').trim();
        console.log('Original Clean HTML (start):', stripTags(originalHtml).substring(0, 200));
        console.log('Local Clean HTML (start):', stripTags(localHtml).substring(0, 200));

        fs.writeFileSync('C:/Users/Bagus Pratama/OneDrive/Documents/detama-storefront/original_full.html', originalHtml);
    });
});
