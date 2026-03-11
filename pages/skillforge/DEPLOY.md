# SkillForge Migration Deployment Guide

This document outlines the steps to deploy the extracted SkillForge assets to production.

## 1. Upload Assets to CDN

Upload the following files to `assets.detama.id`:

- `pages/skillforge/skillforge.css` -> `https://assets.detama.id/skillforge/skillforge.css`
- `pages/skillforge/skillforge-app.js` -> `https://assets.detama.id/skillforge/skillforge-app.js`

## 2. Setup Custom Head Script in Scalev Builder

Replace the Custom Head Script in the Scalev Builder for the SkillForge page with the following code. This script loads the required external fonts, injects the CSS stylesheet, and defers loading of the application logic.

```html
<!-- Load Plus Jakarta Sans Font -->
<script>
  (function () {
    var fontLink = document.createElement("link");
    fontLink.href =
      "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap";
    fontLink.rel = "stylesheet";
    fontLink.as = "style";
    document.head.appendChild(fontLink);
  })();
</script>

<!-- Inject SkillForge CSS -->
<script>
  fetch("https://assets.detama.id/skillforge/skillforge.css")
    .then((r) => r.text())
    .then((css) => {
      var style = document.createElement("style");
      style.innerHTML = css;
      document.head.appendChild(style);
    });
</script>

<!-- Load SkillForge Application Logic -->
<script
  src="https://assets.detama.id/skillforge/skillforge-app.js"
  defer
></script>
```

## 3. Paste HTML Content

Copy the entire contents of `pages/skillforge/index.html` and paste it into the HTML Viewer element within the Scalev Builder.

## 4. Final Visual Verification

1. Save and publish the page in Scalev.
2. Visit the live staging/production link.
3. Verify that the visual appearance matches the original `https://detama.id/skillforge` exactly.
4. Verify that interactions (buttons, carousels, forms) function as expected.
