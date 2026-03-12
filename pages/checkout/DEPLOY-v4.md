# Deployment Guide: Universal Checkout (Phase 4)

## Architecture Overview
This phase introduces the **Headless Universal Checkout** which separates the visual parent (Landing Page) from the interactive child (Iframe).

- **Parent**: `pages/checkout/index.html` (Extracted from Legacy CDN)
- **Child**: `dist/checkout-child.js` (Built from `scripts/checkout/checkout-child.ts`)
- **API**: Cloudflare Worker at `/api/checkout`

## Step-by-Step Deployment

### 1. Build Client Scripts
Ensure the latest logic is compiled:
```bash
npm run build:scripts
```
This generates:
- `dist/checkout-child.js`
- `dist/checkout-parent.js`

### 2. Update Scalev Landing Page
1. Open Scalev Builder.
2. Create a new HTML Component.
3. Paste the contents of `pages/checkout/index.html`.
4. Ensure the container ID matches: `<div id="detama-checkout-container"></div>`.

### 3. Upload Assets to CDN
Upload the following files to `assets.detama.id`:
- `dist/checkout-child.js`
- `dist/checkout-parent.js`
- `pages/checkout/checkout-parent.css`

### 4. Configure Success Redirect
In the `CheckoutParent` configuration (landing page), set the `redirectUrl` to the path of your success page:
```javascript
DetamaCheckout.init({
    redirectUrl: '/success'
});
```

### 5. Verify Worker API
Ensure the API-Worker is deployed and handles POST requests to `/api/checkout`.
```bash
npm run deploy:worker
```

## Maintenance
- To update the Parent UI: Modify `pages/checkout/index.html`.
- To update Logic: Modify `scripts/checkout/checkout-child.ts` and rebuild.
