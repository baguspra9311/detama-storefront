// =====================================================
// POST /webhook/purchase — Scalev Purchase Webhook
// Verifies HMAC-SHA256 signature per PRD v3.1
// =====================================================

import { Hono } from 'hono';
import type { Env } from '../types/index';
import { storePurchase } from '../services/purchaseStore';
import { success, fail } from '../utils/response';

const webhook = new Hono<{ Bindings: Env }>();

/**
 * Verify Scalev HMAC-SHA256 webhook signature.
 * Scalev sends: X-Scalev-Hmac-Sha256: <hex(hmac-sha256(secret, body))>
 */
async function verifySignature(
  secret: string,
  rawBody: string,
  signature: string
): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const mac = await crypto.subtle.sign('HMAC', key, encoder.encode(rawBody));
  const hex = Array.from(new Uint8Array(mac))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return hex === signature;
}

webhook.post('/purchase', async (c) => {
  // 1. Verify HMAC-SHA256 signature
  const signature = c.req.header('X-Scalev-Hmac-Sha256') ?? '';
  const rawBody = await c.req.text();

  const isValid = await verifySignature(
    c.env.SCALEV_SIGNING_SECRET,
    rawBody,
    signature
  );

  if (!isValid) {
    return fail(c, 'Unauthorized — invalid HMAC signature', 401);
  }

  // 2. Parse payload (after signature check, re-parse from rawBody)
  let body: { buyer_name?: string; product_name?: string; city?: string; [key: string]: unknown };
  try {
    body = JSON.parse(rawBody);
  } catch {
    return fail(c, 'Invalid JSON payload');
  }

  const buyerName = body.buyer_name;
  const productName = body.product_name;

  if (!buyerName || !productName) {
    return fail(c, 'buyer_name and product_name are required');
  }

  // 3. Store in KV (fire-and-forget with waitUntil)
  const purchase = {
    buyerName,
    productName,
    timestamp: Date.now(),
    city: body.city ?? undefined,
  };

  c.executionCtx.waitUntil(storePurchase(c.env.KV_PURCHASES, purchase));

  return success(c, { received: true });
});

export default webhook;
